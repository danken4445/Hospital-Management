import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  StatusBar,
} from 'react-native';
import {
  Appbar,
  Button,
  Provider as PaperProvider,
  Snackbar,
  Portal,
  DefaultTheme,
  Card,
  Paragraph,
  IconButton,
} from 'react-native-paper';
import { useCameraPermissions } from 'expo-camera';
import { getDatabase, ref, get, update, set, push } from 'firebase/database';
import { auth } from '../../../../firebaseConfig';

// Import components
import PersonalInformationCard from '../DeptComponents/PersonalInformationCard';
import SuppliesUsedCard from '../DeptComponents/SuppliesUsedCard';
import MedicinesUsedCard from '../DeptComponents/MedicinesUsedCard';
import ScannedItemsCard from '../DeptComponents/ScannedItemCard';
import PrescriptionsCard from '../DeptComponents/PrescriptionCard';
import PrescriptionModal from '../DeptComponents/PrescriptionModal';
import QuantityModal from '../DeptComponents/QuantityModal';
import BarcodeScannerModal from '../DeptComponents/BarcodeScannerModal';

const DeptPatientInfoScreen = ({ route, navigation }) => {
  const { patientData } = route.params;

  
  
  // **State Variables**
  const [firstName, setFirstName] = useState(patientData.firstName);
  const [lastName, setLastName] = useState(patientData.lastName);
  const [birth, setBirth] = useState(patientData.birth);
  const [age, setAge] = useState(patientData.age)
  const [dateTime, setDateTime] = useState (patientData.dateTime)
  const [contact, setContact] = useState(patientData.contact);
  const [diagnosis, setDiagnosis] = useState(patientData.diagnosis);
  const [roomType, setRoomType] = useState(patientData.roomType);
  const [status, setStatus] = useState(patientData.status);
  const [qrData, setQrData] = useState (patientData.qrData)
  const [gender, setGender] = useState (patientData.gender)
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
  const [prescriptions, setPrescriptions] = useState(
    patientData.prescriptions || {}
  );
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

  // **Camera Permissions Hook**
  const [permission, requestPermission] = useCameraPermissions();

  // **useEffect Hook**
  useEffect(() => {
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
      if (!permission || permission.status !== 'granted') {
        await requestPermission();
        if (permission && permission.status !== 'granted') {
          Alert.alert('Error', 'Camera permissions are required to scan barcodes.');
        }
      }
    })();
  }, [patientData, permission]);

  // **Event Handlers and Functions**

  const handleScan = (type) => {
    setScanningFor(type);
    setScanning(true);
    setModalVisible(true);
  };

  const handleBarCodeScanned = async ({ type, data }) => {
    if (!scanning) return;
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
        const itemName =
          scanningFor === 'medicines' ? itemData.genericName : itemData.itemName;
        setCurrentScannedItem({
          ...itemData,
          id: data,
          type: scanningFor,
          name: itemName,
          shortDesc: itemData.shortDesc || '',
          standardDesc: itemData.standardDesc || '',
        });
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
            `Only ${availableQuantity} units of ${currentScannedItem.name} are available.`
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
  
    if (!patientData.qrData) {
      Alert.alert('Error', 'Patient QR data is missing.');
      return;
    }
  
    const patientRef = ref(db, `patient/${patientData.qrData}`);
  
    if (!firstName || !lastName || !birth || !contact || !diagnosis || !roomType || !status| !gender) {
      Alert.alert('Error', 'All fields must be filled out before saving.');
      return;
    }
    console.log("patientData.qrData:", patientData.qrData);

  
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
          Alert.alert('Error', 'Item details not found for ' + scannedItem.name);
          continue;
        }
  
        if (itemDetails.quantity >= quantityToUse) {
          const updatedQuantity = itemDetails.quantity - quantityToUse;
          await update(itemRef, { quantity: updatedQuantity });
  
          const timestamp = new Date().toISOString();
          const retailPrice = itemDetails.retailPrice || 0;
  
          const usageEntry = {
            id: scannedItem.id,
            name: scannedItem.name,
            quantity: quantityToUse,
            timestamp: timestamp,
            retailPrice: retailPrice,
            shortDesc: scannedItem.shortDesc || '',
            standardDesc: scannedItem.standardDesc || '',
          };
  
          if (itemType === 'supplies') {
            updatedSuppliesUsed.push(usageEntry);
          } else if (itemType === 'medicines') {
            updatedMedUse.push(usageEntry);
          }
  
          await logInventoryHistory(scannedItem.name, quantityToUse, itemType);
        } else {
          Alert.alert('Error', 'Insufficient quantity in inventory for ' + scannedItem.name);
        }
      }
  
      const updatedData = {
        firstName,
        lastName,
        birth,
        gender,
        qrData,
        age,
        contact,
        diagnosis,
        roomType,
        dateTime,
        status,
        suppliesUsed: updatedSuppliesUsed,
        medUse: updatedMedUse,
        prescriptions,
      };
  
      await set(patientRef, updatedData);
  
      setSuppliesUsed(updatedSuppliesUsed);
      setMedUse(updatedMedUse);
      setSnackbarMessage('Data saved successfully!');
      setSnackbarVisible(true);
      setScannedItems([]);
      setQuantity('');
    } catch (error) {
      console.error('Save Error:', error);
      Alert.alert('Error', 'An error occurred while saving data.');
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
          brand: item.brand || '',
          standardDesc: item.standardDesc || '',
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
          <Paragraph>Brand: {item.brand || 'No short description available'}</Paragraph>
          <Paragraph>Standard Description: {item.standardDesc || 'No standard description available'}</Paragraph>
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
          title={item.name}
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
          <Paragraph>Short Description: {item.shortDesc || 'No short description available'}</Paragraph>
          <Paragraph>Standard Description: {item.standardDesc || 'No standard description available'}</Paragraph>
          <Paragraph>
            Type: {item.type === 'supplies' ? 'Supply' : 'Medicine'}
          </Paragraph>
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

  // **Define itemDisplayName**
  const itemDisplayName = currentScannedItem?.name || 'Unknown Item';

  // **Render Method**
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
          <PersonalInformationCard
            firstName={firstName}
            setFirstName={setFirstName}
            lastName={lastName}
            setLastName={setLastName}
            birth={birth}
            setBirth={setBirth}
            contact={contact}
            setContact={setContact}
            diagnosis={diagnosis}
            setDiagnosis={setDiagnosis}
            roomType={roomType}
            showDatePicker={showDatePicker}
            setShowDatePicker={setShowDatePicker}
            handleDateChange={handleDateChange}
            styles={styles}
          />

          {/* Supplies Used Section */}
          <SuppliesUsedCard
            suppliesUsed={suppliesUsed}
            suppliesSearchTerm={suppliesSearchTerm}
            setSuppliesSearchTerm={setSuppliesSearchTerm}
            renderUsedItems={renderUsedItems}
            handleScan={handleScan}
            styles={styles}
          />

          {/* Medicines Used Section */}
          <MedicinesUsedCard
            medUse={medUse}
            medSearchTerm={medSearchTerm}
            setMedSearchTerm={setMedSearchTerm}
            renderUsedItems={renderUsedItems}
            handleScan={handleScan}
            styles={styles}
          />

          {/* Scanned Items Preview */}
          {scannedItems.length > 0 && (
            <ScannedItemsCard
              scannedItems={scannedItems}
              renderScannedItems={renderScannedItems}
              styles={styles}
            />
          )}

          {/* Prescriptions Section */}
          <PrescriptionsCard
            renderPrescriptions={renderPrescriptions}
            setPrescriptionModalVisible={setPrescriptionModalVisible}
            styles={styles}
          />

          <Button
            buttonColor="#0D8549"
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
          <PrescriptionModal
            prescriptionModalVisible={prescriptionModalVisible}
            setPrescriptionModalVisible={setPrescriptionModalVisible}
            prescriptionName={prescriptionName}
            setPrescriptionName={setPrescriptionName}
            dosage={dosage}
            setDosage={setDosage}
            instruction={instruction}
            setInstruction={setInstruction}
            handleAddPrescription={handleAddPrescription}
            styles={styles}
          />

          {/* Quantity Input Modal */}
          <QuantityModal
            quantityModalVisible={quantityModalVisible}
            setQuantityModalVisible={setQuantityModalVisible}
            itemDisplayName={itemDisplayName}
            currentScannedItem={currentScannedItem}
            quantity={quantity}
            setQuantity={setQuantity}
            handleQuantityConfirm={handleQuantityConfirm}
            styles={styles}
          />
        </Portal>

        {/* Barcode Scanner Modal */}
        <BarcodeScannerModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          scanning={scanning}
          setScanning={setScanning}
          handleBarCodeScanned={handleBarCodeScanned}
          styles={styles}
        />

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
    color: '#000000',
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
    color: '#000000',
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



