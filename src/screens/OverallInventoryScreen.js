import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { getDatabase, ref, onValue } from 'firebase/database';

const OverallInventory = () => {
  const [overallInventory, setOverallInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getDatabase();
    const overallInventoryRef = ref(db, 'csr/overallInventory');

    onValue(overallInventoryRef, (snapshot) => {
      if (snapshot.exists()) {
        const inventoryData = snapshot.val();
        const inventoryArray = Object.keys(inventoryData).map((key) => ({
          name: key,
          quantity: inventoryData[key],
        }));
        setOverallInventory(inventoryArray);
      } else {
        setOverallInventory([]);
      }
      setLoading(false);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Overall Inventory</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#7a0026" />
      ) : (
        <FlatList
          data={overallInventory}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.itemText}>{item.name}: {item.quantity}</Text>
            </View>
          )}
          keyExtractor={(item) => item.name}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  item: {
    padding: 15,
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    marginBottom: 10,
  },
  itemText: {
    fontSize: 18,
    fontWeight: '500',
  },
});

export default OverallInventory;
