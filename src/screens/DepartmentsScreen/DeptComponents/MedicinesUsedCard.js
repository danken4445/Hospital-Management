import React, { memo } from 'react';
import { Card, Title, Button, Searchbar, Paragraph } from 'react-native-paper';
import { View } from 'react-native';

const MedicinesUsedCard = memo(({ data, onScan, styles }) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const renderUsedItems = () => {
    const filteredItems = data.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filteredItems.map((item, index) => (
      <Card key={index} style={styles.usedItemCard}>
        <Card.Content>
          <Title>{item.name}</Title>
          <Paragraph>Quantity Used: {item.quantity}</Paragraph>
          <Paragraph>
            Last Used: {new Date(item.timestamp).toLocaleString()}
          </Paragraph>
          {item.dosage && (
            <Paragraph>Dosage: {item.dosage}</Paragraph>
          )}
          {item.instructions && (
            <Paragraph>Instructions: {item.instructions}</Paragraph>
          )}
        </Card.Content>
      </Card>
    ));
  };

  return (
    <Card style={styles.sectionContainer}>
      <Card.Content>
        <Title>Medicines Used</Title>
        <Searchbar
          placeholder="Search medicines..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        <View>
          {data.length > 0 ? (
            renderUsedItems()
          ) : (
            <Paragraph>No medicines used yet</Paragraph>
          )}
        </View>
        <Button
          mode="contained"
          onPress={onScan}
          style={styles.scanButton}
        >
          Scan Medicine
        </Button>
      </Card.Content>
    </Card>
  );
});

export default MedicinesUsedCard;