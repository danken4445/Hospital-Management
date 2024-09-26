import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Divider, IconButton, Button } from 'react-native-paper';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { getDatabase, ref, onValue } from 'firebase/database';
import { FontAwesome5 } from '@expo/vector-icons';
import moment from 'moment';
import * as ScreenOrientation from 'expo-screen-orientation';

const screenWidth = Dimensions.get('window').width;

const AnalyticsScreen = () => {
  const [inventoryHistory, setInventoryHistory] = useState([]);
  const [timeFrame, setTimeFrame] = useState('monthly');
  const [filteredData, setFilteredData] = useState([]);
  const [medicinesData, setMedicinesData] = useState([]);
  const [suppliesData, setSuppliesData] = useState([]);
  const [selectedChart, setSelectedChart] = useState(null); // State for selected chart
  const [modalVisible, setModalVisible] = useState(false); // State for chart modal
  useEffect(() => {
    const lockLandscape = async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    };
    lockLandscape();

    return () => {
      // Revert to default orientation (either portrait or landscape) when leaving the screen
      ScreenOrientation.unlockAsync();
    };
  }, []);

  useEffect(() => {
    const db = getDatabase();
    const historyRef = ref(db, 'inventoryHistory');

    onValue(historyRef, (snapshot) => {
      if (snapshot.exists()) {
        const historyData = snapshot.val();
        const historyArray = Object.keys(historyData).map((key) => ({
          id: key,
          ...historyData[key],
        }));
        setInventoryHistory(historyArray);
      }
    });
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

    // Separate medicines and supplies data
    const medicines = filtered.filter(item => item.type === 'medicines');
    const supplies = filtered.filter(item => item.type === 'supplies');

    setMedicinesData(medicines);
    setSuppliesData(supplies);
  };

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

  const renderPieChart = (data, title, colors) => {
    if (data.length === 0) return <Text style={styles.noDataText}>No data available for {title}.</Text>;

    const pieData = data.map((item, index) => ({
      name: item.itemName,
      quantity: item.quantity,
      color: colors[index % colors.length],
      legendFontColor: '#333',
      legendFontSize: 12,
    }));

    return (
      <TouchableOpacity onPress={() => openChartModal('pie', pieData, title)}>
        <PieChart
          data={pieData}
          width={screenWidth - 30}
          height={220}
          chartConfig={chartConfig}
          accessor={'quantity'}
          backgroundColor={'transparent'}
          paddingLeft={'15'}
          absolute
        />
      </TouchableOpacity>
    );
  };

  const renderBarChart = (data, title, color) => {
    if (data.length === 0) return <Text style={styles.noDataText}>No data available for {title}.</Text>;

    const itemUsage = data.reduce((acc, entry) => {
      if (acc[entry.itemName]) {
        acc[entry.itemName] += entry.quantity;
      } else {
        acc[entry.itemName] = entry.quantity;
      }
      return acc;
    }, {});

    const labels = Object.keys(itemUsage);
    const quantities = Object.values(itemUsage);

    return (
      <TouchableOpacity onPress={() => openChartModal('bar', { labels, datasets: [{ data: quantities }] }, title)}>
        <BarChart
          data={{
            labels,
            datasets: [
              {
                data: quantities,
              },
            ],
          }}
          width={screenWidth - 30}
          height={220}
          yAxisLabel=""
          chartConfig={{
            ...chartConfig,
            color: () => color,
          }}
          verticalLabelRotation={30}
          fromZero
        />
      </TouchableOpacity>
    );
  };

  const openChartModal = (type, data, title) => {
    setSelectedChart({ type, data, title });
    setModalVisible(true);
  };

  const renderChartModal = () => {
    if (!selectedChart) return null;

    const { type, data, title } = selectedChart;

    return (
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <Card style={styles.modalCard}>
            <Card.Title title={title} />
            <Card.Content>
              {type === 'pie' && (
                <PieChart
                  data={data}
                  width={screenWidth * 1}
                  height={300}
                  chartConfig={chartConfig}
                  accessor={'quantity'}
                  backgroundColor={'transparent'}
                  paddingLeft={'15'}
                  absolute
                />
              )}
              {type === 'bar' && (
                <BarChart
                  data={data}
                  width={screenWidth * 0.85}
                  height={300}
                  yAxisLabel=""
                  chartConfig={chartConfig}
                  verticalLabelRotation={30}
                  fromZero
                />
              )}
              <Button mode="contained" onPress={() => setModalVisible(false)}>
                Close
              </Button>
            </Card.Content>
          </Card>
        </View>
      </Modal>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Usage Analytics</Title>

          {/* Enhanced Time Frame Selector */}
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

          {/* Summary Section */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryBox}>
              <IconButton icon="pill" size={30} color="#2196F3" />
              <Text style={styles.summaryText}>Medicines: {medicinesData.length} items</Text>
            </View>
            <View style={styles.summaryBox}>
              <IconButton icon="archive" size={30} color="#4CAF50" />
              <Text style={styles.summaryText}>Supplies: {suppliesData.length} items</Text>
            </View>
          </View>

          {/* Medicine Charts */}
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <FontAwesome5 name="pills" size={24} color="#2196F3" />
              <Title style={styles.sectionTitle}>Medicine Usage</Title>
            </View>
            {renderBarChart(medicinesData, 'Medicine Usage', '#2196F3')}
          </View>

          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <FontAwesome5 name="chart-pie" size={24} color="#2196F3" />
              <Title style={styles.sectionTitle}>Medicine Breakdown</Title>
            </View>
            {renderPieChart(medicinesData, 'Medicine Breakdown', ['#4CAF50', '#FF5722', '#FFC107', '#2196F3', '#9C27B0'])}
          </View>

          {/* Supplies Charts */}
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <FontAwesome5 name="box" size={24} color="#4CAF50" />
              <Title style={styles.sectionTitle}>Supplies Usage</Title>
            </View>
            {renderBarChart(suppliesData, 'Supplies Usage', '#4CAF50')}
          </View>

          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <FontAwesome5 name="chart-pie" size={24} color="#4CAF50" />
              <Title style={styles.sectionTitle}>Supplies Breakdown</Title>
            </View>
            {renderPieChart(suppliesData, 'Supplies Breakdown', ['#FF5722', '#FFC107', '#4CAF50', '#00BCD4', '#E91E63'])}
          </View>
        </Card.Content>
      </Card>

      {/* Render Chart Modal */}
      {renderChartModal()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    padding: 2,
  },
  card: {
    borderRadius: 20,
    elevation: 3,
    backgroundColor: '#fff',
    padding: 2,
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
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  summaryBox: {
    flexDirection: 'col',
    alignItems: 'center',
    padding: 34
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  chartContainer: {
    marginVertical: 15,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalCard: {
    width: '90%',
    borderRadius: 20,
    padding: 20,
    backgroundColor: '#fff',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
});

export default AnalyticsScreen;
