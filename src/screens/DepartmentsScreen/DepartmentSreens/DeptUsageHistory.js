import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import { getDatabase, ref, onValue, get } from 'firebase/database';
import { FontAwesome5 } from '@expo/vector-icons';
import { auth } from '../../../../firebaseConfig';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const DeptUsageHistory = ({ route, navigation }) => {
  const { clinic, department, userRole, permissions } = route.params || {};
  const userClinic = clinic || null;

  // Check if clinic context is available
  if (!userClinic) {
    Alert.alert('Error', 'No clinic context available. Please navigate from the department dashboard.');
    navigation.goBack();
    return null;
  }

  const [usageHistory, setUsageHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [userDepartment, setUserDepartment] = useState(department || null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const fetchUserDepartment = async () => {
      try {
        const user = auth.currentUser;
        if (user && !userDepartment) {
          const db = getDatabase();
          // Try clinic-specific user data first
          const userRef = ref(db, `${userClinic}/users/${user.uid}`);
          const snapshot = await get(userRef);
          
          if (snapshot.exists()) {
            const userData = snapshot.val();
            console.log('Clinic user data:', userData);
            setUserDepartment(userData.department || userData.role);
            return userData.department || userData.role;
          } else {
            // Fallback to global users
            const globalUserRef = ref(db, `users/${user.uid}`);
            const globalSnapshot = await get(globalUserRef);
            if (globalSnapshot.exists()) {
              const userData = globalSnapshot.val();
              console.log('Global user data:', userData);
              setUserDepartment(userData.department);
              return userData.department;
            }
          }
        }
        return userDepartment || department;
      } catch (error) {
        console.error('Error fetching user department:', error);
        setLoading(false);
        return userDepartment || department;
      }
    };

    const fetchUsageHistory = async () => {
      try {
        const deptName = await fetchUserDepartment();
        
        if (deptName && userClinic) {
          const db = getDatabase();
          // Use clinic-specific path for usage history
          const historyRef = ref(db, `${userClinic}/departments/${deptName}/usageHistory`);
          
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
          console.log('No user department or clinic found');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in fetchUsageHistory:', error);
        setLoading(false);
      }
    };

    fetchUsageHistory();
  }, [userClinic, department, userDepartment]);

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
      {/* Clinic Header */}
      <View style={styles.clinicHeader}>
        <View style={styles.clinicInfo}>
          <FontAwesome5 name="hospital" size={16} color="#00796b" style={styles.clinicIcon} />
          <Text style={styles.clinicName}>{userClinic || 'No Clinic'}</Text>
        </View>
        <Text style={styles.departmentText}>{userDepartment || 'Loading...'} Department</Text>
      </View>

      <Text style={styles.header}>
        Usage History
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
            {searchQuery || selectedDate ? 'No matching records found' : `No usage history available for ${userClinic}`}
          </Text>
          {!searchQuery && !selectedDate && (
            <Text style={styles.emptySubText}>
              Items used in {userDepartment} department will appear here
            </Text>
          )}
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
  clinicHeader: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: -20,
    marginTop: -20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clinicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clinicIcon: {
    marginRight: 8,
  },
  clinicName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  departmentText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
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
  emptySubText: {
    marginTop: 5,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
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
