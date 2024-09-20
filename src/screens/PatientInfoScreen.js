import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { getDatabase, ref, get, update, push } from 'firebase/database';
import DateTimePicker from '@react-native-community/datetimepicker'; // Import DateTimePicker

const PatientInfoScreen = ({ route, navigation }) => {
  const { patientData } = route.params;
  const [name, setName] = useState(patientData.name);
  const [birth, setBirth] = useState(patientData.birth);
  const [contact, setContact] = useState(patientData.contact);
  const [roomType, setRoomType] = useState(patientData.roomType);
  const [status, setStatus] = useState(patientData.status);
  const [suppliesUsed, setSuppliesUsed] = useState(patientData.suppliesUsed || {});
  const [medUse, setMedUse] = useState(patientData.medUse || {});
  const [modalVisible, setModalVisible] = useState(false);
  const [quantityModalVisible, setQuantityModalVisible] = useState(false);
  const [scanningFor, setScanningFor] = useState(null); // 'supplies' or 'medicines'
  const [scanning, setScanning] = useState(false);
  const [scannedItem, setScannedItem] = useState(null); // Store scanned item details
  const [quantity, setQuantity] = useState(''); // Quantity input state
  const [showDatePicker, setShowDatePicker] = useState(false); // Date picker visibility

  useEffect(() => {
    // Update patientData with the latest data when screen loads
    setName(patientData.name);
    setBirth(patientData.birth);
    setContact(patientData.contact);
    setRoomType(patientData.roomType);
    setStatus(patientData.status);
    setSuppliesUsed(patientData.suppliesUsed || {});
    setMedUse(patientData.medUse || {});
  }, [patientData]);

  const handleSave = async () => {
    const db = getDatabase();
    const patientRef = ref(db, `patient/${patientData.qrData}`);

    const updatedData = {
      name,
      birth,
      contact,
      roomType,
      status,
      suppliesUsed,
      medUse,
    };

    try {
      await update(patientRef, updatedData);
      Alert.alert('Success', 'Patient data updated successfully!');
      navigation.goBack(); // Navigate back to the previous screen
    } catch (error) {
      Alert.alert('Error', 'An error occurred while updating patient data.');
    }
  };

  const handleScan = (type) => {
    setScanningFor(type); // Set scanning type ('supplies' or 'medicines')
    setScanning(true);
    setModalVisible(true);
  };

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanning(false);
    setModalVisible(false);

    try {
      const db = getDatabase();
      let itemRef;
      if (scanningFor === 'supplies') {
        itemRef = ref(db, `supplies/${data}`);
      } else if (scanningFor === 'medicines') {
        itemRef = ref(db, `medicines/${data}`);
      }

      const snapshot = await get(itemRef);

      if (snapshot.exists()) {
        const itemData = snapshot.val();
        setScannedItem({ ...itemData, id: data }); // Store the scanned item details with ID
        setQuantityModalVisible(true); // Show quantity input modal
      } else {
        Alert.alert('Error', 'Item not found in inventory.');
      }
    } catch (error) {
      console.error('Error:', error); // Log the error
      Alert.alert('Error', 'Failed to fetch item data.');
    }
  };

  const logInventoryHistory = async (itemName, quantity, type) => {
    const db = getDatabase();
    const historyRef = ref(db, 'inventoryHistory');
    const newHistoryRef = push(historyRef); // Create a new entry

    const historyData = {
      patientId: patientData.qrData,
      patientName: patientData.name,
      itemName,
      quantity,
      type, // 'supplies' or 'medicines'
      timestamp: new Date().toISOString(), // Current timestamp
    };

    try {
      await update(newHistoryRef, historyData); // Save to inventoryHistory node
    } catch (error) {
      console.error('Error logging inventory history:', error);
    }
  };

  const handleQuantityConfirm = async () => {
    const quantityToUse = parseInt(quantity, 10);
    if (isNaN(quantityToUse) || quantityToUse <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity.');
      return;
    }

    const db = getDatabase();
    let itemRef;
    if (scanningFor === 'supplies') {
      itemRef = ref(db, `supplies/${scannedItem.id}`);
    } else if (scanningFor === 'medicines') {
      itemRef = ref(db, `medicines/${scannedItem.id}`);
    }

    if (scannedItem.quantity >= quantityToUse) {
      const updatedQuantity = scannedItem.quantity - quantityToUse;
      try {
        await update(itemRef, { quantity: updatedQuantity });

        // Update local state with nested structure
        if (scanningFor === 'supplies') {
          setSuppliesUsed((prev) => ({
            ...prev,
            [scannedItem.id]: {
              name: scannedItem.name,
              quantity: (prev[scannedItem.id]?.quantity || 0) + quantityToUse,
            },
          }));
        } else if (scanningFor === 'medicines') {
          setMedUse((prev) => ({
            ...prev,
            [scannedItem.id]: {
              name: scannedItem.name,
              quantity: (prev[scannedItem.id]?.quantity || 0) + quantityToUse,
            },
          }));
        }

        // Log the usage to inventoryHistory node
        await logInventoryHistory(scannedItem.name, quantityToUse, scanningFor);

        Alert.alert('Success', `${scannedItem.name} quantity updated successfully.`);
        setQuantity('');
        setQuantityModalVisible(false);
      } catch (error) {
        Alert.alert('Error', 'Failed to update item quantity.');
      }
    } else {
      Alert.alert('Error', 'Insufficient quantity in inventory.');
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirth(selectedDate.toISOString().split('T')[0]); // Format date as YYYY-MM-DD
    }
  };

  const renderUsedItems = (usedItems) => {
    return Object.entries(usedItems).map(([key, item]) => (
      <Text key={key} style={styles.textArea}>
        {item.name} ({item.quantity})
      </Text>
    ));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      {/* Date of Birth Input */}
      <Text style={styles.label}>Date of Birth</Text>
      <TouchableOpacity
        style={styles.dateInput}
        onPress={() => setShowDatePicker(true)}
      >
        <Text>{birth || 'Select Date'}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={birth ? new Date(birth) : new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <Text style={styles.label}>Contact</Text>
      <TextInput
        style={styles.input}
        value={contact}
        onChangeText={setContact}
      />

      {/* Supplies Scanner */}
      <Text style={styles.label}>Supplies Used</Text>
      <View style={styles.textAreaContainer}>
        {renderUsedItems(suppliesUsed)}
      </View>
      <Button title="Scan Item for Supplies" onPress={() => handleScan('supplies')} />

      {/* Medicines Scanner */}
      <Text style={styles.label}>Medicines Used</Text>
      <View style={styles.textAreaContainer}>
        {renderUsedItems(medUse)}
     
        </View>
      <Button title="Scan Item for Medicines" onPress={() => handleScan('medicines')} />

      <Button title="Save" onPress={handleSave} />

      {/* Modal for Scanning */}
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
            <Text style={styles.modalLabel}>
              Enter quantity for {scannedItem?.name}:
            </Text>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    marginVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    justifyContent: 'center',
  },
  textAreaContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#f0f0f0',
  },
  textArea: {
    minHeight: 20, // Minimum height for the text area items
    fontSize: 16,
    marginBottom: 5,
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
  quantityModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
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
});

export default PatientInfoScreen;
