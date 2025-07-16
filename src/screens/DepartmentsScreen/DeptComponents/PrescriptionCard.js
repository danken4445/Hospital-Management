import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Button, Searchbar, Paragraph, IconButton } from 'react-native-paper';

const PrescriptionsCard = memo(({ prescriptions = [], onAdd, onDelete, styles = {} }) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const renderPrescriptions = () => {
    // Safety check for prescriptions
    if (!Array.isArray(prescriptions)) return null;
    
    const filteredPrescriptions = prescriptions.filter(prescription => {
      // Safety check for undefined name
      return prescription?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false;
    });

    return filteredPrescriptions.map((prescription) => (
      <Card key={prescription.key || Date.now()} style={[localStyles.prescriptionCard, styles.prescriptionCard]}>
        <Card.Content>
          <View style={localStyles.headerRow}>
            <Title>{prescription?.name || 'Unnamed Prescription'}</Title>
            {onDelete && (
              <IconButton
                icon="delete"
                size={20}
                onPress={() => onDelete(prescription.key)}
              />
            )}
          </View>
          {prescription?.dosage && (
            <Paragraph>Dosage: {prescription.dosage}</Paragraph>
          )}
          {prescription?.instructions && (
            <Paragraph>Instructions: {prescription.instructions}</Paragraph>
          )}
          <Paragraph>
            Prescribed: {
              prescription?.key 
                ? new Date(parseInt(prescription.key)).toLocaleString() 
                : 'Unknown date'
            }
          </Paragraph>
        </Card.Content>
      </Card>
    ));
  };

  return (
    <Card style={[localStyles.sectionContainer, styles.sectionContainer]}>
      <Card.Content>
        <Title>Prescriptions</Title>
        <Searchbar
          placeholder="Search prescriptions..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[localStyles.searchbar, styles.searchbar]}
        />
        <View>
          {Array.isArray(prescriptions) && prescriptions.length > 0 ? (
            renderPrescriptions()
          ) : (
            <Paragraph>No prescriptions added yet</Paragraph>
          )}
        </View>
        <Button
          mode="contained"
          onPress={onAdd}
          style={[localStyles.addButton, styles.addButton]}
          icon="plus"
        >
          Add Prescription
        </Button>
      </Card.Content>
    </Card>
  );
});

// Local styles as fallback if parent styles are not provided
const localStyles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 16,
  },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  prescriptionCard: {
    marginBottom: 12,
  },
  searchbar: {
    marginBottom: 12,
  },
  addButton: {
    marginTop: 16,
  },
});

export default PrescriptionsCard;