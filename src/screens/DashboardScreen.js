import React from 'react';
import { ScrollView, View, StyleSheet, SafeAreaView, Dimensions, StatusBar, TouchableOpacity } from 'react-native';
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
      bottomOffset: 40,a
    });
    navigation.navigate('InventoryHistory');
  };

  const handleInventoryScreenPress = () => {
    Toast.show({
      type: 'success',
      position: 'bottom',
      text1: 'Navigating to Inventory Screen',
      visibilityTime: 3000,
      autoHide: true,
      bottomOffset: 40,
    });
    navigation.navigate('InventoryScreen');
  };
  const handleUsageAnalyticsPress = () => {
    Toast.show({
      type: 'success',
      position: 'bottom',
      text1: 'Navigating to Usage Analytics',
      visibilityTime: 3000,
      autoHide: true,
      bottomOffset: 40,
    });
    navigation.navigate('UsageAnalyticsScreen');
  };

  return (
    <SafeAreaView style={styles.safeAreaView}>
      {/* Configure StatusBar for full screen */}
      <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent={true} />
      <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.scrollView}>
        {/* Usage Analytics Card on top */}
        <View style={styles.cardContainer}>
          <TouchableOpacity onPress={handleUsageAnalyticsPress}>
            <UsageAnalyticsCard />
          </TouchableOpacity>
        </View>

        {/* Background Card for Feature Cards */}
        <View style={styles.featureCardContainer}>
          <View style={styles.grid}>
            <FeatureCard
              title="Inventory"
              icon={require('../../assets/inventory.png')}
              onPress={handleInventoryScreenPress}
            />
            <FeatureCard
              title="Create an Account"
              icon={require('../../assets/inventoryOverall.png')}
              onPress={() => navigation.navigate('CreateAccountScreen')}
            />
            <FeatureCard
              title="Patient Scanner"
              icon={require('../../assets/patientScanner.png')}
              onPress={handlePatientScannerPress}
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
              onPress={handleInventoryHistoryPress}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: '#7a0026', // Light background color for the screen
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#f4f4f4', // Light background color for the screen
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
    marginTop: -26,
    elevation:0,
  },
  featureCardContainer: {
    backgroundColor: '#fbfbf9', // Dark red background for the feature card container
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 44,
    height: '70%',
    paddingTop: 34,
    paddingHorizontal: 14,
    borderTopLeftRadius: 44,
    borderTopRightRadius: 44,
    marginTop: -34,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
});

export default Dashboard;
