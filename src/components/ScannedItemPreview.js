import React from 'react';
import { View, Button, Text } from 'react-native';
import { Card, Paragraph, Title } from 'react-native-paper';
import styles from '../screens/AdminScreens/styles';

const ScannedItemPreview = ({ scannedItem, quantity, setQuantity, scanningFor, handleSaveScannedItem }) => {
  if (!scannedItem) return null;

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionHeader}>Scanned Item</Text>
      <Card style={styles.scannedItemCard}>
        <Card.Content>
          <Title style={styles.itemName}>{scannedItem.itemName}</Title>
          <Paragraph>Entered Quantity: {quantity ? quantity : 'Not Entered'}</Paragraph>
          <Paragraph>Type: {scanningFor === 'supplies' ? 'Supply' : 'Medicine'}</Paragraph>
        </Card.Content>
      </Card>
      <Button title="Save" color="#4CAF50" onPress={handleSaveScannedItem} />
    </View>
  );
};

export default ScannedItemPreview;
