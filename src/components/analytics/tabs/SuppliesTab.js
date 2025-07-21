import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import TimelineSelector from '../TimelineSelector';
import ChartCard from '../ChartCard';
import BarChart from '../../charts/BarChart';
import PieChart from '../../charts/PieChart';
import Legend from '../Legend';

const { width: screenWidth } = Dimensions.get('window');

const SuppliesTab = ({
  timelineOptions,
  selectedTimeline,
  onTimelineChange,
  chartData
}) => {
  return (
    <View style={styles.container}>
      <TimelineSelector
        timelineOptions={timelineOptions}
        selectedTimeline={selectedTimeline}
        onTimelineChange={onTimelineChange}
      />

      <Text style={styles.sectionTitle}>Supply Analytics</Text>

      <ChartCard
        title="Supply Usage Trends"
        subtitle="Most used supplies in the hospital"
      >
        <BarChart 
          data={chartData?.supplyUsage || []} 
          width={screenWidth - 80} 
          height={220}
          title="supplyUsage"
        />
      </ChartCard>

      <ChartCard
        title="Supply Categories"
        subtitle="Distribution by category"
      >
        <PieChart 
          data={chartData?.supplyCategories || []} 
          width={screenWidth - 120} 
          height={200}
          title="supplyCategories"
        />
      </ChartCard>

      <Legend data={chartData?.supplyUsage || []} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    marginTop: 10,
  },
});

export default SuppliesTab;