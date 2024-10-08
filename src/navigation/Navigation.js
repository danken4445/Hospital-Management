// src/navigation/Navigation.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';

//Admin Screens
import DashboardScreen from '../screens/AdminScreens/DashboardScreen';
import PatientScanner from '../screens/AdminScreens/PatientScanner';
import PatientInfoScreen from '../screens/AdminScreens/PatientInfoScreen'; 
import InventoryHistory from '../screens/AdminScreens/InventoryHistory'; 
import InventoryScreen from '../screens/AdminScreens/InventoryScreen'; 
import CreateAccountScreen from '../screens/AdminScreens/CreateAccountScreen';
import InventoryScanner from '../screens/AdminScreens/InventoryScanner';
import UsageAnalyticsScreen from '../screens/AdminScreens/UsageAnalyticsScreen';

//CSR SCREENS
import CSRdashboardScreen from '../screens/CSRscreens/CSRdashboardScreen';
import OverallInventory from './../screens/CSRscreens/OverallInventoryScreen';
import CSRinventoryHistory from './../screens/CSRscreens/CSRinventoryHistory';
import LocalInventory from './../screens/CSRscreens/LocalInventory';
import StockTransfer from './../screens/CSRscreens/StockTransfer';
import SupplyDetails from '../screens/CSRscreens/SupplyDetails';
import CSRscanner from '../screens/CSRscreens/CSRscanner';
import TransferHistory from '../screens/CSRscreens/TransferHistory';
//ICU Screens
import ICUdashboard from '../screens/ICUscreens/ICUdashboardScreen'
import ICUlocalInventory from '../screens/ICUscreens/ICUlocalInventory';


const Stack = createStackNavigator();

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login"
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
        <Stack.Screen name="CSRscanner" component={CSRscanner}/>
        <Stack.Screen name="TransferHistory" component={TransferHistory}/>
        <Stack.Screen name="InventoryScanner" component={InventoryScanner} />
        <Stack.Screen name="UsageAnalyticsScreen" component={UsageAnalyticsScreen}/>
        <Stack.Screen name="Overallinventory" component={OverallInventory}/>
        <Stack.Screen name="CSRinventoryHistory" component={CSRinventoryHistory}/>
        <Stack.Screen name="LocalInventoryCSR" component={LocalInventory}/>
        <Stack.Screen name="StockTransfer" component={StockTransfer}/>
        <Stack.Screen name="SupplyDetails" component={SupplyDetails}/>
        <Stack.Screen name="ICUdashboard" component={ICUdashboard}/>
        <Stack.Screen name="ICUlocalInventory" component={ICUlocalInventory}/>







      


      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
