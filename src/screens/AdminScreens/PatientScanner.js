import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { getDatabase, ref, get } from 'firebase/database';

const PatientScanner = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleBarCodeScanned = async ({ data }) => {
    setScanned(true);
    setLoading(true);

    try {
      const db = getDatabase();
      const patientRef = ref(db, `patient/${data}`);
      const snapshot = await get(patientRef);

      if (snapshot.exists()) {
        navigation.navigate('PatientInfo', { patientData: snapshot.val() });
      } else {
        Alert.alert('No Data', `No patient data found for ID: ${data}.`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch patient data.');
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
        <Text style={styles.permissionMessage}>We need your permission to access the camera.</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13', 'code128'],
        }}
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading patient data...</Text>
        </View>
      )}

      {scanned && !loading && (
        <TouchableOpacity style={styles.scanAgainButton} onPress={() => setScanned(false)}>
          <Text style={styles.scanAgainText}>Scan Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  camera: { flex: 1 },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
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
    backgroundColor: '#28a745',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  scanAgainText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PatientScanner;
