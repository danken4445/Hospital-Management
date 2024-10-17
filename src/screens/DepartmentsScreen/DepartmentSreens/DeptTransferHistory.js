import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { Card } from 'react-native-paper';
import { getDatabase, ref, onValue, get } from 'firebase/database';
import { format } from 'date-fns';
import { auth } from '../../../../firebaseConfig'; // Ensure the correct path to Firebase config

const DepartmentTransferHistory = () => {
  const [transferHistory, setTransferHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [userDepartment, setUserDepartment] = useState(null);

  useEffect(() => {
    const db = getDatabase();

    // Fetch the current user's department
    const fetchUserDepartment = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setUserDepartment(userData.department); // Assuming the department field exists
          console.log('Fetched User Department:', userData.department);
        } else {
          console.error('User department not found');
          setLoading(false);
        }
      }
    };

    // Fetch transfer history for the department after the department is fetched
    const fetchTransferHistory = async () => {
      await fetchUserDepartment();

      if (userDepartment) {
        // Firebase references
        const supplyHistoryRef = ref(db, 'supplyHistoryTransfer');
        const medicineHistoryRef = ref(db, 'medicineTransferHistory');

        let combinedHistory = [];

        // Fetch supply transfer history
        onValue(supplyHistoryRef, (snapshot) => {
          if (snapshot.exists()) {
            const supplyHistoryData = snapshot.val();
            const supplyHistoryArray = Object.keys(supplyHistoryData).map((key) => ({
              id: key,
              ...supplyHistoryData[key],
            }));

            // Filter supply history by recipient department
            const filteredSupplyHistory = supplyHistoryArray.filter(
              (item) => item.recipientDepartment === userDepartment
            );

            combinedHistory = [...combinedHistory, ...filteredSupplyHistory];
          } else {
            console.log('No supply transfer history found.');
          }
        });

        // Fetch medicine transfer history
        onValue(medicineHistoryRef, (snapshot) => {
          if (snapshot.exists()) {
            const medicineHistoryData = snapshot.val();
            const medicineHistoryArray = Object.keys(medicineHistoryData).map((key) => ({
              id: key,
              ...medicineHistoryData[key],
            }));

            // Filter medicine history by recipient department
            const filteredMedicineHistory = medicineHistoryArray.filter(
              (item) => item.recipientDepartment === userDepartment
            );

            combinedHistory = [...combinedHistory, ...filteredMedicineHistory];
          } else {
            console.log('No medicine transfer history found.');
          }

          // Sort combined history by timestamp
          const sortedHistory = combinedHistory.sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
          );

          console.log('Transfer History:', sortedHistory); // Log transfer history to ensure it's being fetched correctly

          setTransferHistory(sortedHistory);
          setFilteredHistory(sortedHistory);
          setLoading(false);
        });
      } else {
        console.error('User department is null or undefined.');
        setLoading(false);
      }
    };

    fetchTransferHistory();
  }, [userDepartment]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query === '') {
      setFilteredHistory(transferHistory);
    } else {
      const filteredData = transferHistory.filter((item) => {
        const itemName = item.itemName ? item.itemName.toLowerCase() : ''; // Handle missing itemName
        const recipientDepartment = item.recipientDepartment ? item.recipientDepartment.toLowerCase() : ''; // Handle missing recipientDepartment
  
        return itemName.includes(query.toLowerCase()) || recipientDepartment.includes(query.toLowerCase());
      });
      setFilteredHistory(filteredData);
    }
  };
  
  const formatDate = (timestamp) => {
    // Since the timestamp is already in a human-readable format, just return it
    return timestamp ? timestamp : 'N/A';
  };
  
  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.itemName}>{item.itemName}</Text>
          <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
        </View>
        <Text style={styles.label}>Brand: {item.itemBrand}</Text>
        <Text style={styles.label}>Quantity: {item.quantity}</Text>
        <Text style={styles.label}>Sender: {item.sender}</Text>
        <Text style={styles.label}>Reason: {item.reason}</Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Department Transfer History</Text>

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search by item name or department..."
        value={searchQuery}
        onChangeText={handleSearch}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#6200ea" />
      ) : filteredHistory.length > 0 ? (
        <FlatList
          data={filteredHistory}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <Text style={styles.noDataText}>No transfer history available.</Text>
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
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#6200ea',
  },
  searchBar: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 12,
    elevation: 3,
    padding: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  timestamp: {
    fontSize: 14,
    color: '#888',
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  listContainer: {
    paddingBottom: 10,
  },
  noDataText: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default DepartmentTransferHistory;
