// src/navigation/Navigation.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import PatientScanner from '../screens/PatientScanner';
import PatientInfoScreen from '../screens/PatientInfoScreen'; 
import InventoryHistory from '../screens/InventoryHistory'; 
import InventoryScreen from '../screens/InventoryScreen'; 
import CreateAccountScreen from '../screens/CreateAccountScreen';
import InventoryScanner from '../screens/InventoryScanner';
import UsageAnalyticsScreen from '../screens/UsageAnalyticsScreen';

//CSR SCREENS
import CSRdashboardScreen from '../screens/CSRscreens/CSRdashboardScreen';
import OverallInventory from './../screens/CSRscreens/OverallInventoryScreen';
import CSRinventoryHistory from './../screens/CSRscreens/CSRinventoryHistory';
import LocalInventory from './../screens/CSRscreens/LocalInventory';
import StockTransfer from './../screens/CSRscreens/StockTransfer';



const Stack = createStackNavigator();

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoginScreen"
        screenOptions={{ headerShown: false }} // Hides header for all screens
>
        
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="CreateAccountScreen" component={CreateAccountScreen} /> 
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="PatientScanner" component={PatientScanner} />
        <Stack.Screen name="PatientInfo" component={PatientInfoScreen} /> 
        <Stack.Screen name="InventoryHistory" component={InventoryHistory} /> 
        <Stack.Screen name="InventoryScreen" component={InventoryScreen} /> 
        <Stack.Screen name="CSRdashboardScreen" component={CSRdashboardScreen} /> 
        <Stack.Screen name="InventoryScanner" component={InventoryScanner} />
        <Stack.Screen name="UsageAnalyticsScreen" component={UsageAnalyticsScreen}/>
        <Stack.Screen name="Overallinventory" component={OverallInventory}/>
        <Stack.Screen name="CSRinventoryHistory" component={CSRinventoryHistory}/>
        <Stack.Screen name="LocalInventoryCSR" component={LocalInventory}/>
        <Stack.Screen name="StockTransfer" component={StockTransfer}/>


      


      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
