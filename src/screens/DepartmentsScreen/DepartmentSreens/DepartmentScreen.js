import React, { useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet, SafeAreaView, Dimensions, StatusBar, Text, Platform } from 'react-native';
import { Card, Surface, IconButton, Badge, ActivityIndicator } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FeatureCard from '../../../components/Card';
import Toast from 'react-native-toast-message';
import { auth, database } from '../../../../firebaseConfig';
import { ref, get } from 'firebase/database';
import DepartmentUsageAnalyticsCard from '../../../components/DeptUsageAnalytics';

const { width, height } = Dimensions.get('window');

const Dashboard = ({ navigation }) => {
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  
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
    if (userRole && userRole !== 'admin') {
      fetchDepartmentAnalytics(userRole);
    }
  }, [userRole]);

  const fetchUserRole = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setUserRole(userData.department);
          setUserName(`${userData.firstName || 'User'} ${userData.lastName || ''}`);
        }
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentAnalytics = async (department) => {
    setLoading(true);
    try {
      // Fetch Department Patients
      const patientsRef = ref(database, 'patients');
      const patientsSnapshot = await get(patientsRef);
      let departmentPatients = 0;
      
      if (patientsSnapshot.exists()) {
        const patientsData = patientsSnapshot.val();
        Object.values(patientsData).forEach(patient => {
          if (patient.currentDepartment === department || patient.department === department) {
            departmentPatients++;
          }
        });
      }

      // Fetch Department Inventory
      const inventoryRef = ref(database, `departmentInventory/${department}`);
      const inventorySnapshot = await get(inventoryRef);
      let inventoryItems = 0;
      let criticalAlerts = 0;
      
      if (inventorySnapshot.exists()) {
        const inventoryData = inventorySnapshot.val();
        Object.values(inventoryData).forEach(category => {
          if (typeof category === 'object') {
            Object.values(category).forEach(item => {
              inventoryItems++;
              if (item.quantity && item.quantity < 5) {
                criticalAlerts++;
              }
            });
          }
        });
      }

      // Fetch Department Usage History
      const usageRef = ref(database, `usageHistory/${department}`);
      const usageSnapshot = await get(usageRef);
      let usageCount = 0;
      
      if (usageSnapshot.exists()) {
        const usageData = usageSnapshot.val();
        usageCount = Object.keys(usageData).length;
      }

      // Fetch Transfer History
      const transferRef = ref(database, 'transferHistory');
      const transferSnapshot = await get(transferRef);
      let transferCount = 0;
      
      if (transferSnapshot.exists()) {
        const transferData = transferSnapshot.val();
        Object.values(transferData).forEach(transfer => {
          if (transfer.fromDepartment === department || transfer.toDepartment === department) {
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

  const handleFeaturePress = (screenName, department, params = {}) => {
    Toast.show({
      type: 'success',
      position: 'bottom',
      text1: `Accessing ${screenName}`,
      visibilityTime: 2000,
      autoHide: true,
      bottomOffset: 40,
    });
    navigation.navigate(screenName, params);
  };

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

  const getDepartmentColor = (dept) => {
    const colors = {
      'ICU': '#e74c3c',
      'ER': '#e67e22',
      'COVID UNIT': '#9b59b6',
      'Outpatient': '#3498db',
      'admin': '#2c3e50'
    };
    return colors[dept] || '#3498db';
  };

  const getDepartmentIcon = (dept) => {
    const icons = {
      'ICU': 'heart-pulse',
      'ER': 'ambulance',
      'COVID UNIT': 'virus',
      'Outpatient': 'account-group',
      'admin': 'shield-crown'
    };
    return icons[dept] || 'hospital-building';
  };

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

  const renderAdminDashboard = () => (
    <Surface style={styles.dashboardContainer} elevation={4}>
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.iconContainer}>
              <Icon name="shield-crown" size={32} color="#ffffff" />
            </View>
            <View>
              <Text style={styles.headerTitle}>ADMIN CONTROL</Text>
              <Text style={styles.headerSubtitle}>System Administration</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <IconButton
              icon="refresh"
              iconColor="#ffffff"
              size={24}
              onPress={() => fetchDepartmentAnalytics(userRole)}
            />
          </View>
        </View>
      </View>

      <ScrollView style={styles.cardsScrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.modernGrid}>
          <ModernFeatureCard
            title="Inventory Management"
            subtitle="Monitor stock levels"
            icon="package-variant"
            color="#3498db"
            onPress={() => handleFeaturePress('InventoryScreen')}
          />
          <ModernFeatureCard
            title="Account Creation"
            subtitle="User management"
            icon="account-plus"
            color="#2ecc71"
            onPress={() => handleFeaturePress('CreateAccountScreen')}
          />
          <ModernFeatureCard
            title="Patient Scanner"
            subtitle="QR code scanning"
            icon="qrcode-scan"
            color="#e74c3c"
            onPress={() => handleFeaturePress('DeptPatientScanner')}
          />
          <ModernFeatureCard
            title="Inventory Scanner"
            subtitle="Stock scanning"
            icon="barcode-scan"
            color="#f39c12"
            onPress={() => handleFeaturePress('InventoryScanner')}
          />
          <ModernFeatureCard
            title="Department Access"
            subtitle="View all departments"
            icon="hospital-building"
            color="#9b59b6"
            onPress={() => handleFeaturePress('AccessDepartment')}
          />
          <ModernFeatureCard
            title="Usage Analytics"
            subtitle="Historical data"
            icon="chart-line"
            color="#1abc9c"
            onPress={() => handleFeaturePress('InventoryHistory')}
          />
        </View>
      </ScrollView>
    </Surface>
  );

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
                onPress={() => fetchDepartmentAnalytics(userRole)}
                style={styles.refreshButton}
              />
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView style={styles.mainScrollView} showsVerticalScrollIndicator={false}>
        {/* Analytics Card */}
        <View style={styles.analyticsContainer}>
          <DepartmentUsageAnalyticsCard onChartPress={(chartType) => handleFeaturePress('DeptAnalyticsScreen', { chartType })} />
        </View>

        {userRole === 'admin' ? (
          renderAdminDashboard()
        ) : (
          <>
            {/* Department Stats Grid */}
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

            {/* Department Dashboard */}
            <Surface style={styles.dashboardContainer} elevation={4}>
              <View style={[styles.headerContainer, { backgroundColor: getDepartmentColor(userRole) }]}>
                <View style={styles.headerContent}>
                  <View style={styles.headerLeft}>
                    <View style={styles.iconContainer}>
                      <Icon name={getDepartmentIcon(userRole)} size={32} color="#ffffff" />
                    </View>
                    <View>
                      <Text style={styles.headerTitle}>{userRole.toUpperCase()} DEPARTMENT</Text>
                      <Text style={styles.headerSubtitle}>Department Operations</Text>
                    </View>
                  </View>
                  <View style={styles.headerRight}>
                    {departmentStats.criticalAlerts > 0 && (
                      <Badge style={styles.alertBadge}>{departmentStats.criticalAlerts}</Badge>
                    )}
                  </View>
                </View>
              </View>

              <ScrollView style={styles.cardsScrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.modernGrid}>
                  <ModernFeatureCard
                    title="Patient Scanner"
                    subtitle="Scan patient codes"
                    icon="qrcode-scan"
                    color="#e74c3c"
                    onPress={() => handleFeaturePress('DeptPatientScanner', userRole, { department: userRole })}
                  />
                  <ModernFeatureCard
                    title="Transfer History"
                    subtitle="Track transfers"
                    icon="swap-horizontal"
                    color="#3498db"
                    onPress={() => navigation.navigate('DeptTransferHistory')}
                  />
                  <ModernFeatureCard
                    title="Local Inventory"
                    subtitle="Department stock"
                    icon="package-variant"
                    color="#2ecc71"
                    badge={departmentStats.criticalAlerts}
                    onPress={() => handleFeaturePress('DeptLocalInventory', userRole, { department: userRole })}
                  />
                  <ModernFeatureCard
                    title="Usage History"
                    subtitle="Track consumption"
                    icon="history"
                    color="#f39c12"
                    onPress={() => handleFeaturePress('DeptUsageHistory', userRole, { department: userRole })}
                  />
                </View>
              </ScrollView>
            </Surface>
          </>
        )}
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
  welcomeHeader: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
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
  mainScrollView: {
    flex: 1,
  },
  analyticsContainer: {
    paddingHorizontal: 20,
    marginTop: -10,
  },
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
  },
  alertBadge: {
    backgroundColor: '#ffffff',
    color: '#e74c3c',
  },
  cardsScrollView: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  modernGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  modernCard: {
    width: (width - 72) / 2,
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

export default Dashboard;
