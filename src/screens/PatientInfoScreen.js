import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, Modal, TouchableOpacity, StatusBar } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { getDatabase, ref, get, update, push } from 'firebase/database';
import DateTimePicker from '@react-native-community/datetimepicker';

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
      navigation.goBack();
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
      itemRef = ref(db, `medicine/${scannedItem.id}`);
    }

    if (scannedItem.quantity >= quantityToUse) {
      const updatedQuantity = scannedItem.quantity - quantityToUse;
      try {
        await update(itemRef, { quantity: updatedQuantity });

        if (scanningFor === 'supplies') {
          setSuppliesUsed((prev) => ({
            ...prev,
            [scannedItem.id]: {
              name: scannedItem.itemName,
              quantity: (prev[scannedItem.id]?.quantity || 0) + quantityToUse,
            },
          }));
        } else if (scanningFor === 'medicines') {
          setMedUse((prev) => ({
            ...prev,
            [scannedItem.id]: {
              name: scannedItem.itemName,
              quantity: (prev[scannedItem.id]?.quantity || 0) + quantityToUse,
            },
          }));
        }

        await logInventoryHistory(scannedItem.supplyName || scannedItem.itemName, quantityToUse, scanningFor);

        Alert.alert('Success', `${scannedItem.supplyName || scannedItem.itemName} quantity updated successfully.`);
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
      <View key={index} style={styles.prescriptionItem}>
        <Text style={styles.prescriptionText}>
          Name: {prescription.prescriptionName || 'N/A'}
        </Text>
        <Text style={styles.prescriptionText}>
          Dosage: {prescription.dosage || 'N/A'}
        </Text>
        <Text style={styles.prescriptionText}>
          Instruction: {prescription.instruction || 'N/A'}
        </Text>
        <Text style={styles.prescriptionText}>
          Created At: {prescription.createdAt || 'N/A'}
        </Text>
      </View>
    ));
  };

  const renderUsedItems = (usedItems) => {
    return Object.entries(usedItems).map(([key, item]) => (
      <Text key={key} style={styles.textArea}>
        {item.name} ({item.quantity})
      </Text>
    ));
  };

  return (
    <View style={styles.fullScreenContainer}>
      <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent={true} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

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

        <Text style={styles.label}>Diagnosis</Text>
        <TextInput
          style={styles.input}
          value={diagnosis}
          onChangeText={setDiagnosis}
        />

        <Text style={styles.label}>Accommodation</Text>
        <View style={styles.textAreaContainer}>
          <Text style={styles.roomTypeText}>
            {roomType || 'No Room Type Specified'}
          </Text>
        </View>

        <Text style={styles.label}>Supplies Used</Text>
        <View style={styles.textAreaContainer}>
          {renderUsedItems(suppliesUsed)}
        </View>
        <Button title="Scan Item for Supplies" onPress={() => handleScan('supplies')} />

        <Text style={styles.label}>Medicines Used</Text>
        <View style={styles.textAreaContainer}>
          {renderUsedItems(medUse)}
        </View>
        <Button title="Scan Item for Medicines" onPress={() => handleScan('medicines')} />

        {!addPrescription ? (
          <Button title="Add Prescription" onPress={handleAddPrescription} />
        ) : (
          <View style={styles.prescriptionForm}>
            <Text style={styles.formLabel}>Prescription Name:</Text>
            <TextInput
              style={[styles.input, errors.prescriptionName ? styles.errorInput : null]}
              value={prescriptionName}
              onChangeText={(text) => setPrescriptionName(text)}
            />
            {errors.prescriptionName && <Text style={styles.errorText}>{errors.prescriptionName}</Text>}

            <Text style={styles.formLabel}>Dosage:</Text>
            <TextInput
              style={[styles.input, errors.dosage ? styles.errorInput : null]}
              value={dosage}
              onChangeText={(text) => setDosage(text)}
            />
            {errors.dosage && <Text style={styles.errorText}>{errors.dosage}</Text>}

            <Text style={styles.formLabel}>Instruction:</Text>
            <TextInput
              style={[styles.input, errors.instruction ? styles.errorInput : null]}
              value={instruction}
              onChangeText={(text) => setInstruction(text)}
            />
            {errors.instruction && <Text style={styles.errorText}>{errors.instruction}</Text>}

            <Button title={loading ? 'Adding...' : 'Add Prescription'} onPress={handlePrescriptionSubmit} disabled={loading} />
            <Button title="Cancel" onPress={() => setAddPrescription(false)} />
          </View>
        )}

        <Button title="View Prescription" onPress={fetchPrescriptions} />

        <Button title="Save" onPress={handleSave} />
      </ScrollView>

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

      <Modal visible={quantityModalVisible} transparent={true} animationType="slide">
        <View style={styles.quantityModalContainer}>
          <View style={styles.quantityModalContent}>
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
            <ScrollView>
              {renderPrescriptions()}
            </ScrollView>
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
    minHeight: 20,
    fontSize: 16,
    marginBottom: 5,
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
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
  },
  prescriptionText: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default PatientInfoScreen;
