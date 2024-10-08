// src/components/PrescriptionsSection.js
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, ScrollView, Text } from 'react-native';
import { Card, Paragraph, Title } from 'react-native-paper';

const PrescriptionsSection = ({ prescriptions, renderPrescriptions, handleAddPrescription, handlePrescriptionSubmit, addPrescription, setAddPrescription, prescriptionName, setPrescriptionName, dosage, setDosage, instruction, setInstruction, errors, loading }) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionHeader}>Prescriptions</Text>
      {!addPrescription ? (
        <Button title="Add Prescription" color="#2196F3" onPress={handleAddPrescription} />
      ) : (
        <View style={styles.prescriptionForm}>
          <TextInput
            style={[styles.input, errors.prescriptionName ? styles.errorInput : null]}
            label="Prescription Name"
            placeholder="Enter prescription name"
            value={prescriptionName}
            onChangeText={setPrescriptionName}
          />
          {errors.prescriptionName && <Text style={styles.errorText}>{errors.prescriptionName}</Text>}

          <TextInput
            style={[styles.input, errors.dosage ? styles.errorInput : null]}
            label="Dosage"
            placeholder="Enter dosage"
            value={dosage}
            onChangeText={setDosage}
          />
          {errors.dosage && <Text style={styles.errorText}>{errors.dosage}</Text>}

          <TextInput
            style={[styles.input, errors.instruction ? styles.errorInput : null]}
            label="Instruction"
            placeholder="Enter instructions"
            value={instruction}
            onChangeText={setInstruction}
          />
          {errors.instruction && <Text style={styles.errorText}>{errors.instruction}</Text>}

          <Button title={loading ? 'Adding...' : 'Add Prescription'} onPress={handlePrescriptionSubmit} disabled={loading} />
          <Button title="Cancel" onPress={() => setAddPrescription(false)} />
        </View>
      )}
      <ScrollView>{renderPrescriptions()}</ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  errorInput: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    marginBottom: 5,
  },
  prescriptionForm: {
    marginVertical: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
});

export default PrescriptionsSection;
