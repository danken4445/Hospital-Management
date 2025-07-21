import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  chartContainer: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#34495e',
    marginBottom: 10,
  },
  loadingSpinner: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  button: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default styles;