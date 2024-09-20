import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import { getDatabase, ref, onValue } from 'firebase/database';
import { FontAwesome5 } from '@expo/vector-icons'; // Import icons for UI enhancement

const InventoryScreen = () => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getDatabase();
    const suppliesRef = ref(db, 'supplies');
    const medicinesRef = ref(db, 'medicines');

    const fetchData = () => {
      let allInventory = [];
      
      onValue(suppliesRef, (snapshot) => {
        if (snapshot.exists()) {
          const suppliesData = snapshot.val();
          const suppliesArray = Object.keys(suppliesData).map((key) => ({
            id: key,
            name: suppliesData[key].name,
            quantity: suppliesData[key].quantity,
            type: 'Supplies',
          }));
          allInventory = [...allInventory, ...suppliesArray];
        }
      });

      onValue(medicinesRef, (snapshot) => {
        if (snapshot.exists()) {
          const medicinesData = snapshot.val();
          const medicinesArray = Object.keys(medicinesData).map((key) => ({
            id: key,
            name: medicinesData[key].name,
            quantity: medicinesData[key].quantity,
            type: 'Medicines',
          }));
          allInventory = [...allInventory, ...medicinesArray];
          setInventory(allInventory);
          setFilteredInventory(allInventory);
          setLoading(false);
        }
      });
    };

    fetchData();

    // Clean up listeners when the component is unmounted
    return () => {
      // Turn off listeners if needed
    };
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredInventory(inventory);
    } else {
      const filtered = inventory.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredInventory(filtered);
    }
  };

  const renderInventoryItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <FontAwesome5
            name={item.type === 'Supplies' ? 'box' : 'pills'}
            size={24}
            color={item.type === 'Supplies' ? '#4CAF50' : '#FF5722'}
          />
          <Title style={styles.cardTitle}>{item.name}</Title>
        </View>
        <Paragraph>Quantity: {item.quantity}</Paragraph>
        <Paragraph>Type: {item.type}</Paragraph>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search inventory..."
        value={searchQuery}
        onChangeText={handleSearch}
      />

      {/* Inventory List */}
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={filteredInventory}
          renderItem={renderInventoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  listContainer: {
    paddingBottom: 10,
  },
  card: {
    marginBottom: 10,
    borderRadius: 10,
    elevation: 3,
    backgroundColor: '#fff',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default InventoryScreen;
