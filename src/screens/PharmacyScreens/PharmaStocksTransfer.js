import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert, ScrollView } from 'react-native';
import { getDatabase, ref, update, get, push } from 'firebase/database';
import { auth } from '../../../firebaseConfig'; // Adjust the import path
import { useRoute, useNavigation } from '@react-navigation/native'; // Import for navigation and route
import { Picker } from '@react-native-picker/picker'; // Correct Picker import

const StockTransferScreen = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [quantity, setQuantity] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemBrand, setItemBrand] = useState('');
  const [userInfo, setUserInfo] = useState(null); // To store logged-in user info
  const [supplies, setSupplies] = useState([]);

  const db = getDatabase();
  const navigation = useNavigation();
  const route = useRoute(); // Initialize route to receive params

  useEffect(() => {
    // Fetch departments excluding CSR
    const fetchDepartments = async () => {
      const departmentsRef = ref(db, 'departments');
      const snapshot = await get(departmentsRef);
      if (snapshot.exists()) {
        const deptData = snapshot.val();
        const departmentList = Object.keys(deptData).filter(dept => dept !== 'CSR');
        setDepartments(departmentList);
      }
    };

    // Fetch logged-in user details (assuming they are stored under users node)
    const fetchUserInfo = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = ref(db, `users/${user.uid}`);
        const userSnapshot = await get(userRef);
        if (userSnapshot.exists()) {
          setUserInfo(userSnapshot.val());
        }
      }
    };

    // Autofill fields based on navigation params
    if (route.params && route.params.itemDetails) {
      const { itemDetails } = route.params;
      setItemName(itemDetails.itemName);
      setItemBrand(itemDetails.brand);
    }

    // Fetch available supplies from the CSR department
    const fetchSupplies = async () => {
      const suppliesRef = ref(db, 'departments/Pharmacy/localMeds');
      const snapshot = await get(suppliesRef);
      if (snapshot.exists()) {
        const supplyList = Object.entries(snapshot.val()).map(([key, value]) => ({
          id: key,
          ...value
        }));
        setSupplies(supplyList);
      }
    };

  
    

    fetchDepartments();
    fetchUserInfo();
    fetchSupplies();
  }, [route.params]); // Add route.params as dependency to re-fetch when itemDetails change

  const handleTransfer = async () => {
    if (!selectedDepartment || !quantity || !itemName || !itemBrand) {
      Alert.alert('Error', 'Please fill in all the fields');
      return;
    }
  
    const transferQuantity = parseInt(quantity, 10);
    if (isNaN(transferQuantity) || transferQuantity <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity');
      return;
    }
    const formatDateToLocal = (date) => {
      const offset = date.getTimezoneOffset();
      const adjustedDate = new Date(date.getTime() - offset * 60 * 1000);
      return adjustedDate.toISOString().slice(0, 16).replace('T', ' ');
    };
    
  
    // Find the supply item from the CSR supplies
// Find the supply item from the CSR supplies (Case-insensitive and trimmed comparison)
const supplyItem = supplies.find(
  (item) => 
    item.itemName.trim().toLowerCase() === itemName.trim().toLowerCase() &&
    item.brand.trim().toLowerCase() === itemBrand.trim().toLowerCase()
);

if (!supplyItem) {
  Alert.alert('Error', 'Supply item not found.');
  return;
}
  
    if (supplyItem.quantity < transferQuantity) {
      Alert.alert('Error', 'Insufficient stock in CSR.');
      return;
    }
  
    try {
      // Deduct from CSR stock
      const updatedCSRQuantity = supplyItem.quantity - transferQuantity;
      const supplyItemRef = ref(db, `departments/Pharmacy/localMeds/${supplyItem.id}`);
      await update(supplyItemRef, { quantity: updatedCSRQuantity });
  
      // Update or create the item in the selected department's localSupplies
      const departmentSupplyRef = ref(db, `departments/${selectedDepartment}/localMeds`);
      const departmentSnapshot = await get(departmentSupplyRef);
      const departmentSupplies = departmentSnapshot.exists() ? departmentSnapshot.val() : {};
  
      let foundItem = false;
      for (const key in departmentSupplies) {
        if (departmentSupplies[key].itemName === itemName && departmentSupplies[key].brand === itemBrand) {
          // If the item already exists in the department, update its quantity
          const updatedQuantity = departmentSupplies[key].quantity + transferQuantity;
          await update(ref(db, `departments/${selectedDepartment}/localMeds/${key}`), { quantity: updatedQuantity });
          foundItem = true;
          break;
        }
      }
  
      if (!foundItem) {
        // If the item doesn't exist, create a new entry in localSupplies
        const newSupplyKey = push(departmentSupplyRef).key;
        const newSupplyItem = {
          brand: itemBrand,
          itemName,
          quantity: transferQuantity,
          timestamp: formatDateToLocal(new Date()), // Use the formatted timestamp here
          createdBy: `${userInfo.firstName} ${userInfo.lastName}`,
        };
        await update(ref(db, `departments/${selectedDepartment}/localMeds/${newSupplyKey}`), newSupplyItem);
      }
  
      // Log the transfer in InventoryHistoryTransfer under CSR
      const transferHistoryRefCSR = ref(db, 'medicineTransferHistory');
      const newTransferKeyCSR = push(transferHistoryRefCSR).key;
      const transferDataCSR = {
        sender: `${userInfo.firstName} ${userInfo.lastName}`,
        recipientDepartment: selectedDepartment,
        quantity: transferQuantity,
        itemName,
        itemBrand,
        timestamp: formatDateToLocal(new Date()), // Use the formatted timestamp here
      };
      await update(ref(db, `medicineTransferHistory/${newTransferKeyCSR}`), transferDataCSR);
  

  
      Alert.alert('Success', 'Stock transferred successfully');
      setQuantity('');
      setItemName('');
      setItemBrand('');
    } catch (error) {
      Alert.alert('Error', `Failed to transfer stock: ${error.message}`);
    }
  };
  
    
        return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Stock Transfers</Text>
      
      {/* Department Picker */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Select Department (Receiver)</Text>
        <Picker
          selectedValue={selectedDepartment}
          onValueChange={(itemValue) => setSelectedDepartment(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select a Department" value="" />
          {departments.map((dept) => (
            <Picker.Item key={dept} label={dept} value={dept} />
          ))}
        </Picker>
      </View>

      {/* Quantity Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Quantity</Text>
        <TextInput
          style={styles.input}
          value={quantity}
          onChangeText={setQuantity}
          placeholder="Enter quantity"
          keyboardType="numeric"
        />
      </View>

      {/* Item Name Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Item Name</Text>
        <TextInput
          style={styles.input}
          value={itemName}
          onChangeText={setItemName}
          placeholder="Enter item name"
          autoCapitalize="none"
        />
      </View>

      {/* Item Brand Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Item Brand</Text>
        <TextInput
          style={styles.input}
          value={itemBrand}
          onChangeText={setItemBrand}
          placeholder="Enter item brand"
          autoCapitalize="none"
        />
      </View>

      {/* Submit Button */}
      <Button title="Transfer Stock" onPress={handleTransfer} color="#4CAF50" />

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
});

export default StockTransferScreen;
