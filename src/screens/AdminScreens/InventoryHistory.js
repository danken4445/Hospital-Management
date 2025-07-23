import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { Card, Title, Paragraph, Surface, IconButton } from 'react-native-paper';
import { getDatabase, ref, onValue } from 'firebase/database';
import { FontAwesome5 } from '@expo/vector-icons';

const InventoryHistoryScreen = ({ route }) => {
  const [inventoryHistory, setInventoryHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Get clinic context from navigation params
  const { clinic, userRole, permissions } = route?.params || {};
  const userClinic = clinic || null;

  useEffect(() => {
    const db = getDatabase();
    
    // If no clinic context is available, don't load data
    if (!userClinic) {
      setLoading(false);
      return;
    }

    // Reference clinic-specific inventory history
    const historyRef = ref(db, `${userClinic}/inventoryHistory`);

    const fetchHistory = () => {
      onValue(historyRef, (snapshot) => {
        if (snapshot.exists()) {
          const historyData = snapshot.val();
          const historyArray = Object.keys(historyData).map((key) => ({
            id: key,
            ...historyData[key],
          }));
          
          // Sort by timestamp (most recent first)
          historyArray.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          
          setInventoryHistory(historyArray);
          setFilteredHistory(historyArray);
          setLoading(false);
        } else {
          setInventoryHistory([]);
          setFilteredHistory([]);
          setLoading(false);
        }
      }, (error) => {
        console.error('Error fetching inventory history:', error);
        setLoading(false);
      });
    };

    fetchHistory();

    // Clean up listeners when the component is unmounted
    return () => {
      // Firebase listeners are automatically cleaned up
    };
  }, [userClinic]);

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
      {/* Header with Clinic Info */}
      <Surface style={styles.header}>
        <View style={styles.headerContent}>
          <FontAwesome5 name="history" size={24} color="#2196F3" />
          <Text style={styles.headerTitle}>Inventory History</Text>
        </View>
        {userClinic && (
          <Text style={styles.clinicInfo}>Clinic: {userClinic}</Text>
        )}
      </Surface>

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search history by patient, item, or type..."
        value={searchQuery}
        onChangeText={handleSearch}
      />

      {/* Clinic Warning */}
      {!userClinic && (
        <Surface style={styles.warningContainer}>
          <FontAwesome5 name="exclamation-triangle" size={20} color="#FF9800" />
          <Text style={styles.warningText}>
            No clinic context available. Please navigate from the dashboard.
          </Text>
        </Surface>
      )}

      {/* Inventory History List */}
      {loading ? (
        <ActivityIndicator size="large" color="#2196F3" style={styles.loader} />
      ) : filteredHistory.length === 0 && userClinic ? (
        <Surface style={styles.emptyContainer}>
          <FontAwesome5 name="clipboard-list" size={48} color="#9E9E9E" />
          <Text style={styles.emptyText}>
            {searchQuery ? 'No history found matching your search.' : 'No inventory history available.'}
          </Text>
        </Surface>
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
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  header: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#FFFFFF',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#2196F3',
  },
  clinicInfo: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  searchBar: {
    height: 48,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#FFF3E0',
    elevation: 1,
  },
  warningText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#F57C00',
    flex: 1,
  },
  loader: {
    marginTop: 50,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 1,
    margin: 16,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9E9E9E',
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#FFFFFF',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    marginLeft: 12,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  label: {
    fontWeight: 'bold',
    color: '#666',
  },
});

export default InventoryHistoryScreen;
