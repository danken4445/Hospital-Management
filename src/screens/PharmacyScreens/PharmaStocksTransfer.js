import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert, ScrollView } from 'react-native';
import { getDatabase, ref, update, get, push } from 'firebase/database';
import { auth } from '../../../firebaseConfig'; // Adjust the import path
import { useRoute, useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

const PharmaStockTransferScreen = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [quantity, setQuantity] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemBrand, setItemBrand] = useState('');
  const [userInfo, setUserInfo] = useState(null); // To store logged-in user info
  const [medicines, setMedicines] = useState([]);

  const db = getDatabase();
  const navigation = useNavigation();
  const route = useRoute();

  useEffect(() => {
    // Fetch departments excluding Pharmacy
    const fetchDepartments = async () => {
      const departmentsRef = ref(db, 'departments');
      const snapshot = await get(departmentsRef);
      if (snapshot.exists()) {
        const deptData = snapshot.val();
        const departmentList = Object.keys(deptData).filter(dept => dept !== 'Pharmacy');
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

    // Fetch available medicines from the Pharmacy department
    const fetchMedicines = async () => {
      const medsRef = ref(db, 'departments/Pharmacy/localMeds');
      const snapshot = await get(medsRef);
      if (snapshot.exists()) {
        const medicineList = Object.entries(snapshot.val()).map(([key, value]) => ({
          id: key,
          ...value
        }));
        setMedicines(medicineList);
      }
    };

    fetchDepartments();
    fetchUserInfo();
    fetchMedicines();
  }, [route.params]);

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

    // Find the medicine item from Pharmacy's localMeds
    const medicineItem = medicines.find(
      (item) => item.itemName === itemName && item.brand === itemBrand
    );

    if (!medicineItem) {
      Alert.alert('Error', 'Medicine item not found.');
      return;
    }

    if (medicineItem.quantity < transferQuantity) {
      Alert.alert('Error', 'Insufficient stock in Pharmacy.');
      return;
    }

    try {
      // Deduct from Pharmacy stock
      const updatedPharmacyQuantity = medicineItem.quantity - transferQuantity;
      const medicineItemRef = ref(db, `departments/Pharmacy/localMeds/${medicineItem.id}`);
      await update(medicineItemRef, { quantity: updatedPharmacyQuantity });

      // Update or create the item in the selected department's localMeds
      const departmentMedsRef = ref(db, `departments/${selectedDepartment}/localMeds`);
      const departmentSnapshot = await get(departmentMedsRef);
      const departmentMeds = departmentSnapshot.exists() ? departmentSnapshot.val() : {};

      let foundItem = false;
      for (const key in departmentMeds) {
        if (departmentMeds[key].itemName === itemName && departmentMeds[key].brand === itemBrand) {
          // If the item already exists in the department, update its quantity
          const updatedQuantity = departmentMeds[key].quantity + transferQuantity;
          await update(ref(db, `departments/${selectedDepartment}/localMeds/${key}`), { quantity: updatedQuantity });
          foundItem = true;
          break;
        }
      }

      if (!foundItem) {
        // If the item doesn't exist, create a new entry in localMeds
        const newMedKey = push(departmentMedsRef).key;
        const newMedicineItem = {
          brand: itemBrand,
          itemName,
          quantity: transferQuantity,
          timestamp:  new Date().toISOString(),
          createdBy: `${userInfo.firstName} ${userInfo.lastName}`,
        };
        await update(ref(db, `departments/${selectedDepartment}/localMeds/${newMedKey}`), newMedicineItem);
      }

      // Log the transfer in InventoryHistoryTransfer under Pharmacy
      const transferHistoryRefPharmacy = ref(db, 'medicineTransferHistory');
      const newTransferKeyPharmacy = push(transferHistoryRefPharmacy).key;
      const transferDataPharmacy = {
        sender: `${userInfo.firstName} ${userInfo.lastName}`,
        recipientDepartment: selectedDepartment,
        quantity: transferQuantity,
        itemName,
        itemBrand,
        timestamp: formatDateToLocal(new Date()),
      };
      await update(ref(db, `/medicineTransferHistory`), transferDataPharmacy);

      // Log the transfer in InventoryHistoryTransfer under recipient department
   

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
      <Text style={styles.header}>Pharmacy Stock Transfer</Text>

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

export default PharmaStockTransferScreen;
