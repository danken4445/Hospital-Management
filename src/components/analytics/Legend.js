import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Legend = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <View style={styles.legend}>
      <Text style={styles.legendTitle}>Legend</Text>
      <View style={styles.legendItems}>
        {data.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View 
              style={[styles.legendColor, { backgroundColor: item.color }]} 
            />
            <Text style={styles.legendText}>
              {item.label} ({item.count})
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  legend: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#333',
  },
});

export default Legend;