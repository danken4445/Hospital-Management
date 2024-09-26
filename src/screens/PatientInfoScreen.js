import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, Modal, TouchableOpacity, StatusBar, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { getDatabase, ref, get, update, push } from 'firebase/database';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Card, FAB, IconButton, Paragraph, Title } from 'react-native-paper';

const PatientInfoScreen = ({ route, navigation }) => {
  const { patientData } = route.params;
  const [name, setName] = useState(patientData.name);
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
  const [scannedItem, setScannedItem] = useState(null);
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

  useEffect(() => {
    setName(patientData.name);
    setBirth(patientData.birth);
    setContact(patientData.contact);
    setDiagnosis(patientData.diagnosis);
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
      diagnosis,
      roomType,
      status,
      suppliesUsed,
      medUse,
    };

    try {
      await update(patientRef, updatedData);
      Alert.alert('Success', 'Patient data updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'An error occurred while updating patient data.');
    }
  };

  const handleScan = (type) => {
    setScanningFor(type);
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
        itemRef = ref(db, `medicine/${data}`);
      }

      const snapshot = await get(itemRef);

      if (snapshot.exists()) {
        const itemData = snapshot.val();
        setScannedItem({ ...itemData, id: data });
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
    const historyRef = ref(db, 'inventoryHistory');
    const newHistoryRef = push(historyRef);

    const historyData = {
      patientId: patientData.qrData,
      patientName: patientData.name,
      itemName,
      quantity,
      type,
      timestamp: new Date().toISOString(),
    };

    try {
      await update(newHistoryRef, historyData);
    } catch (error) {
      console.error('Error logging inventory history:', error);
    }
  };

  const handleQuantityConfirm = () => {
    // Confirm the quantity but do not update the database yet
    const quantityToUse = parseInt(quantity, 10);
    if (isNaN(quantityToUse) || quantityToUse <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity.');
      return;
    }

    setQuantityModalVisible(false); // Hide the modal to show the save button
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
      itemRef = ref(db, `supplies/${scannedItem.id}`);
    } else if (scanningFor === 'medicines') {
      itemRef = ref(db, `medicine/${scannedItem.id}`);
    }

    if (scannedItem.quantity >= quantityToUse) {
      const updatedQuantity = scannedItem.quantity - quantityToUse;
      try {
        await update(itemRef, { quantity: updatedQuantity });

        const timestamp = new Date().toISOString();

        if (scanningFor === 'supplies') {
          setSuppliesUsed((prev) => ({
            ...prev,
            [scannedItem.id]: {
              name: scannedItem.itemName,
              quantity: (prev[scannedItem.id]?.quantity || 0) + quantityToUse,
              lastUsed: timestamp,
            },
          }));
        } else if (scanningFor === 'medicines') {
          setMedUse((prev) => ({
            ...prev,
            [scannedItem.id]: {
              name: scannedItem.itemName,
              quantity: (prev[scannedItem.id]?.quantity || 0) + quantityToUse,
              lastUsed: timestamp,
            },
          }));
        }

        await logInventoryHistory(scannedItem.itemName, quantityToUse, scanningFor);

        Alert.alert('Success', `Quantity of ${scannedItem.itemName} updated successfully.`);
        setQuantity('');
        setScannedItem(null);
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
      setBirth(selectedDate.toISOString().split('T')[0]);
    }
  };

  const handleAddPrescription = () => {
    setAddPrescription(true);
    setPrescriptionName('');
    setDosage('');
    setInstruction('');
    setErrors({});
  };

  const handlePrescriptionSubmit = async () => {
    const newErrors = {};
    if (!prescriptionName) newErrors.prescriptionName = 'Prescription name is required.';
    if (!dosage) newErrors.dosage = 'Dosage is required.';
    if (!instruction) newErrors.instruction = 'Instruction is required.';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    const newPrescription = {
      prescriptionName,
      dosage,
      instruction,
      createdAt: new Date().toISOString(),
    };

    try {
      const db = getDatabase();
      const prescriptionRef = ref(db, `patient/${patientData.qrData}/prescriptions`);
      const newPrescriptionRef = push(prescriptionRef);
      await update(newPrescriptionRef, newPrescription);

      Alert.alert('Success', 'Prescription added successfully!');
      setAddPrescription(false);
    } catch (error) {
      console.error('Error adding prescription:', error);
      Alert.alert('Error', 'Failed to add prescription.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrescriptions = async () => {
    const db = getDatabase();
    const prescriptionRef = ref(db, `patient/${patientData.qrData}/prescriptions`);

    try {
      const snapshot = await get(prescriptionRef);
      if (snapshot.exists()) {
        setPrescriptions(Object.values(snapshot.val()));
        setPrescriptionModalVisible(true);
      } else {
        setPrescriptions([]);
        Alert.alert('No Prescriptions', 'No prescriptions found for this patient.');
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      Alert.alert('Error', 'Failed to fetch prescriptions.');
    }
  };

  const renderPrescriptions = () => {
    return prescriptions.map((prescription, index) => (
      <Card key={index} style={styles.prescriptionItem}>
        <Card.Content>
          <Title style={styles.prescriptionTitle}>{prescription.prescriptionName || 'N/A'}</Title>
          <Paragraph style={styles.prescriptionDetail}>Dosage: {prescription.dosage || 'N/A'}</Paragraph>
          <Paragraph style={styles.prescriptionDetail}>Instruction: {prescription.instruction || 'N/A'}</Paragraph>
          <Paragraph style={styles.prescriptionDetail}>Created At: {prescription.createdAt || 'N/A'}</Paragraph>
        </Card.Content>
      </Card>
    ));
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

  return (
    <View style={styles.fullScreenContainer}>
      <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent={true} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerText}>Patient Information</Text>
        
        {/* Personal Information Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Personal Information</Text>
          <TextInput
            style={styles.input}
            label="Name"
            placeholder="Enter patient name"
            value={name}
            onChangeText={setName}
          />
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

        {/* Scanned Item Preview */}
        {scannedItem && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>Scanned Item</Text>
            <Card style={styles.scannedItemCard}>
              <Card.Content>
                <Title style={styles.itemName}>{scannedItem.itemName}</Title>
                <Paragraph>Entered Quantity: {quantity ? quantity : 'Not Entered'}</Paragraph>
                <Paragraph>Type: {scanningFor === 'supplies' ? 'Supply' : 'Medicine'}</Paragraph>
              </Card.Content>
            </Card>
            <Button
              title="Save"
              color="#4CAF50"
              onPress={handleSaveScannedItem}
            />
          </View>
        )}

        {/* Prescription Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Prescriptions</Text>
          {!addPrescription ? (
            <Button
              title="Add Prescription"
              color="#2196F3"
              onPress={handleAddPrescription}
            />
          ) : (
            <View style={styles.prescriptionForm}>
              <TextInput
                style={[styles.input, errors.prescriptionName ? styles.errorInput : null]}
                label="Prescription Name"
                placeholder="Enter prescription name"
                value={prescriptionName}
                onChangeText={(text) => setPrescriptionName(text)}
              />
              {errors.prescriptionName && <Text style={styles.errorText}>{errors.prescriptionName}</Text>}

              <TextInput
                style={[styles.input, errors.dosage ? styles.errorInput : null]}
                label="Dosage"
                placeholder="Enter dosage"
                value={dosage}
                onChangeText={(text) => setDosage(text)}
              />
              {errors.dosage && <Text style={styles.errorText}>{errors.dosage}</Text>}

              <TextInput
                style={[styles.input, errors.instruction ? styles.errorInput : null]}
                label="Instruction"
                placeholder="Enter instructions"
                value={instruction}
                onChangeText={(text) => setInstruction(text)}
              />
              {errors.instruction && <Text style={styles.errorText}>{errors.instruction}</Text>}

              <Button title={loading ? 'Adding...' : 'Add Prescription'} onPress={handlePrescriptionSubmit} disabled={loading} />
              <Button title="Cancel" onPress={() => setAddPrescription(false)} />
            </View>
          )}

          <Button title="View Prescription" color="#673AB7" onPress={fetchPrescriptions} />
        </View>

        <Button title="Save" color="#4CAF50" onPress={handleSave} />
      </ScrollView>

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
      
      {/* Scanned Item Preview */}
      {scannedItem && (
        <View style={styles.scannedItemContainer}>
          <Text style={styles.modalLabel}>Scanned Item</Text>
          <Card style={styles.scannedItemCard}>
            <Card.Content>
              <Title style={styles.itemName}>{scannedItem.itemName}</Title>
              <Paragraph>Available Quantity: {scannedItem.quantity}</Paragraph>
              <Paragraph>Type: {scanningFor === 'supplies' ? 'Supply' : 'Medicine'}</Paragraph>
            </Card.Content>
          </Card>
        </View>
      )}
      
      {/* Quantity Input Section */}
      <Text style={styles.modalLabel}>
        Enter quantity for {scannedItem?.supplyName || scannedItem?.itemName}:
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

      {/* Prescription Modal */}
      <Modal visible={prescriptionModalVisible} transparent={true} animationType="slide">
        <View style={styles.prescriptionModalContainer}>
          <View style={styles.prescriptionModalContent}>
            <Text style={styles.modalLabel}>Prescriptions</Text>
            <ScrollView>{renderPrescriptions()}</ScrollView>
            <Button title="Close" onPress={() => setPrescriptionModalVisible(false)} />
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
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
  },
  textAreaContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#f0f0f0',
  },
  roomTypeText: {
    fontSize: 16,
    color: '#333',
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
  prescriptionForm: {
    marginVertical: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  formLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  errorInput: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    marginBottom: 5,
  },
  prescriptionModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  prescriptionModalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
  },
  prescriptionItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  prescriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  prescriptionDetail: {
    fontSize: 16,
    color: '#666',
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
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  timestampText: {
    fontSize: 14,
    color: '#777',
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
});

export default PatientInfoScreen;
