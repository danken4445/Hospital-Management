import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const PatientInfoComponent = ({
  name,
  birth,
  contact,
  diagnosis,
  roomType,
  setName,
  setBirth,
  setContact,
  setDiagnosis,
  showDatePicker,
  setShowDatePicker,
  handleDateChange
}) => (
  <View style={styles.sectionContainer}>
    <Text style={styles.sectionHeader}>Personal Information</Text>
    <TextInput
      style={styles.input}
      label="Name"
      placeholder="Enter patient name"
      value={name}
      onChangeText={setName}
    />
    <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
      <Text style={styles.datePickerText}>{birth || 'Select Date of Birth'}</Text>
    </TouchableOpacity>
    {showDatePicker && (
      <DateTimePicker
        value={birth ? new Date(birth) : new Date()}
        mode="date"
        display="default"
        onChange={handleDateChange}
      />
    )}
    <TextInput
      style={styles.input}
      label="Contact"
      placeholder="Enter contact number"
      value={contact}
      onChangeText={setContact}
    />
    <TextInput
      style={styles.input}
      label="Diagnosis"
      placeholder="Enter diagnosis"
      value={diagnosis}
      onChangeText={setDiagnosis}
    />
    <View style={styles.textAreaContainer}>
      <Text style={styles.roomTypeText}>
        Accommodation: {roomType || 'No Room Type Specified'}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
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
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
  },
  textAreaContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#f0f0f0',
  },
  roomTypeText: {
    fontSize: 16,
    color: '#333',
  },
});

export default PatientInfoComponent;
