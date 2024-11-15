import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Card, TextInput } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';

const PersonalInformationCard = ({
  name,
  setName,
  lastName,
  setLastName,
  birth,
  setBirth,
  contact,
  setContact,
  diagnosis,
  setDiagnosis,
  roomType,
  showDatePicker,
  setShowDatePicker,
  handleDateChange,
  styles,
}) => (
  <Card style={styles.sectionContainer}>
    <Card.Title title="Personal Information" />
    <Card.Content>
      <TextInput
        label="First Name"
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Last Name"
        value={lastName}
        onChangeText={setLastName}
        mode="outlined"
        style={styles.input}
      />
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <TextInput
          label="Date of Birth"
          value={birth}
          mode="outlined"
          style={styles.input}
          editable={false}
          right={<TextInput.Icon name="calendar" />}
        />
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
        label="Contact Number"
        value={contact}
        onChangeText={setContact}
        mode="outlined"
        style={styles.input}
        keyboardType="phone-pad"
      />
      <TextInput
        label="Diagnosis"
        value={diagnosis}
        onChangeText={setDiagnosis}
        mode="outlined"
        style={styles.input}
        multiline
      />
      <TextInput
        label="Accommodation"
        value={roomType}
        mode="outlined"
        style={styles.input}
        editable={false}
      />
    </Card.Content>
  </Card>
);

export default PersonalInformationCard;
