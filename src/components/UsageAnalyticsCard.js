import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Animated, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { getDatabase, ref, onValue } from 'firebase/database';

const screenWidth = Dimensions.get('window').width;

const UsageAnalyticsCard = ({ onChartPress }) => {
  const [inventoryHistory, setInventoryHistory] = useState([]);
  const [pieChartData, setPieChartData] = useState([]);
  const [barChartData, setBarChartData] = useState(null);
  const [scrollX] = useState(new Animated.Value(0));

  useEffect(() => {
    const db = getDatabase();
    const departmentsRef = ref(db, 'departments');

    const fetchData = () => {
      let allUsageHistory = [];

      // Fetching usage history from all departments
      onValue(departmentsRef, (snapshot) => {
        if (snapshot.exists()) {
          const departmentsData = snapshot.val();

          // Loop through all departments
          Object.keys(departmentsData).forEach((deptKey) => {
            const department = departmentsData[deptKey];
            if (department.usageHistory) {
              // Collect usage history from each department
              Object.keys(department.usageHistory).forEach((usageKey) => {
                allUsageHistory.push(department.usageHistory[usageKey]);
              });
            }
          });

          setInventoryHistory(allUsageHistory);
        } else {
          setInventoryHistory([]);
        }
      });
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (inventoryHistory.length === 0) return;

    const itemUsage = {};

    // Aggregate item usage across all departments
    inventoryHistory.forEach((entry) => {
      if (itemUsage[entry.itemName]) {
        itemUsage[entry.itemName] += entry.quantity;
      } else {
        itemUsage[entry.itemName] = entry.quantity;
      }
    });

    const pieData = Object.keys(itemUsage).map((itemName, index) => ({
      name: itemName,
      quantity: itemUsage[itemName],
      color: getColor(index),
      legendFontColor: '#ffffff',
      legendFontSize: 14,
    }));

    setPieChartData(pieData);

    const labels = Object.keys(itemUsage);
    const quantities = Object.values(itemUsage);

    if (labels.length && quantities.length) {
      setBarChartData({
        labels,
        datasets: [
          {
            data: quantities,
          },
        ],
      });
    }
  }, [inventoryHistory]);

  const getColor = (index) => {
    const colors = [
      '#4CAF50', '#FF5722', '#FFC107', '#2196F3', '#9C27B0',
      '#FF9800', '#00BCD4', '#8BC34A', '#E91E63', '#607D8B'
    ];
    return colors[index % colors.length];
  };

  const renderSlide = (type) => {
    if (!onChartPress || typeof onChartPress !== 'function') {
      console.error('Invalid onChartPress prop');
      return null;
    }
    if (type === 'pie') {
      return (
        <TouchableOpacity activeOpacity={0.7} onPress={() => onChartPress('pie')}>
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.chartTitle}>Item Usage Overview</Text>
              {pieChartData.length ? (
                <PieChart
                  data={pieChartData}
                  width={screenWidth - 60}
                  height={240}
                  chartConfig={chartConfig}
                  accessor={'quantity'}
                  backgroundColor={'transparent'}
                  paddingLeft={'18'}
                  absolute
                />
              ) : (
                <Text style={styles.noDataText}>No data available for the pie chart.</Text>
              )}
            </Card.Content>
          </Card>
        </TouchableOpacity>
      );
    } else if (type === 'bar') {
      return (
        <TouchableOpacity activeOpacity={0.7} onPress={() => onChartPress('bar')}>
          <Card style={[styles.card, styles.barCard]}>
            <Card.Content>
              <Text style={styles.chartTitle}>Item-wise Usage</Text>
              {barChartData ? (
                <BarChart
                  data={barChartData}
                  width={screenWidth - 60}
                  height={280}
                  chartConfig={chartConfig}
                  verticalLabelRotation={30}
                  fromZero
                  showBarTops={false}
                  showValuesOnTopOfBars={true}
                />
              ) : (
                <Text style={styles.noDataText}>No data available for the bar chart.</Text>
              )}
            </Card.Content>
          </Card>
        </TouchableOpacity>
      );
    }
  };

  const renderPagination = () => {
    const position = Animated.divide(scrollX, screenWidth);
    return (
      <View style={styles.paginationContainer}>
        {['pie', 'bar'].map((_, i) => {
          const opacity = position.interpolate({
            inputRange: [i - 1, i, i + 1],
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp'
          });
          return (
            <Animated.View
              key={i}
              style={[styles.paginationDot, { opacity }]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={{ width: screenWidth }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {renderSlide('pie')}
        {renderSlide('bar')}
      </ScrollView>
      {renderPagination()}
    </View>
  );
};

const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#f5f5f5',
  backgroundGradientTo: '#f5f5f5',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(122, 0, 38, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(122, 0, 38, ${opacity})`,
  style: {
    borderRadius: 24,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#ffa726',
  },
};

const styles = StyleSheet.create({
  card: {
    marginTop: 44,
    backgroundColor: 'rgba(25, 43, 57, 1)',
    width: screenWidth - 30,
    marginHorizontal: 15,
    borderRadius: 16,
  },
  barCard: {
    marginBottom: 22,
    paddingBottom: 32,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginVertical: 15,
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginVertical: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: -20,
  },
  paginationDot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    marginTop: -26,
    backgroundColor: '#ffffff',
    marginHorizontal: 6,
  },
});

export default UsageAnalyticsCard;
