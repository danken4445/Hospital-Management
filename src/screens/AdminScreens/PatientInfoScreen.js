import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, Modal, TouchableOpacity, StatusBar, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Camera } from 'expo-camera';
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
  const [cameraPermission, setCameraPermission] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [scannedItems, setScannedItems] = useState([]);
  const [quantity, setQuantity] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(status === 'granted');
    })();

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
    setModalVisible(true);
  };

  const captureBarcode = async () => {
    if (cameraRef) {
      const photo = await cameraRef.takePictureAsync({ base64: true });
      // Implement barcode decoding logic or external library support to parse the barcode from the image.
      Alert.alert('Scanned Barcode', 'You need to implement decoding logic here.');
    }
  };

  const handleQuantityConfirm = () => {
    const quantityToUse = parseInt(quantity, 10);
    if (isNaN(quantityToUse) || quantityToUse <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity.');
      return;
    }

    setQuantityModalVisible(false);
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
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) {
                  setBirth(date.toISOString().split('T')[0]);
                }
              }}
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
          <Button title="Scan Supplies" color="#4CAF50" onPress={() => handleScan('supplies')} />
          <Text style={styles.label}>Medicines Used</Text>
          {renderUsedItems(medUse)}
          <Button title="Scan Medicines" color="#FF5722" onPress={() => handleScan('medicines')} />
        </View>

        <Button title="Save" color="#4CAF50" onPress={handleSave} />
      </ScrollView>

      {/* Camera Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          {cameraPermission ? (
            <Camera
              style={styles.camera}
              ref={(ref) => setCameraRef(ref)}
              onCameraReady={captureBarcode}
            />
          ) : (
            <Text>No access to camera</Text>
          )}
          <Button title="Close" onPress={() => setModalVisible(false)} />
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
  camera: {
    width: '100%',
    height: '80%',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PatientInfoScreen;
