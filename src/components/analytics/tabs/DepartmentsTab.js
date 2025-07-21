import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import TimelineSelector from '../TimelineSelector';
import ChartCard from '../ChartCard';
import BarChart from '../../charts/BarChart';
import PieChart from '../../charts/PieChart';
import Legend from '../Legend';

const { width: screenWidth } = Dimensions.get('window');

const DepartmentsTab = ({
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

      <Text style={styles.sectionTitle}>Department Analytics</Text>

      <ChartCard
        title="Department Activity"
        subtitle="Patient distribution by department"
      >
        <BarChart 
          data={chartData?.departmentActivity || []} 
          width={screenWidth - 80} 
          height={220}
          title="departmentActivity"
        />
      </ChartCard>

      <ChartCard
        title="Department Load"
        subtitle="Workload distribution"
      >
        <PieChart 
          data={chartData?.departmentLoad || []} 
          width={screenWidth - 120} 
          height={200}
          title="departmentLoad"
        />
      </ChartCard>

      <Legend data={chartData?.departmentActivity || []} valueKey="patients" />
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

export default DepartmentsTab;