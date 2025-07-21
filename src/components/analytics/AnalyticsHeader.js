import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const AnalyticsHeader = ({ 
  insets, 
  navigation, 
  isLandscape, 
  toggleOrientation, 
  currentTime, 
  userName, 
  analyticsData,
  formatTime,
  formatDate 
}) => {
  return (
    <View style={[styles.modernHeader, { paddingTop: insets.top + 10 }]}>
      <View style={styles.headerGradient} />
      
      {/* Main Header Content */}
      <View style={styles.headerTop}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <View style={styles.backButtonInner}>
            <Text style={styles.backArrow}>←</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Hospital Analytics</Text>
          <Text style={styles.headerSubtitle}>Real-time Dashboard</Text>
        </View>

        <TouchableOpacity 
          style={styles.orientationButton}
          onPress={toggleOrientation}
          activeOpacity={0.7}
        >
          <View style={styles.orientationButtonInner}>
            <Text style={styles.orientationIcon}>
              {isLandscape ? '📱' : '🔄'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Time and Status Row */}
      <View style={styles.statusRow}>
        <View style={styles.timeContainer}>
          <Text style={styles.currentTime}>{formatTime ? formatTime(currentTime) : new Date().toLocaleTimeString()}</Text>
          <Text style={styles.currentDate}>{formatDate ? formatDate(currentTime) : new Date().toLocaleDateString()}</Text>
        </View>

        <View style={styles.statusContainer}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Live Data</Text>
          <Text style={styles.userInfo}>• {userName || 'Admin'}</Text>
        </View>
      </View>

      {/* Quick Stats Preview */}
      <View style={styles.quickStats}>
        <View style={styles.quickStatItem}>
          <Text style={styles.quickStatValue}>{analyticsData?.totalPatients || 0}</Text>
          <Text style={styles.quickStatLabel}>Patients</Text>
        </View>
        <View style={styles.quickStatDivider} />
        <View style={styles.quickStatItem}>
          <Text style={styles.quickStatValue}>
            {(analyticsData?.totalMedicines || 0) + (analyticsData?.totalSupplies || 0)}
          </Text>
          <Text style={styles.quickStatLabel}>Items Used</Text>
        </View>
        <View style={styles.quickStatDivider} />
        <View style={styles.quickStatItem}>
          <Text style={styles.quickStatValue}>{analyticsData?.departmentCount || 0}</Text>
          <Text style={styles.quickStatLabel}>Departments</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modernHeader: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingBottom: 25,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#2c3e50',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    zIndex: 2,
  },
  backButton: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  backArrow: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    fontWeight: '400',
  },
  orientationButton: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  orientationButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  orientationIcon: {
    fontSize: 16,
    color: '#fff',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    zIndex: 2,
  },
  timeContainer: {
    alignItems: 'flex-start',
  },
  currentTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  currentDate: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ECDC4',
    marginRight: 8,
  },
  statusText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  userInfo: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    marginLeft: 4,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 20,
    zIndex: 2,
  },
  quickStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  quickStatLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
    textAlign: 'center',
  },
  quickStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});

export default AnalyticsHeader;