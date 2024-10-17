import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ActivityIndicator, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import { BarChart, PieChart, LineChart } from 'react-native-chart-kit';
import { getDatabase, ref, onValue } from 'firebase/database';
import * as ScreenOrientation from 'expo-screen-orientation'; 
import { useFocusEffect } from '@react-navigation/native'; 

const screenWidth = Dimensions.get('window').width;

const SupplyAnalyticsScreen = () => {
  const [transferHistory, setTransferHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [totalTransfers, setTotalTransfers] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [mostTransferredItem, setMostTransferredItem] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('Weekly');

  // Lock the screen orientation to landscape mode when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const lockOrientation = async () => {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      };

      lockOrientation();

      return () => {
        ScreenOrientation.unlockAsync();
      };
    }, [])
  );

  useEffect(() => {
    const fetchTransferHistory = async () => {
      try {
        const db = getDatabase();
        const historyRef = ref(db, 'supplyHistoryTransfer');

        onValue(historyRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const historyArray = Object.keys(data).map((key) => ({
              id: key,
              ...data[key],
            }));

            setTransferHistory(historyArray);
            applyTimeframeFilter(historyArray, selectedTimeframe);
            setLoading(false);
          } else {
            console.log('No data found');
            setLoading(false);
          }
        }, (error) => {
          console.error('Firebase onValue Error:', error);
          setLoading(false);
        });
      } catch (error) {
        console.error('Error fetching transfer history:', error);
        setLoading(false);
      }
    };

    fetchTransferHistory();
  }, [selectedTimeframe]);

  const applyTimeframeFilter = (historyArray, timeframe) => {
    const now = new Date();
    let filtered = [];

    try {
      switch (timeframe) {
        case 'Weekly':
          filtered = historyArray.filter((item) => {
            const itemDate = new Date(item.timestamp);
            const oneWeekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
            return itemDate >= oneWeekAgo;
          });
          break;
        case 'Monthly':
          filtered = historyArray.filter((item) => {
            const itemDate = new Date(item.timestamp);
            const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            return itemDate >= oneMonthAgo;
          });
          break;
        case 'Annual':
          filtered = historyArray.filter((item) => {
            const itemDate = new Date(item.timestamp);
            const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            return itemDate >= oneYearAgo;
          });
          break;
        default:
          filtered = historyArray;
      }

      setFilteredData(filtered);
      calculateSummary(filtered);
    } catch (error) {
      console.error('Error applying timeframe filter:', error);
    }
  };

  const calculateSummary = (data) => {
    let totalQty = 0;
    let maxItem = { name: '', quantity: 0 };
    const aggregatedData = {};

    data.forEach((entry) => {
      const itemName = entry.itemName || 'Unknown Item';
      const quantity = parseInt(entry.quantity, 10) || 0;

      totalQty += quantity;

      if (aggregatedData[itemName]) {
        aggregatedData[itemName].quantity += quantity;
      } else {
        aggregatedData[itemName] = {
          itemName,
          quantity,
        };
      }

      if (aggregatedData[itemName].quantity > maxItem.quantity) {
        maxItem = aggregatedData[itemName];
      }
    });

    setTotalTransfers(Object.keys(aggregatedData).length);
    setTotalQuantity(totalQty);
    setMostTransferredItem(maxItem);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query === '') {
      setFilteredData(transferHistory);
    } else {
      const filtered = transferHistory.filter((item) => {
        const itemName = item.itemName ? item.itemName.toLowerCase() : ''; // Fallback to empty string if itemName is undefined
        return itemName.includes(query.toLowerCase());
      });
      setFilteredData(filtered);
    }
  };

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(122, 0, 38, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(122, 0, 38, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#ffa726',
    },
  };

  const renderSummaryCards = () => (
    <View style={styles.summaryContainer}>
      <Card style={styles.summaryCard}>
        <View style={styles.cardContent}>
          <Text style={styles.summaryTitle}>Total Transfers</Text>
          <Text style={styles.summaryValue}>{totalTransfers}</Text>
        </View>
      </Card>
      <Card style={styles.summaryCard}>
        <View style={styles.cardContent}>
          <Text style={styles.summaryTitle}>Total Quantity Transferred</Text>
          <Text style={styles.summaryValue}>{totalQuantity} units</Text>
        </View>
      </Card>
      <Card style={styles.summaryCard}>
        <View style={styles.cardContent}>
          <Text style={styles.summaryTitle}>Most Transferred Item</Text>
          {mostTransferredItem ? (
            <Text style={styles.summaryValue}>
              {mostTransferredItem.name} ({mostTransferredItem.quantity} units)
            </Text>
          ) : (
            <Text style={styles.summaryValue}>N/A</Text>
          )}
        </View>
      </Card>
    </View>
  );

  const renderCharts = () => {
    const itemNames = filteredData.map((item) => item.itemName);
    const quantities = filteredData.map((item) => item.quantity);
    
    const timestamps = filteredData.map((item) => {
      const date = new Date(item.timestamp);
      return date.toLocaleDateString();
    });

    return (
      <>
        <Text style={styles.chartTitle}>Item-wise Quantity Transferred</Text>
        <BarChart
          data={{
            labels: itemNames,
            datasets: [
              {
                data: quantities,
              },
            ],
          }}
          width={screenWidth - 140} // Adjusted for landscape
          height={220}
          chartConfig={chartConfig}
          verticalLabelRotation={30}
          fromZero
        />

        <Text style={styles.chartTitle}>Percentage Distribution by Item</Text>
        <PieChart
          data={filteredData.map((item, index) => ({
            name: item.itemName,
            quantity: item.quantity,
            color: getColor(index),
            legendFontColor: '#7F7F7F',
            legendFontSize: 14,
          }))}
          width={screenWidth - 150} // Adjusted for landscape
          height={220}
          chartConfig={chartConfig}
          accessor="quantity"
          backgroundColor="transparent"
          paddingLeft="15"
        />

        <Text style={styles.chartTitle}>Transfer Trends Over Time</Text>
        <LineChart
          data={{
            labels: timestamps,
            datasets: [
              {
                data: quantities,
              },
            ],
          }}
          width={screenWidth - 140} // Adjusted for landscape
          height={220}
          chartConfig={chartConfig}
          fromZero
          bezier
        />
      </>
    );
  };

  
  const getColor = (index) => {
    const colors = ['#4CAF50', '#FF5722', '#FFC107', '#2196F3', '#9C27B0', '#FF9800', '#00BCD4', '#E91E63', '#607D8B'];
    return colors[index % colors.length];
  };

  const renderTimeframeButtons = () => (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={[styles.timeframeButton, selectedTimeframe === 'Weekly' && styles.timeframeButtonSelected]}
        onPress={() => setSelectedTimeframe('Weekly')}
      >
        <Text style={styles.timeframeButtonText}>Weekly</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.timeframeButton, selectedTimeframe === 'Monthly' && styles.timeframeButtonSelected]}
        onPress={() => setSelectedTimeframe('Monthly')}
      >
        <Text style={styles.timeframeButtonText}>Monthly</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.timeframeButton, selectedTimeframe === 'Annual' && styles.timeframeButtonSelected]}
        onPress={() => setSelectedTimeframe('Annual')}
      >
        <Text style={styles.timeframeButtonText}>Annual</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#6200ea" style={styles.loading} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Supply Transfer Analytics</Text>

      <TextInput
        style={styles.searchBar}
        placeholder="Search by item name or department..."
        value={searchQuery}
        onChangeText={handleSearch}
      />

      {renderTimeframeButtons()}
      {renderSummaryCards()}
      {renderCharts()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#6200ea',
  },
  searchBar: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  summaryCard: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
    minWidth: screenWidth / 4.5, // Adjusted for landscape
  },
  cardContent: {
    padding: 15,
  },
  summaryTitle: {
    fontSize: 16,
    color: '#333',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#6200ea',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#6200ea',
    textAlign: 'center',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 15,
  },
  timeframeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#6200ea',
    borderRadius: 8,
  },
  timeframeButtonSelected: {
    backgroundColor: '#ff9800',
  },
  timeframeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SupplyAnalyticsScreen;
