import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen'; 
import Dashboard from '../screens/DashboardScreen'; 
import PatientScanner from '../screens/PatientScanner'; 
import Toast from 'react-native-toast-message';

const Stack = createStackNavigator();

const App = () => {
  return (
    <>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Dashboard" component={Dashboard} />
          <Stack.Screen name="PatientScanner" component={PatientScanner} />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast ref={(ref) => Toast.setRef(ref)} />
    </>
  );
};

export default App;
