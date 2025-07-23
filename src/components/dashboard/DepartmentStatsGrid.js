import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Surface, Badge } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const StatCard = ({ icon, value, label, color, trend }) => (
  <Surface style={styles.statCard} elevation={2}>
    <View style={styles.statHeader}>
      <Icon name={icon} size={24} color={color} />
      {trend && (
        <View style={[styles.trendIndicator, { backgroundColor: trend > 0 ? '#2ecc71' : '#e74c3c' }]}>
          <Icon name={trend > 0 ? 'trending-up' : 'trending-down'} size={12} color="#ffffff" />
        </View>
      )}
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </Surface>
);

const DepartmentStatsGrid = ({ userRole, departmentStats }) => {
  return (
    <View style={styles.statsContainer}>
      <Text style={styles.sectionTitle}>{userRole} Department Overview</Text>
      <View style={styles.statsGrid}>
        <StatCard
          icon="account-heart"
          value={departmentStats.totalPatients}
          label="Active Patients"
          color="#e74c3c"
          trend={2}
        />
        <StatCard
          icon="package-variant"
          value={departmentStats.inventoryItems}
          label="Inventory Items"
          color="#2ecc71"
          trend={-1}
        />
        <StatCard
          icon="history"
          value={departmentStats.usageCount}
          label="Usage Records"
          color="#f39c12"
          trend={5}
        />
        <StatCard
          icon="swap-horizontal"
          value={departmentStats.transferCount}
          label="Transfers"
          color="#9b59b6"
        />
        <StatCard
          icon="alert-circle"
          value={departmentStats.criticalAlerts}
          label="Critical Alerts"
          color="#e74c3c"
        />
        <StatCard
          icon="clipboard-list"
          value={departmentStats.pendingTasks}
          label="Pending Tasks"
          color="#3498db"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    width: (width - 64) / 3,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  trendIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    borderRadius: 10,
    padding: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});

export default DepartmentStatsGrid;
