import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import { getDatabase, ref, onValue, get } from 'firebase/database';
import { FontAwesome5 } from '@expo/vector-icons';
import { auth } from '../../../../firebaseConfig'; // Adjust this path as needed
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const DeptUsageHistory = () => {
  const [usageHistory, setUsageHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [userDepartment, setUserDepartment] = useState(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

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
          setUserDepartment(userData.department); // Assuming 'role' contains the department name
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
        const patientName = item.firstName ? item.lastName.toLowerCase() : '';

        return itemName.includes(query.toLowerCase()) || patientName.includes(query.toLowerCase());
      });

      setFilteredHistory(filtered);
    }
  };

  const handleDateFilter = (date) => {
    setSelectedDate(date);
    setDatePickerVisible(false);

    const filtered = usageHistory.filter((item) => {
      const itemDate = new Date(item.timestamp).toDateString(); // Format the item's timestamp
      return itemDate === date.toDateString(); // Match the selected date
    });

    setFilteredHistory(filtered);
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

      {/* Search Bar and Date Picker */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search history by item or patient..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <TouchableOpacity onPress={() => setDatePickerVisible(true)}>
          <FontAwesome5 name="calendar-alt" size={24} color="#00796b" style={styles.calendarIcon} />
        </TouchableOpacity>
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateFilter}
        onCancel={() => setDatePickerVisible(false)}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  searchBar: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  calendarIcon: {
    marginLeft: 10,
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
