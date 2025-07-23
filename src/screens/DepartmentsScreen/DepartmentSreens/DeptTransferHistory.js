import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import { getDatabase, ref, onValue, get } from 'firebase/database';
import { auth } from '../../../../firebaseConfig'; // Adjust the path accordingly
import { FontAwesome5 } from '@expo/vector-icons';

const TransferHistory = ({ route, navigation }) => {
  const { clinic, department, userRole, permissions } = route.params || {};
  const userClinic = clinic || null;

  // Check if clinic context is available
  if (!userClinic) {
    Alert.alert('Error', 'No clinic context available. Please navigate from the department dashboard.');
    navigation.goBack();
    return null;
  }

  const [transferHistory, setTransferHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [userDepartment, setUserDepartment] = useState(department || null);

  useEffect(() => {
    const db = getDatabase();

    const fetchUserDepartment = async () => {
      const user = auth.currentUser;
      if (user && !userDepartment) {
        try {
          // Try clinic-specific user data first
          const userRef = ref(db, `${userClinic}/users/${user.uid}`);
          const snapshot = await get(userRef);
          
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setUserDepartment(userData.department || userData.role);
            return userData.department || userData.role;
          } else {
            // Fallback to global users
            const globalUserRef = ref(db, `users/${user.uid}`);
            const globalSnapshot = await get(globalUserRef);
            if (globalSnapshot.exists()) {
              const userData = globalSnapshot.val();
              setUserDepartment(userData.department);
              return userData.department;
            }
          }
        } catch (error) {
          console.error('Error fetching user department:', error);
        }
      }
      return userDepartment || department;
    };

    const fetchTransferHistory = async () => {
      const deptName = await fetchUserDepartment(); // Ensure user's department is fetched first
      
      if (deptName && userClinic) {
        // Use clinic-specific paths for transfer history
        const medicineRef = ref(db, `${userClinic}/medicineTransferHistory`);
        const supplyRef = ref(db, `${userClinic}/supplyHistoryTransfer`);

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
              (item) => item.recipientDepartment === deptName
            );
            
            // Sort by timestamp (newest first)
            departmentFiltered.sort((a, b) => {
              const timeA = new Date(a.timestamp || 0);
              const timeB = new Date(b.timestamp || 0);
              return timeB - timeA;
            });
            
            setTransferHistory(departmentFiltered);
            setFilteredHistory(departmentFiltered);
            setLoading(false);
          });
        });
      } else {
        console.log('No user department or clinic found');
        setLoading(false);
      }
    };

    fetchTransferHistory();
  }, [userDepartment, userClinic, department]);

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
          <Text style={styles.label}>Quantity:</Text> {item.quantity || 'N/A'}
        </Paragraph>
        <Paragraph>
          <Text style={styles.label}>Sender:</Text> {item.sender || 'Unknown'}
        </Paragraph>
        <Paragraph>
          <Text style={styles.label}>Recipient Department:</Text> {item.recipientDepartment || 'Unknown'}
        </Paragraph>
        <Paragraph>
          <Text style={styles.label}>Timestamp:</Text> {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'N/A'}
        </Paragraph>
        <Paragraph>
          <Text style={styles.label}>Type:</Text> {item.type}
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

      <Text style={styles.header}>Transfer History</Text>

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search by item, sender, or department..."
        value={searchQuery}
        onChangeText={handleSearch}
      />

      {/* Transfer History List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00796b" />
          <Text style={styles.loadingText}>Loading transfer history...</Text>
        </View>
      ) : filteredHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome5 name="truck" size={50} color="#ccc" />
          <Text style={styles.emptyText}>
            {searchQuery ? 'No matching transfers found' : `No transfer history available for ${userClinic}`}
          </Text>
          {!searchQuery && (
            <Text style={styles.emptySubText}>
              Transfers to {userDepartment} department will appear here
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
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
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

export default TransferHistory;
