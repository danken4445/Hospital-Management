import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { Card } from 'react-native-paper';
import { getDatabase, ref, onValue } from 'firebase/database';
import { format } from 'date-fns';

const MedicinesTransferHistory = () => {
  const [transferHistory, setTransferHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getDatabase();
    const historyRef = ref(db, 'medicineTransferHistory');

    const fetchHistory = () => {
      setLoading(true);
      onValue(historyRef, (snapshot) => {
        if (snapshot.exists()) {
          const historyData = snapshot.val();
          const historyArray = Object.keys(historyData).map((key) => ({
            id: key,
            ...historyData[key],
          }));

          // Sort by timestamp (latest first)
          const sortedHistory = historyArray.sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
          );

          setTransferHistory(sortedHistory);
          setFilteredHistory(sortedHistory);
          setLoading(false);
        } else {
          setTransferHistory([]);
          setFilteredHistory([]);
          setLoading(false);
        }
      });
    };

    fetchHistory();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query === '') {
      setFilteredHistory(transferHistory);
    } else {
      const filteredData = transferHistory.filter(
        (item) =>
          item.itemName.toLowerCase().includes(query.toLowerCase()) ||
          item.recipientDepartment.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredHistory(filteredData);
    }
  };

  const formatDate = (timestamp) => {
    return format(new Date(timestamp), 'dd MMM yyyy, hh:mm a');
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.itemName}>{item.itemName}</Text>
          <Text style={styles.timestamp}>{(item.timestamp)}</Text>
        </View>
        <Text style={styles.label}>Brand: {item.itemBrand}</Text>
        <Text style={styles.label}>Quantity: {item.quantity}</Text>
        <Text style={styles.label}>Recipient: {item.recipientDepartment}</Text>
        <Text style={styles.label}>Sender: {item.sender}</Text>
        <Text style={styles.label}>Reason: {item.reason}</Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Medicines Transfer History</Text>

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

export default MedicinesTransferHistory;
