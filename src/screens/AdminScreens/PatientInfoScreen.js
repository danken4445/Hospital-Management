import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Modal, Alert, StatusBar, StyleSheet
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { getDatabase, ref, update } from 'firebase/database';
import { Card, Paragraph, Title } from 'react-native-paper';

const PatientInfoScreen = ({ route }) => {
  const { patientData } = route.params;
  const [permission, requestPermission] = useCameraPermissions();

  const [birth, setBirth] = useState(patientData.birth);
  const [diagnosis, setDiagnosis] = useState(patientData.diagnosis);
  const [roomType] = useState(patientData.roomType);
  const [status] = useState(patientData.status);
  const [suppliesUsed] = useState(patientData.suppliesUsed || {});
  const [medUse] = useState(patientData.medUse || {});
  const [modalVisible, setModalVisible] = useState(false);

  const handleSave = async () => {
    const db = getDatabase();
    const patientRef = ref(db, `patient/${patientData.qrData}`);

    const updatedData = {
      firstName: patientData.firstName,
      lastName: patientData.lastName,
      birth,
      contact: patientData.contact,
      diagnosis,
      roomType,
      status,
      suppliesUsed,
      medUse,
    };

    try {
      await update(patientRef, updatedData);
      Alert.alert('Success', 'Patient data updated successfully!');
    } catch {
      Alert.alert('Error', 'An error occurred while updating patient data.');
    }
  };

  const renderUsedItems = (usedItems) => (
    Object.entries(usedItems).map(([key, item]) => (
      <Card key={key} style={styles.usedItemCard}>
        <Card.Content>
          <Title>{item.name}</Title>
          <Paragraph>Quantity: {item.quantity}</Paragraph>
          <Paragraph>Last Used: {item.lastUsed || 'N/A'}</Paragraph>
        </Card.Content>
      </Card>
    ))
  );

  return (
    <View style={styles.fullScreenContainer}>
      <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerText}>Patient Details</Text>

        <View style={styles.displayField}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.valueText}>{patientData.firstName} {patientData.lastName}</Text>
        </View>

        <View style={styles.displayField}>
          <Text style={styles.label}>Contact Number</Text>
          <Text style={styles.valueText}>{patientData.contact}</Text>
        </View>

        <View style={styles.displayField}>
          <Text style={styles.label}>Birth Date</Text>
          <Text style={styles.valueText}>{birth || 'Not Set'}</Text>
        </View>

        <View style={styles.inputField}>
          <Text style={styles.label}>Diagnosis</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => Alert.prompt('Update Diagnosis', '', setDiagnosis, 'plain-text', diagnosis)}
          >
            <Text style={styles.editButtonText}>{diagnosis || 'Enter Diagnosis'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.displayField}>
          <Text style={styles.label}>Room Type</Text>
          <Text style={styles.valueText}>{roomType || 'Not Specified'}</Text>
        </View>

        <Text style={styles.sectionTitle}>Supplies Used</Text>
        {renderUsedItems(suppliesUsed)}
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.scanButtonText}>Scan Supplies</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Medicines Used</Text>
        {renderUsedItems(medUse)}
        <TouchableOpacity
          style={[styles.scanButton, { backgroundColor: '#FF5722' }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.scanButtonText}>Scan Medicines</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Camera Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          {!permission
            ? null
            : !permission.granted
              ? (
                <View style={styles.modalContainer}>
                  <Text style={{ color: 'white', marginBottom: 10 }}>
                    We need your permission to access the camera.
                  </Text>
                  <TouchableOpacity style={styles.closeButton} onPress={requestPermission}>
                    <Text style={styles.closeButtonText}>Grant Permission</Text>
                  </TouchableOpacity>
                </View>
              )
              : (
                <>
                  <CameraView style={styles.camera} />
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>Close Scanner</Text>
                  </TouchableOpacity>
                </>
              )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 20, backgroundColor: '#f9f9f9' },

  headerText: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 20 },

  displayField: { marginBottom: 15 },
  label: { color: '#777', fontSize: 14, marginBottom: 4 },
  valueText: { fontSize: 16, color: '#333', fontWeight: '500' },

  inputField: { marginBottom: 15 },
  editButton: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  editButtonText: { fontSize: 16, color: '#007bff' },

  sectionTitle: {
    fontSize: 18, fontWeight: 'bold', color: '#1C2B39',
    marginTop: 20, marginBottom: 10,
  },

  scanButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  scanButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  saveButton: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
  },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  usedItemCard: {
    marginVertical: 5,
    borderRadius: 10,
    elevation: 3,
    backgroundColor: '#fff',
  },

  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    width: '100%',
    height: '80%',
  },
  closeButton: {
    backgroundColor: '#f00',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  closeButtonText: { color: '#fff', fontWeight: 'bold' },
});

export default PatientInfoScreen;