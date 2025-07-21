import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { getDatabase, ref, get, update, push, onValue } from 'firebase/database';
import { auth } from '../../../firebaseConfig';

export const useDeptInventory = () => {
  const [inventoryData, setInventoryData] = useState({});
  const [userDepartment, setUserDepartment] = useState(null);
  const db = getDatabase();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Listen to user data to get department
    const userRef = ref(db, `users/${user.uid}`);
    const userUnsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        console.log('Current user data:', userData);
        setUserDepartment(userData.department);
      }
    });

    return userUnsubscribe;
  }, [db]);

  useEffect(() => {
    if (!userDepartment) return;

    console.log('Using department:', userDepartment);
    
    // Listen to department inventory
    const deptRef = ref(db, `departments/${userDepartment}`);
    const deptUnsubscribe = onValue(deptRef, (snapshot) => {
      if (snapshot.exists()) {
        const deptData = snapshot.val();
        console.log('Department data loaded:', deptData);
        setInventoryData({
          localMeds: deptData.localMeds || {},
          localSupplies: deptData.localSupplies || {}
        });
      } else {
        console.log('No department data found');
        setInventoryData({ localMeds: {}, localSupplies: {} });
      }
    });

    return deptUnsubscribe;
  }, [userDepartment, db]);

  const getCurrentUserDepartment = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const db = getDatabase();
    const userRef = ref(db, `users/${currentUser.uid}`);
    
    try {
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.val();
        console.log('Current user data:', userData);
        return userData.department;
      } else {
        throw new Error('User data not found');
      }
    } catch (error) {
      console.error('Error fetching current user department:', error);
      throw error;
    }
  }, []);

  const checkInventoryItem = async (itemId, type) => {
    try {
      console.log(`Checking inventory for item: ${itemId}, type: ${type}`);
      
      const itemType = type === 'medicines' ? 'localMeds' : 'localSupplies';
      const item = inventoryData[itemType]?.[itemId];
      
      if (!item) {
        console.log('Item not found in inventory');
        return null;
      }

      console.log('Found item:', item);
      
      // Return item with proper structure
      return {
        ...item,
        id: itemId,
        type: type,
        name: item.itemName || item.genericName || 'Unknown Item',
        retailPrice: item.retailPrice || 0,
        shortDesc: item.shortDesc || '',
        standardDesc: item.standardDesc || ''
      };
    } catch (error) {
      console.error('Error checking inventory item:', error);
      return null;
    }
  };

  const updateInventoryQuantity = async (items) => {
    try {
      if (!userDepartment) {
        console.error('No user department available');
        return false;
      }

      console.log('updateInventoryQuantity called with:', { items, userDepartment });

      const updates = {};
      
      for (const item of items) {
        const { id, type, quantityUsed } = item;
        
        console.log(`Processing item: ${id}, type: ${type}, quantityUsed: ${quantityUsed}`);
        
        // Determine the correct path
        const itemType = type === 'medicines' ? 'localMeds' : 'localSupplies';
        const itemPath = `departments/${userDepartment}/${itemType}/${id}`;
        
        // Get current item data
        const currentItem = inventoryData[itemType]?.[id];
        
        if (!currentItem) {
          console.error(`Item ${id} not found in ${itemType}`);
          continue;
        }

        // Get current quantity - handle both number and string
        let currentQuantity = currentItem.quantity;
        if (typeof currentQuantity === 'string') {
          currentQuantity = parseInt(currentQuantity, 10);
        }
        
        if (isNaN(currentQuantity) || currentQuantity < 0) {
          console.error(`Invalid current quantity for item ${id}: ${currentItem.quantity}`);
          currentQuantity = 0;
        }

        // Calculate new quantity
        const newQuantity = Math.max(0, currentQuantity - quantityUsed);
        
        console.log(`Updating path: ${itemPath}/quantity with quantity: ${newQuantity} (current: ${currentQuantity}, used: ${quantityUsed})`);
        
        // Add to updates object
        updates[`${itemPath}/quantity`] = newQuantity;
      }

      if (Object.keys(updates).length === 0) {
        console.log('No valid updates to process');
        return false;
      }

      console.log('Applying updates:', updates);
      
      // Apply all updates atomically
      await update(ref(db), updates);
      
      console.log('Inventory updated successfully');
      return true;
      
    } catch (error) {
      console.error('Error updating inventory:', error);
      return false;
    }
  };

  const logUsageHistory = async (patientInfo, item, quantity, type) => {
    try {
      if (!userDepartment) {
        console.error('No user department for logging usage history');
        return;
      }

      const historyRef = ref(db, `departments/${userDepartment}/usageHistory`);
      const historyEntry = {
        patientId: patientInfo.qrData || 'Unknown ID',
        firstName: patientInfo.firstName || 'Unknown Name',
        lastName: patientInfo.lastName || 'Unknown Name',
        itemName: item.name || item.itemName || item.genericName || 'Unknown Item',
        quantity: parseInt(quantity, 10),
        type: type,
        timestamp: new Date().toISOString()
      };

      await push(historyRef, historyEntry);
      console.log('Usage history logged:', historyEntry);
    } catch (error) {
      console.error('Error logging usage history:', error);
    }
  };

  return {
    inventoryData,
    userDepartment,
    checkInventoryItem,
    updateInventoryQuantity,
    logUsageHistory
  };
};
