import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { Card, Title, Divider, Button, Paragraph } from 'react-native-paper';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { getDatabase, ref, onValue, get } from 'firebase/database';
import { auth } from '../../../firebaseConfig';
import moment from 'moment';

const screenWidth = Dimensions.get('window').width;

const AnalyticsScreen = () => {
  const [inventoryHistory, setInventoryHistory] = useState([]);
  const [timeFrame, setTimeFrame] = useState('monthly');
  const [filteredData, setFilteredData] = useState([]);
  const [medicinesData, setMedicinesData] = useState([]);
  const [suppliesData, setSuppliesData] = useState([]);
  const [departmentItems, setDepartmentItems] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      setLoading(true);
      const user = auth.currentUser;
      if (user) {
        const db = getDatabase();
        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setUserRole(userData.role);
          fetchData(userData.role);
        } else {
          console.log('User data not found in the database.');
          setLoading(false);
        }
      }
    };

    const fetchData = (role) => {
      const db = getDatabase();
      let departmentsRef;
      let allInventory = [];
      let allUsageHistory = [];

      if (role === 'admin') {
        departmentsRef = ref(db, 'departments'); // Admin fetches all departments
      } else {
        departmentsRef = ref(db, `departments/${role}`); // Non-admin fetches their department
      }

      onValue(departmentsRef, (snapshot) => {
        if (snapshot.exists()) {
          const departmentsData = snapshot.val();
          const meds = [];
          const supplies = [];
          const usageHistory = [];
          const itemsArray = [];

          // Loop through all departments for admin
          Object.keys(departmentsData).forEach((deptKey) => {
            const department = departmentsData[deptKey];

            // Fetch localMeds
            if (department.localMeds) {
              Object.keys(department.localMeds).forEach((medKey) => {
                meds.push(department.localMeds[medKey]);
                itemsArray.push(department.localMeds[medKey]);
              });
            }

            // Fetch localSupplies
            if (department.localSupplies) {
              Object.keys(department.localSupplies).forEach((supplyKey) => {
                supplies.push(department.localSupplies[supplyKey]);
                itemsArray.push(department.localSupplies[supplyKey]);
              });
            }

            // Fetch usageHistory
            if (department.usageHistory) {
              Object.keys(department.usageHistory).forEach((usageKey) => {
                usageHistory.push(department.usageHistory[usageKey]);
              });
            }
          });

          // Update state for all fetched data
          setMedicinesData(meds);
          setSuppliesData(supplies);
          setInventoryHistory(usageHistory);
          setDepartmentItems(itemsArray);
        } else {
          console.log('No data found for departments.');
        }
        setLoading(false);
      });
    };

    fetchUserRole();
  }, []);

  useEffect(() => {
    filterData(timeFrame);
  }, [inventoryHistory, timeFrame]);

  const filterData = (frame) => {
    const now = moment();
    let filtered = [];

    if (frame === 'monthly') {
      filtered = inventoryHistory.filter(item => moment(item.timestamp).isSame(now, 'month'));
    } else if (frame === 'weekly') {
      filtered = inventoryHistory.filter(item => moment(item.timestamp).isSame(now, 'week'));
    } else if (frame === 'annual') {
      filtered = inventoryHistory.filter(item => moment(item.timestamp).isSame(now, 'year'));
    }

    setFilteredData(filtered);

    const medicines = filtered.filter(item => item.type === 'medicines');
    const supplies = filtered.filter(item => item.type === 'supplies');

    setMedicinesData(medicines);
    setSuppliesData(supplies);
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title style={styles.cardTitle}>{item.itemName}</Title>
        <Paragraph>Quantity: {item.quantity}</Paragraph>
        <Paragraph>Brand: {item.brand || 'N/A'}</Paragraph>
        <Paragraph>Status: {item.status}</Paragraph>
      </Card.Content>
    </Card>
  );

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
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
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Usage Analytics for {userRole === 'admin' ? 'All Departments' : userRole}</Title>

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

          <Divider style={styles.divider} />

          {/* Display LocalMeds and LocalSupplies */}
          <View style={styles.itemsContainer}>
            <Text style={styles.sectionTitle}>Department Items</Text>
            {departmentItems.length > 0 ? (
              <FlatList
                data={departmentItems}
                renderItem={renderItem}
                keyExtractor={(item) => item.itemKey || item.itemName}
              />
            ) : (
              <Text>No items available for this department.</Text>
            )}
          </View>

          {/* Bar Chart for Medicine Usage */}
          <View style={styles.chartContainer}>
            <Title style={styles.sectionTitle}>Medicine Usage</Title>
            {medicinesData.length > 0 ? (
              <BarChart
                data={{
                  labels: medicinesData.map(item => item.itemName),
                  datasets: [
                    {
                      data: medicinesData.map(item => item.quantity),
                    },
                  ],
                }}
                width={screenWidth - 30}
                height={220}
                yAxisLabel=""
                chartConfig={chartConfig}
                verticalLabelRotation={30}
                fromZero
              />
            ) : (
              <Text>No data available for medicines.</Text>
            )}
          </View>

          {/* Pie Chart for Supplies Breakdown */}
          <View style={styles.chartContainer}>
            <Title style={styles.sectionTitle}>Supplies Breakdown</Title>
            {suppliesData.length > 0 ? (
              <PieChart
                data={suppliesData.map((item, index) => ({
                  name: item.itemName,
                  quantity: item.quantity,
                  color: chartConfig.color(index / suppliesData.length),
                  legendFontColor: '#333',
                  legendFontSize: 14,
                }))}
                width={screenWidth - 30}
                height={220}
                chartConfig={chartConfig}
                accessor="quantity"
                backgroundColor="transparent"
                paddingLeft="15"
              />
            ) : (
              <Text>No data available for supplies.</Text>
            )}
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    padding: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: 20,
    elevation: 3,
    backgroundColor: '#fff',
    marginVertical: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  timeFrameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  timeFrameButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  divider: {
    marginVertical: 20,
  },
  itemsContainer: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  chartContainer: {
    marginVertical: 15,
  },
});

export default AnalyticsScreen;
