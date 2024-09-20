import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import { getDatabase, ref, onValue } from 'firebase/database';
import { FontAwesome5 } from '@expo/vector-icons'; // Import icons for UI enhancement

const InventoryHistoryScreen = () => {
  const [inventoryHistory, setInventoryHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getDatabase();
    const historyRef = ref(db, 'inventoryHistory');

    const fetchHistory = () => {
      onValue(historyRef, (snapshot) => {
        if (snapshot.exists()) {
          const historyData = snapshot.val();
          const historyArray = Object.keys(historyData).map((key) => ({
            id: key,
            ...historyData[key],
          }));
          setInventoryHistory(historyArray);
          setFilteredHistory(historyArray);
          setLoading(false);
        } else {
          setInventoryHistory([]);
          setFilteredHistory([]);
          setLoading(false);
        }
      });
    };

    fetchHistory();

    // Clean up listeners when the component is unmounted
    return () => {
      // Turn off listeners if needed
    };
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
  
    if (query.trim() === '') {
      setFilteredHistory(inventoryHistory);
    } else {
      const filtered = inventoryHistory.filter((item) => {
        const patientName = item.patientName ? item.patientName.toLowerCase() : '';
        const itemName = item.itemName ? item.itemName.toLowerCase() : '';
        const type = item.type ? item.type.toLowerCase() : '';
  
        return (
          patientName.includes(query.toLowerCase()) ||
          itemName.includes(query.toLowerCase()) ||
          type.includes(query.toLowerCase())
        );
      });
  
      setFilteredHistory(filtered);
    }
  };
  
  const renderHistoryItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <FontAwesome5
            name={item.type === 'Supplies' ? 'box' : 'pills'}
            size={24}
            color={item.type === 'Supplies' ? '#4CAF50' : '#FF5722'}
          />
          <Title style={styles.cardTitle}>{item.patientName}</Title>
        </View>
        <Paragraph>
          <Text style={styles.label}>Item:</Text> {item.itemName}
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
      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search history by patient, item, or type..."
        value={searchQuery}
        onChangeText={handleSearch}
      />

      {/* Inventory History List */}
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
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

export default InventoryHistoryScreen;
