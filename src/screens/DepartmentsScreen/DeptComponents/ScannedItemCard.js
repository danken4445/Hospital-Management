import React from 'react';
import { View, FlatList } from 'react-native';
import { Card, Text, Button, Divider } from 'react-native-paper';

const ScannedItemsCard = ({ items, onRemove, styles }) => {
  if (!items || items.length === 0) return null;

  const renderItem = ({ item, index }) => (
    <View>
      <View style={styles.scannedItemRow}>
        <View style={styles.scannedItemInfo}>
          <Text style={styles.scannedItemName}>{item.itemName || item.name}</Text>
          <Text style={styles.scannedItemDetails}>
            Quantity: {item.quantity} | Type: {item.type}
          </Text>
        </View>
        <Button
          mode="outlined"
          onPress={() => onRemove(item.id)}
          compact
          icon="delete"
          buttonColor="#ff4444"
        >
          Remove
        </Button>
      </View>
      {index < items.length - 1 && <Divider />}
    </View>
  );

  return (
    <Card style={styles.sectionContainer}>
      <Card.Title title="Scanned Items" />
      <Card.Content>
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.id || index.toString()}
          scrollEnabled={false}
        />
      </Card.Content>
    </Card>
  );
};

export default ScannedItemsCard;
