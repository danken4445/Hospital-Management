import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Svg, { Polyline, Circle, Line, Text as SvgText, G } from 'react-native-svg';
import * as d3 from 'd3';

const LineChart = ({ 
  data, 
  width, 
  height, 
  color = '#FF6B3D', 
  title
}) => {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { width, height }]}>
        <Text style={styles.chartTitle}>{title}</Text>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No data available</Text>
        </View>
      </View>
    );
  }

  // Chart dimensions
  const padding = 40;
  const chartWidth = width - (padding * 2);
  const chartHeight = height - 80; // Leave space for title and labels

  // Prepare data and scales
  const xValues = data.map((_, index) => index);
  const yValues = data.map(d => d.count || d.value || 0);
  
  const xScale = d3.scaleLinear()
    .domain([0, data.length - 1])
    .range([0, chartWidth]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(yValues) || 1])
    .range([chartHeight, 0]);

  // Generate line path points
  const linePoints = data.map((d, index) => {
    const x = xScale(index);
    const y = yScale(d.count || d.value || 0);
    return `${x},${y}`;
  }).join(' ');

  // Generate chart points for circles
  const chartPoints = data.map((d, index) => ({
    x: xScale(index),
    y: yScale(d.count || d.value || 0),
    value: d.count || d.value || 0,
    label: d.label || `Point ${index + 1}`
  }));

  // Generate Y-axis ticks
  const yTicks = yScale.ticks(5);
  const xTicks = data.length <= 10 ? 
    data.map((_, index) => index) : 
    d3.range(0, data.length, Math.ceil(data.length / 5));

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={[styles.container, { width: Math.max(width, 300), height }]}>
        <Text style={styles.chartTitle}>{title}</Text>
        
        <Svg width={width} height={chartHeight + 60} style={styles.svg}>
          <G x={padding} y={20}>
            {/* Y-axis grid lines and labels */}
            {yTicks.map((tick, index) => (
              <G key={`y-tick-${index}`}>
                <Line
                  x1={0}
                  y1={yScale(tick)}
                  x2={chartWidth}
                  y2={yScale(tick)}
                  stroke="#e0e0e0"
                  strokeWidth={1}
                  strokeDasharray="3,3"
                />
                <SvgText
                  x={-10}
                  y={yScale(tick) + 4}
                  fontSize="10"
                  fill="#666"
                  textAnchor="end"
                >
                  {String(tick)} {/* Ensure it's a string */}
                </SvgText>
              </G>
            ))}

            {/* X-axis grid lines and labels */}
            {xTicks.map((tick, index) => (
              <G key={`x-tick-${index}`}>
                <Line
                  x1={xScale(tick)}
                  y1={0}
                  x2={xScale(tick)}
                  y2={chartHeight}
                  stroke="#e0e0e0"
                  strokeWidth={1}
                  strokeDasharray="3,3"
                />
                <SvgText
                  x={xScale(tick)}
                  y={chartHeight + 15}
                  fontSize="10"
                  fill="#666"
                  textAnchor="middle"
                >
                  {String(data[tick]?.label || tick)} {/* Ensure it's a string */}
                </SvgText>
              </G>
            ))}

            {/* Main axes */}
            <Line
              x1={0}
              y1={0}
              x2={0}
              y2={chartHeight}
              stroke="#333"
              strokeWidth={2}
            />
            <Line
              x1={0}
              y1={chartHeight}
              x2={chartWidth}
              y2={chartHeight}
              stroke="#333"
              strokeWidth={2}
            />

            {/* Line chart */}
            <Polyline
              points={linePoints}
              fill="none"
              stroke={color}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {chartPoints.map((point, index) => (
              <G key={`point-${index}`}>
                <Circle
                  cx={point.x}
                  cy={point.y}
                  r={4}
                  fill={color}
                  stroke="#fff"
                  strokeWidth={2}
                />
                {/* Value label on hover effect */}
                <SvgText
                  x={point.x}
                  y={point.y - 10}
                  fontSize="10"
                  fill="#333"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {String(point.value)} {/* Ensure it's a string */}
                </SvgText>
              </G>
            ))}
          </G>
        </Svg>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: color }]} />
            <Text style={styles.legendText}>{title || 'Data Trend'}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
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
  chartTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  svg: {
    backgroundColor: 'transparent',
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
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#333',
  },
});

export default LineChart;