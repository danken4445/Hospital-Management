import { useCallback } from 'react';
import { Alert } from 'react-native';
import { getDatabase, ref, get, update, push } from 'firebase/database';

export const useDeptInventory = () => {
  const checkInventoryItem = useCallback(async (itemId, scanType, userDepartment) => {
    if (!userDepartment) {
      throw new Error('User department not found');
    }

    const db = getDatabase();
    let itemRef;

    if (scanType === 'supplies') {
      itemRef = ref(db, `departments/${userDepartment}/localSupplies/${itemId}`);
    } else if (scanType === 'medicines') {
      itemRef = ref(db, `departments/${userDepartment}/localMeds/${itemId}`);
    } else {
      throw new Error('Invalid scan type');
    }

    const snapshot = await get(itemRef);
    if (snapshot.exists()) {
      const itemData = snapshot.val();
      const itemName = scanType === 'medicines' ? itemData.genericName : itemData.itemName;
      
      return {
        ...itemData,
        id: itemId,
        type: scanType,
        name: itemName,
        shortDesc: itemData.shortDesc || '',
        standardDesc: itemData.standardDesc || '',
      };
    }
    return null;
  }, []);

  const updateInventoryQuantity = useCallback(async (items, userDepartment) => {
    if (!userDepartment) {
      Alert.alert('Error', 'User department not found');
      return false;
    }

    try {
      const db = getDatabase();
      const updates = {};

      for (const item of items) {
        const path = item.type === 'supplies' 
          ? `departments/${userDepartment}/localSupplies/${item.id}/quantity`
          : `departments/${userDepartment}/localMeds/${item.id}/quantity`;
        updates[path] = item.quantity;
      }

      await update(ref(db), updates);
      return true;
    } catch (error) {
      console.error('Error updating inventory:', error);
      Alert.alert('Error', 'Failed to update inventory');
      return false;
    }
  }, []);

  const logUsageHistory = useCallback(async (patientData, item, quantity, scanType, userDepartment) => {
    if (!userDepartment) return;
    
    const db = getDatabase();
    const historyRef = ref(db, `departments/${userDepartment}/usageHistory`);
    const newHistoryRef = push(historyRef);

    const patientId = patientData.qrData || 'Unknown ID';
    const firstName = patientData.firstName || 'Unknown Name';
    const lastName = patientData.lastName || 'Unknown Name';

    if (!item.name || !quantity || !scanType) {
      console.error('Invalid inventory data: itemName, quantity, or type is missing.');
      return;
    }

    const historyData = {
      patientId,
      firstName,
      lastName,
      itemName: item.name,
      quantity,
      type: scanType,
      timestamp: new Date().toISOString(),
    };

    try {
      await update(newHistoryRef, historyData);
      console.log('Inventory history logged successfully');
    } catch (error) {
      console.error('Error logging inventory history:', error);
    }
  }, []);

  return {
    checkInventoryItem,
    updateInventoryQuantity,
    logUsageHistory,
  };
};
