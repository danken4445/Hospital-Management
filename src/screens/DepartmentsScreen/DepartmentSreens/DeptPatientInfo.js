// Import statements
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Modal, // Import Modal from react-native
} from 'react-native';
import {
  Appbar,
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  IconButton,
  Modal as PaperModal, // Rename Modal from react-native-paper
  Portal,
  Provider as PaperProvider,
  DefaultTheme,
  Subheading,
  Divider,
  Searchbar,
  FAB,
  Snackbar,
} from 'react-native-paper';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { getDatabase, ref, get, update, push } from 'firebase/database';
import DateTimePicker from '@react-native-community/datetimepicker';
import { auth } from '../../../../firebaseConfig'; // Ensure this path is correct

const DeptPatientInfoScreen = ({ route, navigation }) => {
  const { patientData } = route.params;
  const [name, setName] = useState(patientData.firstName);
  const [lastName, setLastName] = useState(patientData.lastName);
  const [birth, setBirth] = useState(patientData.birth);
  const [contact, setContact] = useState(patientData.contact);
  const [diagnosis, setDiagnosis] = useState(patientData.diagnosis);
  const [roomType, setRoomType] = useState(patientData.roomType);
  const [status, setStatus] = useState(patientData.status);
  const [suppliesUsed, setSuppliesUsed] = useState(
    Array.isArray(patientData.suppliesUsed) ? patientData.suppliesUsed : []
  );
  const [medUse, setMedUse] = useState(
    Array.isArray(patientData.medUse) ? patientData.medUse : []
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [quantityModalVisible, setQuantityModalVisible] = useState(false);
  const [scanningFor, setScanningFor] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scannedItems, setScannedItems] = useState([]);
  const [quantity, setQuantity] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [addPrescription, setAddPrescription] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [prescriptionName, setPrescriptionName] = useState('');
  const [dosage, setDosage] = useState('');
  const [instruction, setInstruction] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [prescriptionModalVisible, setPrescriptionModalVisible] = useState(false);
  const [userDepartment, setUserDepartment] = useState(null);
  const [currentScannedItem, setCurrentScannedItem] = useState(null);
  const [suppliesSearchTerm, setSuppliesSearchTerm] = useState('');
  const [medSearchTerm, setMedSearchTerm] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    setName(patientData.firstName);
    setLastName(patientData.lastName);
    setBirth(patientData.birth);
    setContact(patientData.contact);
    setDiagnosis(patientData.diagnosis);
    setRoomType(patientData.roomType);
    setStatus(patientData.status);
    setSuppliesUsed(
      Array.isArray(patientData.suppliesUsed) ? patientData.suppliesUsed : []
    );
    setMedUse(Array.isArray(patientData.medUse) ? patientData.medUse : []);
    setPrescriptions(patientData.prescriptions || {});

    const fetchUserDepartment = async () => {
      const user = auth.currentUser;
      if (user) {
        const db = getDatabase();
        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setUserDepartment(userData.role); // Assuming 'role' contains the department name
        }
      }
    };

    fetchUserDepartment();

    // Request camera permissions
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error', 'Camera permissions are required to scan barcodes.');
      }
    })();
  }, [patientData]);

  const handleScan = (type) => {
    setScanningFor(type);
    setScanning(true);
    setModalVisible(true);
  };

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanning(false);
    setModalVisible(false);

    if (!userDepartment) {
      Alert.alert('Error', 'Failed to determine user department.');
      return;
    }

    try {
      const db = getDatabase();
      let itemRef;

      if (scanningFor === 'supplies') {
        itemRef = ref(db, `departments/${userDepartment}/localSupplies/${data}`);
      } else if (scanningFor === 'medicines') {
        itemRef = ref(db, `departments/${userDepartment}/localMeds/${data}`);
      }

      const snapshot = await get(itemRef);

      if (snapshot.exists()) {
        const itemData = snapshot.val();
        setCurrentScannedItem({ ...itemData, id: data, type: scanningFor });
        setQuantityModalVisible(true);
      } else {
        Alert.alert('Error', 'Item not found in inventory.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to fetch item data.');
    }
  };

  const handleQuantityConfirm = async () => {
    const quantityToUse = parseInt(quantity, 10);
    if (isNaN(quantityToUse) || quantityToUse <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity.');
      return;
    }

    if (!userDepartment) {
      Alert.alert('Error', 'Failed to determine user department.');
      return;
    }

    try {
      const db = getDatabase();
      let itemRef;

      if (currentScannedItem.type === 'supplies') {
        itemRef = ref(db, `departments/${userDepartment}/localSupplies/${currentScannedItem.id}`);
      } else if (currentScannedItem.type === 'medicines') {
        itemRef = ref(db, `departments/${userDepartment}/localMeds/${currentScannedItem.id}`);
      }

      const snapshot = await get(itemRef);

      if (snapshot.exists()) {
        const itemData = snapshot.val();
        const availableQuantity = itemData.quantity;

        if (availableQuantity >= quantityToUse) {
          setScannedItems((prevItems) => [
            ...prevItems,
            { ...currentScannedItem, quantity: quantityToUse },
          ]);
          setQuantity('');
          setCurrentScannedItem(null);
          setQuantityModalVisible(false);
        } else {
          Alert.alert(
            'Insufficient Quantity',
            `Only ${availableQuantity} units of ${currentScannedItem.itemName} are available.`
          );
        }
      } else {
        Alert.alert('Error', 'Item not found in inventory.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to check item quantity.');
    }
  };

  const logInventoryHistory = async (itemName, quantity, type) => {
    const db = getDatabase();
    const historyRef = ref(db, `departments/${userDepartment}/usageHistory`);
    const newHistoryRef = push(historyRef);

    const patientId = patientData.qrData || 'Unknown ID';
    const firstName = patientData.firstName || 'Unknown Name';
    const lastName = patientData.lastName || 'Unknown Name';

    if (!itemName || !quantity || !type) {
      console.error('Invalid inventory data: itemName, quantity, or type is missing.');
      return;
    }

    const historyData = {
      patientId,
      firstName,
      lastName,
      itemName,
      quantity,
      type,
      timestamp: new Date().toISOString(),
    };

    try {
      await update(newHistoryRef, historyData);
      console.log('Inventory history logged successfully');
    } catch (error) {
      console.error('Error logging inventory history:', error);
    }
  };

  const handleAddPrescription = () => {
    if (!prescriptionName || !dosage || !instruction) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const newPrescription = {
      prescriptionName: prescriptionName,
      dosage,
      instruction,
      createdAt: new Date().toISOString(),
    };

    setPrescriptions((prev) => ({
      ...prev,
      [new Date().getTime()]: newPrescription,
    }));

    setPrescriptionName('');
    setDosage('');
    setInstruction('');
    setPrescriptionModalVisible(false);
  };

  const renderPrescriptions = () => {
    return Object.entries(prescriptions).map(([key, item]) => (
      <Card key={key} style={styles.prescriptionCard}>
        <Card.Title title={item.prescriptionName} />
        <Card.Content>
          <Paragraph>Dosage: {item.dosage}</Paragraph>
          <Paragraph>Instruction: {item.instruction}</Paragraph>
          <Paragraph>Added At: {new Date(item.createdAt).toLocaleString()}</Paragraph>
        </Card.Content>
      </Card>
    ));
  };

  const handleSaveAll = async () => {
    const db = getDatabase();
    const patientRef = ref(db, `patient/${patientData.qrData}`);

    if (!name || !birth || !contact || !diagnosis || !roomType || !status) {
      Alert.alert('Error', 'All fields must be filled out before saving.');
      return;
    }

    try {
      let updatedSuppliesUsed = [...suppliesUsed];
      let updatedMedUse = [...medUse];

      for (let scannedItem of scannedItems) {
        const quantityToUse = scannedItem.quantity;
        const itemType = scannedItem.type;
        let itemRef;
        let itemDetails = {};

        if (itemType === 'supplies') {
          itemRef = ref(db, `departments/${userDepartment}/localSupplies/${scannedItem.id}`);
        } else if (itemType === 'medicines') {
          itemRef = ref(db, `departments/${userDepartment}/localMeds/${scannedItem.id}`);
        }

        const snapshot = await get(itemRef);
        if (snapshot.exists()) {
          itemDetails = snapshot.val();
        } else {
          Alert.alert('Error', 'Item details not found for ' + scannedItem.itemName);
          continue;
        }

        if (itemDetails.quantity >= quantityToUse) {
          const updatedQuantity = itemDetails.quantity - quantityToUse;
          await update(itemRef, { quantity: updatedQuantity });

          const timestamp = new Date().toISOString();
          const retailPrice = itemDetails.retailPrice || 0;

          const usageEntry = {
            id: scannedItem.id,
            name: scannedItem.itemName,
            quantity: quantityToUse,
            timestamp: timestamp,
            retailPrice: retailPrice,
          };

          if (itemType === 'supplies') {
            updatedSuppliesUsed.push(usageEntry);
          } else if (itemType === 'medicines') {
            updatedMedUse.push(usageEntry);
          }

          await logInventoryHistory(scannedItem.itemName, quantityToUse, itemType);
        } else {
          Alert.alert('Error', 'Insufficient quantity in inventory for ' + scannedItem.itemName);
        }
      }

      const updatedData = {
        name,
        birth,
        contact,
        diagnosis,
        roomType,
        status,
        suppliesUsed: updatedSuppliesUsed,
        medUse: updatedMedUse,
        prescriptions,
      };

      await update(patientRef, updatedData);

      setSuppliesUsed(updatedSuppliesUsed);
      setMedUse(updatedMedUse);

      setSnackbarMessage('Data saved successfully!');
      setSnackbarVisible(true);

      setScannedItems([]);
      setQuantity('');
    } catch (error) {
      console.error('Save Error:', error);
      Alert.alert(
        'Error',
        'An error occurred while saving data. Please check the console for more details.'
      );
    }
  };

  const handleRemoveScannedItem = (itemId) => {
    setScannedItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const renderUsedItems = (usedItems, searchTerm) => {
    const groupedItems = {};

    usedItems.forEach((item) => {
      const key = item.id;
      if (!groupedItems[key]) {
        groupedItems[key] = {
          ...item,
          totalQuantity: item.quantity,
          latestTimestamp: item.timestamp,
        };
      } else {
        groupedItems[key].totalQuantity += item.quantity;
        if (new Date(item.timestamp) > new Date(groupedItems[key].latestTimestamp)) {
          groupedItems[key].latestTimestamp = item.timestamp;
        }
      }
    });

    const groupedItemsArray = Object.values(groupedItems);

    const filteredItems = groupedItemsArray.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filteredItems.map((item, index) => (
      <Card key={index} style={styles.usedItemCard}>
        <Card.Title title={item.name} />
        <Card.Content>
          <Paragraph>Quantity Used: {item.totalQuantity}</Paragraph>
          <Paragraph>
            Last Used: {new Date(item.latestTimestamp).toLocaleString() || 'N/A'}
          </Paragraph>
        </Card.Content>
      </Card>
    ));
  };

  const renderScannedItems = () => {
    return scannedItems.map((item, index) => (
      <Card key={index} style={styles.scannedItemCard}>
        <Card.Title
          title={item.itemName}
          right={(props) => (
            <IconButton
              {...props}
              icon="close"
              onPress={() => handleRemoveScannedItem(item.id)}
            />
          )}
        />
        <Card.Content>
          <Paragraph>Quantity: {item.quantity}</Paragraph>
          <Paragraph>Type: {item.type === 'supplies' ? 'Supply' : 'Medicine'}</Paragraph>
        </Card.Content>
      </Card>
    ));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirth(selectedDate.toISOString().split('T')[0]);
    }
  };

  return (
    <PaperProvider theme={theme}>
      <View style={styles.fullScreenContainer}>
        <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent={true} />
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Patient Information" />
        </Appbar.Header>
        <ScrollView contentContainerStyle={styles.container}>
          {/* Personal Information Section */}
          <Card style={styles.sectionContainer}>
            <Card.Title title="Personal Information" />
            <Card.Content>
              <TextInput
                label="First Name"
                value={name}
                onChangeText={setName}
                mode="outlined"
                style={styles.input}
              />
              <TextInput
                label="Last Name"
                value={lastName}
                onChangeText={setLastName}
                mode="outlined"
                style={styles.input}
              />
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <TextInput
                  label="Date of Birth"
                  value={birth}
                  mode="outlined"
                  style={styles.input}
                  editable={false}
                  right={<TextInput.Icon name="calendar" />}
                />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={birth ? new Date(birth) : new Date()}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}
              <TextInput
                label="Contact Number"
                value={contact}
                onChangeText={setContact}
                mode="outlined"
                style={styles.input}
                keyboardType="phone-pad"
              />
              <TextInput
                label="Diagnosis"
                value={diagnosis}
                onChangeText={setDiagnosis}
                mode="outlined"
                style={styles.input}
                multiline
              />
              <TextInput
                label="Accommodation"
                value={roomType}
                mode="outlined"
                style={styles.input}
                editable={false}
              />
            </Card.Content>
          </Card>

          {/* Inventory Section */}
          
          <Card style={styles.sectionContainer}>
           
            <Card.Content>
              {/* Supplies Used */}
              <Subheading style={styles.subheading}>Supplies Used</Subheading>
              <Searchbar
                placeholder="Search Supplies"
                value={suppliesSearchTerm}
                onChangeText={setSuppliesSearchTerm}
                style={styles.searchbar}
              />
              {renderUsedItems(suppliesUsed, suppliesSearchTerm)}
              <Button
              buttonColor="#740938"
                rippleColor="#FF000020"
                mode="contained"
                icon="broom"
                onPress={() => handleScan('supplies')}
                style={styles.scanButton}
              >
                Scan Item for Supplies
              </Button>
              </Card.Content>
          </Card>


              {/* Medicines Used */}
          <Card style={styles.sectionContainer}>
            <Card.Content>
              <Subheading style={styles.subheading}>Medicines Used</Subheading>
              <Searchbar
                placeholder="Search Medicines"
                value={medSearchTerm}
                onChangeText={setMedSearchTerm}
                style={styles.searchbar}
              />
              {renderUsedItems(medUse, medSearchTerm)}
              <Button
               buttonColor="#740938"
               rippleColor="#FF000020"
                mode="contained"
                icon="pill"
                onPress={() => handleScan('medicines')}
                style={styles.scanButton}
              >
                Scan Item for Medicines
              </Button>
            </Card.Content>
          </Card>

          {/* Scanned Items Preview */}
          {scannedItems.length > 0 && (
            <Card style={styles.sectionContainer}>
              <Card.Title title="Scanned Items" />
              <Card.Content>{renderScannedItems()}</Card.Content>
            </Card>
          )}

          {/* Prescriptions Section */}
          <Card style={styles.sectionContainer}>
            <Card.Title title="Prescriptions" />
            <Card.Content>
              {renderPrescriptions()}
              <Button
              buttonColor='#2A3990'
                mode="contained"
                icon="plus"
                onPress={() => setPrescriptionModalVisible(true)}
                style={styles.addButton}
              >
                Add Prescription
              </Button>
            </Card.Content>
          </Card>

          <Button
          buttonColor='#0D8549'
            mode="contained"
            onPress={handleSaveAll}
            style={styles.saveButton}
            loading={loading}
          >
            Save
          </Button>
        </ScrollView>

        {/* Modals */}
        <Portal>
          {/* Prescription Modal */}
          <PaperModal
            visible={prescriptionModalVisible}
            onDismiss={() => setPrescriptionModalVisible(false)}
          >
            <Card style={styles.modalContent}>
              <Card.Title title="Add Prescription" />
              <Card.Content>
                <TextInput
                  label="Prescription Name"
                  value={prescriptionName}
                  onChangeText={setPrescriptionName}
                  mode="outlined"
                  style={styles.input}
                />
                <TextInput
                  label="Dosage"
                  value={dosage}
                  onChangeText={setDosage}
                  mode="outlined"
                  style={styles.input}
                />
                <TextInput
                  label="Instruction"
                  value={instruction}
                  onChangeText={setInstruction}
                  mode="outlined"
                  style={styles.input}
                  multiline
                />
              </Card.Content>
              <Card.Actions style={styles.modalActions}>
                <Button onPress={() => setPrescriptionModalVisible(false)}>Cancel</Button>
                <Button onPress={handleAddPrescription}>Add</Button>
              </Card.Actions>
            </Card>
          </PaperModal>

          {/* Quantity Input Modal */}
          <PaperModal
            visible={quantityModalVisible}
            onDismiss={() => setQuantityModalVisible(false)}
          >
            <Card style={styles.modalContent}>
              <Card.Title title={`Enter Quantity for ${currentScannedItem?.itemName}`} />
              <Card.Content>
                <TextInput
                  label="Available Quantity"
                  value={String(currentScannedItem?.quantity || 0)}
                  mode="outlined"
                  style={styles.input}
                  editable={false}
                />
                <TextInput
                  label="Quantity to Use"
                  value={quantity}
                  onChangeText={setQuantity}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="numeric"
                />
              </Card.Content>
              <Card.Actions style={styles.modalActions}>
                <Button onPress={() => setQuantityModalVisible(false)}>Cancel</Button>
                <Button onPress={handleQuantityConfirm}>Confirm</Button>
              </Card.Actions>
            </Card>
          </PaperModal>
        </Portal>

        {/* Barcode Scanner Modal */}
        <Modal
          visible={modalVisible}
          transparent={false}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.scannerContainer}>
            {scanning && (
              <BarCodeScanner
                onBarCodeScanned={handleBarCodeScanned}
                style={StyleSheet.absoluteFillObject}
              />
            )}
            <Button
              mode="contained"
              onPress={() => setModalVisible(false)}
              style={styles.closeScannerButton}
            >
              Close Scanner
            </Button>
          </View>
        </Modal>

        {/* Snackbar for Notifications */}
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
        >
          {snackbarMessage}
        </Snackbar>
      </View>
    </PaperProvider>
  );
};

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200ee',
    accent: '#03dac4',
  },
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
  },
  container: {
    padding: 16,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  subheading: {
    color:'#000000',
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  searchbar: {
    marginBottom: 12,
  },
  scanButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  addButton: {
    marginTop: 16,
  },
  saveButton: {
    margin: 16,
  },
  modalContent: {
    color:'#000000',
    margin: 16,
  },
  modalActions: {
    justifyContent: 'flex-end',
  },
  scannerContainer: {
    flex: 1,
  },
  closeScannerButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#fff',
  },
  prescriptionCard: {
    marginBottom: 12,
  },
  usedItemCard: {
    marginVertical: 6,
  },
  scannedItemCard: {
    marginVertical: 6,
  },
});

export default DeptPatientInfoScreen;
