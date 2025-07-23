import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Modal, TouchableOpacity, Alert } from 'react-native';
import { Card, Title, Paragraph, Searchbar, Button, Surface } from 'react-native-paper';
import { getDatabase, ref, onValue, get } from 'firebase/database';
import { FontAwesome5 } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';

const InventoryScanner = ({ route }) => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const [alertContent, setAlertContent] = useState({});
  const [permission, requestPermission] = useCameraPermissions();

  // Get clinic context from navigation params
  const { clinic, userRole, permissions } = route?.params || {};
  const userClinic = clinic || null;

  useEffect(() => {
    const fetchInventory = () => {
      // If no clinic context is available, don't load data
      if (!userClinic) {
        setLoading(false);
        return;
      }

      const db = getDatabase();
      // Reference clinic-specific inventory
      const suppliesRef = ref(db, `${userClinic}/supplies`);
      const medicinesRef = ref(db, `${userClinic}/medicine`);
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
      }, (error) => {
        console.error('Error fetching supplies:', error);
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
        }
        
        // Update state after both queries complete
        setInventory(allInventory);
        setFilteredInventory(allInventory);
        setLoading(false);
      }, (error) => {
        console.error('Error fetching medicines:', error);
        setLoading(false);
      });
    };

    fetchInventory();

    return () => {
      // Clean up listeners when component unmounts
    };
  }, [userClinic]);

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

    // Check if clinic context is available
    if (!userClinic) {
      setAlertContent({
        title: 'Error',
        message: 'No clinic context available. Please navigate from the dashboard.',
      });
      setCustomAlertVisible(true);
      return;
    }

    try {
      const db = getDatabase();
      // Check clinic-specific inventory paths
      const suppliesRef = ref(db, `${userClinic}/supplies/${data}`);
      const medicinesRef = ref(db, `${userClinic}/medicine/${data}`);

      // Check if the scanned data exists in the supplies node
      const suppliesSnapshot = await get(suppliesRef);
      if (suppliesSnapshot.exists()) {
        const suppliesData = suppliesSnapshot.val();
        setAlertContent({
          title: 'Supply Found',
          message: `Clinic: ${userClinic}\nSupply Name: ${suppliesData.itemName}\nBrand: ${suppliesData.brand}\nQuantity: ${suppliesData.quantity}\nStatus: ${suppliesData.status}`,
        });
        setCustomAlertVisible(true);
        return;
      }

      // Check if the scanned data exists in the medicines node
      const medicinesSnapshot = await get(medicinesRef);
      if (medicinesSnapshot.exists()) {
        const medicinesData = medicinesSnapshot.val();
        setAlertContent({
          title: 'Medicine Found',
          message: `Clinic: ${userClinic}\nMedicine Name: ${medicinesData.itemName}\nQuantity: ${medicinesData.quantity}\nStatus: ${medicinesData.status}`,
        });
        setCustomAlertVisible(true);
        return;
      }

      // If item is not found in both nodes
      setAlertContent({
        title: 'Item Not Found',
        message: `Item not found in ${userClinic} inventory. Please verify the QR code.`,
      });
      setCustomAlertVisible(true);
    } catch (error) {
      console.error('Error fetching item data:', error);
      setAlertContent({
        title: 'Error',
        message: 'Failed to fetch item data. Please try again.',
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

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#7a0026" />
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Surface style={styles.emptyContainer}>
          <FontAwesome5 name="camera-retro" size={48} color="#9E9E9E" />
          <Text style={styles.emptyText}>Camera permission is required to scan QR codes.</Text>
          <Button mode="contained" onPress={requestPermission} style={styles.scanButton}>
            Grant Camera Permission
          </Button>
        </Surface>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Clinic Info */}
      <Surface style={styles.header}>
        <View style={styles.headerContent}>
          <FontAwesome5 name="search" size={24} color="#7a0026" />
          <Text style={styles.headerTitle}>Inventory Scanner</Text>
        </View>
        {userClinic && (
          <Text style={styles.clinicInfo}>Clinic: {userClinic}</Text>
        )}
      </Surface>

      {/* Clinic Warning */}
      {!userClinic && (
        <Surface style={styles.warningContainer}>
          <FontAwesome5 name="exclamation-triangle" size={20} color="#FF9800" />
          <Text style={styles.warningText}>
            No clinic context available. Please navigate from the dashboard.
          </Text>
        </Surface>
      )}

      {/* Search Bar */}
      {userClinic && (
        <Searchbar
          placeholder="Search inventory..."
          value={searchQuery}
          onChangeText={handleSearch}
          style={styles.searchBar}
        />
      )}

      {/* Inventory List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7a0026" />
          <Text style={styles.loadingText}>Loading inventory...</Text>
        </View>
      ) : !userClinic ? (
        <Surface style={styles.emptyContainer}>
          <FontAwesome5 name="hospital" size={48} color="#9E9E9E" />
          <Text style={styles.emptyText}>
            Please access scanner from your clinic dashboard.
          </Text>
        </Surface>
      ) : filteredInventory.length === 0 ? (
        <Surface style={styles.emptyContainer}>
          <FontAwesome5 name="box-open" size={48} color="#9E9E9E" />
          <Text style={styles.emptyText}>
            {searchQuery ? 'No items found matching your search.' : `No inventory available for ${userClinic}.`}
          </Text>
        </Surface>
      ) : (
        <FlatList
          data={filteredInventory}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* QR Code Scanner Button */}
      {userClinic && (
        <Button
          mode="contained"
          onPress={() => {
            if (permission?.granted) {
              setScanning(true);
              setModalVisible(true);
            } else {
              Alert.alert('Permission Required', 'Camera permission is required to scan QR codes.');
            }
          }}
          style={styles.scanButton}
          icon="qrcode-scan"
        >
          Scan QR Code
        </Button>
      )}

      {/* QR Code Scanner Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.scannerHeader}>
            <Text style={styles.scannerTitle}>Scan Inventory QR Code</Text>
            <Text style={styles.scannerSubtitle}>Scanning {userClinic} Inventory</Text>
          </View>
          {scanning && permission?.granted && (
            <CameraView
              style={styles.barcodeScanner}
              onBarcodeScanned={handleBarCodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ['qr', 'ean13', 'code128'],
              }}
            />
          )}
          <View style={styles.scannerFooter}>
            <Button 
              mode="contained" 
              onPress={() => {
                setModalVisible(false);
                setScanning(false);
              }}
              style={styles.closeButton}
            >
              Close Scanner
            </Button>
          </View>
        </View>
      </Modal>

      {/* Custom Alert Modal */}
      <Modal visible={customAlertVisible} transparent={true} animationType="fade">
        <View style={styles.alertModalContainer}>
          <View style={styles.alertBox}>
            <FontAwesome5 
              name={alertContent.title === 'Supply Found' || alertContent.title === 'Medicine Found' ? 'check-circle' : 'exclamation-triangle'} 
              size={32} 
              color={alertContent.title === 'Supply Found' || alertContent.title === 'Medicine Found' ? '#4CAF50' : '#FF9800'} 
              style={styles.alertIcon}
            />
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
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  header: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#ffffff',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#7a0026',
  },
  clinicInfo: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#FFF3E0',
    elevation: 1,
  },
  warningText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#F57C00',
    flex: 1,
  },
  searchBar: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    elevation: 1,
    margin: 16,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9E9E9E',
    textAlign: 'center',
    lineHeight: 22,
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
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
    color: '#666',
  },
  scanButton: {
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: '#7a0026',
    borderRadius: 12,
    elevation: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  scannerHeader: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  scannerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scannerSubtitle: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
    marginTop: 4,
  },
  barcodeScanner: {
    flex: 1,
  },
  scannerFooter: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  closeButton: {
    backgroundColor: '#7a0026',
    borderRadius: 8,
  },
  alertModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  alertBox: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
  },
  alertIcon: {
    marginBottom: 16,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#7a0026',
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
    color: '#424242',
  },
  alertButton: {
    backgroundColor: '#7a0026',
    borderRadius: 8,
    paddingHorizontal: 24,
  },
  alertButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default InventoryScanner;
