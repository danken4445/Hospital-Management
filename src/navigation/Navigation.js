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


const Stack = createStackNavigator();

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Dashboard"
        screenOptions={{ headerShown: false }} // Hides header for all screens
>
        
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="PatientScanner" component={PatientScanner} />
        <Stack.Screen name="PatientInfo" component={PatientInfoScreen} /> 
        <Stack.Screen name="InventoryHistory" component={InventoryHistory} /> 
        <Stack.Screen name="InventoryScreen" component={InventoryScreen} /> 

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
