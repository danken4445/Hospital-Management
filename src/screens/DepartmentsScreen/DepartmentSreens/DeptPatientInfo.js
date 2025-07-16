import React, { useReducer, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  StatusBar,
} from 'react-native';
import {
  Appbar,
  Button,
  Provider as PaperProvider,
  Snackbar,
  Portal,
  DefaultTheme,
} from 'react-native-paper';
import { useCameraPermissions } from 'expo-camera';
import { getDatabase, ref, get, set, update } from 'firebase/database';
import { auth } from '../../../../firebaseConfig';

import { useDeptInventory } from '../../../utils/hooks/useDeptInventory';
import { deptPatientReducer, initialDeptPatientState } from '../../../utils/reducers/deptPatientReducer';

// Import components
import PersonalInformationCard from '../DeptComponents/PersonalInformationCard';
import SuppliesUsedCard from '../DeptComponents/SuppliesUsedCard';
import MedicinesUsedCard from '../DeptComponents/MedicinesUsedCard';
import ScannedItemsCard from '../DeptComponents/ScannedItemCard';
import PrescriptionsCard from '../DeptComponents/PrescriptionCard';
import PrescriptionModal from '../DeptComponents/PrescriptionModal';
import QuantityModal from '../DeptComponents/QuantityModal';
import BarcodeScannerModal from '../DeptComponents/BarcodeScannerModal';
import ErrorBoundary from '../../AdminScreens/components/ErrorBoundary';

const DeptPatientInfoScreen = ({ route, navigation }) => {
  const { patientData } = route.params;
  const { checkInventoryItem, updateInventoryQuantity, logUsageHistory } = useDeptInventory();

  // Debug: Log the patient data to console
  console.log('Patient Data received:', JSON.stringify(patientData, null, 2));
  console.log('Patient Data keys:', Object.keys(patientData || {}));
  console.log('Patient Data firstName:', patientData?.firstName);
  console.log('Patient Data lastName:', patientData?.lastName);
  console.log('Patient Data qrData:', patientData?.qrData);

  // Initialize state with patient data
  const [state, dispatch] = useReducer(deptPatientReducer, {
    ...initialDeptPatientState,
    personalInfo: {
      firstName: patientData?.firstName || '',
      lastName: patientData?.lastName || '',
      birth: patientData?.birth || '',
      age: patientData?.age || '',
      dateTime: patientData?.dateTime || new Date().toISOString(),
      contact: patientData?.contact || '',
      diagnosis: patientData?.diagnosis || '',
      roomType: patientData?.roomType || '',
      status: patientData?.status || '',
      qrData: patientData?.qrData || '',
      gender: patientData?.gender || ''
    },
    inventory: {
      suppliesUsed: Array.isArray(patientData?.suppliesUsed) ? patientData.suppliesUsed : [],
      medUse: Array.isArray(patientData?.medUse) ? patientData.medUse : [],
      scannedItems: []
    },
    prescriptions: patientData?.prescriptions || {}
  });

  // Load patient data from Firebase if QR data exists but other fields are missing
  useEffect(() => {
    const loadPatientData = async () => {
      // Always try to load patient data if we have QR data
      if (patientData?.qrData) {
        console.log('Loading patient data for QR:', patientData.qrData);
        try {
          const db = getDatabase();
          const patientRef = ref(db, `patient/${patientData.qrData}`);
          const snapshot = await get(patientRef);
          
          if (snapshot.exists()) {
            const fullPatientData = snapshot.val();
            console.log('Full patient data loaded from Firebase:', JSON.stringify(fullPatientData, null, 2));
            
            // Update personal information
            dispatch({
              type: 'SET_PERSONAL_INFO',
              payload: {
                firstName: fullPatientData.firstName || '',
                lastName: fullPatientData.lastName || '',
                birth: fullPatientData.birth || '',
                age: fullPatientData.age ? fullPatientData.age.toString() : '',
                dateTime: fullPatientData.dateTime || new Date().toISOString(),
                contact: fullPatientData.contact || '',
                diagnosis: fullPatientData.diagnosis || '',
                roomType: fullPatientData.roomType || '',
                status: fullPatientData.status || '',
                qrData: patientData.qrData, // Use the QR data from scan
                gender: fullPatientData.gender || ''
              }
            });

            // Update inventory data
            dispatch({
              type: 'UPDATE_INVENTORY',
              payload: {
                suppliesUsed: Array.isArray(fullPatientData.suppliesUsed) ? fullPatientData.suppliesUsed : [],
                medUse: Array.isArray(fullPatientData.medUse) ? fullPatientData.medUse : [],
                scannedItems: [] // Always start with empty scanned items
              }
            });

            // Update prescriptions
            if (fullPatientData.prescriptions) {
              dispatch({
                type: 'ADD_PRESCRIPTION',
                payload: fullPatientData.prescriptions
              });
            }
          } else {
            console.log('No patient data found in Firebase for QR:', patientData.qrData);
            Alert.alert('Error', 'Patient data not found in database');
          }
        } catch (error) {
          console.error('Error loading patient data from Firebase:', error);
          Alert.alert('Error', 'Failed to load patient data');
        }
      } else {
        console.log('No QR data available to load patient info');
      }
    };

    loadPatientData();
  }, [patientData?.qrData]); // Only depend on QR data

  // Camera permissions hook
  const [permission, requestPermission] = useCameraPermissions();

  // Initialize user department
  const initializeUserDepartment = useCallback(async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const db = getDatabase();
        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();
          dispatch({ type: 'SET_USER_DEPARTMENT', payload: userData.role });
        }
      } catch (error) {
        console.error('Error fetching user department:', error);
      }
    }
  }, []);

  // Initialize camera permissions
  const initializeCameraPermissions = useCallback(async () => {
    if (!permission || permission.status !== 'granted') {
      await requestPermission();
      if (permission && permission.status !== 'granted') {
        Alert.alert('Error', 'Camera permissions are required to scan barcodes.');
      }
    }
  }, [permission, requestPermission]);

  // **useEffect Hook**
  useEffect(() => {
    initializeUserDepartment();
    initializeCameraPermissions();
  }, [initializeUserDepartment, initializeCameraPermissions]);

  // Barcode scanning handlers
  const handleScan = useCallback((type) => {
    dispatch({ 
      type: 'SET_UI_STATE', 
      payload: { 
        scanning: true, 
        scanType: type 
      } 
    });
  }, []);

  const handleBarCodeScanned = useCallback(async ({ data }) => {
    if (!state.ui.scanning) return;
    
    dispatch({ type: 'SET_UI_STATE', payload: { scanning: false } });

    try {
      const item = await checkInventoryItem(data, state.ui.scanType, state.userDepartment);
      if (item) {
        dispatch({ 
          type: 'SET_UI_STATE', 
          payload: { 
            currentScannedItem: item,
            quantityModalVisible: true
          } 
        });
      } else {
        Alert.alert('Error', 'Item not found in inventory.');
      }
    } catch (error) {
      console.error('Error scanning item:', error);
      Alert.alert('Error', error.message || 'Failed to fetch item data.');
    }
  }, [state.ui.scanning, state.ui.scanType, state.userDepartment, checkInventoryItem]);

  const handleQuantityConfirm = useCallback(async (quantity) => {
    const parsedQuantity = parseInt(quantity, 10);
    const item = state.ui.currentScannedItem;
    
    if (!item) {
      Alert.alert('Error', 'No item selected.');
      return;
    }
    
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity.');
      return;
    }

    if (!state.userDepartment) {
      Alert.alert('Error', 'Failed to determine user department.');
      return;
    }

    try {
      const db = getDatabase();
      let itemRef;

      if (item.type === 'supplies') {
        itemRef = ref(db, `departments/${state.userDepartment}/localSupplies/${item.id}`);
      } else if (item.type === 'medicines') {
        itemRef = ref(db, `departments/${state.userDepartment}/localMeds/${item.id}`);
      }

      const snapshot = await get(itemRef);

      if (snapshot.exists()) {
        const itemData = snapshot.val();
        const availableQuantity = itemData.quantity;

        if (availableQuantity >= parsedQuantity) {
          dispatch({ 
            type: 'UPDATE_INVENTORY', 
            payload: { 
              scannedItems: [...state.inventory.scannedItems, { ...item, quantity: parsedQuantity }]
            } 
          });
          
          dispatch({ 
            type: 'SET_UI_STATE', 
            payload: { 
              currentScannedItem: null, 
              quantityModalVisible: false 
            } 
          });
        } else {
          Alert.alert(
            'Insufficient Quantity',
            `Only ${availableQuantity} units of ${item.name} are available.`
          );
        }
      } else {
        Alert.alert('Error', 'Item not found in inventory.');
      }
    } catch (error) {
      console.error('Error confirming quantity:', error);
      Alert.alert('Error', 'Failed to check item quantity.');
    }
  }, [state.ui.currentScannedItem, state.userDepartment, state.inventory.scannedItems]);

  const handleAddPrescription = useCallback((prescription) => {
    if (!prescription.name) {
      Alert.alert('Error', 'Please enter a prescription name');
      return;
    }

    dispatch({
      type: 'ADD_PRESCRIPTION',
      payload: { [Date.now()]: {
        prescriptionName: prescription.name,
        dosage: prescription.dosage,
        instruction: prescription.instructions,
        createdAt: new Date().toISOString(),
      }}
    });
    
    dispatch({ 
      type: 'SET_UI_STATE', 
      payload: { prescriptionModalVisible: false } 
    });
  }, []);

  const handleSaveAll = useCallback(async () => {
    const { firstName, lastName, birth, contact, diagnosis, roomType, status, gender, qrData } = state.personalInfo;
    
    if (!qrData) {
      Alert.alert('Error', 'Patient QR data is missing.');
      return;
    }
  
    if (!firstName || !lastName || !birth || !contact || !diagnosis || !roomType || !status || !gender) {
      Alert.alert('Error', 'All fields must be filled out before saving.');
      return;
    }

    dispatch({ type: 'SET_UI_STATE', payload: { loading: true } });
    
    try {
      const db = getDatabase();
      const patientRef = ref(db, `patient/${qrData}`);
      
      let updatedSuppliesUsed = [...state.inventory.suppliesUsed];
      let updatedMedUse = [...state.inventory.medUse];

      // Update inventory quantities and add scanned items to used lists
      for (const scannedItem of state.inventory.scannedItems) {
        const quantityToUse = scannedItem.quantity;
        const itemType = scannedItem.type;
        let itemRef;

        if (itemType === 'supplies') {
          itemRef = ref(db, `departments/${state.userDepartment}/localSupplies/${scannedItem.id}`);
        } else if (itemType === 'medicines') {
          itemRef = ref(db, `departments/${state.userDepartment}/localMeds/${scannedItem.id}`);
        }

        const snapshot = await get(itemRef);
        if (snapshot.exists()) {
          const itemDetails = snapshot.val();
          
          if (itemDetails.quantity >= quantityToUse) {
            const updatedQuantity = itemDetails.quantity - quantityToUse;
            await update(itemRef, { quantity: updatedQuantity });

            const timestamp = new Date().toISOString();
            const retailPrice = itemDetails.retailPrice || 0;

            const usageEntry = {
              id: scannedItem.id,
              name: scannedItem.name,
              quantity: quantityToUse,
              timestamp: timestamp,
              retailPrice: retailPrice,
              shortDesc: scannedItem.shortDesc || '',
              standardDesc: scannedItem.standardDesc || '',
            };

            if (itemType === 'supplies') {
              updatedSuppliesUsed.push(usageEntry);
            } else if (itemType === 'medicines') {
              updatedMedUse.push(usageEntry);
            }

            await logUsageHistory(state.personalInfo, scannedItem, quantityToUse, itemType, state.userDepartment);
          } else {
            Alert.alert('Error', 'Insufficient quantity in inventory for ' + scannedItem.name);
          }
        } else {
          Alert.alert('Error', 'Item details not found for ' + scannedItem.name);
        }
      }

      const updatedData = {
        ...state.personalInfo,
        suppliesUsed: updatedSuppliesUsed,
        medUse: updatedMedUse,
        prescriptions: state.prescriptions,
      };

      await set(patientRef, updatedData);

      dispatch({ 
        type: 'UPDATE_INVENTORY', 
        payload: { 
          suppliesUsed: updatedSuppliesUsed,
          medUse: updatedMedUse,
          scannedItems: []
        } 
      });
      
      dispatch({ 
        type: 'SET_UI_STATE', 
        payload: { 
          loading: false,
          snackbar: {
            visible: true,
            message: 'Data saved successfully!'
          }
        } 
      });
    } catch (error) {
      console.error('Save Error:', error);
      Alert.alert('Error', 'An error occurred while saving data.');
      dispatch({ type: 'SET_UI_STATE', payload: { loading: false } });
    }
  }, [state, logUsageHistory]);

  const handleRemoveScannedItem = useCallback((itemId) => {
    dispatch({
      type: 'UPDATE_INVENTORY',
      payload: {
        scannedItems: state.inventory.scannedItems.filter(item => item.id !== itemId)
      }
    });
  }, [state.inventory.scannedItems]);

  const handleDateChange = useCallback((event, selectedDate) => {
    if (selectedDate) {
      dispatch({ 
        type: 'SET_PERSONAL_INFO', 
        payload: { birth: selectedDate.toISOString().split('T')[0] } 
      });
    }
    dispatch({ type: 'SET_UI_STATE', payload: { showDatePicker: false } });
  }, []);

  // **Memoized values and render functions**
  const memoizedPrescriptions = useMemo(() => 
    Object.entries(state.prescriptions).map(([key, item]) => ({
      key,
      name: item.prescriptionName,
      dosage: item.dosage,
      instructions: item.instruction,
      createdAt: item.createdAt,
    })), [state.prescriptions]);

  // **Render Method**
  return (
    <ErrorBoundary>
      <PaperProvider theme={theme}>
        <View style={styles.fullScreenContainer}>
          <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent={true} />
          <Appbar.Header>
            <Appbar.BackAction onPress={() => navigation.goBack()} />
            <Appbar.Content title="Patient Information" />
          </Appbar.Header>
          
          <ScrollView contentContainerStyle={styles.container}>
            {/* Personal Information Section */}
            <PersonalInformationCard
              data={state.personalInfo}
              onUpdate={(updates) => dispatch({ 
                type: 'SET_PERSONAL_INFO', 
                payload: updates 
              })}
              showDatePicker={state.ui.showDatePicker}
              setShowDatePicker={(show) => dispatch({
                type: 'SET_UI_STATE',
                payload: { showDatePicker: show }
              })}
              handleDateChange={handleDateChange}
              styles={styles}
            />

            {/* Supplies Used Section */}
            <SuppliesUsedCard
              data={state.inventory.suppliesUsed}
              onScan={() => handleScan('supplies')}
              searchTerm={state.ui.suppliesSearchTerm}
              onSearchChange={(term) => dispatch({
                type: 'SET_UI_STATE',
                payload: { suppliesSearchTerm: term }
              })}
              styles={styles}
            />

            {/* Medicines Used Section */}
            <MedicinesUsedCard
              data={state.inventory.medUse}
              onScan={() => handleScan('medicines')}
              searchTerm={state.ui.medSearchTerm}
              onSearchChange={(term) => dispatch({
                type: 'SET_UI_STATE',
                payload: { medSearchTerm: term }
              })}
              styles={styles}
            />

            {/* Scanned Items Preview */}
            {state.inventory.scannedItems.length > 0 && (
              <ScannedItemsCard
                items={state.inventory.scannedItems}
                onRemove={handleRemoveScannedItem}
                styles={styles}
              />
            )}

            {/* Prescriptions Section */}
            <PrescriptionsCard
              prescriptions={memoizedPrescriptions}
              onAdd={() => dispatch({
                type: 'SET_UI_STATE',
                payload: { prescriptionModalVisible: true }
              })}
              onDelete={(key) => {
                const { [key]: removed, ...rest } = state.prescriptions;
                dispatch({
                  type: 'ADD_PRESCRIPTION',
                  payload: rest
                });
              }}
              styles={styles}
            />

            <Button
              buttonColor="#0D8549"
              mode="contained"
              onPress={handleSaveAll}
              style={styles.saveButton}
              loading={state.ui.loading}
            >
              Save Changes
            </Button>
          </ScrollView>

          {/* Modals */}
          <Portal>
            {/* Prescription Modal */}
            <PrescriptionModal
              visible={state.ui.prescriptionModalVisible}
              onDismiss={() => dispatch({
                type: 'SET_UI_STATE',
                payload: { prescriptionModalVisible: false }
              })}
              onAdd={handleAddPrescription}
            />

            {/* Quantity Input Modal */}
            <QuantityModal
              visible={state.ui.quantityModalVisible}
              item={state.ui.currentScannedItem}
              onConfirm={handleQuantityConfirm}
              onDismiss={() => dispatch({
                type: 'SET_UI_STATE',
                payload: { quantityModalVisible: false }
              })}
            />

            {/* Barcode Scanner Modal */}
            <BarcodeScannerModal
              visible={state.ui.scanning}
              onScan={handleBarCodeScanned}
              onDismiss={() => dispatch({
                type: 'SET_UI_STATE',
                payload: { scanning: false }
              })}
            />
          </Portal>

          {/* Snackbar for Notifications */}
          <Snackbar
            visible={state.ui.snackbar.visible}
            onDismiss={() => dispatch({
              type: 'SET_UI_STATE',
              payload: { snackbar: { visible: false, message: '' } }
            })}
            duration={3000}
          >
            {state.ui.snackbar.message}
          </Snackbar>
        </View>
      </PaperProvider>
    </ErrorBoundary>
  );
};

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200ee',
    accent: '#03dac4',
  },
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
  },
  container: {
    padding: 16,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  subheading: {
    color: '#000000',
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  searchbar: {
    marginBottom: 12,
  },
  scanButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  addButton: {
    marginTop: 16,
  },
  saveButton: {
    margin: 16,
  },
  modalContent: {
    color: '#000000',
    margin: 16,
  },
  modalActions: {
    justifyContent: 'flex-end',
  },
  scannerContainer: {
    flex: 1,
  },
  closeScannerButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#fff',
  },
  prescriptionCard: {
    marginBottom: 12,
  },
  usedItemCard: {
    marginVertical: 6,
  },
  scannedItemCard: {
    marginVertical: 6,
  },
  scannedItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  scannedItemInfo: {
    flex: 1,
    marginRight: 16,
  },
  scannedItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  scannedItemDetails: {
    fontSize: 14,
    color: '#666',
  },
});

export default DeptPatientInfoScreen;
