import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

const TimelineSelector = ({ timelineOptions, selectedTimeline, onTimelineChange }) => {
  return (
    <View style={styles.timelineContainer}>
      <Text style={styles.timelineTitle}>Timeline</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timelineScroll}>
        {timelineOptions?.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.timelineButton,
              selectedTimeline === option.value && styles.activeTimelineButton
            ]}
            onPress={() => onTimelineChange(option.value)}
          >
            <Text style={[
              styles.timelineButtonText,
              selectedTimeline === option.value && styles.activeTimelineButtonText
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  timelineContainer: {
    marginBottom: 25,
    paddingTop: 10,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  timelineScroll: {
    marginHorizontal: -5,
  },
  timelineButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#e9ecef',
    minWidth: 80,
  },
  activeTimelineButton: {
    backgroundColor: '#FF6B3D',
    borderColor: '#FF6B3D',
  },
  timelineButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  activeTimelineButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default TimelineSelector;