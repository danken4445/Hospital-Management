import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Title, TextInput, Divider, Surface } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const PersonalInformationCard = ({ 
  data, 
  onUpdate, 
  showDatePicker, 
  setShowDatePicker, 
  handleDateChange, 
  offline 
}) => {
  const [editMode, setEditMode] = useState(false);
  const [tempData, setTempData] = useState(data || {});

  // Ensure data has default values
  const patientData = {
    firstName: data?.firstName || '',
    lastName: data?.lastName || '',
    age: data?.age || '',
    gender: data?.gender || '',
    contact: data?.contact || '',
    birth: data?.birth || '',
    diagnosis: data?.diagnosis || '',
    dateTime: data?.dateTime || '',
    status: data?.status || '',
    roomType: data?.roomType || '',
    qrData: data?.qrData || '',
    ...data
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'Not specified';
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateTimeString;
    }
  };

  const formatBirthDate = (birthString) => {
    if (!birthString) return 'Not specified';
    try {
      const date = new Date(birthString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return birthString;
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'ER': { bg: '#ffebee', text: '#d32f2f', border: '#f44336' },
      'ICU': { bg: '#fff3e0', text: '#f57c00', border: '#ff9800' },
      'Ward': { bg: '#e8f5e8', text: '#388e3c', border: '#4caf50' },
      'OPD': { bg: '#e3f2fd', text: '#1976d2', border: '#2196f3' },
      'Surgery': { bg: '#f3e5f5', text: '#7b1fa2', border: '#9c27b0' },
    };
    return statusColors[status] || { bg: '#f5f5f5', text: '#666', border: '#ccc' };
  };

  const statusColor = getStatusColor(patientData.status || patientData.roomType);

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(tempData);
    }
    setEditMode(false);
  };

  const handleCancel = () => {
    setTempData(patientData);
    setEditMode(false);
  };

  return (
    <Card style={styles.mainCard} elevation={4}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarContainer}>
              <Icon 
                name={patientData.gender === 'Female' ? 'account-circle-outline' : 'account-circle'} 
                size={50} 
                color="#ffffff" 
              />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.patientName}>
                {`${patientData.firstName} ${patientData.lastName}`.trim() || 'Unknown Patient'}
              </Text>
              <Text style={styles.patientId}>
                ID: {patientData.qrData || 'N/A'}
              </Text>
            </View>
          </View>
          
          <View style={styles.headerRight}>
            <Surface style={[styles.statusChip, { backgroundColor: statusColor.bg }]} elevation={2}>
              <Text style={[styles.statusText, { color: statusColor.text }]}>
                {patientData.status || patientData.roomType || 'Unknown'}
              </Text>
            </Surface>
            {offline && (
              <Surface style={styles.offlineChip} elevation={2}>
                <View style={styles.offlineChipContent}>
                  <Icon name="cloud-off-outline" size={16} color="#ff9800" />
                  <Text style={styles.offlineChipText}>Offline</Text>
                </View>
              </Surface>
            )}
          </View>
        </View>
      </View>

      <Card.Content style={styles.cardContent}>
        {/* Action Buttons */}
        <View style={styles.actionBar}>
          {!editMode ? (
            <TouchableOpacity 
              style={[styles.actionButton, styles.editButton]}
              onPress={() => setEditMode(true)}
              disabled={offline}
            >
              <Icon name="pencil-outline" size={18} color="#667eea" />
              <Text style={[styles.actionButtonText, { color: '#667eea' }]}>Edit Info</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.editActions}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Icon name="close" size={18} color="#f44336" />
                <Text style={[styles.actionButtonText, { color: '#f44336' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.saveButton]}
                onPress={handleSave}
              >
                <Icon name="check" size={18} color="#4caf50" />
                <Text style={[styles.actionButtonText, { color: '#4caf50' }]}>Save</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Divider style={styles.divider} />

        {/* Information Grid */}
        <View style={styles.infoGrid}>
          {/* Basic Information Section */}
          <View style={styles.sectionHeaderContainer}>
            <Icon name="account-details" size={20} color="#667eea" />
            <Text style={styles.sectionHeader}>Basic Information</Text>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Age</Text>
              {editMode ? (
                <TextInput
                  value={tempData.age?.toString() || ''}
                  onChangeText={(text) => setTempData({...tempData, age: text})}
                  style={styles.editInput}
                  keyboardType="numeric"
                  dense
                  mode="outlined"
                  theme={{ colors: { primary: '#667eea' } }}
                />
              ) : (
                <Text style={styles.infoValue}>{patientData.age || 'Not specified'}</Text>
              )}
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Gender</Text>
              <Text style={styles.infoValue}>{patientData.gender || 'Not specified'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItemFull}>
              <Text style={styles.infoLabel}>Contact Number</Text>
              {editMode ? (
                <TextInput
                  value={tempData.contact || ''}
                  onChangeText={(text) => setTempData({...tempData, contact: text})}
                  style={styles.editInput}
                  keyboardType="phone-pad"
                  dense
                  mode="outlined"
                  theme={{ colors: { primary: '#667eea' } }}
                />
              ) : (
                <Text style={styles.infoValue}>{patientData.contact || 'Not specified'}</Text>
              )}
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItemFull}>
              <Text style={styles.infoLabel}>Date of Birth</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowDatePicker && setShowDatePicker(true)}
                disabled={offline || !editMode}
              >
                <Icon name="calendar" size={16} color="#667eea" />
                <Text style={[styles.infoValue, styles.dateText]}>
                  {formatBirthDate(patientData.birth)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Divider style={styles.sectionDivider} />

          {/* Medical Information Section */}
          <View style={styles.sectionHeaderContainer}>
            <Icon name="medical-bag" size={20} color="#667eea" />
            <Text style={styles.sectionHeader}>Medical Information</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItemFull}>
              <Text style={styles.infoLabel}>Admission Date & Time</Text>
              <View style={styles.admissionInfo}>
                <Icon name="clock-outline" size={16} color="#666" />
                <Text style={styles.infoValue}>{formatDateTime(patientData.dateTime)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItemFull}>
              <Text style={styles.infoLabel}>Diagnosis</Text>
              {editMode ? (
                <TextInput
                  value={tempData.diagnosis || ''}
                  onChangeText={(text) => setTempData({...tempData, diagnosis: text})}
                  multiline
                  numberOfLines={4}
                  style={styles.diagnosisInput}
                  mode="outlined"
                  placeholder="Enter diagnosis..."
                  theme={{ colors: { primary: '#667eea' } }}
                />
              ) : (
                <Surface style={styles.diagnosisContainer} elevation={1}>
                  <Text style={styles.diagnosisText}>
                    {patientData.diagnosis || 'No diagnosis recorded'}
                  </Text>
                </Surface>
              )}
            </View>
          </View>
        </View>

        {/* Footer Information */}
        {patientData.lastModified && (
          <View style={styles.footer}>
            <Divider style={styles.footerDivider} />
            <View style={styles.footerContent}>
              <Icon name="update" size={12} color="#999" />
              <Text style={styles.footerText}>
                Last updated: {new Date(patientData.lastModified).toLocaleString()}
              </Text>
            </View>
          </View>
        )}
      </Card.Content>

      {showDatePicker && (
        <DateTimePicker
          value={new Date(patientData.birth || Date.now())}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  mainCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e3f2fd',
  },
  headerSection: {
    backgroundColor: '#667eea',
    paddingBottom: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  patientId: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'monospace',
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  offlineChip: {
    borderRadius: 12,
    backgroundColor: '#fff3cd',
  },
  offlineChipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  offlineChipText: {
    fontSize: 11,
    color: '#856404',
    marginLeft: 4,
  },
  cardContent: {
    padding: 0,
  },
  actionBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fafafa',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  editButton: {
    borderColor: '#667eea',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  saveButton: {
    borderColor: '#4caf50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  cancelButton: {
    borderColor: '#f44336',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    backgroundColor: '#e0e0e0',
  },
  infoGrid: {
    padding: 20,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  infoItem: {
    flex: 1,
  },
  infoItemFull: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  dateText: {
    color: '#667eea',
  },
  admissionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  diagnosisContainer: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9ff',
    marginTop: 4,
  },
  diagnosisText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  diagnosisInput: {
    marginTop: 8,
    backgroundColor: '#ffffff',
  },
  editInput: {
    backgroundColor: '#ffffff',
    marginTop: 4,
  },
  sectionDivider: {
    backgroundColor: '#f0f0f0',
    marginVertical: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  footerDivider: {
    backgroundColor: '#f5f5f5',
    marginBottom: 12,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});

export default PersonalInformationCard;
