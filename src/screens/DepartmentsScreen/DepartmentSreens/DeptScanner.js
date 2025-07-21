import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Button,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { getDatabase, ref, get } from 'firebase/database';
import { auth } from '../../../../firebaseConfig';

const DeptPatientScanner = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userDepartment, setUserDepartment] = useState('');

  useEffect(() => {
    const fetchUserDepartment = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const db = getDatabase();
          const userRef = ref(db, `users/${user.uid}`);
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            const userData = snapshot.val();
            console.log('User department loaded:', userData.department);
            setUserDepartment(userData.department);
          } else {
            console.error('User data not found');
            Alert.alert('Error', 'User data not found. Please log in again.');
          }
        } else {
          console.error('No authenticated user');
          Alert.alert('Error', 'No authenticated user. Please log in.');
        }
      } catch (error) {
        console.error('Error fetching user department:', error);
        Alert.alert('Error', 'Failed to load user information.');
      }
    };

    fetchUserDepartment();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned || loading) return;
    
    console.log('=== QR SCAN DEBUG ===');
    console.log('Scanned ID:', data);
    console.log('User Department:', userDepartment);
    
    setScanned(true);
    setLoading(true);

    try {
      const db = getDatabase();
      const patientRef = ref(db, `patient/${data}`);
      console.log('Fetching patient data from:', `patient/${data}`);
      
      const snapshot = await get(patientRef);

      if (snapshot.exists()) {
        const patientData = snapshot.val();
        console.log('Patient data found:', {
          name: patientData.name,
          roomType: patientData.roomType,
          userDept: userDepartment
        });

        // Ensure QR data is included in patient data
        const patientDataWithQR = {
          ...patientData,
          qrData: data,
          // Ensure all required fields are present with defaults
          suppliesUsed: Array.isArray(patientData.suppliesUsed) ? patientData.suppliesUsed : [],
          medUse: Array.isArray(patientData.medUse) ? patientData.medUse : [],
          prescriptions: patientData.prescriptions || {}
        };

        // Check if the patient's roomType matches the user's department
        if (patientData.roomType === userDepartment) {
          console.log('Access granted - navigating to patient info');
          setLoading(false);
          navigation.navigate('DeptPatientInfoScreen', { 
            patientData: patientDataWithQR 
          });
        } else {
          console.log(`Access denied - Patient room: ${patientData.roomType}, User dept: ${userDepartment}`);
          setLoading(false);
          Alert.alert(
            'Access Denied',
            `This patient is assigned to ${patientData.roomType}, but you're authorized for ${userDepartment}.`,
            [
              { text: 'OK', onPress: () => setScanned(false) }
            ]
          );
        }
      } else {
        console.log('No patient data found for ID:', data);
        setLoading(false);
        Alert.alert(
          'Patient Not Found', 
          `No patient record found for ID: ${data}`,
          [
            { text: 'Scan Again', onPress: () => setScanned(false) }
          ]
        );
      }
    } catch (error) {
      console.error('Error fetching patient data:', error);
      setLoading(false);
      Alert.alert(
        'Error', 
        'Failed to fetch patient data. Please try again.',
        [
          { text: 'Retry', onPress: () => setScanned(false) }
        ]
      );
    }
  };

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.message}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>Camera permission is required to scan QR codes</Text>
        <Button onPress={requestPermission} title="Grant Camera Permission" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barCodeScannerSettings={{
          barCodeTypes: ['qr'],
        }}
      />
      
      {/* Loading overlay */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Loading patient data...</Text>
        </View>
      )}
      
      {/* Scan again button */}
      {scanned && !loading && (
        <TouchableOpacity
          style={styles.scanAgainButton}
          onPress={() => setScanned(false)}
        >
          <Text style={styles.scanAgainText}>Tap to Scan Again</Text>
        </TouchableOpacity>
      )}

      {/* Department indicator */}
      {userDepartment && (
        <View style={styles.departmentIndicator}>
          <Text style={styles.departmentText}>{userDepartment} Department</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  scanAgainButton: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  scanAgainText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  departmentIndicator: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 123, 255, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  departmentText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  message: {
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    fontSize: 16,
    color: '#333',
  },
});

export default DeptPatientScanner;
