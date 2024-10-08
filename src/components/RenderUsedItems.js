import React from 'react';
import { Card, Paragraph, Title } from 'react-native-paper';
import { View } from 'react-native';
import styles from '../screens/AdminScreens/styles';

const RenderUsedItems = ({ usedItems }) => {
  return (
    <View>
      {Object.entries(usedItems).map(([key, item]) => (
        <Card key={key} style={styles.usedItemCard}>
          <Card.Content>
            <Title style={styles.itemName}>{item.name}</Title>
            <Paragraph>Quantity: {item.quantity}</Paragraph>
            <Paragraph style={styles.timestampText}>Last Used: {item.lastUsed || 'N/A'}</Paragraph>
          </Card.Content>
        </Card>
      ))}
    </View>
  );
};

export default RenderUsedItems;
