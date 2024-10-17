import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, Modal, TouchableOpacity, StatusBar, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { getDatabase, ref, get, update, push } from 'firebase/database';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Card, FAB, IconButton, Paragraph, Title } from 'react-native-paper';
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
  const [suppliesUsed, setSuppliesUsed] = useState(patientData.suppliesUsed || {});
  const [medUse, setMedUse] = useState(patientData.medUse || {});
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
  const [userDepartment, setUserDepartment] = useState(null); // To store user’s department

  useEffect(() => {
    setName(patientData.firstName);
    setLastName(patientData.lastName);
    setBirth(patientData.birth);
    setContact(patientData.contact);
    setDiagnosis(patientData.diagnosis);
    setRoomType(patientData.roomType);
    setStatus(patientData.status);
    setSuppliesUsed(patientData.suppliesUsed || {});
    setMedUse(patientData.medUse || {});
    setPrescriptions(patientData.prescriptions || {});


    
    // Fetch user’s department from Firebase
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

      // Adjust the reference based on the user's department and item type
      if (scanningFor === 'supplies') {
        itemRef = ref(db, `departments/${userDepartment}/localSupplies/${data}`);
      } else if (scanningFor === 'medicines') {
        itemRef = ref(db, `departments/${userDepartment}/localMeds/${data}`);
      }

      const snapshot = await get(itemRef);

      if (snapshot.exists()) {
        const itemData = snapshot.val();
        setScannedItems((prevItems) => [...prevItems, { ...itemData, id: data }]);
        setQuantityModalVisible(true);
      } else {
        Alert.alert('Error', 'Item not found in inventory.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to fetch item data.');
    }
  };

  const logInventoryHistory = async (itemName, quantity, type) => {
    const db = getDatabase();
    const historyRef = ref(db, `departments/${userDepartment}/usageHistory`);
    const newHistoryRef = push(historyRef);
  
    // Validate that patientData fields are not undefined or null
    const patientId = patientData.qrData ? patientData.qrData : 'Unknown ID';
    const firstName = patientData.firstName ? patientData.firstName : 'Unknown Name';
    const lastName = patientData.lastName ? patientData.lastName : 'Unknown Name';
  
    // Validate that itemName, quantity, and type are defined
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
        <Card.Content>
          <Title style={styles.itemName}>{item.prescriptionName}</Title>
          <Paragraph>Dosage: {item.dosage}</Paragraph>
          <Paragraph>Instruction: {item.instruction}</Paragraph>
          <Paragraph>Added At: {new Date(item.createdAt).toLocaleString()}</Paragraph>
        </Card.Content>
      </Card>
    ));
  };

  
  const handleQuantityConfirm = () => {
    const quantityToUse = parseInt(quantity, 10);
    if (isNaN(quantityToUse) || quantityToUse <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity.');
      return;
    }

    setQuantityModalVisible(false);
  };

  const handleSaveScannedItem = async () => {
    const quantityToUse = parseInt(quantity, 10);
    if (isNaN(quantityToUse) || quantityToUse <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity.');
      return;
    }

    const db = getDatabase();
    let itemRef;
    if (scanningFor === 'supplies') {
      itemRef = ref(db, `departments/${userDepartment}/localSupplies/${scannedItems[scannedItems.length - 1].id}`);
    } else if (scanningFor === 'medicines') {
      itemRef = ref(db, `departments/${userDepartment}/localMeds/${scannedItems[scannedItems.length - 1].id}`);
    }

    if (scannedItems[scannedItems.length - 1].quantity >= quantityToUse) {
      const updatedQuantity = scannedItems[scannedItems.length - 1].quantity - quantityToUse;
      try {
        await update(itemRef, { quantity: updatedQuantity });

        const timestamp = new Date().toISOString();

        if (scanningFor === 'supplies') {
          setSuppliesUsed((prev) => ({
            ...prev,
            [scannedItems[scannedItems.length - 1].id]: {
              name: scannedItems[scannedItems.length - 1].itemName,
              quantity: (prev[scannedItems[scannedItems.length - 1].id]?.quantity || 0) + quantityToUse,
              lastUsed: timestamp,
              retailPrice: retailPrice

            },
          }));
        } else if (scanningFor === 'medicines') {
          setMedUse((prev) => ({
            ...prev,
            [scannedItems[scannedItems.length - 1].id]: {
              name: scannedItems[scannedItems.length - 1].itemName,
              quantity: (prev[scannedItems[scannedItems.length - 1].id]?.quantity || 0) + quantityToUse,
              lastUsed: timestamp,
              retailPrice: retailPrice
          
            },
          }));
        }

        await logInventoryHistory(scannedItems[scannedItems.length - 1].itemName, quantityToUse, scanningFor);

        Alert.alert('Success', `Quantity of ${scannedItems[scannedItems.length - 1].itemName} updated successfully.`);
        setQuantity('');
      } catch (error) {
        Alert.alert('Error', 'Failed to update item quantity.');
      }
    } else {
      Alert.alert('Error', 'Insufficient quantity in inventory.');
    }
  };

  const renderUsedItems = (usedItems) => {
    return Object.entries(usedItems).map(([key, item]) => (
      <Card key={key} style={styles.usedItemCard}>
        <Card.Content>
          <Title style={styles.itemName}>{item.name}</Title>
          <Paragraph>Quantity: {item.quantity}</Paragraph>
          <Paragraph style={styles.timestampText}>Last Used: {item.lastUsed || 'N/A'}</Paragraph>
        </Card.Content>
      </Card>
    ));
  };

  const handleSaveAll = async () => {
    const db = getDatabase();
    const patientRef = ref(db, `patient/${patientData.qrData}`);

    const updatedData = {
      name,
      birth,
      contact,
      diagnosis,
      roomType,
      status,
      suppliesUsed,
      medUse,
      prescriptions
      
    };

    try {
      // Update patient data
      await update(patientRef, updatedData);

// Save all scanned items (if any)
for (let scannedItem of scannedItems) {
  const quantityToUse = parseInt(quantity, 10);
  if (!isNaN(quantityToUse) && quantityToUse > 0) {
    let itemRef;
    let itemDetails = {}; // Store item details, including retailPrice

    if (scanningFor === 'supplies') {
      itemRef = ref(db, `departments/${userDepartment}/localSupplies/${scannedItem.id}`);
    } else if (scanningFor === 'medicines') {
      itemRef = ref(db, `departments/${userDepartment}/localMeds/${scannedItem.id}`);
    }

    // Fetch the item details including retailPrice
    const snapshot = await get(itemRef);
    if (snapshot.exists()) {
      itemDetails = snapshot.val(); // This contains all item details including retailPrice
    } else {
      Alert.alert('Error', 'Item details not found for ' + scannedItem.itemName);
      continue; // Skip this item if details are not found
    }

    if (scannedItem.quantity >= quantityToUse) {
      const updatedQuantity = scannedItem.quantity - quantityToUse;
      await update(itemRef, { quantity: updatedQuantity });

      const timestamp = new Date().toISOString();
      const retailPrice = itemDetails.retailPrice || 0; // Use 0 if retailPrice is not available

      if (scanningFor === 'supplies') {
        setSuppliesUsed((prev) => ({
          ...prev,
          [scannedItem.id]: {
            name: scannedItem.itemName,
            quantity: (prev[scannedItem.id]?.quantity || 0) + quantityToUse,
            lastUsed: timestamp,
            retailPrice: retailPrice, // Store the retailPrice
          },
        }));
      } else if (scanningFor === 'medicines') {
        setMedUse((prev) => ({
          ...prev,
          [scannedItem.id]: {
            name: scannedItem.itemName,
            quantity: (prev[scannedItem.id]?.quantity || 0) + quantityToUse,
            lastUsed: timestamp,
            retailPrice: retailPrice, // Store the retailPrice
          },
        }));
      }

      await logInventoryHistory(scannedItem.itemName, quantityToUse, scanningFor);
    } else {
      Alert.alert('Error', 'Insufficient quantity in inventory for ' + scannedItem.itemName);
    }
  }
}

Alert.alert('Success', 'Data saved successfully!');
setScannedItems([]); // Clear scanned items after saving
setQuantity('');
  
    } catch (error) {
      Alert.alert('Error', 'An error occurred while saving data.');
    }
  };

  const handleRemoveScannedItem = (itemId) => {
    setScannedItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };



  const renderScannedItems = () => {
    return scannedItems.map((item, index) => (
      <Card key={index} style={styles.scannedItemCard}>
        <Card.Content>
          <Title style={styles.itemName}>{item.itemName}</Title>
          <Paragraph>Quantity: {item.quantity}</Paragraph>
          <Paragraph>Type: {scanningFor === 'supplies' ? 'Supply' : 'Medicine'}</Paragraph>
        </Card.Content>
        <IconButton
          icon="close"
          color="#FF0000"
          onPress={() => handleRemoveScannedItem(item.id)}
          style={styles.removeIcon}
        />
      </Card>
    ));
  };


  return (
    <View style={styles.fullScreenContainer}>
      <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent={true} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerText}>Patient Information</Text>
        
        {/* Personal Information Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Personal Information</Text>
          <Text style={styles.input}>
            {name} {lastName}
            </Text>
          <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.datePickerText}>{birth || 'Select Date of Birth'}</Text>
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
            style={styles.input}
            label="Contact"
            placeholder="Enter contact number"
            value={contact}
            onChangeText={setContact}
          />
          <TextInput
            style={styles.input}
            label="Diagnosis"
            placeholder="Enter diagnosis"
            value={diagnosis}
            onChangeText={setDiagnosis}
          />
          <View style={styles.textAreaContainer}>
            <Text style={styles.roomTypeText}>
              Accommodation: {roomType || 'No Room Type Specified'}
            </Text>
          </View>
        </View>
        
        {/* Inventory Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Inventory</Text>
          <Text style={styles.label}>Supplies Used</Text>
          {renderUsedItems(suppliesUsed)}
          <Button
            title="Scan Item for Supplies"
            color="#4CAF50"
            onPress={() => handleScan('supplies')}
          />
          <Text style={styles.label}>Medicines Used</Text>
          {renderUsedItems(medUse)}
          <Button
            title="Scan Item for Medicines"
            color="#FF5722"
            onPress={() => handleScan('medicines')}
          />
        </View>

        {/* Scanned Items Preview */}
        {scannedItems.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>Scanned Items</Text>
            {renderScannedItems()}
          </View>
        )}
                {/* Prescriptions Section */}
                <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Prescriptions</Text>
          {renderPrescriptions()}
          <Button
            title="Add Prescription"
            color="#3b5998"
            onPress={() => setPrescriptionModalVisible(true)}
          />
        </View>


        <Button title="Save" color="#4CAF50" onPress={handleSaveAll} />
      </ScrollView>
            {/* Prescription Modal */}
            <Modal visible={prescriptionModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.prescriptionModalContent}>
            <Text style={styles.modalLabel}>Prescription Name:</Text>
            <TextInput
              style={styles.input}
              value={prescriptionName}
              onChangeText={setPrescriptionName}
              placeholder="Enter Prescription Name"
            />
            <Text style={styles.modalLabel}>Dosage:</Text>
            <TextInput
              style={styles.input}
              value={dosage}
              onChangeText={setDosage}
              placeholder="Enter Dosage"
            />
            <Text style={styles.modalLabel}>Instruction:</Text>
            <TextInput
              style={styles.input}
              value={instruction}
              onChangeText={setInstruction}
              placeholder="Enter Instruction"
            />
            <Button title="Add Prescription" onPress={handleAddPrescription} />
            <Button title="Cancel" onPress={() => setPrescriptionModalVisible(false)} />
          </View>
        </View>
      </Modal>


      {/* Barcode Scanner Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          {scanning ? (
            <BarCodeScanner
              onBarCodeScanned={scanning ? handleBarCodeScanned : undefined}
              style={styles.barcodeScanner}
            />
          ) : (
            <Button title="Close" onPress={() => setModalVisible(false)} />
          )}
        </View>
      </Modal>

     {/* Quantity Input Modal */}
     <Modal visible={quantityModalVisible} transparent={true} animationType="slide">
        <View style={styles.quantityModalContainer}>
          <View style={styles.quantityModalContent}>
            <Text style={styles.modalLabel}>Enter quantity for {scannedItems[scannedItems.length - 1]?.itemName}:</Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              placeholder="Enter quantity"
            />
            <Button title="Confirm" onPress={handleQuantityConfirm} />
            <Button title="Cancel" onPress={() => setQuantityModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: StatusBar.currentHeight || 0,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  prescriptionModalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },

  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  label: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
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
  quantityModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  quantityModalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalLabel: {
    fontSize: 18,
    marginBottom: 15,
  },
  usedItemCard: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  prescriptionCard: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 20,
  },

  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  scannedItemCard: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 20,
  },
  removeIcon: { 
    position: 'absolute', 
    top: 0, 
    right: 0 },

});

export default DeptPatientInfoScreen;
