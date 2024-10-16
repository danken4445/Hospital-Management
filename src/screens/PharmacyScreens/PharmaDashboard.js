import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, SafeAreaView, Dimensions, StatusBar, TouchableOpacity, Text, ImageBackground, Platform } from 'react-native';
import FeatureCard from './../../components/Card';
import Toast from 'react-native-toast-message';
import UsageAnalyticsCard from '@/src/components/PharmaUsageAnalyticsCard';

const { height, width: screenWidth } = Dimensions.get('window');

const PharmaDashboard = ({ navigation }) => {
  
  const handleInventoryHistoryPress = () => {
    Toast.show({
      type: 'success',
      position: 'bottom',
      text1: 'Navigating to Pharmacy Transfer History',
      visibilityTime: 3000,   
      autoHide: true,
      bottomOffset: 40,
    });
    navigation.navigate('MedicinesTransferHistory');
  };

  const handleInventoryScreenPress = () => {
    Toast.show({
      type: 'success',
      position: 'bottom',
      text1: 'Navigating to Pharmacy Local Inventory',
      visibilityTime: 3000,
      autoHide: true,
      bottomOffset: 40,
    });
    navigation.navigate('LocalInventoryPharmacy');
  };

  const handleUsageAnalyticsPress = (chartType) => {
    Toast.show({
      type: 'success',
      position: 'bottom',
      text1: `Navigating to Usage Analytics for ${chartType}`,
      visibilityTime: 3000,
      autoHide: true,
      bottomOffset: 40,
    });
    navigation.navigate('MedicineAnalyticsScreen', { chartType });
  };

  const handleStockTransferPress = (chartType) => {
    Toast.show({
      type: 'success',
      position: 'bottom',
      text1: `Navigating to Usage Analytics for ${chartType}`,
      visibilityTime: 3000,
      autoHide: true,
      bottomOffset: 40,
    });
    navigation.navigate('StockTransfer', { chartType });
  };

  return (
    <ImageBackground source={require('../../../assets/background.png')} style={styles.imageBackground}>
      <SafeAreaView style={styles.safeAreaView}>
        <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent={true} />
        <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.scrollView}>
          <View style={styles.cardContainer}>
            <UsageAnalyticsCard onChartPress={handleUsageAnalyticsPress} />
          </View>
          <View style={styles.featureCardContainer}>
            <Text style={styles.titleText}>Pharmacy Dashboard</Text>
            <View style={styles.grid}>
              <FeatureCard 
                title="Overall Inventory"
                icon={require('../../../assets/inventoryOverall.png')}
                onPress={() => navigation.navigate('PharmaOverallInventory')}
              />
              
              <FeatureCard
                title="Pharmacy Inventory"
                icon= {require('../../../assets/inventory.png')}
                onPress={() => navigation.navigate('PharmaLocalInventory')}
              />
             
              <FeatureCard
                title="Transfer History"
                icon={require('../../../assets/inventoryHistory.png')}
                onPress={handleInventoryHistoryPress}
              />
              {/* <FeatureCard
                title="Stocks Transfer"
                icon={require('../../../assets/stockTransfer.png')}
                onPress={handleStockTransferPress}
              />  */}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  imageBackground: {
    flex: 1,
    resizeMode: 'cover',
  },
  safeAreaView: {
    flex: 1,
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
    marginTop: -26,
    elevation: 0,
  },
  featureCardContainer: {
    backgroundColor: 'rgba(251, 251, 249, 0.9)',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 44,
    height: '80%',
    paddingTop: 34,
    paddingHorizontal: 10,
    borderTopLeftRadius: 64,
    borderTopRightRadius: 64,
    marginTop: -34,
    paddingBottom: 40,
  },

  featureCardContainer1: {
    backgroundColor: 'rgba(251, 251, 249, 0.9)',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 44,
    height: '80%',
    paddingTop: 34,
    paddingHorizontal: 10,
    borderTopLeftRadius: 64,
    borderTopRightRadius: 64,
    marginTop: -34,
    paddingBottom: 40,
    paddingRight:12,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: Platform.OS === 'ios' ? 20 : 10,
  },
  titleText: {
    textAlign: 'center',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: -21,
    color: 'maroon',
  },
});

export default PharmaDashboard;
