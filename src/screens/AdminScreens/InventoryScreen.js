import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { getDatabase, ref, onValue } from 'firebase/database';
import { Card, Surface } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';

const OverallInventory = ({ route }) => {
  const [overallSupplies, setOverallSupplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSupplies, setFilteredSupplies] = useState([]);
  const navigation = useNavigation();

  // Get clinic context from navigation params
  const { clinic, userRole, permissions } = route?.params || {};
  const userClinic = clinic || null;

  useEffect(() => {
    // If no clinic context is available, don't load data
    if (!userClinic) {
      setLoading(false);
      return;
    }

    const db = getDatabase();
    // Reference clinic-specific departments
    const departmentsRef = ref(db, `${userClinic}/departments`);

    const unsubscribe = onValue(departmentsRef, (snapshot) => {
      if (snapshot.exists()) {
        const departmentsData = snapshot.val();
        const supplyTotals = {};

        for (const deptKey in departmentsData) {
          const department = departmentsData[deptKey];
          if (department.localSupplies) {
            for (const supplyKey in department.localSupplies) {
              const supply = department.localSupplies[supplyKey];

              if (supplyTotals[supply.itemName]) {
                supplyTotals[supply.itemName].totalQuantity += supply.quantity;
                supplyTotals[supply.itemName].departments.push({
                  departmentName: deptKey,
                  quantity: supply.quantity,
                  brand: supply.brand,
                });
              } else {
                supplyTotals[supply.itemName] = {
                  totalQuantity: supply.quantity,
                  brand: supply.brand,
                  departments: [
                    {
                      departmentName: deptKey,
                      quantity: supply.quantity,
                      brand: supply.brand,
                    },
                  ],
                };
              }
            }
          }
        }

        const supplyArray = Object.keys(supplyTotals).map((itemName) => ({
          itemName,
          totalQuantity: supplyTotals[itemName].totalQuantity,
          brandName: supplyTotals[itemName].brand,
          departments: supplyTotals[itemName].departments,
        }));

        setOverallSupplies(supplyArray);
        setFilteredSupplies(supplyArray);
      } else {
        setOverallSupplies([]);
        setFilteredSupplies([]);
      }

      setLoading(false);
    }, (error) => {
      console.error('Error fetching inventory data:', error);
      Alert.alert('Error', 'Failed to load inventory data.');
      setLoading(false);
    });

    // Cleanup function
    return () => unsubscribe();
  }, [userClinic]);

  const handleSearch = (query) => {
    setSearchQuery(query);

    if (query === '') {
      setFilteredSupplies(overallSupplies);
    } else {
      const filteredData = overallSupplies.filter((item) =>
        item.itemName.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSupplies(filteredData);
    }
  };

  const navigateToSupplyDetails = (supply) => {
    // Pass clinic context to SupplyDetails screen
    navigation.navigate('SupplyDetails', { 
      supply, 
      clinic: userClinic,
      userRole,
      permissions 
    });
  };

  return (
    <View style={styles.container}>
      {/* Header with Clinic Info */}
      <Surface style={styles.header}>
        <View style={styles.headerContent}>
          <FontAwesome5 name="boxes" size={24} color="#00796b" />
          <Text style={styles.title}>Overall Inventory</Text>
        </View>
        {userClinic && (
          <Text style={styles.clinicInfo}>Clinic: {userClinic}</Text>
        )}
      </Surface>

      {/* Clinic Warning */}
      {!userClinic && (
        <Surface style={styles.warningContainer}>
          <FontAwesome5 name="exclamation-triangle" size={20} color="#FF9800" />
          <Text style={styles.warningText}>
            No clinic context available. Please navigate from the dashboard.
          </Text>
        </Surface>
      )}

      {/* Search Bar */}
      {userClinic && (
        <TextInput
          style={styles.searchBar}
          placeholder="Search for supplies..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
      )}

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00796b" />
          <Text style={styles.loadingText}>Loading inventory...</Text>
        </View>
      ) : !userClinic ? (
        <Surface style={styles.emptyContainer}>
          <FontAwesome5 name="hospital" size={48} color="#9E9E9E" />
          <Text style={styles.emptyText}>
            Please access inventory from your clinic dashboard.
          </Text>
        </Surface>
      ) : filteredSupplies.length === 0 ? (
        <Surface style={styles.emptyContainer}>
          <FontAwesome5 name="box-open" size={48} color="#9E9E9E" />
          <Text style={styles.emptyText}>
            {searchQuery ? 'No supplies found matching your search.' : `No inventory available for ${userClinic}.`}
          </Text>
        </Surface>
      ) : (
        <FlatList
          data={filteredSupplies}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigateToSupplyDetails(item)}>
              <Card style={styles.card}>
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <FontAwesome5 name="box" size={20} color="#00796b" />
                    <Text style={styles.itemName}>{item.itemName}</Text>
                  </View>
                  <Text style={styles.itemDetails}>Total: {item.totalQuantity} units</Text>
                  <Text style={styles.brandDetails}>Brand: {item.brandName}</Text>
                  <Text style={styles.departmentCount}>
                    Available in {item.departments.length} department{item.departments.length !== 1 ? 's' : ''}
                  </Text>
                </View>
              </Card>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.itemName}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  header: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#ffffff',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#00796b',
  },
  clinicInfo: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
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
  searchBar: {
    height: 48,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#ffffff',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    elevation: 1,
    margin: 16,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9E9E9E',
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#ffffff',
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#00796b',
    marginLeft: 8,
    flex: 1,
  },
  itemDetails: {
    fontSize: 16,
    color: '#424242',
    marginBottom: 4,
  },
  brandDetails: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  departmentCount: {
    fontSize: 12,
    color: '#9E9E9E',
    fontStyle: 'italic',
  },
});


export default OverallInventory;
