import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getDatabase, ref, onValue } from 'firebase/database';
import { Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const PharmaOverallInventory = () => {
  const [overallMeds, setOverallMeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMeds, setFilteredMeds] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const db = getDatabase();
    const pharmacyRef = ref(db, 'departments/Pharmacy/localMeds'); // Firebase path to localMeds

    const fetchInventory = () => {
      let medsTotals = {};

      // Fetch localMeds under Pharmacy
      onValue(pharmacyRef, (snapshot) => {
        if (snapshot.exists()) {
          const medsData = snapshot.val();

          // Aggregate medicines from localMeds
          for (const medKey in medsData) {
            const med = medsData[medKey];

            // Ensure itemName and quantity exist
            const itemName = med.itemName || 'Unknown Medicine';
            const quantity = med.quantity || 0;
            const brand = med.brand || 'Unknown Brand';

            // If the item is already in medsTotals, aggregate the quantities
            if (medsTotals[itemName]) {
              medsTotals[itemName].totalQuantity += quantity;
              medsTotals[itemName].brand = brand; // Keep brand consistent
            } else {
              // If the item is not in medsTotals, create a new entry
              medsTotals[itemName] = {
                totalQuantity: quantity,
                brand: brand,
              };
            }
          }

          // Transform the final result into an array for display
          const medsArray = Object.keys(medsTotals).map((itemName) => ({
            itemName,
            totalQuantity: medsTotals[itemName].totalQuantity,
            brandName: medsTotals[itemName].brand,
          }));

          setOverallMeds(medsArray);
          setFilteredMeds(medsArray);
          setLoading(false);
        } else {
          // If no data is found
          console.log('No data found');
          setLoading(false);
        }
      }, (error) => {
        // Log errors
        console.error('Error fetching data:', error);
        setLoading(false);
      });
    };

    fetchInventory();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);

    if (query === '') {
      setFilteredMeds(overallMeds);
    } else {
      const filteredData = overallMeds.filter((item) =>
        item.itemName ? item.itemName.toLowerCase().includes(query.toLowerCase()) : false
      );
      setFilteredMeds(filteredData);
    }
  };

  const navigateToMedDetails = (med) => {
    navigation.navigate('MedicineDetails', { med });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Overall Medicine Inventory</Text>

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search for medicines..."
        value={searchQuery}
        onChangeText={handleSearch}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#00796b" />
      ) : filteredMeds.length > 0 ? (
        <FlatList
          data={filteredMeds}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigateToMedDetails(item)}>
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
      ) : (
        <Text style={styles.noDataText}>No Medicines Found</Text>
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
  noDataText: {
    textAlign: 'center',
    color: '#757575',
    marginTop: 20,
    fontSize: 16,
  },
});

export default PharmaOverallInventory;
