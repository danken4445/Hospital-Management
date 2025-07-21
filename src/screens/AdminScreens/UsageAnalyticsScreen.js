import React, { useState, useEffect } from 'react';
import { View, ScrollView, ActivityIndicator, StatusBar, SafeAreaView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ScreenOrientation from 'expo-screen-orientation';
import { auth } from '../../../firebaseConfig';
import { getDatabase, ref, get } from 'firebase/database';

// Components
import AnalyticsHeader from '../../components/analytics/AnalyticsHeader';
import TabButton from '../../components/common/TabButton';
import OverviewTab from '../../components/analytics/tabs/OverviewTab';
import MedicinesTab from '../../components/analytics/tabs/MedicinesTab';
import SuppliesTab from '../../components/analytics/tabs/SuppliesTab';
import DepartmentsTab from '../../components/analytics/tabs/DepartmentsTab';
import PatientTrafficTab from '../../components/analytics/tabs/PatientTrafficTab';
import LoadingScreen from '../../components/analytics/LoadingScreen';

// Hooks and Utils
import { useAnalyticsData } from '../../hooks/useAnalyticsData';
import { formatCurrency, formatTime, formatDate } from '../../utils/formatters';
import { timelineOptions } from '../../constants/analytics';
import { styles } from '../../components/analytics/styles/screenStyles';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const AnalyticsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedTimeline, setSelectedTimeline] = useState('6months');
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('');
  const [isLandscape, setIsLandscape] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dimensions, setDimensions] = useState({ width: screenWidth, height: screenHeight });
  
  const insets = useSafeAreaInsets();

  // Use custom hook for analytics data
  const { 
    loading, 
    analyticsData, 
    chartData, 
    patientTrafficData 
  } = useAnalyticsData(selectedTimeline, timelineOptions);

  useEffect(() => {
    fetchUserInfo();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Listen for orientation changes
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
      setIsLandscape(window.width > window.height);
    });

    return () => {
      clearInterval(timer);
      subscription?.remove();
    };
  }, []);

  const fetchUserInfo = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const db = getDatabase();
        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setUserRole(userData.role || 'admin');
          setUserName(`${userData.firstName || ''} ${userData.lastName || ''}`);
        }
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const toggleOrientation = async () => {
    try {
      if (isLandscape) {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        setIsLandscape(false);
      } else {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        setIsLandscape(true);
      }
    } catch (error) {
      console.log('Orientation change not supported:', error);
    }
  };

  const renderTabContent = () => {
    const commonProps = {
      timelineOptions,
      selectedTimeline,
      onTimelineChange: setSelectedTimeline,
      analyticsData,
      chartData,
      patientTrafficData,
      formatCurrency,
      isLandscape, // Make sure this is passed
      dimensions   // Make sure this is passed
    };

    console.log('Passing props to tabs:', { isLandscape, dimensions }); // Debug log

    switch (activeTab) {
      case 'Overview':
        return <OverviewTab {...commonProps} />;
      case 'Medicines':
        return <MedicinesTab {...commonProps} />;
      case 'Supplies':
        return <SuppliesTab {...commonProps} />;
      case 'Departments':
        return <DepartmentsTab {...commonProps} />;
      case 'PatientTraffic':
        return <PatientTrafficTab {...commonProps} />;
      default:
        return <OverviewTab {...commonProps} />;
    }
  };

  if (loading) {
    return <LoadingScreen selectedTimeline={selectedTimeline} timelineOptions={timelineOptions} />;
  }

  return (
    <SafeAreaView style={[styles.container, isLandscape && styles.landscapeContainer]}>
      <StatusBar backgroundColor="#2c3e50" barStyle="light-content" translucent={false} />
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        horizontal={isLandscape}
      >
        <AnalyticsHeader
          insets={insets}
          navigation={navigation}
          isLandscape={isLandscape}
          toggleOrientation={toggleOrientation}
          currentTime={currentTime}
          userName={userName}
          analyticsData={analyticsData}
          formatTime={formatTime}
          formatDate={formatDate}
        />

        {/* Tab Navigation */}
        <View style={[styles.tabContainer, isLandscape && styles.landscapeTabContainer]}>
          {['Overview', 'Medicines', 'Supplies', 'Departments', 'PatientTraffic'].map(tab => (
            <TabButton
              key={tab}
              title={tab === 'PatientTraffic' ? 'Patient Traffic' : tab}
              isActive={activeTab === tab}
              onPress={() => setActiveTab(tab)}
            />
          ))}
        </View>

        {/* Content */}
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AnalyticsScreen;
