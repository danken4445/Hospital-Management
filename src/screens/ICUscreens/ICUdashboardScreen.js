import React from 'react';
import { ScrollView, View, StyleSheet, SafeAreaView, Dimensions, StatusBar, TouchableOpacity, ImageBackground, Platform, Text } from 'react-native';
import FeatureCard from './../../components/Card';
import UsageAnalyticsCard from './../../components/UsageAnalyticsCard';
import Toast from 'react-native-toast-message';

const { height } = Dimensions.get('window');

const ICUDashboard = ({ navigation }) => {

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
      text1: 'Navigating to ICU Inventory Screen',
      visibilityTime: 3000,
      autoHide: true,
      bottomOffset: 40,
    });
    navigation.navigate('ICUlocalInventory');
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
    navigation.navigate('UsageAnalyticsScreen', { chartType });
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
            <Text style={styles.titleText}>ICU Dashboard</Text>
            <View style={styles.grid}>
              <FeatureCard
                title="Inventory"
                icon={require('../../../assets/inventory.png')}
                onPress={handleInventoryScreenPress}
              />
              <FeatureCard
                title="Overall Inventory"
                icon={require('../../../assets/inventoryOverall.png')}
                onPress={() => navigation.navigate('Overallinventory')}
              />
              
              <FeatureCard
                title="Inventory Scanner"
                icon={require('../../../assets/inventoryScanner.png')}
                onPress={() => navigation.navigate('InventoryScanner')}
              />
             
              <FeatureCard
                title="Inventory History"
                icon={require('../../../assets/inventoryHistory.png')}
                onPress={handleInventoryHistoryPress}
              />
              <FeatureCard
                title="Stocks Transfer"
                icon={require('../../../assets/inventoryHistory.png')}
                onPress={handleStockTransferPress}
              />
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
    resizeMode: 'cover', // Ensure the image covers the entire background
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
    backgroundColor: 'rgba(251, 251, 249, 0.9)', // Add slight transparency to see the background image
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
    paddingBottom: 40, // Add padding to the bottom to avoid overlap with home bar
  },
  titleText:{
  textAlign: 'center',
  fontSize: 32,
  marginTop: -24,
  fontWeight: 'bold',
  color: 'maroon',
},

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: Platform.OS === 'ios' ? 20 : 10, // Different padding for iOS
  },
});

export default ICUDashboard;
