import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Animated, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { Card, Button, Divider, Paragraph } from 'react-native-paper';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { getDatabase, ref, onValue, get } from 'firebase/database';
import moment from 'moment';
import { auth } from '../../../../firebaseConfig'; // Make sure the path is correct

const screenWidth = Dimensions.get('window').width;

const DeptAnalyticsScreen = () => {
  const [inventoryHistory, setInventoryHistory] = useState([]);
  const [medicinesData, setMedicinesData] = useState([]);
  const [suppliesData, setSuppliesData] = useState([]); // Added suppliesData state
  const [pieChartData, setPieChartData] = useState([]);
  const [barChartData, setBarChartData] = useState(null);
  const [scrollX] = useState(new Animated.Value(0));
  const [userDepartment, setUserDepartment] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [timeFrame, setTimeFrame] = useState('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getDatabase();
    const fetchUserDepartment = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setUserDepartment(userData.role); // Assuming 'role' is the department name
        }
      }
    };

    fetchUserDepartment();
  }, []);

  useEffect(() => {
    if (!userDepartment) return;

    const db = getDatabase();
    const historyRef = ref(db, `departments/${userDepartment}/usageHistory`);
    const medsRef = ref(db, `departments/${userDepartment}/localMeds`);
    const suppliesRef = ref(db, `departments/${userDepartment}/localSupplies`);

    const fetchData = () => {
      setLoading(true);

      // Fetch usage history
      onValue(historyRef, (snapshot) => {
        if (snapshot.exists()) {
          const historyData = snapshot.val();
          const historyArray = Object.keys(historyData).map((key) => ({
            id: key,
            ...historyData[key],
          }));
          setInventoryHistory(historyArray);
        } else {
          setInventoryHistory([]);
        }
      });

      // Fetch localMeds
      onValue(medsRef, (snapshot) => {
        if (snapshot.exists()) {
          const medsData = snapshot.val();
          const medsArray = Object.keys(medsData).map((key) => ({
            id: key,
            ...medsData[key],
          }));
          setMedicinesData(medsArray);
        } else {
          setMedicinesData([]);
        }
      });

      // Fetch localSupplies
      onValue(suppliesRef, (snapshot) => {
        if (snapshot.exists()) {
          const suppliesData = snapshot.val();
          const suppliesArray = Object.keys(suppliesData).map((key) => ({
            id: key,
            ...suppliesData[key],
          }));
          setSuppliesData(suppliesArray); // Set suppliesData
        } else {
          setSuppliesData([]);
        }
        setLoading(false);
      });
    };

    fetchData();
  }, [userDepartment]);

  useEffect(() => {
    filterData(timeFrame);
  }, [inventoryHistory, timeFrame]);

  const filterData = (frame) => {
    if (!inventoryHistory.length) return;
    const now = moment();
    let filtered = [];

    if (frame === 'monthly') {
      filtered = inventoryHistory.filter((item) => moment(item.timestamp).isSame(now, 'month'));
    } else if (frame === 'weekly') {
      filtered = inventoryHistory.filter((item) => moment(item.timestamp).isSame(now, 'week'));
    } else if (frame === 'annual') {
      filtered = inventoryHistory.filter((item) => moment(item.timestamp).isSame(now, 'year'));
    }

    const itemUsage = {};
    filtered.forEach((entry) => {
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
      legendFontColor: '#000',
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
  };

  const getColor = (index) => {
    const colors = [
      '#4CAF50', '#FF5722', '#FFC107', '#2196F3', '#9C27B0',
      '#FF9800', '#00BCD4', '#8BC34A', '#E91E63', '#607D8B',
    ];
    return colors[index % colors.length];
  };

  const renderPieChart = () => (
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
  );

  const renderBarChart = () => (
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
  );

  const handleItemPress = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const renderItemDetailsModal = () => {
    if (!selectedItem) return null;

    return (
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Card style={styles.modalCard}>
            <Card.Title title={selectedItem.itemName} />
            <Card.Content>
              <Paragraph><Text style={styles.modalLabel}>Quantity: </Text>{selectedItem.quantity}</Paragraph>
              <Paragraph><Text style={styles.modalLabel}>Status: </Text>{selectedItem.status}</Paragraph>
              <Paragraph><Text style={styles.modalLabel}>Timestamp: </Text>{moment(selectedItem.timestamp).format('MMMM Do YYYY, h:mm:ss a')}</Paragraph>
            </Card.Content>
            <Button onPress={() => setModalVisible(false)} mode="contained" style={styles.modalButton}>
              Close
            </Button>
          </Card>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7a0026" />
        <Text>Loading data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Detailed Usage Analytics</Text>
        <Text style={styles.subtitle}>A breakdown of department usage and item statistics</Text>
      </View>
      <View style={styles.timeFrameContainer}>
        <Button
          mode={timeFrame === 'monthly' ? 'contained' : 'outlined'}
          onPress={() => setTimeFrame('monthly')}
          style={styles.timeFrameButton}
        >
          Monthly
        </Button>
        <Button
          mode={timeFrame === 'weekly' ? 'contained' : 'outlined'}
          onPress={() => setTimeFrame('weekly')}
          style={styles.timeFrameButton}
        >
          Weekly
        </Button>
        <Button
          mode={timeFrame === 'annual' ? 'contained' : 'outlined'}
          onPress={() => setTimeFrame('annual')}
          style={styles.timeFrameButton}
        >
          Annual
        </Button>
      </View>
      <View style={styles.content}>
        {renderPieChart()}
        {renderBarChart()}
        <Divider style={styles.divider} />
        <Text style={styles.sectionTitle}>Detailed History</Text>
        {inventoryHistory.map((item, index) => (
          <TouchableOpacity key={index} onPress={() => handleItemPress(item)}>
            <Card style={styles.historyCard}>
              <Card.Content>
                <Text style={styles.historyItem}>{item.itemName}</Text>
                <Text style={styles.historyDetails}>Quantity: {item.quantity}</Text>
                <Text style={styles.historyDetails}>Date: {moment(item.timestamp).format('MMMM Do YYYY')}</Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
      {renderItemDetailsModal()}
    </ScrollView>
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
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#7a0026',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
  },
  timeFrameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 15,
    marginVertical: 20,
  },
  timeFrameButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  content: {
    paddingHorizontal: 15,
  },
  card: {
    marginVertical: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    elevation: 5,
  },
  barCard: {
    paddingBottom: 32,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7a0026',
    textAlign: 'center',
    marginVertical: 10,
  },
  noDataText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#7a0026',
    marginBottom: 15,
    marginTop: 20,
  },
  historyCard: {
    marginVertical: 10,
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: '#fdfdfd',
    borderRadius: 12,
    elevation: 2,
  },
  historyItem: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  historyDetails: {
    fontSize: 14,
    color: '#777',
  },
  divider: {
    marginVertical: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalCard: {
    width: '80%',
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  modalLabel: {
    fontWeight: '600',
    color: '#333',
  },
  modalButton: {
    marginTop: 20,
  },
});

export default DeptAnalyticsScreen;
