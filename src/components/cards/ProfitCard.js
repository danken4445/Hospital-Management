import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ProfitCard = ({ profit, label, icon }) => {
  return (
    <Card style={styles.card} elevation={4}>
      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <Icon name={icon} size={28} color="#ffffff" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.profitValue}>${profit.toFixed(2)}</Text>
          <Text style={styles.profitLabel}>{label}</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: '#3498db',
    borderRadius: 28,
    padding: 12,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  profitValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  profitLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
});

export default ProfitCard;