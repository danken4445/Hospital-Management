import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { getDatabase, ref, get } from 'firebase/database';

const PatientScanner = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    console.log('Scanned ID:', data);
    setScanned(true);
    setLoading(true);
    try {
      const db = getDatabase();
      const patientRef = ref(db, `patient/${data}`);
      console.log('Fetching patient data from:', `patient/${data}`);
      const snapshot = await get(patientRef);

      if (snapshot.exists()) {
        console.log('Patient data found:', snapshot.val());
        setLoading(false);
        // Navigate to PatientInfoScreen with patient data
        navigation.navigate('PatientInfo', { patientData: snapshot.val() });
      } else {
        console.log('No patient data found for ID:', data);
        Alert.alert('No Data', `No patient data found for the scanned ID: ${data}.`);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching patient data:', error);
      Alert.alert('Error', 'An error occurred while fetching patient data.');
      setLoading(false);
    }
  };

  if (hasPermission === null) {
    return <View style={styles.centered}><Text>Requesting camera permission...</Text></View>;
  }

  if (hasPermission === false) {
    return <View style={styles.centered}><Text>No access to camera</Text></View>;
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={styles.barcodeScanner}
      />
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
      {scanned && !loading && (
        <TouchableOpacity
          style={styles.scanAgainButton}
          onPress={() => setScanned(false)}
        >
          <Text style={styles.scanAgainText}>Scan Again</Text>
        </TouchableOpacity>
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
  barcodeScanner: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent background while loading
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanAgainButton: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
  },
  scanAgainText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PatientScanner;
