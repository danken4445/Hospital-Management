// components/FABGrid.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FAB } from 'react-native-paper';

const FABGrid = ({ fabIcons, onPress }) => {
    return (
      <View style={styles.fabContainer}>
        {fabIcons.map((icon, index) => (
          <FAB
            key={index}
            icon={icon}
            style={[
              styles.fab,
              {
                // Adjust the position of each FAB if needed
              }
            ]}
            onPress={() => onPress(icon)}
          />
        ))}
      </View>
    );
  };
  
const styles = StyleSheet.create({
    fabContainer: {
      position: 'absolute',
      flexDirection: 'row',
      flexWrap: 'wrap',
      bottom: 275,
      left: 55,
      right: 55,
      justifyContent: 'space-between',
      alignContent: 'space-between',
      height:200, // Adjust height to fit your layout
      padding: 8, // Add padding if needed
    },
    fab: {
      backgroundColor: '#6200ee',
      width: 170, // Adjust size as needed
      height: 170, // Adjust size as needed
      margin: 34, // Adjust spacing as needed
    },
  });
  

export default FABGrid;
