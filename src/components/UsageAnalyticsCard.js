import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Animated, TouchableOpacity } from 'react-native';
import { Card, Surface } from 'react-native-paper';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { getDatabase, ref, onValue } from 'firebase/database';
import { FontAwesome5 } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

const UsageAnalyticsCard = ({ onChartPress, clinic, userRole }) => {
  const [inventoryHistory, setInventoryHistory] = useState([]);
  const [pieChartData, setPieChartData] = useState([]);
  const [barChartData, setBarChartData] = useState(null);
  const [scrollX] = useState(new Animated.Value(0));
  const [loading, setLoading] = useState(true);

  const userClinic = clinic || null;

  useEffect(() => {
    // If no clinic context is available, don't load data
    if (!userClinic) {
      setLoading(false);
      return;
    }

    const db = getDatabase();
    // Reference clinic-specific departments
    const departmentsRef = ref(db, `${userClinic}/departments`);

    const fetchData = () => {
      let allUsageHistory = [];

      // Fetching usage history from clinic-specific departments
      const unsubscribe = onValue(departmentsRef, (snapshot) => {
        if (snapshot.exists()) {
          const departmentsData = snapshot.val();

          // Loop through all departments in the clinic
          Object.keys(departmentsData).forEach((deptKey) => {
            const department = departmentsData[deptKey];
            if (department.usageHistory) {
              // Collect usage history from each department
              Object.keys(department.usageHistory).forEach((usageKey) => {
                const usageEntry = department.usageHistory[usageKey];
                allUsageHistory.push({
                  ...usageEntry,
                  department: deptKey,
                  clinic: userClinic
                });
              });
            }
          });

          setInventoryHistory(allUsageHistory);
        } else {
          setInventoryHistory([]);
        }
        setLoading(false);
      }, (error) => {
        console.error('Error fetching usage analytics:', error);
        setInventoryHistory([]);
        setLoading(false);
      });

      return unsubscribe;
    };

    const unsubscribe = fetchData();
    return () => unsubscribe && unsubscribe();
  }, [userClinic]);

  useEffect(() => {
    if (inventoryHistory.length === 0) {
      setPieChartData([]);
      setBarChartData(null);
      return;
    }

    const itemUsage = {};

    // Aggregate item usage across all departments in the clinic
    inventoryHistory.forEach((entry) => {
      if (itemUsage[entry.itemName]) {
        itemUsage[entry.itemName] += entry.quantity;
      } else {
        itemUsage[entry.itemName] = entry.quantity;
      }
    });

    // Sort items by usage quantity (descending) and take top 10
    const sortedItems = Object.entries(itemUsage)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    const pieData = sortedItems.map(([itemName, quantity], index) => ({
      name: itemName.length > 15 ? itemName.substring(0, 15) + '...' : itemName,
      quantity: quantity,
      color: getColor(index),
      legendFontColor: '#ffffff',
      legendFontSize: 12,
    }));

    setPieChartData(pieData);

    const labels = sortedItems.map(([itemName]) => 
      itemName.length > 8 ? itemName.substring(0, 8) + '...' : itemName
    );
    const quantities = sortedItems.map(([, quantity]) => quantity);

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

    // Show clinic context warning if no clinic
    if (!userClinic) {
      return (
        <Card style={[styles.card, styles.warningCard]}>
          <Card.Content style={styles.warningContent}>
            <FontAwesome5 name="exclamation-triangle" size={32} color="#FF9800" />
            <Text style={styles.warningTitle}>No Clinic Context</Text>
            <Text style={styles.warningText}>
              Please navigate from your clinic dashboard to view analytics.
            </Text>
          </Card.Content>
        </Card>
      );
    }

    // Show loading state
    if (loading) {
      return (
        <Card style={styles.card}>
          <Card.Content style={styles.loadingContent}>
            <FontAwesome5 name="chart-pie" size={32} color="#ffffff" />
            <Text style={styles.loadingText}>Loading {userClinic} analytics...</Text>
          </Card.Content>
        </Card>
      );
    }

    if (type === 'pie') {
      return (
        <TouchableOpacity activeOpacity={0.7} onPress={() => onChartPress('pie')}>
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.chartHeader}>
                <FontAwesome5 name="chart-pie" size={20} color="#ffffff" />
                <Text style={styles.chartTitle}>Item Usage Overview</Text>
              </View>
              <Text style={styles.clinicLabel}>{userClinic} - Top 10 Items</Text>
              {pieChartData.length ? (
                <PieChart
                  data={pieChartData}
                  width={screenWidth - 60}
                  height={220}
                  chartConfig={chartConfig}
                  accessor={'quantity'}
                  backgroundColor={'transparent'}
                  paddingLeft={'18'}
                  absolute
                />
              ) : (
                <View style={styles.noDataContainer}>
                  <FontAwesome5 name="chart-pie" size={48} color="#666" />
                  <Text style={styles.noDataText}>No usage data available for {userClinic}.</Text>
                </View>
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
              <View style={styles.chartHeader}>
                <FontAwesome5 name="chart-bar" size={20} color="#ffffff" />
                <Text style={styles.chartTitle}>Item-wise Usage</Text>
              </View>
              <Text style={styles.clinicLabel}>{userClinic} - Usage Quantities</Text>
              {barChartData ? (
                <BarChart
                  data={barChartData}
                  width={screenWidth - 60}
                  height={260}
                  chartConfig={chartConfig}
                  verticalLabelRotation={30}
                  fromZero
                  showBarTops={false}
                  showValuesOnTopOfBars={true}
                />
              ) : (
                <View style={styles.noDataContainer}>
                  <FontAwesome5 name="chart-bar" size={48} color="#666" />
                  <Text style={styles.noDataText}>No usage data available for {userClinic}.</Text>
                </View>
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
      {/* Only render scrollable charts if clinic context exists and not loading */}
      {userClinic && !loading ? (
        <>
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
        </>
      ) : (
        // Single slide for warning or loading
        <View style={{ width: screenWidth }}>
          {renderSlide('pie')}
        </View>
      )}
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
  warningCard: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  warningContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9800',
    marginTop: 16,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#FF9800',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#ffffff',
    marginTop: 16,
    textAlign: 'center',
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 8,
    textAlign: 'center',
  },
  clinicLabel: {
    fontSize: 12,
    color: '#B0BEC5',
    textAlign: 'center',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDataText: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.8,
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
