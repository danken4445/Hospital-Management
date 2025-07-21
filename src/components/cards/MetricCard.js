import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';

const MetricCard = ({ title, value, subtitle, icon }) => {
  return (
    <Card style={styles.card} elevation={4}>
      <View style={styles.cardContent}>
        <Text style={styles.icon}>{icon}</Text>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  icon: {
    fontSize: 32,
    marginRight: 16,
    color: '#34495e',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  value: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1abc9c',
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
  },
});

export default MetricCard;