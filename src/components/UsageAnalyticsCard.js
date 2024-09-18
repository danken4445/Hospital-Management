import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';

const UsageAnalyticsCard = () => {
  return (
      <Card.Content>
        <Title>Usage Analytics</Title>
        <View style={styles.chartPlaceholder}>
          {/* Placeholder for Pie Chart */}
        </View>
      </Card.Content>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 10,
    padding: 20,
  },
  chartPlaceholder: {
    height: 150,  // This will be the placeholder height for the pie chart
    backgroundColor: 'gray',  // Light gray background for the placeholder
    borderRadius: 32,  // Rounded to simulate a circle (for pie chart)
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default UsageAnalyticsCard;
