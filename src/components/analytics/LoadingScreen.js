import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, SafeAreaView } from 'react-native';

const LoadingScreen = ({ selectedTimeline, timelineOptions }) => {
  const selectedOption = timelineOptions?.find(opt => opt.value === selectedTimeline);
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gradient}>
        <View style={styles.content}>
          {/* Loading Animation */}
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Loading Analytics...</Text>
            <Text style={styles.subText}>
              Preparing {selectedOption?.label || '6 Months'} data
            </Text>
          </View>

          {/* Progress Indicators */}
          <View style={styles.progressContainer}>
            <View style={styles.progressItem}>
              <View style={styles.progressDot} />
              <Text style={styles.progressText}>Fetching Patient Data</Text>
            </View>
            <View style={styles.progressItem}>
              <View style={[styles.progressDot, styles.progressDotActive]} />
              <Text style={styles.progressText}>Processing Analytics</Text>
            </View>
            <View style={styles.progressItem}>
              <View style={styles.progressDot} />
              <Text style={styles.progressText}>Generating Charts</Text>
            </View>
          </View>

          {/* Hospital Stats Preview */}
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>Hospital Management System</Text>
            <View style={styles.previewStats}>
              <View style={styles.previewStat}>
                <Text style={styles.previewValue}>🏥</Text>
                <Text style={styles.previewLabel}>Analytics</Text>
              </View>
              <View style={styles.previewStat}>
                <Text style={styles.previewValue}>📊</Text>
                <Text style={styles.previewLabel}>Reports</Text>
              </View>
              <View style={styles.previewStat}>
                <Text style={styles.previewValue}>👥</Text>
                <Text style={styles.previewLabel}>Patients</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    backgroundColor: '#FF6B3D', // Replace LinearGradient with solid color
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  loadingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 8,
  },
  subText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 40,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginRight: 15,
  },
  progressDotActive: {
    backgroundColor: '#fff',
  },
  progressText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  previewContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  previewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  previewStat: {
    alignItems: 'center',
  },
  previewValue: {
    fontSize: 30,
    marginBottom: 8,
  },
  previewLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
});

export default LoadingScreen;