import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const PersonalInfoForm = ({ name, birth, contact, diagnosis, setName, setBirth, setContact, setDiagnosis, showDatePicker, setShowDatePicker, handleDateChange }) => {
  return (
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
});

export default PersonalInfoForm;
