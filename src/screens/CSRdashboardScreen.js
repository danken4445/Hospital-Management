import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import FeatureCard from '../components/Card';
import Toast from 'react-native-toast-message';
import { getDatabase, ref, onValue } from 'firebase/database';
import { auth } from '../../firebaseConfig'; // Import Firebase Auth for user information

const { height } = Dimensions.get('window');

const CSRdashboardScreen = ({ navigation }) => {
  const [userRole, setUserRole] = useState('');
  const [department, setDepartment] = useState('');

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const db = getDatabase();
      const userRef = ref(db, `users/${user.uid}`);
      onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setUserRole(userData.role);
          setDepartment(userData.department);
        }
      });
    }
  }, []);

  const handleInventoryPress = () => {
    if (userRole === 'csr') {
      Toast.show({
        type: 'success',
        position: 'bottom',
        text1: 'Navigating to Local Inventory',
        visibilityTime: 3000,
        autoHide: true,
        bottomOffset: 40,
      });
      navigation.navigate('Inventory');
    } else if (userRole === 'pharmacy') {
      Toast.show({
        type: 'error',
        position: 'bottom',
        text1: 'Access Denied',
        text2: 'Only CSR can access this section',
        visibilityTime: 3000,
        autoHide: true,
        bottomOffset: 40,
      });
    }
  };

  const handleOverallInventoryPress = () => {
    if (userRole === 'csr') {
      Toast.show({
        type: 'success',
        position: 'bottom',
        text1: 'Navigating to Overall Inventory',
        visibilityTime: 3000,
        autoHide: true,
        bottomOffset: 40,
      });
      navigation.navigate('OverallInventory');
    } else {
      Toast.show({
        type: 'error',
        position: 'bottom',
        text1: 'Access Denied',
        text2: 'Only CSR can access this section',
        visibilityTime: 3000,
        autoHide: true,
        bottomOffset: 40,
      });
    }
  };

  const handleInventoryScannerPress = () => {
    Toast.show({
      type: 'success',
      position: 'bottom',
      text1: 'Navigating to Inventory Scanner',
      visibilityTime: 3000,
      autoHide: true,
      bottomOffset: 40,
    });
    navigation.navigate('InventoryScanner');
  };

  const handleStockTransferPress = () => {
    if (userRole === 'csr') {
      Toast.show({
        type: 'success',
        position: 'bottom',
        text1: 'Navigating to Stock Transfer',
        visibilityTime: 3000,
        autoHide: true,
        bottomOffset: 40,
      });
      navigation.navigate('StockTransfer');
    } else {
      Toast.show({
        type: 'error',
        position: 'bottom',
        text1: 'Access Denied',
        text2: 'Only CSR can access this section',
        visibilityTime: 3000,
        autoHide: true,
        bottomOffset: 40,
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.scrollView}>
      <View style={styles.cardContainer}>
          <UsageAnalyticsCard />
        </View>
        {/* Usage Analytics Card */}
        <View style={styles.cardContainer}>
          {/* Add UsageAnalyticsCard here if required */}
        </View>

        {/* Feature Cards */}
        <View style={styles.grid}>
          {/* Local Inventory */}
          <FeatureCard
            title="Local Inventory"
            icon={require('../../assets/inventory.png')}
            onPress={handleInventoryPress}
          />
          {/* Overall Inventory */}
          <FeatureCard
            title="Overall Inventory"
            icon={require('../../assets/inventoryOverall.png')}
            onPress={handleOverallInventoryPress}
          />
          {/* Inventory Scanner */}
          <FeatureCard
            title="Inventory Scanner"
            icon={require('../../assets/inventoryScanner.png')}
            onPress={handleInventoryScannerPress}
          />
          {/* Stock Transfer */}
          <FeatureCard
            title="Stock Transfer"
            icon={require('../../assets/inventory.png')}
            onPress={handleStockTransferPress}
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
    justifyContent: 'flex-start',
  },
  cardContainer: {
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
});

export default CSRdashboardScreen;
