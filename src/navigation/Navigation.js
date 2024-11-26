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
import OverallInventory from '../screens/CSRscreens/OverallInventoryScreen'; 
import CSRinventoryHistory from '../screens/CSRscreens/CSRinventoryHistory';
import LocalInventory from '../screens/CSRscreens/LocalInventory';
import StockTransfer from '../screens/CSRscreens/StockTransfer';
import SupplyDetails from '../screens/CSRscreens/SupplyDetails';
import TransferHistory from '../screens/CSRscreens/TransferHistory';
import CSRInventoryScanner from '../screens/CSRscreens/CSRscanner';

//Department Screens
import DepartmentScreen from '../screens/DepartmentsScreen/DepartmentSreens/DepartmentScreen';
import DeptLocalInventory from '../screens/DepartmentsScreen/DepartmentSreens/DeptLocalInventory';
import DeptPatientScanner from '../screens/DepartmentsScreen/DepartmentSreens/DeptScanner';
import DeptPatientInfoScreen from '../screens/DepartmentsScreen/DepartmentSreens/DeptPatientInfo';
import DeptTransferHistory from '../screens/DepartmentsScreen/DepartmentSreens/DeptTransferHistory';
import DeptUsageHistory from '../screens/DepartmentsScreen/DepartmentSreens/DeptUsageHistory';
import DeptAnalyticsScreen from '../screens/DepartmentsScreen/DepartmentSreens/DeptUsageAnalytics';

//Pharma Screens
import PharmaDashboard from '../screens/PharmacyScreens/PharmaDashboard';
import PharmaLocalInventory from '../screens/PharmacyScreens/PharmaLocalIventory';
import PharmaOverallInventory from '../screens/PharmacyScreens/PharmaOverallInventory';
import MedicineDetails from '../screens/PharmacyScreens/MedicineDetails';
import PharmaStockTransferScreen from '../screens/PharmacyScreens/PharmaStocksTransfer';
import MedicinesTransferHistory from '../screens/PharmacyScreens/PharmaTransferHistory';
import MedicineAnalyticsScreen from '../screens/PharmacyScreens/MedsUsageAnalytics';

const Stack = createStackNavigator();

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login"
        screenOptions={{ headerShown: false }} // Hides header for all screens
>
        
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="CreateAccountScreen" component={CreateAccountScreen} /> 
        <Stack.Screen name="AdminDashboard" component={DashboardScreen} />
        <Stack.Screen name="PatientScanner" component={PatientScanner} />
        <Stack.Screen name="PatientInfo" component={PatientInfoScreen} /> 
        <Stack.Screen name="InventoryHistory" component={InventoryHistory} /> 
        <Stack.Screen name="InventoryScreen" component={InventoryScreen} /> 
        <Stack.Screen name="CSRdashboardScreen" component={CSRdashboardScreen} /> 
        <Stack.Screen name="CSRInventoryScanner" component={CSRInventoryScanner}/>
        <Stack.Screen name="TransferHistory" component={TransferHistory}/>
        <Stack.Screen name="InventoryScanner" component={InventoryScanner} />
        <Stack.Screen name="UsageAnalyticsScreen" component={UsageAnalyticsScreen}/>
        <Stack.Screen name="Overallinventory" component={OverallInventory}/>
        <Stack.Screen name="CSRinventoryHistory" component={CSRinventoryHistory}/>
        <Stack.Screen name="LocalInventoryCSR" component={LocalInventory}/>
        <Stack.Screen name="StockTransfer" component={StockTransfer}/>
        <Stack.Screen name="SupplyDetails" component={SupplyDetails}/>


        <Stack.Screen name="DepartmentScreen" component={DepartmentScreen}/>
        <Stack.Screen name="DeptLocalInventory" component={DeptLocalInventory}/>
        <Stack.Screen name="DeptPatientScanner" component={DeptPatientScanner}/>
        <Stack.Screen name="DeptPatientInfoScreen" component={DeptPatientInfoScreen}/>
        <Stack.Screen name="DeptTransferHistory" component={DeptTransferHistory}/>
        <Stack.Screen name="DeptUsageHistory" component={DeptUsageHistory}/>
        <Stack.Screen name="DeptAnalyticsScreen" component={DeptAnalyticsScreen}/>



        <Stack.Screen name="PharmaDashboard" component={PharmaDashboard}/>
        <Stack.Screen name="PharmaLocalInventory" component={PharmaLocalInventory}/>
        <Stack.Screen name="PharmaOverallInventory" component={PharmaOverallInventory}/>
        <Stack.Screen name="MedicineDetails" component={MedicineDetails}/>
        <Stack.Screen name="PharmaStockTransferScreen" component={PharmaStockTransferScreen}/>
        <Stack.Screen name="MedicinesTransferHistory" component={MedicinesTransferHistory}/>
        <Stack.Screen name="MedicineAnalyticsScreen" component={MedicineAnalyticsScreen}/>




      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
