import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import TimelineSelector from '../TimelineSelector';
import ChartCard from '../ChartCard';
import MetricsGrid from '../MetricsGrid';
import LineChart from '../../charts/LineChart';
import BarChart from '../../charts/BarChart';
import PieChart from '../../charts/PieChart';

const { width: screenWidth } = Dimensions.get('window');

const PatientTrafficTab = ({
  timelineOptions,
  selectedTimeline,
  onTimelineChange,
  patientTrafficData
}) => {
  return (
    <View style={styles.container}>
      <TimelineSelector
        timelineOptions={timelineOptions}
        selectedTimeline={selectedTimeline}
        onTimelineChange={onTimelineChange}
      />

      <Text style={styles.sectionTitle}>Patient Traffic Analytics</Text>

      {/* Daily Traffic Chart */}
      <ChartCard
        title="Daily Patient Traffic"
        subtitle="Number of patients per day"
      >
        <LineChart 
          data={patientTrafficData?.dailyTraffic || []} 
          width={screenWidth - 80} 
          height={180}
          color="#FF6B3D"
          title="dailyTraffic"
        />
      </ChartCard>

      {/* Hourly Pattern Chart */}
      <ChartCard
        title="Hourly Patient Pattern"
        subtitle="Peak hours for patient visits"
      >
        <BarChart 
          data={patientTrafficData?.hourlyPattern || []} 
          width={screenWidth - 80} 
          height={200}
          title="hourlyPattern"
        />
      </ChartCard>

      {/* Department Traffic */}
      <ChartCard
        title="Department-wise Traffic"
        subtitle="Patient distribution by department"
      >
        <BarChart 
          data={patientTrafficData?.departmentTraffic || []} 
          width={screenWidth - 80} 
          height={200}
          title="departmentTraffic"
        />
      </ChartCard>

      {/* Key Metrics */}
      <ChartCard title="Traffic Insights">
        <MetricsGrid metrics={patientTrafficData?.metrics || {}} />
      </ChartCard>
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

export default PatientTrafficTab;