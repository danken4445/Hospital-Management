import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Title, Button } from 'react-native-paper';
import { sharedStyles } from './sharedStyles';

const SuppliesUsedCard = ({ data, onScan, offline }) => {
  return (
    <Card style={styles.sectionContainer}>
      <Card.Content>
        <Title style={styles.sectionTitle}>Supplies Used</Title>
        {/* Your component content */}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  ...sharedStyles,
  // Component-specific styles
});

export default SuppliesUsedCard;import { StyleSheet } from 'react-native';

export const sharedStyles = StyleSheet.create({
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  cardContent: {
    padding: 16,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  value: {
    fontSize: 14,
    color: '#333',
  },
  emptyState: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    padding: 16,
  },
  offlineIndicator: {
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