import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { Card } from 'react-native-paper';
import { BarChart, PieChart, LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { getDatabase, ref, onValue } from 'firebase/database';
import * as ScreenOrientation from 'expo-screen-orientation'; 
import { useFocusEffect } from '@react-navigation/native'; 

const screenWidth = Dimensions.get('window').width;

const MedicineAnalyticsScreen = () => {
  const [transferHistory, setTransferHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [totalTransfers, setTotalTransfers] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [mostTransferredItem, setMostTransferredItem] = useState(null);

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
    const fetchTransferHistory = () => {
      const db = getDatabase();
      const historyRef = ref(db, 'medicineTransferHistory');

      onValue(historyRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const historyArray = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));

          // Aggregate the data by itemName
          const aggregatedData = {};
          historyArray.forEach((entry) => {
            const itemName = entry.itemName || 'Unknown Item';
            const quantity = parseInt(entry.quantity, 10) || 0;

            if (aggregatedData[itemName]) {
              aggregatedData[itemName].quantity += quantity;
            } else {
              aggregatedData[itemName] = {
                itemName: entry.itemName,
                quantity: quantity,
              };
            }
          });

          const aggregatedArray = Object.values(aggregatedData);
          setTransferHistory(aggregatedArray);
          setFilteredData(aggregatedArray);
          setLoading(false);

          // Calculate total transfers and total quantity
          let totalQty = 0;
          let maxItem = { name: '', quantity: 0 };

          aggregatedArray.forEach((item) => {
            totalQty += item.quantity;
            if (item.quantity > maxItem.quantity) {
              maxItem = { name: item.itemName, quantity: item.quantity };
            }
          });

          setTotalTransfers(aggregatedArray.length);
          setTotalQuantity(totalQty);
          setMostTransferredItem(maxItem);
        }
      });
    };

    fetchTransferHistory();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query === '') {
      setFilteredData(transferHistory);
    } else {
      const filtered = transferHistory.filter(
        (item) =>
          item.itemName.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredData(filtered);
    }
  };

  const chartConfig = {
    backgroundGradientFrom: '#f5f5f5',
    backgroundGradientTo: '#f5f5f5',
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
          width={screenWidth - 40}
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
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          accessor="quantity"
          backgroundColor="transparent"
          paddingLeft="15"
        />

        <Text style={styles.chartTitle}>Transfer Trends Over Time</Text>
        <LineChart
          data={{
            labels: filteredData.map((item) =>  new Date().toISOString()),
            datasets: [
              {
                data: quantities,
              },
            ],
          }}
          width={screenWidth - 40}
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

  if (loading) {
    return <ActivityIndicator size="large" color="#6200ea" style={styles.loading} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Medicine Transfer Analytics</Text>

      <TextInput
        style={styles.searchBar}
        placeholder="Search by item name or department..."
        value={searchQuery}
        onChangeText={handleSearch}
      />

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
  },
  summaryCard: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
  },
  cardContent: {
    padding: 10,
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
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MedicineAnalyticsScreen;
