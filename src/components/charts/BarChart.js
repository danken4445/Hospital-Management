import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const BarChart = ({ data, width, height, title }) => {
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

  const maxValue = Math.max(...data.map(item => item.count || item.value || 0));
  const chartHeight = height - 80; // Leave space for title and labels
  const barWidth = 40;
  const barSpacing = 8;

  return (
    <View style={[styles.container, { width, height }]}>
      <Text style={styles.title}>{title}</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chartContainer}>
          <View style={[styles.barsContainer, { height: chartHeight }]}>
            {data.map((item, index) => {
              const value = item.count || item.value || 0;
              const barHeight = maxValue > 0 ? (value / maxValue) * (chartHeight - 40) : 0;
              
              return (
                <View key={index} style={[styles.barContainer, { marginHorizontal: barSpacing / 2 }]}>
                  <Text style={styles.countText}>{value}</Text>
                  <View 
                    style={[
                      styles.bar, 
                      { 
                        height: barHeight,
                        width: barWidth,
                        backgroundColor: item.color || '#4ECDC4'
                      }
                    ]} 
                  />
                  <Text style={styles.labelText} numberOfLines={2}>
                    {item.label || item.name || `Item ${index + 1}`}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
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
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingBottom: 10,
  },
  barContainer: {
    alignItems: 'center',
    minWidth: 60,
  },
  bar: {
    borderRadius: 4,
    marginTop: 5,
  },
  labelText: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    width: 55,
  },
  countText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
});

export default BarChart;