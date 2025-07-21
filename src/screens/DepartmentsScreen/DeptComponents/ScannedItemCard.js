import React from 'react';
import { Card, Title, Button, Paragraph } from 'react-native-paper';
import { View, StyleSheet, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ScannedItemsCard = ({ items, onRemove, offline }) => {
  // Ensure items is an array with fallback
  const scannedItems = Array.isArray(items) ? items : [];

  if (scannedItems.length === 0) {
    return null; // Don't render if no items
  }

  return (
    <Card style={styles.sectionContainer}>
      <Card.Content>
        <View style={styles.headerContainer}>
          <Title style={styles.sectionTitle}>
            <Icon name="preview" size={20} /> Pending Items ({scannedItems.length})
          </Title>
          {offline && (
            <View style={styles.offlineIndicator}>
              <Icon name="cloud-off" size={16} color="#FF9800" />
            </View>
          )}
        </View>

        <Paragraph style={styles.helperText}>
          These items will be added to inventory when you save changes.
        </Paragraph>

        <View style={styles.itemsContainer}>
          {scannedItems.map((item, index) => (
            <Card key={`scanned-${item.id || index}`} style={styles.scannedItemCard}>
              <Card.Content>
                <View style={styles.itemHeader}>
                  <View style={styles.itemInfo}>
                    <Title style={styles.itemName}>{item.name || 'Unknown Item'}</Title>
                    <Paragraph style={styles.itemType}>
                      Type: {item.type === 'supplies' ? 'Supply' : 'Medicine'}
                    </Paragraph>
                  </View>
                  <Button
                    mode="text"
                    onPress={() => onRemove(item.id)}
                    icon="close"
                    compact
                    textColor="#dc3545"
                  >
                    Remove
                  </Button>
                </View>
                
                <View style={styles.itemDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Quantity to use:</Text>
                    <Text style={styles.quantityValue}>{item.quantity || 0}</Text>
                  </View>
                  
                  {item.standardDesc && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Description:</Text>
                      <Text style={styles.detailValue}>{item.standardDesc}</Text>
                    </View>
                  )}
                  
                  {item.shortDesc && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Specs:</Text>
                      <Text style={styles.detailValue}>{item.shortDesc}</Text>
                    </View>
                  )}
                  
                  {item.retailPrice && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Price:</Text>
                      <Text style={styles.priceValue}>₱{item.retailPrice.toFixed(2)}</Text>
                    </View>
                  )}
                  
                  {item.offline && (
                    <View style={styles.offlineTag}>
                      <Icon name="cloud-off" size={12} color="#FF9800" />
                      <Text style={styles.offlineTagText}>Added offline</Text>
                    </View>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>

        <Paragraph style={styles.warningText}>
          <Icon name="warning" size={16} color="#ffc107" /> 
          Don't forget to press "Save Changes" to update the inventory!
        </Paragraph>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  offlineIndicator: {
    padding: 4,
    backgroundColor: '#fff3cd',
    borderRadius: 12,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  itemsContainer: {
    marginBottom: 12,
  },
  scannedItemCard: {
    marginBottom: 8,
    backgroundColor: '#fff8e1',
    elevation: 1,
    borderLeftWidth: 3,
    borderLeftColor: '#ffc107',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  itemType: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
  },
  itemDetails: {
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 13,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  quantityValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffc107',
    flex: 1,
    textAlign: 'right',
  },
  priceValue: {
    fontSize: 13,
    color: '#007bff',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  offlineTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  offlineTagText: {
    marginLeft: 4,
    fontSize: 11,
    color: '#856404',
  },
  warningText: {
    fontSize: 12,
    color: '#856404',
    backgroundColor: '#fff3cd',
    padding: 8,
    borderRadius: 4,
    textAlign: 'center',
  },
});

export default ScannedItemsCard;
