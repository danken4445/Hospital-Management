import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Card } from 'react-native-paper'; // Import the Card component for UI styling
import { PieChart, BarChart } from 'react-native-chart-kit';
import { getDatabase, ref, onValue } from 'firebase/database';

const screenWidth = Dimensions.get('window').width;

const UsageAnalyticsCard = () => {
  const [inventoryHistory, setInventoryHistory] = useState([]);
  const [pieChartData, setPieChartData] = useState([]);
  const [barChartData, setBarChartData] = useState(null); // Initial state is null
  const [loading, setLoading] = useState(true);

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

  return (
    <Card style={styles.card}>
      <Card.Content>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* Pie Chart */}
          <Text style={styles.chartTitle}>Item Usage Overview</Text>
          {pieChartData.length ? (
            <PieChart
              data={pieChartData}
              width={screenWidth - 60} // Reduced width to fit inside the card
              height={200} // Adjusted height for a compact look
              chartConfig={chartConfig}
              accessor={'quantity'}
              backgroundColor={'transparent'}
              paddingLeft={'15'}
              absolute
            />
          ) : (
            <Text style={styles.noDataText}>No data available for the pie chart.</Text>
          )}

          {/* Bar Chart */}
          <Text style={styles.chartTitle}>Item-wise Usage</Text>
          {barChartData ? (
            <BarChart
              data={barChartData}
              width={screenWidth - 60} // Reduced width to fit inside the card
              height={220} // Adjusted height for a compact look
              chartConfig={chartConfig}
              verticalLabelRotation={30}
              fromZero
            />
          ) : (
            <Text style={styles.noDataText}>No data available for the bar chart.</Text>
          )}
        </ScrollView>
      </Card.Content>
    </Card>
  );
};

const chartConfig = {
  backgroundColor: '#fff',
  backgroundGradientFrom: '#fbfbfb',
  backgroundGradientTo: '#fbfbfb',
  decimalPlaces: 0, // Optional, defaults to 2dp
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
    margin: 10,
    borderRadius: 10,
    elevation: 3,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default UsageAnalyticsCard;
