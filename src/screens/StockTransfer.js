import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { getDatabase, ref, update } from 'firebase/database';
import { Picker } from '@react-native-picker/picker'; // Import Picker


const StockTransfer = () => {
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [department, setDepartment] = useState('');

  const handleTransfer = async () => {
    const quantityToTransfer = parseInt(quantity, 10);
    if (!itemName || isNaN(quantityToTransfer) || quantityToTransfer <= 0 || !department) {
      Alert.alert('Invalid Input', 'Please enter valid details.');
      return;
    }

    const db = getDatabase();
    const itemRef = ref(db, `csr/localInventory/${itemName}`);
    const departmentRef = ref(db, `departments/${department}/inventory/${itemName}`);

    try {
      // Update CSR local inventory
      const currentItemSnapshot = await get(itemRef);
      const currentQuantity = currentItemSnapshot.exists() ? currentItemSnapshot.val().quantity : 0;

      if (currentQuantity < quantityToTransfer) {
        Alert.alert('Error', 'Insufficient quantity to transfer.');
        return;
      }

      const updatedQuantity = currentQuantity - quantityToTransfer;
      await update(itemRef, { quantity: updatedQuantity });

      // Update Department Inventory
      const departmentItemSnapshot = await get(departmentRef);
      const departmentQuantity = departmentItemSnapshot.exists() ? departmentItemSnapshot.val().quantity : 0;
      const updatedDepartmentQuantity = departmentQuantity + quantityToTransfer;
      await update(departmentRef, { quantity: updatedDepartmentQuantity });

      Alert.alert('Success', `${quantityToTransfer} of ${itemName} transferred to ${department} successfully.`);
      setItemName('');
      setQuantity('');
      setDepartment('');
    } catch (error) {
      console.error('Error transferring stock:', error);
      Alert.alert('Error', 'Failed to transfer stock.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stock Transfer</Text>
      <TextInput
        style={styles.input}
        placeholder="Item Name"
        value={itemName}
        onChangeText={setItemName}
      />
      <TextInput
        style={styles.input}
        placeholder="Quantity"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
      />
<Picker
  selectedValue={department}
  style={styles.input} // Use the same style as TextInput for consistency
  onValueChange={(itemValue) => setDepartment(itemValue)}
>
  {/* Add picker items for each department */}
  <Picker.Item label="Select Department" value="" />
  <Picker.Item label="ICU" value="ICU" />
  <Picker.Item label="CSR" value="CSR" />
  <Picker.Item label="Pharmacy" value="Pharmacy" />
  <Picker.Item label="Inpatients" value="Inpatients" />
  {/* Add more departments as needed */}
</Picker>

      <Button title="Transfer Stock" onPress={handleTransfer} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
});

export default StockTransfer;
