import { StyleSheet } from 'react-native';

const chartStyles = StyleSheet.create({
  chartContainer: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    elevation: 2,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  axisLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  tooltip: {
    backgroundColor: '#34495e',
    color: '#ffffff',
    padding: 8,
    borderRadius: 4,
  },
  gridLines: {
    stroke: '#ecf0f1',
    strokeWidth: 1,
  },
});

export default chartStyles;