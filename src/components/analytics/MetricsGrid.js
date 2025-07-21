import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MetricsGrid = ({ metrics }) => {
  const metricItems = [
    { key: 'totalPatients', label: 'Total Patients' },
    { key: 'avgPatientsPerDay', label: 'Avg/Day' },
    { key: 'peakHour', label: 'Peak Hour' },
    { key: 'peakDay', label: 'Busiest Day' },
  ];

  return (
    <View style={styles.metricsGrid}>
      {metricItems.map((item) => (
        <View key={item.key} style={styles.metricItem}>
          <Text style={styles.metricValue}>
            {metrics?.[item.key] || 'N/A'}
          </Text>
          <Text style={styles.metricLabel}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingTop: 10,
  },
  metricItem: {
    alignItems: 'center',
    minWidth: '22%',
    marginBottom: 15,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default MetricsGrid;