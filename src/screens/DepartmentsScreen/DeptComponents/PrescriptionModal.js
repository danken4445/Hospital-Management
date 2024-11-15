import React from 'react';
import { Card, TextInput, Button, Modal as PaperModal } from 'react-native-paper';

const PrescriptionModal = ({
  prescriptionModalVisible,
  setPrescriptionModalVisible,
  prescriptionName,
  setPrescriptionName,
  dosage,
  setDosage,
  instruction,
  setInstruction,
  handleAddPrescription,
  styles,
}) => (
  <PaperModal
    visible={prescriptionModalVisible}
    onDismiss={() => setPrescriptionModalVisible(false)}
  >
    <Card style={styles.modalContent}>
      <Card.Title title="Add Prescription" />
      <Card.Content>
        <TextInput
          label="Prescription Name"
          value={prescriptionName}
          onChangeText={setPrescriptionName}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Dosage"
          value={dosage}
          onChangeText={setDosage}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Instruction"
          value={instruction}
          onChangeText={setInstruction}
          mode="outlined"
          style={styles.input}
          multiline
        />
      </Card.Content>
      <Card.Actions style={styles.modalActions}>
        <Button onPress={() => setPrescriptionModalVisible(false)}>Cancel</Button>
        <Button onPress={handleAddPrescription}>Add</Button>
      </Card.Actions>
    </Card>
  </PaperModal>
);

export default PrescriptionModal;
