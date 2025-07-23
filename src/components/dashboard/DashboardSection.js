import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Surface, IconButton, Badge } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FeatureGrid from './FeatureGrid';

const DashboardSection = ({ 
  title, 
  subtitle, 
  icon, 
  color, 
  features, 
  onRefresh, 
  alertCount 
}) => {
  return (
    <Surface style={styles.dashboardContainer} elevation={4}>
      <View style={[styles.headerContainer, { backgroundColor: color }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.iconContainer}>
              <Icon name={icon} size={32} color="#ffffff" />
            </View>
            <View>
              <Text style={styles.headerTitle}>{title}</Text>
              <Text style={styles.headerSubtitle}>{subtitle}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            {onRefresh && (
              <IconButton
                icon="refresh"
                iconColor="#ffffff"
                size={24}
                onPress={onRefresh}
              />
            )}
            {alertCount > 0 && (
              <Badge style={styles.alertBadge}>{alertCount}</Badge>
            )}
          </View>
        </View>
      </View>

      <View style={styles.featuresContainer}>
        <FeatureGrid features={features} />
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  dashboardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    margin: 20,
    marginTop: 10,
  },
  headerContainer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',

  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  headerRight: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  alertBadge: {
    backgroundColor: '#ffffff',
    color: '#e74c3c',
  },
  featuresContainer: {
    padding: 12,
    flex: 1,
  },
});

export default DashboardSection;
