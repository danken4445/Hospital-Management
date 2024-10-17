import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import { getDatabase, ref, onValue, get } from 'firebase/database';
import { FontAwesome5 } from '@expo/vector-icons';
import { auth } from '../../../../firebaseConfig'; // Adjust this path as needed

const DeptUsageHistory = () => {
  const [usageHistory, setUsageHistory] = useState([]);
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
          setUserDepartment(userData.role); // Assuming 'role' contains the department name
        }
      }
    };

    const fetchUsageHistory = async () => {
      await fetchUserDepartment();
      if (userDepartment) {
        const historyRef = ref(db, `departments/${userDepartment}/usageHistory`);
        onValue(historyRef, (snapshot) => {
          if (snapshot.exists()) {
            const historyData = snapshot.val();
            const historyArray = Object.keys(historyData).map((key) => ({
              id: key,
              ...historyData[key],
            }));
            setUsageHistory(historyArray);
            setFilteredHistory(historyArray);
            setLoading(false);
          } else {
            setUsageHistory([]);
            setFilteredHistory([]);
            setLoading(false);
          }
        });
      }
    };

    fetchUsageHistory();
  }, [userDepartment]);

  const handleSearch = (query) => {
    setSearchQuery(query);

    if (query.trim() === '') {
      setFilteredHistory(usageHistory);
    } else {
      const filtered = usageHistory.filter((item) => {
        const itemName = item.itemName ? item.itemName.toLowerCase() : '';
        const firstName = item.firstName ? item.firstName.toLowerCase() : '';

        return itemName.includes(query.toLowerCase()) || firstName.includes(query.toLowerCase());
      });

      setFilteredHistory(filtered);
    }
  };

  const renderHistoryItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <FontAwesome5 name={item.type === 'medicines' ? 'pills' : 'box'} size={24} color="#00796b" />
          <Title style={styles.cardTitle}>{item.itemName}</Title>
        </View>
        <Paragraph>
          <Text style={styles.label}>Patient:</Text> {item.firstName} {item.lastName}
        </Paragraph>
        <Paragraph>
          <Text style={styles.label}>Quantity:</Text> {item.quantity}
        </Paragraph>
        <Paragraph>
          <Text style={styles.label}>Type:</Text> {item.type}
        </Paragraph>
        <Paragraph>
          <Text style={styles.label}>Date:</Text> {new Date(item.timestamp).toLocaleString()}
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
        placeholder="Search history by item or patient..."
        value={searchQuery}
        onChangeText={handleSearch}
      />

      {/* Usage History List */}
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

export default DeptUsageHistory;
