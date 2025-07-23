import React, { useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet, StatusBar, ActivityIndicator, Text } from 'react-native';
import Toast from 'react-native-toast-message';
import { auth, database } from '../../../../firebaseConfig';
import { ref, get } from 'firebase/database';
import DepartmentUsageAnalyticsCard from '../../../components/DeptUsageAnalytics';
import WelcomeHeader from '../../../components/dashboard/WelcomeHeader';
import DepartmentStatsGrid from '../../../components/dashboard/DepartmentStatsGrid';
import DashboardSection from '../../../components/dashboard/DashboardSection';
import { 
  getDepartmentColor, 
  getDepartmentIcon, 
  getDepartmentFeatures 
} from '../../../utils/dashboardHelpers';

const Dashboard = ({ navigation, route }) => {
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  
  // Get clinic context from navigation params
  const { clinic, department, permissions } = route?.params || {};
  const [userClinic, setUserClinic] = useState(clinic || null);
  
  // Department-specific analytics data
  const [departmentStats, setDepartmentStats] = useState({
    totalPatients: 0,
    inventoryItems: 0,
    usageCount: 0,
    transferCount: 0,
    criticalAlerts: 0,
    pendingTasks: 0
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchUserRole();
  }, []);

  useEffect(() => {
    if (userRole) {
      fetchDepartmentAnalytics(userRole);
    }
  }, [userRole]);

  const fetchUserRole = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        let userData = null;
        
        // If we have clinic context from navigation, use it
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
          setUserRole(userData.department || userData.role || department);
          setUserName(`${userData.firstName || 'User'} ${userData.lastName || ''}`);
        } else if (department) {
          // Use data from navigation params if database lookup fails
          setUserRole(department);
          setUserName('User');
        }
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      // Use navigation params as fallback
      if (department) {
        setUserRole(department);
        setUserName('User');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentAnalytics = async (deptName) => {
    setLoading(true);
    try {
      if (!userClinic) {
        console.warn('No clinic context available for analytics');
        setLoading(false);
        return;
      }

      // Fetch Department Patients from clinic-specific path
      const patientsRef = ref(database, `${userClinic}/patients`);
      const patientsSnapshot = await get(patientsRef);
      let departmentPatients = 0;
      
      if (patientsSnapshot.exists()) {
        const patientsData = patientsSnapshot.val();
        Object.values(patientsData).forEach(patient => {
          if (patient.currentDepartment === deptName || 
              patient.department === deptName ||
              patient.admissionInfo?.department === deptName) {
            departmentPatients++;
          }
        });
      }

      // Fetch Department Inventory from clinic-specific paths
      const inventoryRef = ref(database, `${userClinic}/departments/${deptName}/localMeds`);
      const suppliesRef = ref(database, `${userClinic}/departments/${deptName}/localSupplies`);
      
      const [inventorySnapshot, suppliesSnapshot] = await Promise.all([
        get(inventoryRef),
        get(suppliesRef)
      ]);
      
      let inventoryItems = 0;
      let criticalAlerts = 0;
      
      // Count medicines
      if (inventorySnapshot.exists()) {
        const inventoryData = inventorySnapshot.val();
        Object.values(inventoryData).forEach(item => {
          inventoryItems++;
          if (item.quantity && parseInt(item.quantity) < 5) {
            criticalAlerts++;
          }
        });
      }
      
      // Count supplies
      if (suppliesSnapshot.exists()) {
        const suppliesData = suppliesSnapshot.val();
        Object.values(suppliesData).forEach(item => {
          inventoryItems++;
          if (item.quantity && parseInt(item.quantity) < 5) {
            criticalAlerts++;
          }
        });
      }

      // Fetch Department Usage History from clinic-specific path
      const usageRef = ref(database, `${userClinic}/departments/${deptName}/usageHistory`);
      const usageSnapshot = await get(usageRef);
      let usageCount = 0;
      
      if (usageSnapshot.exists()) {
        const usageData = usageSnapshot.val();
        usageCount = Object.keys(usageData).length;
      }

      // Fetch Transfer History from clinic-specific paths
      const medicineTransferRef = ref(database, `${userClinic}/medicineTransferHistory`);
      const supplyTransferRef = ref(database, `${userClinic}/supplyHistoryTransfer`);
      
      const [medicineTransferSnapshot, supplyTransferSnapshot] = await Promise.all([
        get(medicineTransferRef),
        get(supplyTransferRef)
      ]);
      
      let transferCount = 0;
      
      // Count medicine transfers
      if (medicineTransferSnapshot.exists()) {
        const transferData = medicineTransferSnapshot.val();
        Object.values(transferData).forEach(transfer => {
          if (transfer.fromDepartment === deptName || transfer.toDepartment === deptName) {
            transferCount++;
          }
        });
      }
      
      // Count supply transfers
      if (supplyTransferSnapshot.exists()) {
        const supplyTransferData = supplyTransferSnapshot.val();
        Object.values(supplyTransferData).forEach(transfer => {
          if (transfer.fromDepartment === deptName || transfer.toDepartment === deptName) {
            transferCount++;
          }
        });
      }

      setDepartmentStats({
        totalPatients: departmentPatients,
        inventoryItems: inventoryItems,
        usageCount: usageCount,
        transferCount: transferCount,
        criticalAlerts: criticalAlerts,
        pendingTasks: Math.floor(Math.random() * 8) // Mock data
      });

    } catch (error) {
      console.error('Error fetching department analytics:', error);
      Toast.show({
        type: 'error',
        position: 'bottom',
        text1: 'Error loading department data',
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFeaturePress = (screenName, deptName, params = {}) => {
    Toast.show({
      type: 'success',
      position: 'bottom',
      text1: `Accessing ${screenName}`,
      visibilityTime: 2000,
      autoHide: true,
      bottomOffset: 40,
    });
    
    // Always pass clinic context and user info to child screens
    const navigationParams = {
      ...params,
      clinic: userClinic,
      department: deptName || userRole,
      userRole: userRole,
      permissions: permissions
    };
    
    navigation.navigate(screenName, navigationParams);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={getDepartmentColor(userRole)} />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={getDepartmentColor(userRole)} barStyle="light-content" translucent={false} />
      
      {/* Welcome Header */}
      <WelcomeHeader
        userRole={userRole}
        userName={userName}
        currentTime={currentTime}
        userClinic={userClinic}
        onRefresh={() => fetchDepartmentAnalytics(userRole)}
        getDepartmentColor={getDepartmentColor}
      />

      <ScrollView style={styles.mainScrollView} showsVerticalScrollIndicator={false}>
        {/* Analytics Card */}
        <View style={styles.analyticsContainer}>
          <DepartmentUsageAnalyticsCard 
            clinic={userClinic}
            department={userRole}
            onChartPress={(chartType) => handleFeaturePress('DeptAnalyticsScreen', userRole, { 
              chartType,
              clinic: userClinic,
              department: userRole 
            })} 
          />
        </View>

        {/* Department Stats Grid */}
        <DepartmentStatsGrid userRole={userRole} departmentStats={departmentStats} />

        {/* Department Dashboard */}
        <DashboardSection
          title={`${userRole.toUpperCase()} DEPARTMENT`}
          subtitle="Department Operations"
          icon={getDepartmentIcon(userRole)}
          color={getDepartmentColor(userRole)}
          features={getDepartmentFeatures(userRole, handleFeaturePress, navigation, departmentStats)}
          alertCount={departmentStats.criticalAlerts}
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
