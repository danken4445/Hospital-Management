import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Card, Title, Paragraph, Searchbar } from 'react-native-paper';
import { getDatabase, ref, onValue } from 'firebase/database';
import { format } from 'date-fns';


const TransferHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredHistory, setFilteredHistory] = useState([]);

  useEffect(() => {
    const db = getDatabase();
    const transferHistoryRef = ref(db, 'supplyHistoryTransfer');

    const fetchTransferHistory = () => {
      onValue(transferHistoryRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const historyArray = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          setHistory(historyArray);
          setFilteredHistory(historyArray);
        }
        setLoading(false);
      });
    };

    fetchTransferHistory();
  }, []);

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

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title style={styles.cardTitle}>{item.itemName}</Title>
        <Paragraph>
          <Text style={styles.label}>Brand:</Text> {item.itemBrand}
        </Paragraph>
        <Paragraph>
          <Text style={styles.label}>Quantity:</Text> {item.quantity}
        </Paragraph>
        <Paragraph>
          <Text style={styles.label}>Sent by:</Text> {item.sender}
        </Paragraph>
        <Paragraph>
          <Text style={styles.label}>Recipient Department:</Text> {item.recipientDepartment}
        </Paragraph>
        <Paragraph>
        <Text style={styles.label}>Date:</Text> {(item.timestamp).toLocaleString()}
        </Paragraph>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search by item, brand, department or sender"
        value={searchQuery}
        onChangeText={handleSearch}
        style={styles.searchBar}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#7a0026" />
      ) : (
        <FlatList
          data={filteredHistory}
          renderItem={renderItem}
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
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  searchBar: {
    marginBottom: 15,
    borderRadius: 8,
  },
  listContainer: {
    paddingBottom: 10,
  },
  card: {
    marginBottom: 10,
    borderRadius: 12,
    elevation: 3,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    padding: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7a0026',
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
  },
});

export default TransferHistory;
