import React, { memo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Card, Title, Button, Paragraph } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PrescriptionsCard = memo(({ prescriptions = [], onAdd, onDelete, offline }) => {
  // Ensure prescriptions is an array with fallback
  const prescriptionList = Array.isArray(prescriptions) ? prescriptions : [];

  const renderPrescriptions = () => {
    if (prescriptionList.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Icon name="description" size={48} color="#ccc" />
          <Paragraph style={styles.emptyText}>No prescriptions added yet</Paragraph>
        </View>
      );
    }

    return prescriptionList.map((prescription) => (
      <Card key={prescription.key || `prescription-${Date.now()}-${Math.random()}`} style={styles.prescriptionCard}>
        <Card.Content>
          <View style={styles.prescriptionHeader}>
            <Title style={styles.prescriptionName}>
              {prescription.prescriptionName || prescription.name || 'Unnamed Prescription'}
            </Title>
            <Button
              mode="text"
              onPress={() => onDelete(prescription.key)}
              icon="delete"
              compact
              textColor="#dc3545"
              disabled={offline}
            >
              Delete
            </Button>
          </View>
          
          <View style={styles.prescriptionDetails}>
            {prescription.dosage && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Dosage:</Text>
                <Text style={styles.detailValue}>{prescription.dosage}</Text>
              </View>
            )}
            
            {(prescription.instruction || prescription.instructions) && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Instructions:</Text>
                <Text style={styles.detailValue}>
                  {prescription.instruction || prescription.instructions}
                </Text>
              </View>
            )}
            
            {prescription.createdAt && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Created:</Text>
                <Text style={styles.timestampValue}>
                  {new Date(prescription.createdAt).toLocaleString()}
                </Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>
    ));
  };

  return (
    <Card style={styles.sectionContainer}>
      <Card.Content>
        <View style={styles.headerContainer}>
          <View style={styles.titleContainer}>
            <Icon name="description" size={20} color="#333" />
            <Title style={styles.sectionTitle}>Prescriptions</Title>
          </View>
          {offline && (
            <View style={styles.offlineIndicator}>
              <Icon name="cloud-off" size={16} color="#FF9800" />
            </View>
          )}
        </View>

        <View style={styles.prescriptionsContainer}>
          {renderPrescriptions()}
        </View>

        <Button
          mode="contained"
          onPress={onAdd}
          style={[styles.addButton, offline && styles.offlineButton]}
          icon="plus"
          disabled={offline}
        >
          {offline ? 'Offline - Cannot Add' : 'Add Prescription'}
        </Button>

        {offline && (
          <View style={styles.offlineNotice}>
            <Icon name="info" size={16} color="#FF9800" />
            <Paragraph style={styles.offlineText}>
              Prescription management disabled while offline
            </Paragraph>
          </View>
        )}
      </Card.Content>
    </Card>
  );
});

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  offlineIndicator: {
    padding: 4,
    backgroundColor: '#fff3cd',
    borderRadius: 12,
  },
  prescriptionsContainer: {
    marginBottom: 16,
  },
  prescriptionCard: {
    marginBottom: 8,
    backgroundColor: '#e8f5e8',
    elevation: 1,
    borderLeftWidth: 3,
    borderLeftColor: '#28a745',
  },
  prescriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  prescriptionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  prescriptionDetails: {
    gap: 4,
  },
  detailRow: {
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    color: '#333',
  },
  timestampValue: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 16,
  },
  emptyText: {
    marginTop: 8,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  addButton: {
    backgroundColor: '#28a745',
  },
  offlineButton: {
    backgroundColor: '#6c757d',
  },
  offlineNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#fff3cd',
    borderRadius: 4,
  },
  offlineText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#856404',
  },
});

export default PrescriptionsCard;