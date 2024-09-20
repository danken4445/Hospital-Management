// App.js
import React from 'react';
import Navigation from './src/navigation/Navigation';
import { GluestackUIProvider } from "@gluestack-ui/themed";
import Toast from 'react-native-toast-message'; // Import Toast correctly

const App = () => {
  return (
    <GluestackUIProvider>
      {/* Include Navigation Component */}
      <Navigation />
      {/* Correct setup for Toast */}
      <Toast ref={(ref) => Toast.setRef(ref)} />
    </GluestackUIProvider>
  );
};

export default App;
