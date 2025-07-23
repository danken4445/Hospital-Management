import React, { useReducer, useCallback, useMemo, useEffect, useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, StatusBar, Text } from 'react-native';
import { Button, Provider as PaperProvider, Snackbar, Portal, DefaultTheme, Banner } from 'react-native-paper';
import { getDatabase, ref, set, onValue, off, goOffline, goOnline } from 'firebase/database';
import { auth } from '../../../../firebaseConfig';
import NetInfo from '@react-native-community/netinfo';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import { useDeptInventory } from '../../../utils/hooks/useDeptInventory';
import { deptPatientReducer, initialDeptPatientState } from '../../../utils/reducers/deptPatientReducer';
import { validateInventoryUpdate, validateScannedItem } from '../../../utils/inventoryValidation';
import ErrorBoundary from '../../AdminScreens/components/ErrorBoundary';

// Components
import PersonalInformationCard from '../DeptComponents/PersonalInformationCard';
import SuppliesUsedCard from '../DeptComponents/SuppliesUsedCard';
import MedicinesUsedCard from '../DeptComponents/MedicinesUsedCard';
import ScannedItemsCard from '../DeptComponents/ScannedItemCard';
import PrescriptionsCard from '../DeptComponents/PrescriptionCard';
import PrescriptionModal from '../DeptComponents/PrescriptionModal';
import QuantityModal from '../DeptComponents/QuantityModal';
import BarcodeScannerModal from '../DeptComponents/BarcodeScannerModal';

const DeptPatientInfoScreen = ({ route, navigation }) => {
  const { patientData, clinic, department, userRole, permissions } = route.params || {};
  const userClinic = clinic || null;
  
  // Add safety check for patientData
  if (!patientData) {
    Alert.alert('Error', 'Patient data not found');
    navigation.goBack();
    return null;
  }

  // Check if clinic context is available
  if (!userClinic) {
    Alert.alert('Error', 'No clinic context available. Please navigate from the department dashboard.');
    navigation.goBack();
    return null;
  }

  const [state, dispatch] = useReducer(deptPatientReducer, {
    ...initialDeptPatientState,
    personalInfo: { ...patientData },
    inventory: {
      suppliesUsed: Array.isArray(patientData.suppliesUsed) ? patientData.suppliesUsed : [],
      medUse: Array.isArray(patientData.medUse) ? patientData.medUse : [],
      scannedItems: []
    },
    prescriptions: patientData.prescriptions || {}
  });

  const { checkInventoryItem, updateInventoryQuantity, logUsageHistory } = useDeptInventory(userClinic, department);
  const [isConnected, setIsConnected] = useState(true);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  
  const db = useMemo(() => getDatabase(), []);

  // Network & Firebase setup
  useEffect(() => {
    const unsubscribeNetInfo = NetInfo.addEventListener(state => {
      const connected = state.isConnected && state.isInternetReachable;
      setIsConnected(connected);
      setShowOfflineBanner(!connected);
      connected ? goOnline(db) : goOffline(db);
    });

    return unsubscribeNetInfo;
  }, [db]);

  // Firebase listeners
  useEffect(() => {
    const user = auth.currentUser;
    if (!user || !userClinic) return;

    // Use clinic-specific paths
    const userRef = ref(db, `${userClinic}/users/${user.uid}`);
    const patientRef = ref(db, `${userClinic}/patient/${patientData.qrData}`);

    const userListener = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        dispatch({ type: 'SET_USER_DEPARTMENT', payload: snapshot.val().department || snapshot.val().role });
      } else {
        // Fallback to global users
        const globalUserRef = ref(db, `users/${user.uid}`);
        onValue(globalUserRef, (globalSnapshot) => {
          if (globalSnapshot.exists()) {
            dispatch({ type: 'SET_USER_DEPARTMENT', payload: globalSnapshot.val().department });
          }
        });
      }
    }, (error) => {
      console.error('User listener error:', error);
    });

    const patientListener = onValue(patientRef, (snapshot) => {
      if (snapshot.exists()) {
        const fullPatientData = snapshot.val();
        dispatch({ type: 'SET_PERSONAL_INFO', payload: fullPatientData });
        dispatch({
          type: 'UPDATE_INVENTORY',
          payload: {
            suppliesUsed: Array.isArray(fullPatientData.suppliesUsed) ? fullPatientData.suppliesUsed : [],
            medUse: Array.isArray(fullPatientData.medUse) ? fullPatientData.medUse : [],
            scannedItems: []
          }
        });
        if (fullPatientData.prescriptions) {
          dispatch({ type: 'ADD_PRESCRIPTION', payload: fullPatientData.prescriptions });
        }
      }
    }, (error) => {
      console.error('Patient listener error:', error);
    });

    // Connection status listener
    const connectedRef = ref(db, '.info/connected');
    const connectedListener = onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === true) {
        dispatch({
          type: 'SET_UI_STATE',
          payload: {
            snackbar: { visible: true, message: `Back online! Syncing ${userClinic} data...` }
          }
        });
      }
    }, (error) => {
      console.error('Connection listener error:', error);
    });

    return () => {
      off(userRef);
      off(patientRef);
      off(connectedRef);
    };
  }, [patientData.qrData, db, userClinic]);

  // Handlers
  const handleScan = useCallback((type) => {
    dispatch({ type: 'SET_UI_STATE', payload: { scanning: true, scanType: type } });
  }, []);

  const handleBarCodeScanned = useCallback(async ({ data }) => {
    if (!state.ui?.scanType) {
      Alert.alert('Error', 'Scan type not specified.');
      return;
    }

    try {
      const item = await checkInventoryItem(data, state.ui.scanType);
      if (item) {
        dispatch({ 
          type: 'SET_UI_STATE', 
          payload: { 
            currentScannedItem: item,
            quantityModalVisible: true,
            scanning: false 
          } 
        });
      } else {
        const message = isConnected 
          ? 'Item not found in inventory.' 
          : 'Item not found in offline cache.';
        Alert.alert(isConnected ? 'Error' : 'Offline Mode', message);
        dispatch({ type: 'SET_UI_STATE', payload: { scanning: false } });
      }
    } catch (error) {
      console.error('Barcode scan error:', error);
      Alert.alert('Error', isConnected ? 'Failed to process scanned item.' : 'Cannot process item while offline.');
      dispatch({ type: 'SET_UI_STATE', payload: { scanning: false } });
    }
  }, [state.ui?.scanType, checkInventoryItem, isConnected]);

  const handleQuantityConfirm = useCallback(async (quantity) => {
    const item = state.ui.currentScannedItem;
    if (!item || !quantity || quantity <= 0) {
      Alert.alert('Error', 'Invalid quantity specified.');
      return;
    }

    // Validate quantity is a number
    const numericQuantity = parseInt(quantity, 10);
    if (isNaN(numericQuantity) || numericQuantity <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity.');
      return;
    }

    // Just add to scanned items list, don't update inventory yet
    dispatch({
      type: 'UPDATE_INVENTORY',
      payload: {
        scannedItems: [...state.inventory.scannedItems, { 
          ...item, 
          quantity: numericQuantity, // Ensure it's a number
          offline: !isConnected
        }]
      }
    });

    dispatch({ 
      type: 'SET_UI_STATE', 
      payload: { 
        currentScannedItem: null,
        quantityModalVisible: false,
        snackbar: {
          visible: true,
          message: 'Item added to list. Press "Save Changes" to update inventory.'
        }
      } 
    });
  }, [state.ui.currentScannedItem, state.inventory.scannedItems, isConnected]);

  const handleSaveAll = useCallback(async () => {
    try {
      dispatch({ type: 'SET_UI_STATE', payload: { loading: true } });
      
      let updatedSuppliesUsed = [...state.inventory.suppliesUsed];
      let updatedMedUse = [...state.inventory.medUse];

      // Process scanned items
      if (state.inventory.scannedItems.length > 0) {
        console.log('Processing scanned items:', state.inventory.scannedItems);
        
        // Validate all scanned items before processing
        const validationResults = state.inventory.scannedItems.map(item => {
          console.log('Validating item:', item);
          return {
            item,
            validation: validateScannedItem(item)
          };
        });

        const validItems = validationResults
          .filter(result => {
            if (!result.validation.isValid) {
              console.warn('Invalid item:', result.item, 'Errors:', result.validation.errors);
            }
            return result.validation.isValid;
          })
          .map(result => result.validation.sanitized);

        const invalidItems = validationResults.filter(result => !result.validation.isValid);

        if (invalidItems.length > 0) {
          console.warn('Invalid items found:', invalidItems);
          const errorMessages = invalidItems.map(result => 
            `Item ${result.item.name || 'Unknown'}: ${result.validation.errors.join(', ')}`
          ).join('\n');
          
          Alert.alert('Validation Error', `Some items have errors:\n${errorMessages}`);
          dispatch({ type: 'SET_UI_STATE', payload: { loading: false } });
          return;
        }

        if (validItems.length === 0) {
          Alert.alert('Error', 'No valid items to save.');
          dispatch({ type: 'SET_UI_STATE', payload: { loading: false } });
          return;
        }

        console.log('Valid items after sanitization:', validItems);

        // Create inventory updates with validation
        const inventoryUpdateResults = validItems.map(item => {
          const update = {
            id: item.id,
            type: item.type,
            quantityUsed: item.quantity
          };
          console.log('Creating inventory update:', update);
          
          return {
            original: item,
            validation: validateInventoryUpdate(update)
          };
        });

        const validUpdates = inventoryUpdateResults
          .filter(result => {
            if (!result.validation.isValid) {
              console.error('Invalid inventory update:', result.original, 'Errors:', result.validation.errors);
            }
            return result.validation.isValid;
          })
          .map(result => result.validation.sanitized);

        const invalidUpdates = inventoryUpdateResults.filter(result => !result.validation.isValid);

        if (invalidUpdates.length > 0) {
          console.error('Invalid inventory updates:', invalidUpdates);
          Alert.alert('Error', 'Some items failed validation and cannot be processed.');
          dispatch({ type: 'SET_UI_STATE', payload: { loading: false } });
          return;
        }

        console.log('Final valid inventory updates:', validUpdates);

        // Only proceed with inventory updates if we're online
        if (isConnected && validUpdates.length > 0) {
          try {
            console.log('Sending inventory updates:', validUpdates);
            const success = await updateInventoryQuantity(validUpdates);
            console.log('Inventory update result:', success);
            
            if (!success) {
              throw new Error('Inventory update returned false');
            }
          } catch (inventoryError) {
            console.error('Inventory update error:', inventoryError);
            Alert.alert('Inventory Update Error', `Failed to update inventory: ${inventoryError.message}`);
            dispatch({ type: 'SET_UI_STATE', payload: { loading: false } });
            return;
          }
        } else if (!isConnected) {
          console.log('Offline mode - skipping inventory updates');
        }

        // Log usage history and create usage entries for all valid items
        for (const item of validItems) {
          console.log('Processing usage entry for:', item);
          
          if (isConnected) {
            try {
              await logUsageHistory(state.personalInfo, item, item.quantity, item.type);
            } catch (historyError) {
              console.warn('Failed to log usage history:', historyError);
              // Continue processing even if history logging fails
            }
          }

          const usageEntry = {
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            timestamp: new Date().toISOString(),
            retailPrice: parseFloat(item.retailPrice || 0),
            shortDesc: item.shortDesc || '',
            standardDesc: item.standardDesc || '',
            offline: item.offline || !isConnected
          };

          console.log('Created usage entry:', usageEntry);

          if (item.type === 'supplies') {
            updatedSuppliesUsed.push(usageEntry);
          } else if (item.type === 'medicines') {
            updatedMedUse.push(usageEntry);
          }
        }
      }

      const updatedPatientData = {
        ...state.personalInfo,
        suppliesUsed: updatedSuppliesUsed,
        medUse: updatedMedUse,
        prescriptions: state.prescriptions,
        lastModified: new Date().toISOString(),
        modifiedBy: auth.currentUser?.uid
      };

      console.log('Saving patient data:', updatedPatientData);

        // Only update Firebase if connected
        if (isConnected) {
          try {
            await set(ref(db, `${userClinic}/patient/${patientData.qrData}`), updatedPatientData);
            console.log('Patient data saved successfully');
          } catch (firebaseError) {
            console.error('Firebase save error:', firebaseError);
            Alert.alert('Save Error', `Failed to save to database: ${firebaseError.message}`);
            dispatch({ type: 'SET_UI_STATE', payload: { loading: false } });
            return;
          }
        }      dispatch({
        type: 'UPDATE_INVENTORY',
        payload: {
          suppliesUsed: updatedSuppliesUsed,
          medUse: updatedMedUse,
          scannedItems: [] // Clear scanned items after saving
        }
      });

      dispatch({ 
        type: 'SET_UI_STATE', 
        payload: { 
          snackbar: { 
            visible: true, 
            message: isConnected ? 'Saved successfully! Inventory updated.' : 'Saved offline. Will sync when connected.'
          },
          loading: false
        } 
      });
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Save Error', `Failed to save changes: ${error.message || 'Unknown error'}`);
      dispatch({ type: 'SET_UI_STATE', payload: { loading: false } });
    }
  }, [state, patientData.qrData, db, isConnected, updateInventoryQuantity, logUsageHistory]);

  const handleManualSync = useCallback(() => {
    goOnline(db);
    dispatch({
      type: 'SET_UI_STATE',
      payload: {
        snackbar: { visible: true, message: 'Sync initiated.' }
      }
    });
  }, [db]);

  // Memoized values
  const memoizedPrescriptions = useMemo(() => 
    Object.entries(state.prescriptions || {}).map(([key, item]) => ({ key, ...item })), 
    [state.prescriptions]
  );

  // Add safety checks for UI state
  const uiState = state.ui || {};
  const inventoryState = state.inventory || { suppliesUsed: [], medUse: [], scannedItems: [] };

  return (
    <ErrorBoundary>
      <PaperProvider theme={theme}>
        <View style={styles.container}>
          <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent />
          
          {/* Clinic Header */}
          <View style={styles.clinicHeader}>
            <View style={styles.clinicInfo}>
              <FontAwesome5 name="hospital" size={16} color="#667eea" style={styles.clinicIcon} />
              <Text style={styles.clinicName}>{userClinic || 'No Clinic'}</Text>
            </View>
            <Text style={styles.departmentText}>{department} Department</Text>
          </View>

          {showOfflineBanner && (
            <Banner
              visible={showOfflineBanner}
              actions={[
                { 
                  label: 'Dismiss', 
                  onPress: () => setShowOfflineBanner(false) 
                },
                { 
                  label: 'Retry', 
                  onPress: handleManualSync 
                }
              ]}
              icon="cloud-off-outline"
            >
              <Text>You're offline. Changes saved locally and will sync when connected.</Text>
            </Banner>
          )}

          <ScrollView style={styles.scrollView}>
            <PersonalInformationCard
              data={state.personalInfo || {}}
              onUpdate={(updates) => dispatch({ type: 'SET_PERSONAL_INFO', payload: updates })}
              showDatePicker={uiState.showDatePicker || false}
              setShowDatePicker={(show) => dispatch({ type: 'SET_UI_STATE', payload: { showDatePicker: show } })}
              handleDateChange={(event, selectedDate) => {
                if (selectedDate) {
                  dispatch({ type: 'SET_PERSONAL_INFO', payload: { birth: selectedDate.toISOString().split('T')[0] } });
                }
                dispatch({ type: 'SET_UI_STATE', payload: { showDatePicker: false } });
              }}
              offline={!isConnected}
            />

            <SuppliesUsedCard 
              data={inventoryState.suppliesUsed || []} 
              onScan={() => handleScan('supplies')} 
              offline={!isConnected} 
            />
            
            <MedicinesUsedCard 
              data={inventoryState.medUse || []} 
              onScan={() => handleScan('medicines')} 
              offline={!isConnected} 
            />

            {inventoryState.scannedItems && inventoryState.scannedItems.length > 0 && (
              <ScannedItemsCard
                items={inventoryState.scannedItems}
                onRemove={(id) => dispatch({
                  type: 'UPDATE_INVENTORY',
                  payload: { scannedItems: inventoryState.scannedItems.filter(item => item.id !== id) }
                })}
                offline={!isConnected}
              />
            )}

            <PrescriptionsCard
              prescriptions={memoizedPrescriptions}
              onAdd={() => dispatch({ type: 'SET_UI_STATE', payload: { prescriptionModalVisible: true } })}
              onDelete={(key) => {
                const { [key]: removed, ...rest } = state.prescriptions || {};
                dispatch({ type: 'ADD_PRESCRIPTION', payload: rest });
              }}
              offline={!isConnected}
            />

            <View style={styles.saveButtonContainer}>
              <Button
                mode="contained"
                onPress={handleSaveAll}
                style={[styles.saveButton, !isConnected && styles.offlineButton]}
                loading={uiState.loading || false}
                icon={!isConnected ? "content-save-outline" : "content-save"}
                labelStyle={styles.saveButtonLabel}
                contentStyle={styles.saveButtonContent}
              >
                <Text style={styles.saveButtonText}>
                  {isConnected ? 'Save Changes' : 'Save Offline'}
                </Text>
              </Button>
            </View>
          </ScrollView>

          <Portal>
            <PrescriptionModal
              visible={uiState.prescriptionModalVisible || false}
              onDismiss={() => dispatch({ type: 'SET_UI_STATE', payload: { prescriptionModalVisible: false } })}
              onAdd={(prescription) => dispatch({ type: 'ADD_PRESCRIPTION', payload: { [Date.now()]: prescription } })}
            />

            <QuantityModal
              visible={uiState.quantityModalVisible || false}
              item={uiState.currentScannedItem || null}
              onConfirm={handleQuantityConfirm}
              onDismiss={() => dispatch({ type: 'SET_UI_STATE', payload: { quantityModalVisible: false } })}
              offline={!isConnected}
            />

            <BarcodeScannerModal
              visible={uiState.scanning || false}
              onScan={handleBarCodeScanned}
              onDismiss={() => dispatch({ type: 'SET_UI_STATE', payload: { scanning: false } })}
            />
          </Portal>

          <Snackbar
            visible={uiState.snackbar?.visible || false}
            onDismiss={() => dispatch({ type: 'SET_UI_STATE', payload: { snackbar: { visible: false, message: '' } } })}
            duration={4000}
          >
            <Text>{uiState.snackbar?.message || ''}</Text>
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
    primary: '#667eea', 
    accent: '#764ba2',
    surface: '#ffffff',
    background: '#f5f5f5'
  }
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  scrollView: { 
    padding: 16 
  },
  clinicHeader: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clinicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clinicIcon: {
    marginRight: 8,
  },
  clinicName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  departmentText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  saveButtonContainer: {
    marginVertical: 20,
  },
  saveButton: { 
    backgroundColor: '#667eea',
    borderRadius: 12,
    elevation: 4,
  },
  offlineButton: { 
    backgroundColor: '#FF9800' 
  },
  saveButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonContent: {
    paddingVertical: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DeptPatientInfoScreen;