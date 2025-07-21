import React from 'react';
import { View, Text, Dimensions, StyleSheet, ScrollView } from 'react-native';
import TimelineSelector from '../TimelineSelector';
import ChartCard from '../ChartCard';
import BarChart from '../../charts/BarChart';
import PieChart from '../../charts/PieChart';
import Legend from '../Legend';

const { width: screenWidth } = Dimensions.get('window');

const MedicinesTab = ({
  timelineOptions,
  selectedTimeline,
  onTimelineChange,
  chartData,
  isLandscape = false,
  dimensions = { width: screenWidth, height: 600 }
}) => {
  // Calculate appropriate sizes for landscape
  const getChartDimensions = () => {
    if (isLandscape) {
      const availableWidth = dimensions.width - 320; // Account for sidebar
      return {
        chartWidth: Math.min(availableWidth - 60, 800),
        chartHeight: 300,
        pieSize: Math.min(availableWidth / 2 - 40, 350)
      };
    } else {
      return {
        chartWidth: screenWidth - 80,
        chartHeight: 220,
        pieSize: screenWidth - 120
      };
    }
  };

  const chartDims = getChartDimensions();

  if (isLandscape) {
    // Landscape layout - two column grid
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <TimelineSelector
          timelineOptions={timelineOptions}
          selectedTimeline={selectedTimeline}
          onTimelineChange={onTimelineChange}
        />

        <Text style={[styles.sectionTitle, styles.landscapeTitle]}>Medicine Analytics</Text>

        <View style={styles.landscapeGrid}>
          {/* Top row - full width chart */}
          <ChartCard
            title="Medicine Usage Trends"
            subtitle="Most used medicines across all departments"
            isLandscape={isLandscape}
          >
            <BarChart 
              data={chartData?.medicineUsage || []} 
              width={chartDims.chartWidth} 
              height={chartDims.chartHeight}
              title="Medicine Usage"
              isLandscape={isLandscape}
            />
          </ChartCard>

          {/* Bottom row - two side-by-side charts */}
          <View style={styles.landscapeRow}>
            <View style={styles.landscapeColumn}>
              <ChartCard
                title="Medicine Categories"
                subtitle="Distribution by categories"
                isLandscape={isLandscape}
              >
                <PieChart 
                  data={chartData?.medicineCategories || []} 
                  width={chartDims.pieSize}
                  height={250}
                  title="Categories"
                  isLandscape={isLandscape}
                />
              </ChartCard>
            </View>

            <View style={styles.landscapeColumn}>
              <Legend 
                data={chartData?.medicineUsage || []} 
                isLandscape={isLandscape} 
              />
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  // Portrait layout (original)
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <TimelineSelector
        timelineOptions={timelineOptions}
        selectedTimeline={selectedTimeline}
        onTimelineChange={onTimelineChange}
      />

      <Text style={styles.sectionTitle}>Medicine Analytics</Text>

      <ChartCard
        title="Medicine Usage Trends"
        subtitle="Most used medicines across all departments"
      >
        <BarChart 
          data={chartData?.medicineUsage || []} 
          width={chartDims.chartWidth} 
          height={chartDims.chartHeight}
          title="Medicine Usage"
        />
      </ChartCard>

      <ChartCard
        title="Medicine Categories Distribution"
        subtitle="Distribution by medicine categories"
      >
        <PieChart 
          data={chartData?.medicineCategories || []} 
          width={chartDims.pieSize}
          height={200}
          title="Medicine Categories"
        />
      </ChartCard>

      <Legend data={chartData?.medicineUsage || []} />
    </ScrollView>
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
  landscapeTitle: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 30,
  },
  landscapeGrid: {
    flex: 1,
  },
  landscapeRow: {
    flexDirection: 'row',
    marginTop: 20,
  },
  landscapeColumn: {
    flex: 1,
    marginHorizontal: 10,
  },
});

export default MedicinesTab;