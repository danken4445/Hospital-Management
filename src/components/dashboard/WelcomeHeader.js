import React from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView } from 'react-native';
import { Surface, IconButton } from 'react-native-paper';

const WelcomeHeader = ({ 
  userRole, 
  userName, 
  currentTime, 
  userClinic, 
  onRefresh, 
  getDepartmentColor 
}) => {
  const formatTime = () => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View style={[styles.welcomeHeader, { backgroundColor: getDepartmentColor(userRole) }]}>
      <SafeAreaView>
        <View style={styles.welcomeContent}>
          <View style={styles.welcomeLeft}>
            <Text style={styles.greetingText}>{getGreeting()}</Text>
            <Text style={styles.userNameText}>{userName || 'User'}</Text>
            <Text style={styles.dateText}>{formatDate()}</Text>
          </View>
          <View style={styles.welcomeRight}>
            <Surface style={styles.timeContainer} elevation={2}>
              <Text style={styles.timeText}>{formatTime()}</Text>
            </Surface>
            <IconButton
              icon="refresh"
              iconColor="#ffffff"
              size={24}
              onPress={onRefresh}
              style={styles.refreshButton}
            />
           
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  welcomeHeader: {
    paddingTop: 60, // Fixed padding that works well on both platforms
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  welcomeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  welcomeLeft: {
    flex: 1,
  },
  greetingText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
    fontWeight: '400',
  },
  userNameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  welcomeRight: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  timeContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    marginRight: 8,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  refreshButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  clinicIndicator: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 8,
  },
  clinicText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default WelcomeHeader;
