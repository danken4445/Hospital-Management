import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getDatabase, ref, onValue } from 'firebase/database';
import { Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const OverallInventory = () => {
  const [overallSupplies, setOverallSupplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSupplies, setFilteredSupplies] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const db = getDatabase();
    const departmentsRef = ref(db, 'departments');

    const fetchInventory = () => {
      let supplyTotals = {};

      // Fetch department-specific localSupplies for all departments
      onValue(departmentsRef, (snapshot) => {
        if (snapshot.exists()) {
          const departmentsData = snapshot.val();

          for (const deptKey in departmentsData) {
            const department = departmentsData[deptKey];
            if (department.localSupplies) {
              for (const supplyKey in department.localSupplies) {
                const supply = department.localSupplies[supplyKey];

                // If the item is already in supplyTotals, aggregate the quantities
                if (supplyTotals[supply.itemName]) {
                  supplyTotals[supply.itemName].totalQuantity += supply.quantity;
                  supplyTotals[supply.itemName].departments.push({
                    departmentName: deptKey,
                    quantity: supply.quantity,
                    brand: supply.brand,
                  });
                } else {
                  // If the item is not in supplyTotals, create a new entry
                  supplyTotals[supply.itemName] = {
                    totalQuantity: supply.quantity,
                    brand: supply.brand,
                    departments: [
                      {
                        departmentName: deptKey,
                        quantity: supply.quantity,
                        brand: supply.brand,
                      },
                    ],
                  };
                }
              }
            }
          }

          // Transform the final result into an array for display
          const supplyArray = Object.keys(supplyTotals).map((itemName) => ({
            itemName,
            totalQuantity: supplyTotals[itemName].totalQuantity,
            brandName: supplyTotals[itemName].brand,
            departments: supplyTotals[itemName].departments,
          }));

          setOverallSupplies(supplyArray);
          setFilteredSupplies(supplyArray);
          setLoading(false);
        }
      });
    };

    fetchInventory();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);

    if (query === '') {
      setFilteredSupplies(overallSupplies);
    } else {
      const filteredData = overallSupplies.filter((item) =>
        item.itemName.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSupplies(filteredData);
    }
  };

  const navigateToSupplyDetails = (supply) => {
    navigation.navigate('SupplyDetails', { supply });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Overall Inventory</Text>

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search for supplies..."
        value={searchQuery}
        onChangeText={handleSearch}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#00796b" />
      ) : (
        <FlatList
          data={filteredSupplies}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigateToSupplyDetails(item)}>
              <Card style={styles.card}>
                <View style={styles.cardContent}>
                  <Text style={styles.itemName}>{item.itemName}</Text>
                  <Text style={styles.itemDetails}>Total: {item.totalQuantity} units</Text>
                  <Text style={styles.brandDetails}>Brand: {item.brandName}</Text>
                </View>
              </Card>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.itemName}
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#00796b',
  },
  searchBar: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#ffffff',
  },
  card: {
    backgroundColor: '#ffffff',
    marginBottom: 12,
    borderRadius: 10,
    elevation: 3,
  },
  cardContent: {
    padding: 15,
  },
  itemName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#00796b',
    marginBottom: 8,
  },
  itemDetails: {
    fontSize: 16,
    color: '#424242',
  },
  brandDetails: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
});

export default OverallInventory;
