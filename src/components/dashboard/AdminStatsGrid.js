import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Surface } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const AdminStatCard = ({ icon, value, label, color, trend }) => (
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

const AdminStatsGrid = ({ statsConfig }) => {
  return (
    <View style={styles.statsContainer}>
      <Text style={styles.sectionTitle}>System Overview</Text>
      <View style={styles.statsGrid}>
        {statsConfig.map((stat, index) => (
          <AdminStatCard
            key={index}
            icon={stat.icon}
            value={stat.value}
            label={stat.label}
            color={stat.color}
            trend={stat.trend}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
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
    alignItems: 'stretch',
  },
  statCard: {
    width: (width - 52) / 3,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
    minHeight: 100,
    justifyContent: 'space-between',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 14,
  },
});

export default AdminStatsGrid;
