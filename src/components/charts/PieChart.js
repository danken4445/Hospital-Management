import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const PieChart = ({ 
  data, 
  width = 220, 
  height = 220, 
  title = 'pie-chart', 
}) => {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { width, height }]}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No data available</Text>
        </View>
      </View>
    );
  }

  const total = data.reduce((sum, item) => sum + (item.count || item.value || 0), 0);

  return (
    <View style={[styles.container, { width, height }]}>
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.chartContainer}>
        {/* Simple list view for now - we can enhance this later */}
        <ScrollView>
          {data.map((item, index) => {
            const value = item.count || item.value || 0;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            
            return (
              <View key={index} style={styles.pieItem}>
                <View 
                  style={[
                    styles.colorIndicator, 
                    { backgroundColor: item.color || '#4ECDC4' }
                  ]} 
                />
                <Text style={styles.itemLabel}>
                  {item.label || item.name || `Item ${index + 1}`}
                </Text>
                <Text style={styles.itemValue}>
                  {value} ({percentage}%)
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  chartContainer: {
    paddingHorizontal: 10,
  },
  pieItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  itemLabel: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  itemValue: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
});

export default PieChart;