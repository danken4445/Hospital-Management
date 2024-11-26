import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Modal, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Searchbar, Button } from 'react-native-paper';
import { getDatabase, ref, get } from 'firebase/database';
import { FontAwesome5 } from '@expo/vector-icons';
import { Camera } from 'expo-camera'; // Replacing BarCodeScanner with Camera
import { useNavigation } from '@react-navigation/native';

const PharmaLocalInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const [alertContent, setAlertContent] = useState({});
  const navigation = useNavigation(); // To navigate between screens

  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true); // Set loading true while data is fetched
      const db = getDatabase();
      const medsRef = ref(db, 'departments/Pharmacy/localMeds'); // Update to Pharmacy department

      try {
        const snapshot = await get(medsRef);
        if (snapshot.exists()) {
          const medsData = snapshot.val();
          const medsArray = Object.keys(medsData).map((key) => ({
            id: key,
            ...medsData[key],
            type: 'Medicines',
          }));
          setInventory(medsArray); // Set the full inventory from the meds node
          setFilteredInventory(medsArray); // Set filtered inventory as well initially
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false); // Set loading false after data is fetched
      }
    };

    fetchInventory();
  }, []);

  // Handle search query changes
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredInventory(inventory);
    } else {
      const filtered = inventory.filter((item) =>
        item.itemName?.toLowerCase().includes(query.toLowerCase()) ||
        item.brand?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredInventory(filtered);
    }
  };

  // Open item details modal
  const handleItemPress = (item) => {
    setSelectedItem(item);
    setItemModalVisible(true);
  };

  // Navigate to StockTransferScreen with selected item details
  const handleTransferStock = () => {
    setItemModalVisible(false); // Close item details modal
    navigation.navigate('PharmaStockTransferScreen', { itemDetails: selectedItem }); // Pass item details to StockTransferScreen
  };

  // Handle bar code scan results
  const handleBarCodeScanned = async ({ type, data }) => {
    setScanning(false);
    setModalVisible(false);

    try {
      const db = getDatabase();
      // Update the path to match your Firebase structure for Pharmacy
      const medsRef = ref(db, `departments/Pharmacy/localMeds/${data}`);

      // Check if the scanned data exists in the meds node
      const medsSnapshot = await get(medsRef);
      if (medsSnapshot.exists()) {
        const medsData = medsSnapshot.val();
        setSelectedItem({ id: data, ...medsData });
        setItemModalVisible(true); // Show the item details modal
      } else {
        setAlertContent({
          title: 'Error',
          message: 'Item not found in inventory.',
        });
        setCustomAlertVisible(true);
      }
    } catch (error) {
      console.error('Error fetching item data:', error);
      setAlertContent({
        title: 'Error',
        message: 'Failed to fetch item data.',
      });
      setCustomAlertVisible(true);
    }
  };

  // Render each inventory item
  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleItemPress(item)}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <FontAwesome5 name="pills" size={24} color="#4CAF50" />
            <Title style={styles.cardTitle}>{item.itemName}</Title>
          </View>
          <Paragraph><Text style={styles.label}>Brand:</Text> {item.brand}</Paragraph>
          <Paragraph><Text style={styles.label}>Max Quantity:</Text> {item.maxQuantity}</Paragraph>
          <Paragraph><Text style={styles.label}>Current Quantity:</Text> {item.quantity}</Paragraph>
          <Paragraph><Text style={styles.label}>Status:</Text> {item.status}</Paragraph>
        </Card.Content>
      </Card>
    </TouchableOpacity>
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

      {/* Item Details Modal */}
      <Modal visible={itemModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          {selectedItem && (
            <View style={styles.modalContent}>
              <Title>{selectedItem.itemName}</Title>
              <Paragraph><Text style={styles.label}>Brand:</Text> {selectedItem.brand}</Paragraph>
              <Paragraph><Text style={styles.label}>Quantity:</Text> {selectedItem.quantity}</Paragraph>
              <Paragraph><Text style={styles.label}>Status:</Text> {selectedItem.status}</Paragraph>
              <Button
                mode="contained"
                onPress={handleTransferStock}
                style={styles.transferButton}
              >
                Transfer Stocks
              </Button>
              <Button onPress={() => setItemModalVisible(false)}>Close</Button>
            </View>
          )}
        </View>
      </Modal>

      {/* QR Code Scanner Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          {scanning ? (
            <BarCodeScanner onBarCodeScanned={handleBarCodeScanned} style={styles.barcodeScanner} />
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
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  transferButton: {
    marginVertical: 10,
    backgroundColor: '#4CAF50',
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

export default PharmaLocalInventory;
