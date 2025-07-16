import React, { memo } from 'react';
import { Card, Title, Button, Searchbar, Paragraph } from 'react-native-paper';
import { View } from 'react-native';

const SuppliesUsedCard = memo(({ data, onScan, styles }) => {
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
          {item.standardDesc && (
            <Paragraph>Description: {item.standardDesc}</Paragraph>
          )}
        </Card.Content>
      </Card>
    ));
  };

  return (
    <Card style={styles.sectionContainer}>
      <Card.Content>
        <Title>Supplies Used</Title>
        <Searchbar
          placeholder="Search supplies..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        <View>
          {data.length > 0 ? (
            renderUsedItems()
          ) : (
            <Paragraph>No supplies used yet</Paragraph>
          )}
        </View>
        <Button
          mode="contained"
          onPress={() => onScan('supplies')}
          style={styles.scanButton}
        >
          Scan Supply
        </Button>
      </Card.Content>
    </Card>
  );
});

export default SuppliesUsedCard;