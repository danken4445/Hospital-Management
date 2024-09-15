// screens/Dashboard.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import FABGrid from '../components/FAB.js';

const Dashboard = () => {
  // Updated array with valid icon names
  const fabIcons = [
    'plus', 'pencil', 'delete', 'magnify', 'refresh', 'camera', 'email', 'cog'
  ];

  const handleFABPress = (icon) => {
    console.log(`Pressed ${icon}`);
    // Implement specific logic for each FAB press
  };

  return (
    <View style={styles.container}>
      {/* Your existing content, e.g., inventory list or other components */}

      <FABGrid fabIcons={fabIcons} onPress={handleFABPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFBFAF'
  },
});

export default Dashboard;
