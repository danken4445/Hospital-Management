import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, Modal } from 'react-native';
import { Card, Title, Paragraph, Searchbar, Button } from 'react-native-paper';
import { getDatabase, ref, onValue, get } from 'firebase/database';
import { FontAwesome5 } from '@expo/vector-icons';
import { BarCodeScanner } from 'expo-barcode-scanner';

const InventoryScanner = () => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const db = getDatabase();
    const suppliesRef = ref(db, 'supplies');
    const medicinesRef = ref(db, 'medicine');

    const fetchInventory = () => {
      let allInventory = [];

      // Fetch Supplies
      onValue(suppliesRef, (snapshot) => {
        if (snapshot.exists()) {
          const suppliesData = snapshot.val();
          const suppliesArray = Object.keys(suppliesData).map((key) => ({
            id: key,
            ...suppliesData[key],
            type: 'Supplies',
          }));
          allInventory = [...allInventory, ...suppliesArray];
        }
      });

      // Fetch Medicines
      onValue(medicinesRef, (snapshot) => {
        if (snapshot.exists()) {
          const medicinesData = snapshot.val();
          const medicinesArray = Object.keys(medicinesData).map((key) => ({
            id: key,
            ...medicinesData[key],
            type: 'Medicine',
          }));
          allInventory = [...allInventory, ...medicinesArray];
          setInventory(allInventory);
          setFilteredInventory(allInventory);
          setLoading(false);
        }
      });
    };

    fetchInventory();

    return () => {
      // Clean up listeners when component unmounts
    };
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredInventory(inventory);
    } else {
      const filtered = inventory.filter((item) =>
        item.supplyName?.toLowerCase().includes(query.toLowerCase()) ||
        item.brand?.toLowerCase().includes(query.toLowerCase()) ||
        item.itemName?.toLowerCase().includes(query.toLowerCase()) // For medicines
      );
      setFilteredInventory(filtered);
    }
  };

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanning(false);
    setModalVisible(false);

    try {
      const db = getDatabase();
      const suppliesRef = ref(db, `supplies/${data}`);
      const medicinesRef = ref(db, `medicine/${data}`);

      // Check if the scanned data exists in the supplies node
      const suppliesSnapshot = await get(suppliesRef);
      if (suppliesSnapshot.exists()) {
        const suppliesData = suppliesSnapshot.val();
        Alert.alert(
          'Item Found',
          `Supply Name: ${suppliesData.supplyName}\nBrand: ${suppliesData.brand}\nQuantity: ${suppliesData.quantity}\nStatus: ${suppliesData.status}`
        );
        return;
      }

      // Check if the scanned data exists in the medicines node
      const medicinesSnapshot = await get(medicinesRef);
      if (medicinesSnapshot.exists()) {
        const medicinesData = medicinesSnapshot.val();
        Alert.alert(
          'Item Found',
          `Medicine Name: ${medicinesData.itemName}\nQuantity: ${medicinesData.quantity}\nStatus: ${medicinesData.status}`
        );
        return;
      }

      // If item is not found in both nodes
      Alert.alert('Error', 'Item not found in inventory.');
    } catch (error) {
      console.error('Error fetching item data:', error);
      Alert.alert('Error', 'Failed to fetch item data.');
    }
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <FontAwesome5
            name={item.type === 'Supplies' ? 'box' : 'pills'}
            size={24}
            color={item.type === 'Supplies' ? '#4CAF50' : '#FF5722'}
          />
          <Title style={styles.cardTitle}>{item.supplyName || item.itemName}</Title>
        </View>
        {item.type === 'Supplies' && (
          <>
            <Paragraph>
              <Text style={styles.label}>Brand:</Text> {item.brand}
            </Paragraph>
            <Paragraph>
              <Text style={styles.label}>Max Quantity:</Text> {item.maxQuantity}
            </Paragraph>
          </>
        )}
        <Paragraph>
          <Text style={styles.label}>Current Quantity:</Text> {item.quantity}
        </Paragraph>
        <Paragraph>
          <Text style={styles.label}>Status:</Text> {item.status}
        </Paragraph>
        <Paragraph>
          <Text style={styles.label}>Type:</Text> {item.type}
        </Paragraph>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <Searchbar
        placeholder="Search inventory..."
        value={searchQuery}
        onChangeText={handleSearch}
        style={styles.searchBar}
      />

      {/* Inventory List */}
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={filteredInventory}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* QR Code Scanner Button */}
      <Button
        mode="contained"
        onPress={() => {
          setScanning(true);
          setModalVisible(true);
        }}
      >
        Scan QR Code
      </Button>

      {/* QR Code Scanner Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          {scanning ? (
            <BarCodeScanner
              onBarCodeScanned={handleBarCodeScanned}
              style={styles.barcodeScanner}
            />
          ) : (
            <Button title="Close" onPress={() => setModalVisible(false)} />
          )}
        </View>
      </Modal>
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
    marginBottom: 15,
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
  label: {
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent background
  },
  barcodeScanner: {
    width: '100%',
    height: '60%',
  },
});

export default InventoryScanner;
