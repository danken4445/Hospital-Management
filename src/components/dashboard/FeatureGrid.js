import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Card, Badge } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const ModernFeatureCard = ({ title, subtitle, icon, color, onPress, badge }) => (
  <Card style={styles.modernCard} onPress={onPress} elevation={4}>
    <View style={styles.cardContent}>
      <View style={[styles.cardIcon, { backgroundColor: color }]}>
        <Icon name={icon} size={28} color="#ffffff" />
        {badge > 0 && <Badge style={styles.cardBadge}>{badge}</Badge>}
      </View>
      <View style={styles.cardTextContainer}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>
      <Icon name="chevron-right" size={20} color="#bdc3c7" style={styles.cardArrow} />
    </View>
  </Card>
);

const FeatureGrid = ({ features }) => {
  return (
    <View style={styles.modernGrid}>
      {features.map((feature, index) => (
        <ModernFeatureCard
          key={index}
          title={feature.title}
          subtitle={feature.subtitle}
          icon={feature.icon}
          color={feature.color}
          onPress={feature.onPress}
          badge={feature.badge}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  modernGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  modernCard: {
    width: (width - 80) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardContent: {
    padding: 16,
    alignItems: 'center',
    minHeight: 120,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    position: 'relative',
  },
  cardBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#e74c3c',
  },
  cardTextContainer: {
    alignItems: 'center',
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  cardArrow: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
});

export default FeatureGrid;
