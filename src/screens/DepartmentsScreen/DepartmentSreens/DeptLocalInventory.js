import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Modal } from 'react-native';
import { Card, Title, Paragraph, Searchbar, Button } from 'react-native-paper';
import { getDatabase, ref, onValue, get } from 'firebase/database';
import { FontAwesome5 } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { auth } from '../../../../firebaseConfig'; // Adjust this path as needed

const LocalInventoryScanner = () => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const [alertContent, setAlertContent] = useState({});
  const [userDepartment, setUserDepartment] = useState(null);

  // Fetch the user department on component mount
  useEffect(() => {
    const fetchUserDepartment = async () => {
      const db = getDatabase();
      const user = auth.currentUser;
      if (user) {
        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setUserDepartment(userData.department); // Set user department (e.g., ER, ICU)
        }
      }
    };

    fetchUserDepartment();
  }, []);

  // Fetch department-specific inventory once the department is set
  useEffect(() => {
    const fetchLocalInventory = async () => {
      if (!userDepartment) return; // Wait until department is set

      const db = getDatabase();
      const localSuppliesRef = ref(db, `departments/${userDepartment}/localSupplies`);
      const localMedsRef = ref(db, `departments/${userDepartment}/localMeds`);
      const inventoryArray = [];

      // Fetch Supplies
      onValue(localSuppliesRef, (snapshot) => {
        if (snapshot.exists()) {
          const suppliesData = snapshot.val();
          const suppliesArray = Object.keys(suppliesData).map((key) => ({
            id: key,
            ...suppliesData[key],
            type: 'Supplies',
          }));
          inventoryArray.push(...suppliesArray);
        }
      });

      // Fetch Medicines
      onValue(localMedsRef, (snapshot) => {
        if (snapshot.exists()) {
          const medsData = snapshot.val();
          const medsArray = Object.keys(medsData).map((key) => ({
            id: key,
            ...medsData[key],
            type: 'Medicines',
          }));
          inventoryArray.push(...medsArray);
        }
      });

      // Set the final inventory and filtered inventory
      setInventory(inventoryArray);
      setFilteredInventory(inventoryArray);
      setLoading(false);
    };

    fetchLocalInventory();
  }, [userDepartment]);

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

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanning(false);
    setModalVisible(false);

    try {
      const db = getDatabase();
      const suppliesRef = ref(db, `departments/${userDepartment}/localSupplies/${data}`);
      const medicinesRef = ref(db, `departments/${userDepartment}/localMeds/${data}`);

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
          message: `Medicine Name: ${medicinesData.genericName}\nQuantity: ${medicinesData.quantity}\nStatus: ${medicinesData.status}`,
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

  const renderItem = ({ item }) => {
    const isSupply = item.type === 'Supplies';
  
    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <FontAwesome5
              name={isSupply ? 'box' : 'pills'}
              size={24}
              color={isSupply ? '#4CAF50' : '#FF5722'}
            />
            <Title style={styles.cardTitle}>{isSupply ? item.itemName : item.genericName}</Title>
          </View>
          <Paragraph>
            <Text style={styles.label}>{isSupply ? 'Brand:' : 'Description:'}</Text> {isSupply ? item.brand : item.shortDesc}
          </Paragraph>
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
  };
  
  return (
    <View style={styles.container}>
      {/* Department Title */}
      <Text style={styles.header}>Department: {userDepartment || 'Loading...'}</Text>

      {/* Search Bar */}
      <Searchbar
        placeholder="Search inventory..."
        value={searchQuery}
        onChangeText={handleSearch}
        style={styles.searchBar}
      />

      {/* Local Inventory List */}
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
            <CameraView
              onBarCodeScanned={handleBarCodeScanned}
              style={styles.barcodeScanner}
            />
          ) : (
            <Button onPress={() => setModalVisible(false)}>Close</Button>
          )}
        </View>
      </Modal>

      {/* Custom Alert Modal to Show Scanned Item Details */}
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
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#00796b',
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

export default LocalInventoryScanner;
