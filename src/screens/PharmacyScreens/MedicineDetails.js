import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { Card } from 'react-native-paper';
import { getDatabase, ref, onValue } from 'firebase/database';

const MedicineDetails = ({ route }) => {
  const { med } = route.params;
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedicineDetails = () => {
      const db = getDatabase();
      const departmentsRef = ref(db, 'departments'); // Reference to departments node in Firebase
      const medicineDetails = [];

      onValue(departmentsRef, (snapshot) => {
        if (snapshot.exists()) {
          const departmentsData = snapshot.val();

          // Iterate through departments to find the specified medicine in localMeds
          Object.keys(departmentsData).forEach((departmentKey) => {
            const department = departmentsData[departmentKey];
            if (department.localMeds) {
              Object.keys(department.localMeds).forEach((medKey) => {
                const medicine = department.localMeds[medKey];
                if (medicine.itemName === med.itemName) {
                  // Collect department-wise details for the selected medicine
                  medicineDetails.push({
                    departmentName: departmentKey,
                    quantity: medicine.quantity,
                    brand: medicine.brand,
                  });
                }
              });
            }
          });

          setFilteredDepartments(medicineDetails);
          setLoading(false);
        }
      });
    };

    fetchMedicineDetails();
  }, [med]);

  const handleSearch = (query) => {
    setSearchQuery(query);

    if (query === '') {
      setFilteredDepartments(filteredDepartments);
    } else {
      const filteredData = filteredDepartments.filter((dept) =>
        dept.departmentName.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredDepartments(filteredData);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{med.itemName}</Text>
      <Text style={styles.subtitle}>Total Quantity: {med.totalQuantity} units</Text>

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search for departments..."
        value={searchQuery}
        onChangeText={handleSearch}
      />

      {/* Department List */}
      {loading ? (
        <ActivityIndicator size="large" color="#00796b" />
      ) : (
        <FlatList
          data={filteredDepartments}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.cardContent}>
                <Text style={styles.departmentName}>{item.departmentName}</Text>
                <Text style={styles.departmentDetails}>Quantity: {item.quantity}</Text>
                <Text style={styles.brandDetails}>Brand: {item.brand}</Text>
              </View>
            </Card>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      )}
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
    color: '#00796b',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    color: '#424242',
  },
  searchBar: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#ffffff',
  },
  card: {
    backgroundColor: '#ffffff',
    marginBottom: 12,
    borderRadius: 10,
    elevation: 3,
  },
  cardContent: {
    padding: 15,
  },
  departmentName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#00796b',
    marginBottom: 8,
  },
  departmentDetails: {
    fontSize: 16,
    color: '#424242',
  },
  brandDetails: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
});

export default MedicineDetails;
