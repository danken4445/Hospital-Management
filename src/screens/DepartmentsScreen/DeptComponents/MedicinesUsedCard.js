import React from 'react';
import { Card, Subheading, Searchbar, Button } from 'react-native-paper';

const MedicinesUsedCard = ({
  medUse,
  medSearchTerm,
  setMedSearchTerm,
  renderUsedItems,
  handleScan,
  styles,
}) => (
  <Card style={styles.sectionContainer}>
    <Card.Content>
      <Subheading style={styles.subheading}>Medicines Used</Subheading>
      <Searchbar
        placeholder="Search Medicines"
        value={medSearchTerm}
        onChangeText={setMedSearchTerm}
        style={styles.searchbar}
      />
      {renderUsedItems(medUse, medSearchTerm)}
      <Button
        buttonColor="#740938"
        rippleColor="#FF000020"
        mode="contained"
        icon="pill"
        onPress={() => handleScan('medicines')}
        style={styles.scanButton}
      >
        Scan Item for Medicines
      </Button>
    </Card.Content>
  </Card>
);

export default MedicinesUsedCard;
