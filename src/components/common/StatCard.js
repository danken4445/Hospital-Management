import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Surface } from 'react-native-paper';

const StatCard = ({ icon, value, label, growth, color = '#333' }) => {
  return (
    <Surface style={styles.card} elevation={2}>
      <View style={styles.iconContainer}>
        <View style={[styles.iconBg, { backgroundColor: `${color}20` }]}>
          <Text style={[styles.iconText, { color }]}>
            {icon === 'account-multiple' ? '👥' :
             icon === 'pill' ? '💊' :
             icon === 'package-variant' ? '📦' :
             icon === 'currency-usd' ? '💰' : '📊'}
          </Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
        
        {growth && (
          <View style={styles.growthContainer}>
            <Text style={[
              styles.growth, 
              { color: growth >= 0 ? '#4CAF50' : '#F44336' }
            ]}>
              {growth >= 0 ? '+' : ''}{growth}%
            </Text>
          </View>
        )}
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  growthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  growth: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default StatCard;