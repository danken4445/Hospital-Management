import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import { getDatabase, ref, onValue, get } from 'firebase/database';
import { auth } from '../../../../firebaseConfig'; // Adjust the path accordingly
import { FontAwesome5 } from '@expo/vector-icons';

const TransferHistory = () => {
  const [transferHistory, setTransferHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [userDepartment, setUserDepartment] = useState(null);

  useEffect(() => {
    const db = getDatabase();

    const fetchUserDepartment = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setUserDepartment(userData.department); // Assuming 'role' contains the department name
        }
      }
    };

    const fetchTransferHistory = async () => {
      await fetchUserDepartment(); // Ensure user's department is fetched first
      if (userDepartment) {
        const medicineRef = ref(db, 'medicineTransferHistory');
        const supplyRef = ref(db, 'supplyHistoryTransfer');

        let combinedHistory = [];

        onValue(medicineRef, (medicineSnapshot) => {
          if (medicineSnapshot.exists()) {
            const medicines = Object.keys(medicineSnapshot.val()).map((key) => ({
              id: key,
              type: 'medicine', // Identify as a medicine transfer
              ...medicineSnapshot.val()[key],
            }));
            combinedHistory = [...combinedHistory, ...medicines];
          }

          onValue(supplyRef, (supplySnapshot) => {
            if (supplySnapshot.exists()) {
              const supplies = Object.keys(supplySnapshot.val()).map((key) => ({
                id: key,
                type: 'supply', // Identify as a supply transfer
                ...supplySnapshot.val()[key],
              }));
              combinedHistory = [...combinedHistory, ...supplies];
            }

            // Filter by department
            const departmentFiltered = combinedHistory.filter(
              (item) => item.recipientDepartment === userDepartment
            );
            setTransferHistory(departmentFiltered);
            setFilteredHistory(departmentFiltered);
            setLoading(false);
          });
        });
      }
    };

    fetchTransferHistory();
  }, [userDepartment]);

  const handleSearch = (query) => {
    setSearchQuery(query);

    if (query.trim() === '') {
      setFilteredHistory(transferHistory);
    } else {
      const filtered = transferHistory.filter((item) => {
        const genericName = item.genericName ? item.genericName.toLowerCase() : '';
        const itemName = item.itemName ? item.itemName.toLowerCase() : '';
        const sender = item.sender ? item.sender.toLowerCase() : '';
        const recipientDepartment = item.recipientDepartment
          ? item.recipientDepartment.toLowerCase()
          : '';

        return (
          genericName.includes(query.toLowerCase()) ||
          itemName.includes(query.toLowerCase()) ||
          sender.includes(query.toLowerCase()) ||
          recipientDepartment.includes(query.toLowerCase())
        );
      });

      setFilteredHistory(filtered);
    }
  };

  const renderHistoryItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <FontAwesome5 name="truck" size={24} color="#00796b" />
          <Title style={styles.cardTitle}>{item.genericName || item.itemName}</Title>
        </View>
        {item.itemBrand && (
          <Paragraph>
            <Text style={styles.label}>Item Brand:</Text> {item.itemBrand}
          </Paragraph>
        )}
        <Paragraph>
          <Text style={styles.label}>Quantity:</Text> {item.quantity}
        </Paragraph>
        <Paragraph>
          <Text style={styles.label}>Sender:</Text> {item.sender}
        </Paragraph>
        <Paragraph>
          <Text style={styles.label}>Recipient Department:</Text> {item.recipientDepartment}
        </Paragraph>
        <Paragraph>
          <Text style={styles.label}>Timestamp:</Text> {(item.timestamp)}
        </Paragraph>
        <Paragraph>
          <Text style={styles.label}>Type:</Text> {item.type}
        </Paragraph>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Department: {userDepartment}</Text>

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search by item, sender, or department..."
        value={searchQuery}
        onChangeText={handleSearch}
      />

      {/* Transfer History List */}
      {loading ? (
        <ActivityIndicator size="large" color="#00796b" />
      ) : (
        <FlatList
          data={filteredHistory}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#00796b',
  },
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  listContainer: {
    paddingBottom: 10,
  },
  card: {
    marginBottom: 10,
    borderRadius: 10,
    elevation: 3,
    backgroundColor: '#fff',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
  label: {
    fontWeight: 'bold',
  },
});

export default TransferHistory;
