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
import { FontAwesome5 } from '@expo/vector-icons';

const DeptPatientScanner = ({ navigation, route }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userDepartment, setUserDepartment] = useState('');

  // Get clinic context from navigation params
  const { clinic, department, userRole, permissions } = route?.params || {};
  const userClinic = clinic || null;

  useEffect(() => {
    const fetchUserDepartment = async () => {
      try {
        // First try to use department from navigation params
        if (department) {
          console.log('Using department from navigation params:', department);
          setUserDepartment(department);
          return;
        }

        // Fallback: fetch from database with clinic context
        const user = auth.currentUser;
        if (user) {
          const db = getDatabase();
          let userData = null;

          // Try clinic-specific user data first
          if (userClinic) {
            const clinicUserRef = ref(db, `${userClinic}/users/${user.uid}`);
            const clinicSnapshot = await get(clinicUserRef);
            if (clinicSnapshot.exists()) {
              userData = clinicSnapshot.val();
            }
          }

          // Fallback to global users
          if (!userData) {
            const globalUserRef = ref(db, `users/${user.uid}`);
            const globalSnapshot = await get(globalUserRef);
            if (globalSnapshot.exists()) {
              userData = globalSnapshot.val();
            }
          }

          if (userData) {
            console.log('User department loaded:', userData.department);
            setUserDepartment(userData.department || userData.role);
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
  }, [department, userClinic]);

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned || loading) return;
    
    console.log('=== QR SCAN DEBUG ===');
    console.log('Scanned ID:', data);
    console.log('User Department:', userDepartment);
    console.log('User Clinic:', userClinic);
    
    // Check if clinic context is available
    if (!userClinic) {
      Alert.alert(
        'No Clinic Context',
        'Please navigate from the department dashboard to scan patients.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      return;
    }
    
    setScanned(true);
    setLoading(true);

    try {
      const db = getDatabase();
      // Use clinic-specific patient path
      const patientRef = ref(db, `${userClinic}/patient/${data}`);
      console.log('Fetching patient data from:', `${userClinic}/patient/${data}`);
      
      const snapshot = await get(patientRef);

      if (snapshot.exists()) {
        const patientData = snapshot.val();
        console.log('Patient data found:', {
          name: patientData.name,
          roomType: patientData.roomType,
          userDept: userDepartment,
          clinic: userClinic
        });

        // Ensure QR data is included in patient data
        const patientDataWithQR = {
          ...patientData,
          qrData: data,
          clinic: userClinic,
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
            patientData: patientDataWithQR,
            clinic: userClinic,
            department: userDepartment,
            userRole: userRole,
            permissions: permissions
          });
        } else {
          console.log(`Access denied - Patient room: ${patientData.roomType}, User dept: ${userDepartment}`);
          setLoading(false);
          Alert.alert(
            'Access Denied',
            `This patient is assigned to ${patientData.roomType}, but you're authorized for ${userDepartment} in ${userClinic}.`,
            [
              { text: 'OK', onPress: () => setScanned(false) }
            ]
          );
        }
      } else {
        console.log('No patient data found for ID:', data, 'in clinic:', userClinic);
        setLoading(false);
        Alert.alert(
          'Patient Not Found', 
          `No patient record found for ID: ${data} in ${userClinic}`,
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
        <FontAwesome5 name="camera" size={48} color="#666" style={styles.icon} />
        <Text style={styles.message}>Camera permission is required to scan QR codes</Text>
        <Button onPress={requestPermission} title="Grant Camera Permission" />
      </View>
    );
  }

  // Show warning if no clinic context
  if (!userClinic) {
    return (
      <View style={styles.centered}>
        <FontAwesome5 name="exclamation-triangle" size={48} color="#FF9800" />
        <Text style={styles.warningTitle}>No Clinic Context</Text>
        <Text style={styles.message}>
          Please navigate from your department dashboard to scan patients.
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
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

      {/* Department and Clinic indicator */}
      <View style={styles.headerContainer}>
        {userClinic && (
          <View style={styles.clinicIndicator}>
            <FontAwesome5 name="hospital" size={16} color="#ffffff" />
            <Text style={styles.clinicText}>{userClinic}</Text>
          </View>
        )}
        {userDepartment && (
          <View style={styles.departmentIndicator}>
            <FontAwesome5 name="user-md" size={16} color="#ffffff" />
            <Text style={styles.departmentText}>{userDepartment} Department</Text>
          </View>
        )}
      </View>

      {/* Scanning instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          Position patient QR code within the frame
        </Text>
        <Text style={styles.subInstructionsText}>
          Only {userDepartment} patients in {userClinic}
        </Text>
      </View>
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
    padding: 20,
  },
  icon: {
    marginBottom: 20,
  },
  warningTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF9800',
    marginTop: 16,
    marginBottom: 8,
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
  backButton: {
    marginTop: 20,
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  clinicIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(33, 150, 243, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 8,
  },
  clinicText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  departmentIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  departmentText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 180,
    left: 20,
    right: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  instructionsText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  subInstructionsText: {
    color: '#ffffff',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.8,
  },
  message: {
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
});

export default DeptPatientScanner;
