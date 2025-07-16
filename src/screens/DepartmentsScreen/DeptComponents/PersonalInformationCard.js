import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Card, TextInput, Text, Divider, IconButton } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';

const PersonalInformationCard = ({
  data,
  onUpdate,
  showDatePicker,
  setShowDatePicker,
  handleDateChange,
  styles,
}) => {
  // Debug: Log the data received
  console.log('PersonalInformationCard received data:', JSON.stringify(data, null, 2));
  
  return (
    <Card style={modernStyles.cardContainer}>
      <View style={modernStyles.headerContainer}>
        <View style={modernStyles.headerContent}>
          <IconButton icon="account-circle" size={24} iconColor="white" />
          <Text style={modernStyles.headerTitle}>Patient Information</Text>
        </View>
      </View>
      
      <Card.Content style={modernStyles.cardContent}>
        {/* Personal Details Section */}
        <View style={modernStyles.sectionContainer}>
          <Text style={modernStyles.sectionTitle}>Personal Details</Text>
          <View style={modernStyles.inputRow}>
            <View style={modernStyles.inputHalf}>
              <TextInput
                label="First Name"
                value={data.firstName || ''}
                onChangeText={(text) => onUpdate({ firstName: text })}
                mode="outlined"
                style={modernStyles.input}
                editable={false}
                outlineColor="#E0E0E0"
                activeOutlineColor="#4A90E2"
                contentStyle={modernStyles.inputContent}
              />
            </View>
            <View style={modernStyles.inputHalf}>
              <TextInput
                label="Last Name"
                value={data.lastName || ''}
                onChangeText={(text) => onUpdate({ lastName: text })}
                mode="outlined"
                style={modernStyles.input}
                editable={false}
                outlineColor="#E0E0E0"
                activeOutlineColor="#4A90E2"
                contentStyle={modernStyles.inputContent}
              />
            </View>
          </View>

          <View style={modernStyles.inputRow}>
            <View style={modernStyles.inputHalf}>
              <TouchableOpacity onPress={() => setShowDatePicker && setShowDatePicker(true)}>
                <TextInput
                  label="Date of Birth"
                  value={data.birth || ''}
                  mode="outlined"
                  style={modernStyles.input}
                  editable={false}
                  right={<TextInput.Icon icon="calendar" />}
                  outlineColor="#E0E0E0"
                  activeOutlineColor="#4A90E2"
                  contentStyle={modernStyles.inputContent}
                />
              </TouchableOpacity>
              {showDatePicker && handleDateChange && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={data.birth ? new Date(data.birth) : new Date()}
                  mode="date"
                  is24Hour={true}
                  display="default"
                  onChange={handleDateChange}
                />
              )}
            </View>
            <View style={modernStyles.inputHalf}>
              <TextInput
                label="Age"
                value={data.age || ''}
                onChangeText={(text) => onUpdate({ age: text })}
                mode="outlined"
                style={modernStyles.input}
                keyboardType="numeric"
                editable={false}
                outlineColor="#E0E0E0"
                activeOutlineColor="#4A90E2"
                contentStyle={modernStyles.inputContent}
              />
            </View>
          </View>
        </View>

        <Divider style={modernStyles.divider} />

        {/* Contact & Medical Section */}
        <View style={modernStyles.sectionContainer}>
          <Text style={modernStyles.sectionTitle}>Contact & Medical Information</Text>
          
          <TextInput
            label="Contact Number"
            value={data.contact || ''}
            onChangeText={(text) => onUpdate({ contact: text })}
            mode="outlined"
            style={modernStyles.input}
            keyboardType="phone-pad"
            editable={false}
            left={<TextInput.Icon icon="phone" />}
            outlineColor="#E0E0E0"
            activeOutlineColor="#4A90E2"
            contentStyle={modernStyles.inputContent}
          />

          <View style={modernStyles.inputRow}>
            <View style={modernStyles.inputHalf}>
              <TextInput
                label="Gender"
                value={data.gender || ''}
                onChangeText={(text) => onUpdate({ gender: text })}
                mode="outlined"
                style={modernStyles.input}
                editable={false}
                outlineColor="#E0E0E0"
                activeOutlineColor="#4A90E2"
                contentStyle={modernStyles.inputContent}
              />
            </View>
            <View style={modernStyles.inputHalf}>
              <TextInput
                label="Room Type"
                value={data.roomType || ''}
                onChangeText={(text) => onUpdate({ roomType: text })}
                mode="outlined"
                style={modernStyles.input}
                editable={false}
                outlineColor="#E0E0E0"
                activeOutlineColor="#4A90E2"
                contentStyle={modernStyles.inputContent}
              />
            </View>
          </View>

          <TextInput
            label="Status"
            value={data.status || ''}
            onChangeText={(text) => onUpdate({ status: text })}
            mode="outlined"
            style={modernStyles.input}
            left={<TextInput.Icon icon="medical-bag" />}
            outlineColor="#E0E0E0"
            activeOutlineColor="#4A90E2"
            contentStyle={modernStyles.inputContent}
          />

          <TextInput
            label="Diagnosis"
            value={data.diagnosis || ''}
            onChangeText={(text) => onUpdate({ diagnosis: text })}
            mode="outlined"
            style={modernStyles.input}
            multiline
            numberOfLines={3}
            left={<TextInput.Icon icon="clipboard-text" />}
            outlineColor="#E0E0E0"
            activeOutlineColor="#4A90E2"
            contentStyle={modernStyles.inputContent}
          />
        </View>

        <Divider style={modernStyles.divider} />

        {/* Patient ID Section */}
        <View style={modernStyles.sectionContainer}>
          <Text style={modernStyles.sectionTitle}>Patient Identification</Text>
          
          <View style={modernStyles.patientIdContainer}>
            <TextInput
              label="Patient ID"
              value={data.qrData || ''}
              mode="outlined"
              style={modernStyles.patientIdInput}
              editable={false}
              left={<TextInput.Icon icon="qrcode" />}
              outlineColor="#E0E0E0"
              activeOutlineColor="#4A90E2"
              contentStyle={modernStyles.inputContent}
            />
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const modernStyles = StyleSheet.create({
  cardContainer: {
    marginBottom: 20,
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  headerContainer: {
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  cardContent: {
    padding: 20,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  inputHalf: {
    flex: 0.48,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
  },
  inputContent: {
    fontSize: 14,
    color: '#34495E',
  },
  divider: {
    marginVertical: 20,
    backgroundColor: '#E8F4FD',
    height: 1,
  },
  patientIdContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  patientIdInput: {
    backgroundColor: '#FFFFFF',
    marginBottom: 0,
  },
});

export default PersonalInformationCard;
