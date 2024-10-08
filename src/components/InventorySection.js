import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const InventorySection = ({ suppliesUsed, medUse, renderUsedItems, handleScan }) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionHeader}>Inventory</Text>
      <Text style={styles.label}>Supplies Used</Text>
      {renderUsedItems(suppliesUsed)}
      <Button title="Scan Item for Supplies" color="#4CAF50" onPress={() => handleScan('supplies')} />

      <Text style={styles.label}>Medicines Used</Text>
      {renderUsedItems(medUse)}
      <Button title="Scan Item for Medicines" color="#FF5722" onPress={() => handleScan('medicines')} />
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
});

export default InventorySection;
