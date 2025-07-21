import React from 'react';
import { View, Text, Dimensions, StyleSheet, ScrollView } from 'react-native';
import { Surface } from 'react-native-paper';
import TimelineSelector from '../TimelineSelector';
import ChartCard from '../ChartCard';
import StatCard from '../../common/StatCard';
import LineChart from '../../charts/LineChart';
import PieChart from '../../charts/PieChart';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const OverviewTab = ({
  timelineOptions,
  selectedTimeline,
  onTimelineChange,
  analyticsData,
  chartData,
  formatCurrency,
  isLandscape = false,
  dimensions = { width: screenWidth, height: screenHeight },
}) => {
  console.log('OverviewTab received props:', { isLandscape, dimensions });

  return (
    <View style={styles.container}>
      <TimelineSelector
        timelineOptions={timelineOptions}
        selectedTimeline={selectedTimeline}
        onTimelineChange={onTimelineChange}
      />

      <Text style={styles.sectionTitle}>Overview Analytics</Text>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statsRow}>
          <StatCard
            icon="account-multiple"
            value={analyticsData?.totalPatients || 0}
            label="Total Patients"
            growth={analyticsData?.patientGrowth}
            color="#FF6B3D"
          />
          <StatCard
            icon="pill"
            value={analyticsData?.totalMedicines || 0}
            label="Medicines Used"
            growth={analyticsData?.usageGrowth}
            color="#4ECDC4"
          />
        </View>
        
        <View style={styles.statsRow}>
          <StatCard
            icon="package-variant"
            value={analyticsData?.totalSupplies || 0}
            label="Supplies Used"
            growth={analyticsData?.usageGrowth}
            color="#FFD93D"
          />
          <StatCard
            icon="currency-usd"
            value={formatCurrency ? formatCurrency(analyticsData?.totalRevenue || 0).replace('Rp', '').trim() : '0'}
            label="Total Revenue"
            growth={analyticsData?.revenueGrowth}
            color="#6BCF7F"
          />
        </View>
      </View>

      {/* Charts */}
      <ChartCard
        title="Daily Patient Activity"
        subtitle="Last 7 days patient flow"
      >
        <LineChart 
          data={chartData?.dailyPatients || []} 
          width={screenWidth - 80} 
          height={180}
          color="#FF6B3D"
          title="dailyPatients"
        />
      </ChartCard>

      <ChartCard
        title="Revenue Trends"
        subtitle="Revenue overview"
      >
        <LineChart 
          data={chartData?.weeklyRevenue || []} 
          width={screenWidth - 80} 
          height={180}
          color="#6BCF7F"
          title="weeklyRevenue"
        />
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
  statsGrid: {
    marginBottom: 25,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
});

export default OverviewTab;