// filepath: c:\Users\RYZEN 7\OneDrive\Desktop\OdysSys\Hospital-Management\App.js
import React from 'react';
import Navigation from './src/navigation/Navigation';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import Toast from 'react-native-toast-message';

// Import Firebase config SYNCHRONOUSLY
import './firebaseConfig';

// Custom theme for React Native Paper
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200ee',
    accent: '#03dac4',
    surface: '#ffffff',
    background: '#f5f5f5',
  },
};

const App = () => {
  return (
    <PaperProvider theme={theme}>
      <Navigation />
      <Toast />
    </PaperProvider>
  );
};

export default App;