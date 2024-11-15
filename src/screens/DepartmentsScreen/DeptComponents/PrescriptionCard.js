import React from 'react';
import { Card, Button } from 'react-native-paper';

const PrescriptionsCard = ({
  renderPrescriptions,
  setPrescriptionModalVisible,
  styles,
}) => (
  <Card style={styles.sectionContainer}>
    <Card.Title title="Prescriptions" />
    <Card.Content>
      {renderPrescriptions()}
      <Button
        buttonColor="#2A3990"
        mode="contained"
        icon="plus"
        onPress={() => setPrescriptionModalVisible(true)}
        style={styles.addButton}
      >
        Add Prescription
      </Button>
    </Card.Content>
  </Card>
);

export default PrescriptionsCard;
