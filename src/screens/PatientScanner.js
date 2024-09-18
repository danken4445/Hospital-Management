import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import { getDatabase, ref, get } from 'firebase/database'; // Adjust the import path as needed

const PatientScanner = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [patientInfo, setPatientInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    setLoading(true);
    try {
      // Fetch patient data from Firebase Realtime Database
      const db = getDatabase();
      const patientRef = ref(db, `patients/${data}`); // Assuming QR code data is patient ID
      const snapshot = await get(patientRef);

      if (snapshot.exists()) {
        setPatientInfo(snapshot.val());
      } else {
        Alert.alert('No Data', 'No patient data found for the scanned QR code.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while fetching patient data.');
    } finally {
      setLoading(false);
    }
  };

  if (hasPermission === null) {
    return <View />;
  }

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        {loading && <ActivityIndicator size="large" color="#0000ff" />}
      </Camera>
      {patientInfo && !loading && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Name: {patientInfo.Name}</Text>
          <Text style={styles.infoText}>Date of Birth: {patientInfo.DateOfBirth}</Text>
          <Text style={styles.infoText}>Diagnosis: {patientInfo.Diagnosis}</Text>
          <Text style={styles.infoText}>Final Diagnosis: {patientInfo.FinalDiagnosis}</Text>
          <Text style={styles.infoText}>Room Accommodation: {patientInfo.RoomAccommodation}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#fff',
    padding: 20,
    width: '100%',
  },
  infoText: {
    fontSize: 16,
    marginBottom: 10,
  },
});

export default PatientScanner;
