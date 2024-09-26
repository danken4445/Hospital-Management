import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Modal, TouchableOpacity } from 'react-native';
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
  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const [alertContent, setAlertContent] = useState({});

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
        setAlertContent({
          title: 'Item Found',
          message: `Supply Name: ${suppliesData.itemName}\nBrand: ${suppliesData.brand}\nQuantity: ${suppliesData.quantity}\nStatus: ${suppliesData.status}`,
        });
        setCustomAlertVisible(true);
        return;
      }

      // Check if the scanned data exists in the medicines node
      const medicinesSnapshot = await get(medicinesRef);
      if (medicinesSnapshot.exists()) {
        const medicinesData = medicinesSnapshot.val();
        setAlertContent({
          title: 'Item Found',
          message: `Medicine Name: ${medicinesData.itemName}\nQuantity: ${medicinesData.quantity}\nStatus: ${medicinesData.status}`,
        });
        setCustomAlertVisible(true);
        return;
      }

      // If item is not found in both nodes
      setAlertContent({
        title: 'Error',
        message: 'Item not found in inventory.',
      });
      setCustomAlertVisible(true);
    } catch (error) {
      console.error('Error fetching item data:', error);
      setAlertContent({
        title: 'Error',
        message: 'Failed to fetch item data.',
      });
      setCustomAlertVisible(true);
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
        <ActivityIndicator size="large" color="#7a0026" />
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
        style={styles.scanButton}
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
            <Button onPress={() => setModalVisible(false)}>Close</Button>
          )}
        </View>
      </Modal>

      {/* Custom Alert Modal */}
      <Modal visible={customAlertVisible} transparent={true} animationType="fade">
        <View style={styles.alertModalContainer}>
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>{alertContent.title}</Text>
            <Text style={styles.alertMessage}>{alertContent.message}</Text>
            <Button
              mode="contained"
              onPress={() => setCustomAlertVisible(false)}
              style={styles.alertButton}
              labelStyle={styles.alertButtonText}
            >
              OK
            </Button>
          </View>
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
    borderRadius: 8,
  },
  listContainer: {
    paddingBottom: 10,
  },
  card: {
    marginBottom: 10,
    borderRadius: 12,
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
    color: '#7a0026',
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
  },
  scanButton: {
    marginVertical: 20,
    backgroundColor: '#7a0026',
    borderRadius: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  barcodeScanner: {
    width: '100%',
    height: '60%',
  },
  alertModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  alertBox: {
    width: '80%',
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 5,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7a0026',
    marginBottom: 10,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  alertButton: {
    backgroundColor: '#7a0026',
    borderRadius: 8,
  },
  alertButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default InventoryScanner;
