import { useState } from 'react';
import { getDatabase, ref, get, update, push } from 'firebase/database';

export const useInventory = () => {
  const [loading, setLoading] = useState(false);

  const checkInventoryItem = async (itemId, type) => {
    try {
      const db = getDatabase();
      const itemRef = ref(db, `inventory/${type}/${itemId}`);
      const snapshot = await get(itemRef);
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error('Error checking inventory:', error);
      return null;
    }
  };

  const updateInventoryQuantity = async (items) => {
    try {
      setLoading(true);
      const db = getDatabase();
      const updates = {};

      items.forEach(({ id, type, quantity }) => {
        updates[`inventory/${type}/${id}/quantity`] = quantity;
      });

      await update(ref(db), updates);
      return true;
    } catch (error) {
      console.error('Error updating inventory:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logUsageHistory = async (patientData, itemData, quantity, type) => {
    try {
      const db = getDatabase();
      const historyRef = ref(db, 'inventory/usageHistory');
      await push(historyRef, {
        patientId: patientData.qrData,
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        itemName: itemData.name,
        quantity,
        type,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error logging history:', error);
    }
  };

  return {
    loading,
    checkInventoryItem,
    updateInventoryQuantity,
    logUsageHistory
  };
};

export default useInventory;