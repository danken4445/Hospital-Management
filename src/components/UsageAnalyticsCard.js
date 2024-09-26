import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Animated } from 'react-native';
import { Card } from 'react-native-paper';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { getDatabase, ref, onValue } from 'firebase/database';

const screenWidth = Dimensions.get('window').width;

const UsageAnalyticsCard = () => {
  const [inventoryHistory, setInventoryHistory] = useState([]);
  const [pieChartData, setPieChartData] = useState([]);
  const [barChartData, setBarChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scrollX] = useState(new Animated.Value(0));

  useEffect(() => {
    const db = getDatabase();
    const historyRef = ref(db, 'inventoryHistory');

    const fetchData = () => {
      onValue(historyRef, (snapshot) => {
        if (snapshot.exists()) {
          const historyData = snapshot.val();
          const historyArray = Object.keys(historyData).map((key) => ({
            id: key,
            ...historyData[key],
          }));
          setInventoryHistory(historyArray);
          setLoading(false);
        } else {
          setInventoryHistory([]);
          setLoading(false);
        }
      });
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (inventoryHistory.length === 0) return;

    const itemUsage = {};

    // Calculate usage per item
    inventoryHistory.forEach((entry) => {
      if (itemUsage[entry.itemName]) {
        itemUsage[entry.itemName] += entry.quantity;
      } else {
        itemUsage[entry.itemName] = entry.quantity;
      }
    });

    // Prepare data for pie chart
    const pieData = Object.keys(itemUsage).map((itemName, index) => ({
      name: itemName,
      quantity: itemUsage[itemName],
      color: getColor(index),
      legendFontColor: '#333',
      legendFontSize: 12,
    }));

    setPieChartData(pieData);

    // Prepare data for bar chart
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

  // Function to get color for each item in the pie chart
  const getColor = (index) => {
    const colors = [
      '#4CAF50', '#FF5722', '#FFC107', '#2196F3', '#9C27B0',
      '#FF9800', '#00BCD4', '#8BC34A', '#E91E63', '#607D8B'
    ];
    return colors[index % colors.length];
  };

  const renderSlide = (type) => {
    if (type === 'pie') {
      return (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.chartTitle}>Item Usage Overview</Text>
            {pieChartData.length ? (
              <PieChart
                data={pieChartData}
                width={screenWidth - 60}
                height={220}
                chartConfig={chartConfig}
                accessor={'quantity'}
                backgroundColor={'transparent'}
                paddingLeft={'15'}
                absolute
              />
            ) : (
              <Text style={styles.noDataText}>No data available for the pie chart.</Text>
            )}
          </Card.Content>
        </Card>
      );
    } else if (type === 'bar') {
      return (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.chartTitle}>Item-wise Usage</Text>
            {barChartData ? (
              <BarChart
                data={barChartData}
                width={screenWidth - 60}
                height={250}
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
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#ffa726',
  },
};

const styles = StyleSheet.create({
  card: {
    margin: 20,
    borderRadius: 16,
    elevation: 5,
    backgroundColor: '#ffffff',
    width: screenWidth - 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginVertical: 15,
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  paginationDot: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: '#333',
    marginHorizontal: 6,
  },
});

export default UsageAnalyticsCard;
