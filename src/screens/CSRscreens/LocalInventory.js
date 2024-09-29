import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { getDatabase, ref, onValue } from 'firebase/database';
import { FontAwesome5 } from '@expo/vector-icons';

const CSRInventoryScreen = () => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const db = getDatabase();
    const csrInventoryRef = ref(db, 'departments/CSR/inventory');

    const fetchData = () => {
      onValue(csrInventoryRef, (snapshot) => {
        if (snapshot.exists()) {
          const csrData = snapshot.val();
          const inventoryArray = Object.keys(csrData).map((key) => ({
            id: key,
            name: csrData[key].name,
            quantity: csrData[key].quantity,
            type: 'Supply',
          }));
          setInventory(inventoryArray);
          setFilteredInventory(inventoryArray);
          setLoading(false);
        }
      });
    };

    fetchData();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredInventory(inventory);
    } else {
      const filtered = inventory.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase()),
      );
      setFilteredInventory(filtered);
    }
  };

  const openModal = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const renderInventoryItem = ({ item }) => (
    <TouchableOpacity onPress={() => openModal(item)}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <FontAwesome5 name="box" size={24} color="#4CAF50" />
            <Title style={styles.cardTitle}>{item.name}</Title>
          </View>
          <Paragraph>Quantity: {item.quantity}</Paragraph>
          <Paragraph>Type: {item.type}</Paragraph>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search CSR inventory..."
        value={searchQuery}
        onChangeText={handleSearch}
      />

      {/* Inventory List */}
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={filteredInventory}
          renderItem={renderInventoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* Modal for Item Details */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedItem && (
              <>
                <Title style={styles.modalTitle}>{selectedItem.name}</Title>
                <Paragraph style={styles.modalParagraph}>Quantity: {selectedItem.quantity}</Paragraph>
                <Paragraph style={styles.modalParagraph}>Type: {selectedItem.type}</Paragraph>
                <Button
                  onPress={() => setModalVisible(false)}
                  mode="contained"
                  style={styles.modalButton}
                  color="#4CAF50"
                >
                  Close
                </Button>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Darker overlay
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 5, // Add shadow
  },
  modalTitle: {
    marginBottom: 15,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333', // Darker text for title
  },
  modalParagraph: {
    fontSize: 16,
    color: '#555', // Softer text color
    marginBottom: 10,
  },
  modalButton: {
    marginTop: 15,
    width: '100%',
    borderRadius: 8, // Rounded button
  },
});

export default CSRInventoryScreen;
