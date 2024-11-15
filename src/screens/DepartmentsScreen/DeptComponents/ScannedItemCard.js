import React from 'react';
import { Card } from 'react-native-paper';

const ScannedItemsCard = ({ scannedItems, renderScannedItems, styles }) => (
  <Card style={styles.sectionContainer}>
    <Card.Title title="Scanned Items" />
    <Card.Content>{renderScannedItems()}</Card.Content>
  </Card>
);

export default ScannedItemsCard;
