import React from 'react';
import { ScrollView, View, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import FeatureCard from '../components/Card';
import UsageAnalyticsCard from '../components/UsageAnalyticsCard';
import Toast from 'react-native-toast-message';

const { height } = Dimensions.get('window');

const Dashboard = ({ navigation }) => {
  const handlePatientScannerPress = () => {
    Toast.show({
      type: 'success',
      position: 'bottom',
      text1: 'Navigating to Patient Scanner',
      visibilityTime: 3000,
      autoHide: true,
      bottomOffset: 40,
    });
    navigation.navigate('PatientScanner');
  };
  const handleInventoryHistoryPress = () => {
    Toast.show({
      type: 'success',
      position: 'bottom',
      text1: 'Navigating to Inventory History',
      visibilityTime: 3000,
      autoHide: true,
      bottomOffset: 40,
    });
    navigation.navigate('InventoryHistory');
  };
  const handleInventoryScreenPress = () => {
    Toast.show({
      type: 'success',
      position: 'bottom',
      text1: 'Navigating to Inventory History',
      visibilityTime: 3000,
      autoHide: true,
      bottomOffset: 40,
    });
    navigation.navigate('InventoryScreen');
  };





  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.scrollView}>
        {/* Usage Analytics Card on top */}
        <View style={styles.cardContainer}>
          <UsageAnalyticsCard />
        </View>

        {/* Feature Cards */}
        <View style={styles.grid}>
          <FeatureCard
            title="Inventory"
            icon={require('../../assets/inventory.png')}
            onPress={handleInventoryScreenPress}

          />
          <FeatureCard
            title="Overall Inventory"
            icon={require('../../assets/inventoryOverall.png')}
            onPress={() => navigation.navigate('OverallInventory')}
          />
          <FeatureCard
            title="Patient Scanner"
            icon={require('../../assets/patientScanner.png')}
            onPress={handlePatientScannerPress} // Updated handler
          />
          <FeatureCard
            title="Inventory Scanner"
            icon={require('../../assets/inventoryScanner.png')}
            onPress={() => navigation.navigate('InventoryScanner')}
          />
          <FeatureCard
            title="Access Department"
            icon={require('../../assets/accessDept.png')}
            onPress={() => navigation.navigate('AccessDepartment')}
          />
          <FeatureCard
            title="Inventory History"
            icon={require('../../assets/inventoryHistory.png')}
            onPress={handleInventoryHistoryPress} // Updated handler
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
    justifyContent: 'flex-start', // Ensures content starts at the top
  },
  cardContainer: {
    marginBottom: 20, // Space below the UsageAnalyticsCard
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
});

export default Dashboard;
