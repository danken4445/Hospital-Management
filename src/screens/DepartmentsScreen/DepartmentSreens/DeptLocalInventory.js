import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Modal, Alert } from 'react-native';
import { Card, Title, Paragraph, Searchbar, Button } from 'react-native-paper';
import { getDatabase, ref, onValue, get } from 'firebase/database';
import { FontAwesome5 } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { auth } from '../../../../firebaseConfig'; // Adjust this path as needed

const LocalInventoryScanner = ({ route, navigation }) => {
  const { clinic, department, userRole, permissions } = route.params || {};
  const userClinic = clinic || null;

  // Check if clinic context is available
  if (!userClinic) {
    Alert.alert('Error', 'No clinic context available. Please navigate from the department dashboard.');
    navigation.goBack();
    return null;
  }

  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const [alertContent, setAlertContent] = useState({});
  const [userDepartment, setUserDepartment] = useState(department || null);

  // Fetch the user department on component mount
  useEffect(() => {
    const fetchUserDepartment = async () => {
      const db = getDatabase();
      const user = auth.currentUser;
      if (user && !userDepartment) {
        try {
          // Try clinic-specific user data first
          const userRef = ref(db, `${userClinic}/users/${user.uid}`);
          const snapshot = await get(userRef);
          
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setUserDepartment(userData.department || userData.role);
          } else {
            // Fallback to global users
            const globalUserRef = ref(db, `users/${user.uid}`);
            const globalSnapshot = await get(globalUserRef);
            if (globalSnapshot.exists()) {
              const userData = globalSnapshot.val();
              setUserDepartment(userData.department);
            }
          }
        } catch (error) {
          console.error('Error fetching user department:', error);
        }
      }
    };

    fetchUserDepartment();
  }, [userClinic, userDepartment]);

  // Fetch department-specific inventory once the department is set
  useEffect(() => {
    const fetchLocalInventory = async () => {
      const deptName = userDepartment || department;
      if (!deptName || !userClinic) return; // Wait until department and clinic are set

      const db = getDatabase();
      // Use clinic-specific paths for local inventory
      const localSuppliesRef = ref(db, `${userClinic}/departments/${deptName}/localSupplies`);
      const localMedsRef = ref(db, `${userClinic}/departments/${deptName}/localMeds`);
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
        
        // Update state after supplies are processed
        updateInventoryState();
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
        
        // Update state after medicines are processed
        updateInventoryState();
      });

      const updateInventoryState = () => {
        // Sort inventory by name for better UX
        const sortedInventory = inventoryArray.sort((a, b) => {
          const nameA = a.itemName || a.genericName || '';
          const nameB = b.itemName || b.genericName || '';
          return nameA.localeCompare(nameB);
        });
        
        setInventory(sortedInventory);
        setFilteredInventory(sortedInventory);
        setLoading(false);
      };
    };

    fetchLocalInventory();
  }, [userDepartment, userClinic, department]);

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
      const deptName = userDepartment || department;
      
      // Use clinic-specific paths for scanning
      const suppliesRef = ref(db, `${userClinic}/departments/${deptName}/localSupplies/${data}`);
      const medicinesRef = ref(db, `${userClinic}/departments/${deptName}/localMeds/${data}`);

      // Check if the scanned data exists in the supplies node
      const suppliesSnapshot = await get(suppliesRef);
      if (suppliesSnapshot.exists()) {
        const suppliesData = suppliesSnapshot.val();
        setAlertContent({
          title: 'Item Found',
          message: `Supply Name: ${suppliesData.itemName || 'N/A'}\nBrand: ${suppliesData.brand || 'N/A'}\nQuantity: ${suppliesData.quantity || 0}\nStatus: ${suppliesData.status || 'Unknown'}`,
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
          message: `Medicine Name: ${medicinesData.genericName || 'N/A'}\nQuantity: ${medicinesData.quantity || 0}\nStatus: ${medicinesData.status || 'Unknown'}`,
        });
        setCustomAlertVisible(true);
        return;
      }

      // If item is not found in both nodes
      setAlertContent({
        title: 'Item Not Found',
        message: `Item not found in ${userClinic} - ${deptName} inventory.`,
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

  const renderItem = ({ item }) => {
    const isSupply = item.type === 'Supplies';
    const displayName = isSupply ? item.itemName : item.genericName;
    const displayDescription = isSupply ? item.brand : item.shortDesc;
  
    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <FontAwesome5
              name={isSupply ? 'box' : 'pills'}
              size={24}
              color={isSupply ? '#4CAF50' : '#FF5722'}
            />
            <Title style={styles.cardTitle}>{displayName || 'Unknown Item'}</Title>
          </View>
          <Paragraph>
            <Text style={styles.label}>{isSupply ? 'Brand:' : 'Description:'}</Text> {displayDescription || 'N/A'}
          </Paragraph>
          <Paragraph>
            <Text style={styles.label}>Current Quantity:</Text> {item.quantity || 0}
          </Paragraph>
          <Paragraph>
            <Text style={styles.label}>Status:</Text> {item.status || 'Unknown'}
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
      {/* Clinic Header */}
      <View style={styles.clinicHeader}>
        <View style={styles.clinicInfo}>
          <FontAwesome5 name="hospital" size={16} color="#7a0026" style={styles.clinicIcon} />
          <Text style={styles.clinicName}>{userClinic || 'No Clinic'}</Text>
        </View>
        <Text style={styles.departmentText}>{userDepartment || department || 'Loading...'} Department</Text>
      </View>

      {/* Department Title */}
      <Text style={styles.header}>Local Inventory</Text>

      {/* Search Bar */}
      <Searchbar
        placeholder="Search inventory..."
        value={searchQuery}
        onChangeText={handleSearch}
        style={styles.searchBar}
      />

      {/* Local Inventory List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7a0026" />
          <Text style={styles.loadingText}>Loading inventory...</Text>
        </View>
      ) : filteredInventory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome5 name="boxes" size={50} color="#ccc" />
          <Text style={styles.emptyText}>
            {searchQuery ? 'No matching items found' : `No local inventory available for ${userClinic}`}
          </Text>
          {!searchQuery && (
            <Text style={styles.emptySubText}>
              Local inventory for {userDepartment || department} department will appear here
            </Text>
          )}
        </View>
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
          <View style={styles.scannerHeader}>
            <Text style={styles.scannerTitle}>Scan Item QR Code</Text>
            <Button 
              onPress={() => setModalVisible(false)}
              textColor="#fff"
            >
              Close
            </Button>
          </View>
          {scanning ? (
            <CameraView
              onBarCodeScanned={handleBarCodeScanned}
              style={styles.barcodeScanner}
            />
          ) : (
            <View style={styles.scannerPlaceholder}>
              <Text style={styles.scannerPlaceholderText}>Camera Loading...</Text>
            </View>
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
  clinicHeader: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: -20,
    marginTop: -20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clinicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clinicIcon: {
    marginRight: 8,
  },
  clinicName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  departmentText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#7a0026',
  },
  searchBar: {
    marginBottom: 15,
    borderRadius: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptySubText: {
    marginTop: 5,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
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
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  scannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  scannerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  barcodeScanner: {
    flex: 1,
  },
  scannerPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  scannerPlaceholderText: {
    color: '#fff',
    fontSize: 16,
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
