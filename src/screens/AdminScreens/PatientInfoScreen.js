import React, { useReducer, useCallback, useMemo } from 'react';
import { View, StyleSheet, Alert, ScrollView, StatusBar } from 'react-native';
import { Appbar, Button, Provider as PaperProvider, Snackbar, Portal, DefaultTheme } from 'react-native-paper';
import { useCameraPermissions } from 'expo-camera';
import { getDatabase, ref, set } from 'firebase/database';

import useInventory from '../../utils/hooks/useInventory';
import { patientReducer, initialPatientState } from '../../utils/reducers/patientReducer';
import ErrorBoundary from '../AdminScreens/components/ErrorBoundary';

// Import components
import PersonalInformationCard from '../DepartmentsScreen/DeptComponents/PersonalInformationCard';
import SuppliesUsedCard from '../DepartmentsScreen/DeptComponents/SuppliesUsedCard';
import MedicinesUsedCard from '../DepartmentsScreen/DeptComponents/MedicinesUsedCard';
import ScannedItemsCard from '../DepartmentsScreen/DeptComponents/ScannedItemCard';
import PrescriptionsCard from '../DepartmentsScreen/DeptComponents/PrescriptionCard';
import PrescriptionModal from '../DepartmentsScreen/DeptComponents/PrescriptionModal';
import QuantityModal from '../DepartmentsScreen/DeptComponents/QuantityModal';
import BarcodeScannerModal from '../DepartmentsScreen/DeptComponents/BarcodeScannerModal';
const PatientInfoScreen = ({ route, navigation }) => {
  const { patientData, clinic, userRole, permissions } = route.params;
  const userClinic = clinic || null;
  
  const [state, dispatch] = useReducer(patientReducer, {
    ...initialPatientState,
    personalInfo: { ...patientData },
    inventory: {
      suppliesUsed: Array.isArray(patientData.suppliesUsed) ? patientData.suppliesUsed : [],
      medUse: Array.isArray(patientData.medUse) ? patientData.medUse : [],
      scannedItems: []
    },
    prescriptions: patientData.prescriptions || {}
  });

  const { loading, checkInventoryItem, updateInventoryQuantity, logUsageHistory } = useInventory();
  const [permission, requestPermission] = useCameraPermissions();

  // Memoized handlers
  const handleScan = useCallback((type) => {
    dispatch({ type: 'SET_UI_STATE', payload: { scanning: true, scanType: type } });
  }, []);

  const handleBarCodeScanned = useCallback(async ({ data }) => {
    // Safety check for scanType
    if (!state.ui || !state.ui.scanType) {
      Alert.alert('Error', 'Scan type not specified.');
      return;
    }

    // Check if clinic context is available
    if (!userClinic) {
      Alert.alert('Error', 'No clinic context available.');
      dispatch({ type: 'SET_UI_STATE', payload: { scanning: false } });
      return;
    }

    try {
      // Pass clinic context to inventory check
      const item = await checkInventoryItem(data, state.ui.scanType, userClinic);
      if (item) {
        dispatch({ 
          type: 'SET_UI_STATE', 
          payload: { 
            currentScannedItem: { ...item, id: data },
            quantityModalVisible: true,
            scanning: false 
          } 
        });
      } else {
        Alert.alert('Error', `Item not found in ${userClinic} inventory.`);
        dispatch({ type: 'SET_UI_STATE', payload: { scanning: false } });
      }
    } catch (error) {
      console.error('Barcode scan error:', error);
      Alert.alert('Error', 'Failed to process scanned item.');
      dispatch({ type: 'SET_UI_STATE', payload: { scanning: false } });
    }
  }, [state.ui?.scanType, checkInventoryItem, userClinic]);

  const handleQuantityConfirm = useCallback(async (quantity) => {
    const item = state.ui.currentScannedItem;
    if (!item || !userClinic) return;

    // Pass clinic context to inventory update
    const success = await updateInventoryQuantity([{
      id: item.id,
      type: state.ui.scanType,
      quantity: item.quantity - quantity
    }], userClinic);

    if (success) {
      dispatch({
        type: 'UPDATE_INVENTORY',
        payload: {
          scannedItems: [...state.inventory.scannedItems, { ...item, quantity }]
        }
      });
      // Pass clinic context to usage history logging
      await logUsageHistory(patientData, item, quantity, state.ui.scanType, userClinic);
      dispatch({ 
        type: 'SET_UI_STATE', 
        payload: { 
          currentScannedItem: null,
          quantityModalVisible: false 
        } 
      });
    }
  }, [state.ui.currentScannedItem, state.ui.scanType, state.inventory.scannedItems, userClinic, updateInventoryQuantity, logUsageHistory, patientData]);

  const handleSaveAll = useCallback(async () => {
    // Check if clinic context is available
    if (!userClinic) {
      Alert.alert('Error', 'No clinic context available. Cannot save patient data.');
      return;
    }

    try {
      dispatch({ type: 'SET_UI_STATE', payload: { loading: true } });
      const db = getDatabase();
      
      // Save to clinic-specific patient data path
      const patientRef = ref(db, `${userClinic}/patient/${patientData.qrData}`);
      
      const patientUpdateData = {
        ...state.personalInfo,
        suppliesUsed: state.inventory.suppliesUsed,
        medUse: state.inventory.medUse,
        prescriptions: state.prescriptions,
        lastUpdated: new Date().toISOString(),
        updatedBy: userRole || 'unknown'
      };

      await set(patientRef, patientUpdateData);
      
      dispatch({ 
        type: 'SET_UI_STATE', 
        payload: { 
          snackbar: { visible: true, message: `Patient data saved successfully in ${userClinic}!` },
          loading: false
        } 
      });
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save changes. Please try again.');
      dispatch({ type: 'SET_UI_STATE', payload: { loading: false } });
    }
  }, [state, patientData.qrData, userClinic, userRole]);

  // Memoized values
  const memoizedPrescriptions = useMemo(() => 
    Object.entries(state.prescriptions).map(([key, item]) => ({
      key,
      ...item
    })), [state.prescriptions]);

  const memoizedScannedItems = useMemo(() => 
    state.inventory.scannedItems, [state.inventory.scannedItems]);

  return (
    <ErrorBoundary>
     <PaperProvider theme={theme}>
        <View style={styles.fullScreenContainer}>
          <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent={true} />
          <Appbar.Header>
            <Appbar.BackAction onPress={() => navigation.goBack()} />
            <Appbar.Content 
              title="Patient Information" 
              subtitle={userClinic ? `Clinic: ${userClinic}` : 'No clinic context'}
            />
            {!userClinic && (
              <Appbar.Action 
                icon="alert-circle" 
                onPress={() => Alert.alert(
                  'Warning', 
                  'No clinic context available. Data may not save correctly.'
                )} 
              />
            )}
          </Appbar.Header>

          <ScrollView contentContainerStyle={styles.container}>
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
              handleDateChange={(event, selectedDate) => {
                if (selectedDate) {
                  dispatch({ 
                    type: 'SET_PERSONAL_INFO', 
                    payload: { birth: selectedDate.toISOString().split('T')[0] } 
                  });
                }
                dispatch({ type: 'SET_UI_STATE', payload: { showDatePicker: false } });
              }}
              styles={styles}
            />

            <SuppliesUsedCard
              data={state.inventory.suppliesUsed}
              onScan={handleScan}
              styles={styles}
            />

            <MedicinesUsedCard
              data={state.inventory.medUse}
              onScan={() => handleScan('medicines')}
              styles={styles}
            />

            {memoizedScannedItems.length > 0 && (
              <ScannedItemsCard
                items={memoizedScannedItems}
                onRemove={(id) => dispatch({
                  type: 'UPDATE_INVENTORY',
                  payload: {
                    scannedItems: state.inventory.scannedItems.filter(item => item.id !== id)
                  }
                })}
                styles={styles}
              />
            )}

            <PrescriptionsCard
              prescriptions={memoizedPrescriptions || []}  // Add fallback empty array
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
              mode="contained"
              onPress={handleSaveAll}
              style={styles.saveButton}
              loading={loading || state.ui.loading}
            >
              Save Changes
            </Button>
          </ScrollView>

          <Portal>
            <PrescriptionModal
              visible={state.ui.prescriptionModalVisible}
              onDismiss={() => dispatch({ 
                type: 'SET_UI_STATE', 
                payload: { prescriptionModalVisible: false } 
              })}
              onAdd={(prescription) => dispatch({
                type: 'ADD_PRESCRIPTION',
                payload: { [Date.now()]: prescription }
              })}
            />

            <QuantityModal
              visible={state.ui.quantityModalVisible}
              item={state.ui.currentScannedItem}
              onConfirm={handleQuantityConfirm}
              onDismiss={() => dispatch({ 
                type: 'SET_UI_STATE', 
                payload: { quantityModalVisible: false } 
              })}
            />

            <BarcodeScannerModal
              visible={state.ui.scanning}
              onScan={handleBarCodeScanned}
              onDismiss={() => dispatch({ 
                type: 'SET_UI_STATE', 
                payload: { scanning: false } 
              })}
            />
          </Portal>

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
});

export default PatientInfoScreen;
