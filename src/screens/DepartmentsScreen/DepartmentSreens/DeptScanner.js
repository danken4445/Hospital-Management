import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { getDatabase, ref, get } from 'firebase/database';
import { auth } from '../../../../firebaseConfig'; // Assuming auth is configured for fetching user info

const DeptPatientScanner = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userDepartment, setUserDepartment] = useState('');

  useEffect(() => {
    // Request camera permission
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();

    // Fetch logged-in user's department (roomType)
    const fetchUserDepartment = async () => {
      const user = auth.currentUser;
      if (user) {
        const db = getDatabase();
        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setUserDepartment(userData.role); // Assuming role corresponds to the department (e.g., ICU, ER)
        }
      }
    };

    fetchUserDepartment();
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
        const patientData = snapshot.val();
        console.log('Patient data found:', patientData);

        // Check if the patient's roomType matches the user's department
        if (patientData.roomType === userDepartment) {
          setLoading(false);
          navigation.navigate('DeptPatientInfoScreen', { patientData });
        } else {
          setLoading(false);
          Alert.alert('Access Denied', 'You do not have permission to access this patient\'s data.');
        }
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

export default DeptPatientScanner;
