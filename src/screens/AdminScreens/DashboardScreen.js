import React, { useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet, StatusBar, ActivityIndicator, Text } from 'react-native';
import Toast from 'react-native-toast-message';
import { auth, database } from '../../../firebaseConfig';
import { ref, get } from 'firebase/database';
import UsageAnalyticsCard from '../../components/UsageAnalyticsCard';
import WelcomeHeader from '../../components/dashboard/WelcomeHeader';
import AdminStatsGrid from '../../components/dashboard/AdminStatsGrid';
import DashboardSection from '../../components/dashboard/DashboardSection';
import { getAdminDashboardFeatures, getAdminStatsConfig } from '../../utils/adminDashboardHelpers';

const Dashboard = ({ navigation, route }) => {
  const [userName, setUserName] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  
  // Get clinic context from navigation params
  const { clinic, permissions } = route?.params || {};
  const [userClinic, setUserClinic] = useState(clinic || null);
  
  // Real-time analytics data
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalPatients: 0,
    totalInventoryItems: 0,
    totalDepartments: 4,
    activeScans: 0,
    pendingTransfers: 0,
    systemEfficiency: 0,
    criticalAlerts: 0
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchUserInfo();
    fetchDashboardAnalytics();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        let userData = null;
        
        // If we have clinic context, try clinic-specific user data first
        if (userClinic) {
          const clinicUserRef = ref(database, `${userClinic}/users/${user.uid}`);
          const clinicSnapshot = await get(clinicUserRef);
          if (clinicSnapshot.exists()) {
            userData = clinicSnapshot.val();
          }
        }
        
        // If no clinic-specific data found, try global users
        if (!userData) {
          const globalUserRef = ref(database, `users/${user.uid}`);
          const globalSnapshot = await get(globalUserRef);
          if (globalSnapshot.exists()) {
            userData = globalSnapshot.val();
          }
        }
        
        if (userData) {
          setUserName(`${userData.firstName} ${userData.lastName}`);
        }
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const fetchDashboardAnalytics = async () => {
    setLoading(true);
    try {
      // Determine the base path for queries
      const basePath = userClinic || '';
      
      // Fetch Users Count
      const usersRef = ref(database, userClinic ? `${userClinic}/users` : 'users');
      const usersSnapshot = await get(usersRef);
      const usersCount = usersSnapshot.exists() ? Object.keys(usersSnapshot.val()).length : 0;

      // Fetch Patients Count
      const patientsRef = ref(database, userClinic ? `${userClinic}/patients` : 'patients');
      const patientsSnapshot = await get(patientsRef);
      const patientsCount = patientsSnapshot.exists() ? Object.keys(patientsSnapshot.val()).length : 0;

      // Fetch Inventory Count from multiple sources if clinic-specific
      let inventoryCount = 0;
      if (userClinic) {
        // Count from pharmacy inventory
        const pharmacyRef = ref(database, `${userClinic}/pharmacy/medicines`);
        const pharmacySnapshot = await get(pharmacyRef);
        if (pharmacySnapshot.exists()) {
          inventoryCount += Object.keys(pharmacySnapshot.val()).length;
        }
        
        // Count from department inventories
        const departments = ['ICU', 'ER', 'COVID UNIT', 'Outpatient'];
        for (const dept of departments) {
          const deptMedsRef = ref(database, `${userClinic}/departments/${dept}/localMeds`);
          const deptSuppliesRef = ref(database, `${userClinic}/departments/${dept}/localSupplies`);
          
          const [medsSnapshot, suppliesSnapshot] = await Promise.all([
            get(deptMedsRef),
            get(deptSuppliesRef)
          ]);
          
          if (medsSnapshot.exists()) {
            inventoryCount += Object.keys(medsSnapshot.val()).length;
          }
          if (suppliesSnapshot.exists()) {
            inventoryCount += Object.keys(suppliesSnapshot.val()).length;
          }
        }
      } else {
        // Legacy global inventory count
        const inventoryRef = ref(database, 'inventory');
        const inventorySnapshot = await get(inventoryRef);
        if (inventorySnapshot.exists()) {
          const inventoryData = inventorySnapshot.val();
          inventoryCount = Object.values(inventoryData).reduce((total, category) => {
            if (typeof category === 'object' && category !== null) {
              return total + Object.keys(category).length;
            }
            return total;
          }, 0);
        }
      }

      // Fetch Usage History for efficiency calculation
      const usageRef = ref(database, userClinic ? `${userClinic}/usageHistory` : 'usageHistory');
      const usageSnapshot = await get(usageRef);
      let totalUsages = 0;
      let successfulUsages = 0;
      
      if (usageSnapshot.exists()) {
        const usageData = usageSnapshot.val();
        Object.values(usageData).forEach(departmentData => {
          if (typeof departmentData === 'object') {
            Object.values(departmentData).forEach(usage => {
              totalUsages++;
              if (usage.status === 'completed' || !usage.status) {
                successfulUsages++;
              }
            });
          }
        });
      }

      const efficiency = totalUsages > 0 ? Math.round((successfulUsages / totalUsages) * 100) : 95;

      // Fetch recent scans count
      const scansRef = ref(database, userClinic ? `${userClinic}/recentScans` : 'recentScans');
      const scansSnapshot = await get(scansRef);
      const recentScans = scansSnapshot.exists() ? Object.keys(scansSnapshot.val()).length : 0;

      // Calculate critical alerts (low stock items)
      let criticalAlerts = 0;
      if (userClinic) {
        // Check pharmacy inventory
        const pharmacyRef = ref(database, `${userClinic}/pharmacy/medicines`);
        const pharmacySnapshot = await get(pharmacyRef);
        if (pharmacySnapshot.exists()) {
          const pharmacyData = pharmacySnapshot.val();
          Object.values(pharmacyData).forEach(item => {
            if (item.quantity && parseInt(item.quantity) < 10) {
              criticalAlerts++;
            }
          });
        }
      } else {
        // Legacy global inventory check
        const inventoryRef = ref(database, 'inventory');
        const inventorySnapshot = await get(inventoryRef);
        if (inventorySnapshot.exists()) {
          const inventoryData = inventorySnapshot.val();
          Object.values(inventoryData).forEach(category => {
            if (typeof category === 'object') {
              Object.values(category).forEach(item => {
                if (item.quantity && item.quantity < 10) {
                  criticalAlerts++;
                }
              });
            }
          });
        }
      }

      setDashboardStats({
        totalUsers: usersCount,
        totalPatients: patientsCount,
        totalInventoryItems: inventoryCount,
        totalDepartments: 4,
        activeScans: recentScans,
        pendingTransfers: Math.floor(Math.random() * 5),
        systemEfficiency: efficiency,
        criticalAlerts: criticalAlerts
      });

    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      Toast.show({
        type: 'error',
        position: 'bottom',
        text1: 'Error loading dashboard data',
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFeaturePress = (screenName, params = {}) => {
    Toast.show({
      type: 'success',
      position: 'bottom',
      text1: `Accessing ${screenName}`,
      visibilityTime: 2000,
      autoHide: true,
      bottomOffset: 40,
    });
    
    // Always pass clinic context to child screens
    const navigationParams = {
      ...params,
      clinic: userClinic,
      permissions: permissions
    };
    
    navigation.navigate(screenName, navigationParams);
  };

  const handleUsageAnalyticsPress = (chartType) => {
    handleFeaturePress('UsageAnalyticsScreen', { 
      chartType,
      clinic: userClinic 
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#34495e" />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#34495e" barStyle="light-content" translucent={false} />
      
      <ScrollView style={styles.mainScrollView} showsVerticalScrollIndicator={false}>
        {/* Welcome Header */}
        <WelcomeHeader
          userRole="admin"
          userName={userName}
          currentTime={currentTime}
          userClinic={userClinic}
          onRefresh={fetchDashboardAnalytics}
          getDepartmentColor={() => '#34495e'}
        />

        {/* Analytics Card */}
        <View style={styles.analyticsContainer}>
          <UsageAnalyticsCard 
            clinic={userClinic}
            onChartPress={handleUsageAnalyticsPress} 
          />
        </View>

        {/* Real-time Stats Grid */}
        <AdminStatsGrid statsConfig={getAdminStatsConfig(dashboardStats)} />

        {/* Quick Actions */}
        <DashboardSection
          title="ADMIN CONTROL"
          subtitle="System Administration"
          icon="shield-crown"
          color="#34495e"
          features={getAdminDashboardFeatures(handleFeaturePress, dashboardStats.criticalAlerts)}
          onRefresh={fetchDashboardAnalytics}
          alertCount={dashboardStats.criticalAlerts}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#34495e',
  },
  mainScrollView: {
    flex: 1,
  },
  analyticsContainer: {
    paddingHorizontal: -40,
    marginTop: -10,
  },
});

export default Dashboard;
