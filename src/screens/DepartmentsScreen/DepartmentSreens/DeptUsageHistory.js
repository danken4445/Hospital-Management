import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import { getDatabase, ref, onValue, get } from 'firebase/database';
import { FontAwesome5 } from '@expo/vector-icons';
import { auth } from '../../../../firebaseConfig';
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
    const fetchUserDepartment = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const db = getDatabase();
          const userRef = ref(db, `users/${user.uid}`);
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            const userData = snapshot.val();
            console.log('User data:', userData);
            setUserDepartment(userData.department);
            return userData.department;
          }
        }
        return null;
      } catch (error) {
        console.error('Error fetching user department:', error);
        setLoading(false);
        return null;
      }
    };

    const fetchUsageHistory = async () => {
      try {
        const department = await fetchUserDepartment();
        
        if (department) {
          const db = getDatabase();
          const historyRef = ref(db, `departments/${department}/usageHistory`);
          
          onValue(historyRef, (snapshot) => {
            try {
              if (snapshot.exists()) {
                const historyData = snapshot.val();
                const historyArray = Object.keys(historyData).map((key) => {
                  const item = historyData[key];
                  // Ensure timestamp exists and is valid
                  return {
                    id: key,
                    ...item,
                    timestamp: item.timestamp || new Date().toISOString(),
                  };
                });
                
                // Sort by timestamp (newest first)
                historyArray.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                
                setUsageHistory(historyArray);
                setFilteredHistory(historyArray);
              } else {
                setUsageHistory([]);
                setFilteredHistory([]);
              }
              setLoading(false);
            } catch (error) {
              console.error('Error processing usage history:', error);
              setLoading(false);
            }
          }, (error) => {
            console.error('Error listening to usage history:', error);
            setLoading(false);
          });
        } else {
          console.log('No user department found');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in fetchUsageHistory:', error);
        setLoading(false);
      }
    };

    fetchUsageHistory();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);

    if (query.trim() === '') {
      setFilteredHistory(usageHistory);
    } else {
      const filtered = usageHistory.filter((item) => {
        const itemName = item.itemName ? item.itemName.toLowerCase() : '';
        const firstName = item.firstName ? item.firstName.toLowerCase() : '';
        const lastName = item.lastName ? item.lastName.toLowerCase() : '';
        const patientId = item.patientId ? item.patientId.toLowerCase() : '';

        return itemName.includes(query.toLowerCase()) || 
               firstName.includes(query.toLowerCase()) || 
               lastName.includes(query.toLowerCase()) ||
               patientId.includes(query.toLowerCase());
      });

      setFilteredHistory(filtered);
    }
  };

  const handleDateFilter = (date) => {
    if (!date) {
      console.error('Date is undefined in handleDateFilter');
      return;
    }

    setSelectedDate(date);
    setDatePickerVisible(false);

    try {
      const filtered = usageHistory.filter((item) => {
        if (!item.timestamp) return false;
        
        const itemDate = new Date(item.timestamp);
        // Check if date is valid
        if (isNaN(itemDate.getTime())) return false;
        
        return itemDate.toDateString() === date.toDateString();
      });

      setFilteredHistory(filtered);
    } catch (error) {
      console.error('Error filtering by date:', error);
    }
  };

  const clearDateFilter = () => {
    setSelectedDate(null);
    setFilteredHistory(usageHistory);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'No date available';
    
    try {
      const date = new Date(timestamp);
      // Check if date is valid
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return date.toLocaleString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date formatting error';
    }
  };

  const renderHistoryItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <FontAwesome5 
            name={item.type === 'medicines' ? 'pills' : 'box'} 
            size={24} 
            color="#00796b" 
          />
          <Title style={styles.cardTitle}>
            {item.itemName || 'Unknown Item'}
          </Title>
        </View>
        <Paragraph>
          <Text style={styles.label}>Patient:</Text> {item.firstName || 'Unknown'} {item.lastName || ''}
        </Paragraph>
        <Paragraph>
          <Text style={styles.label}>Patient ID:</Text> {item.patientId || 'Unknown'}
        </Paragraph>
        <Paragraph>
          <Text style={styles.label}>Quantity:</Text> {item.quantity || 0}
        </Paragraph>
        <Paragraph>
          <Text style={styles.label}>Type:</Text> {item.type || 'Unknown'}
        </Paragraph>
        <Paragraph>
          <Text style={styles.label}>Date:</Text> {formatDate(item.timestamp)}
        </Paragraph>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Department: {userDepartment || 'Loading...'}
      </Text>

      {/* Search Bar and Date Controls */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search by item, patient name, or ID..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <TouchableOpacity onPress={() => setDatePickerVisible(true)}>
          <FontAwesome5 
            name="calendar-alt" 
            size={24} 
            color="#00796b" 
            style={styles.calendarIcon} 
          />
        </TouchableOpacity>
        {selectedDate && (
          <TouchableOpacity onPress={clearDateFilter}>
            <FontAwesome5 
              name="times-circle" 
              size={24} 
              color="#d32f2f" 
              style={styles.clearIcon} 
            />
          </TouchableOpacity>
        )}
      </View>

      {selectedDate && (
        <Text style={styles.dateFilterText}>
          Showing results for: {selectedDate.toDateString()}
        </Text>
      )}

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateFilter}
        onCancel={() => setDatePickerVisible(false)}
        maximumDate={new Date()} // Prevent selecting future dates
      />

      {/* Usage History List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00796b" />
          <Text style={styles.loadingText}>Loading usage history...</Text>
        </View>
      ) : filteredHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome5 name="inbox" size={50} color="#ccc" />
          <Text style={styles.emptyText}>
            {searchQuery || selectedDate ? 'No matching records found' : 'No usage history available'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredHistory}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
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
  clearIcon: {
    marginLeft: 10,
  },
  dateFilterText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
