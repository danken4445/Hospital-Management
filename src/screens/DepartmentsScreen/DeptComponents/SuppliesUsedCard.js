import React from 'react';
import { Card, Subheading, Searchbar, Button } from 'react-native-paper';

const SuppliesUsedCard = ({
  suppliesUsed,
  suppliesSearchTerm,
  setSuppliesSearchTerm,
  renderUsedItems,
  handleScan,
  styles,
}) => (
  <Card style={styles.sectionContainer}>
    <Card.Content>
      <Subheading style={styles.subheading}>Supplies Used</Subheading>
      <Searchbar
        placeholder="Search Supplies"
        value={suppliesSearchTerm}
        onChangeText={setSuppliesSearchTerm}
        style={styles.searchbar}
      />
      {renderUsedItems(suppliesUsed, suppliesSearchTerm)}
      <Button
        buttonColor="#740938"
        rippleColor="#FF000020"
        mode="contained"
        icon="broom"
        onPress={() => handleScan('supplies')}
        style={styles.scanButton}
      >
        Scan Item for Supplies
      </Button>
    </Card.Content>
  </Card>
);

export default SuppliesUsedCard;
