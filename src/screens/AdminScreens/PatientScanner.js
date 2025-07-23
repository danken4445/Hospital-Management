import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { getDatabase, ref, get } from 'firebase/database';
import { FontAwesome5 } from '@expo/vector-icons';

const PatientScanner = ({ navigation, route }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get clinic context from navigation params
  const { clinic, userRole, permissions } = route?.params || {};
  const userClinic = clinic || null;

  const handleBarCodeScanned = async ({ data }) => {
    setScanned(true);
    setLoading(true);

    try {
      // Check if clinic context is available
      if (!userClinic) {
        Alert.alert(
          'No Clinic Context', 
          'Please navigate from the dashboard to scan patients.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        setLoading(false);
        return;
      }

      const db = getDatabase();
      // Search in clinic-specific patient data
      const patientRef = ref(db, `${userClinic}/patient/${data}`);
      const snapshot = await get(patientRef);

      if (snapshot.exists()) {
        const patientData = snapshot.val();
        // Pass clinic context to PatientInfo screen
        navigation.navigate('PatientInfo', { 
          patientData, 
          clinic: userClinic,
          userRole,
          permissions
        });
      } else {
        Alert.alert(
          'Patient Not Found', 
          `No patient data found for ID: ${data} in ${userClinic}.`,
          [
            { text: 'Scan Again', onPress: () => setScanned(false) },
            { text: 'Cancel', onPress: () => navigation.goBack() }
          ]
        );
      }
    } catch (error) {
      console.error('Error fetching patient data:', error);
      Alert.alert(
        'Error', 
        'Failed to fetch patient data. Please try again.',
        [
          { text: 'Retry', onPress: () => setScanned(false) },
          { text: 'Cancel', onPress: () => navigation.goBack() }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  if (!permission) {
    return <View />; // Permissions loading
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <FontAwesome5 name="camera" size={48} color="#666" style={styles.cameraIcon} />
        <Text style={styles.permissionMessage}>We need your permission to access the camera.</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show warning if no clinic context
  if (!userClinic) {
    return (
      <View style={styles.warningContainer}>
        <FontAwesome5 name="exclamation-triangle" size={48} color="#FF9800" />
        <Text style={styles.warningTitle}>No Clinic Context</Text>
        <Text style={styles.warningMessage}>
          Please navigate from the dashboard to scan patients from your clinic.
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={16} color="#fff" />
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with clinic info */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Patient Scanner</Text>
        <Text style={styles.clinicInfo}>{userClinic}</Text>
      </View>

      <CameraView
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13', 'code128'],
        }}
      />

      {/* Scanning Instructions */}
      <View style={styles.instructionsOverlay}>
        <View style={styles.scanFrame} />
        <Text style={styles.instructionsText}>
          Position the patient QR code within the frame
        </Text>
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading patient data...</Text>
        </View>
      )}

      {scanned && !loading && (
        <TouchableOpacity style={styles.scanAgainButton} onPress={() => setScanned(false)}>
          <FontAwesome5 name="redo" size={16} color="#fff" />
          <Text style={styles.scanAgainText}>Scan Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000' 
  },

  header: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 16,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  clinicInfo: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
    marginTop: 4,
  },

  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  cameraIcon: {
    marginBottom: 20,
  },
  permissionMessage: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },

  warningContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f8f9fa',
  },
  warningTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF9800',
    marginTop: 16,
    marginBottom: 8,
  },
  warningMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },

  camera: { 
    flex: 1 
  },

  instructionsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  instructionsText: {
    position: 'absolute',
    bottom: 120,
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  loadingText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },

  scanAgainButton: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  scanAgainText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default PatientScanner;
