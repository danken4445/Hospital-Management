import React, { useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet, SafeAreaView, Dimensions, StatusBar, Text, Platform } from 'react-native';
import { Card, Surface, IconButton, Badge, ActivityIndicator } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import UsageAnalyticsCard from '../../components/UsageAnalyticsCard';
import Toast from 'react-native-toast-message';
import { auth, database } from '../../../firebaseConfig';
import { ref, get, onValue, off } from 'firebase/database';

const { width, height } = Dimensions.get('window');

const Dashboard = ({ navigation }) => {
  const [userName, setUserName] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  
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
        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();
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
      // Fetch Users Count
      const usersRef = ref(database, 'users');
      const usersSnapshot = await get(usersRef);
      const usersCount = usersSnapshot.exists() ? Object.keys(usersSnapshot.val()).length : 0;

      // Fetch Patients Count
      const patientsRef = ref(database, 'patients');
      const patientsSnapshot = await get(patientsRef);
      const patientsCount = patientsSnapshot.exists() ? Object.keys(patientsSnapshot.val()).length : 0;

      // Fetch Inventory Count
      const inventoryRef = ref(database, 'inventory');
      const inventorySnapshot = await get(inventoryRef);
      let inventoryCount = 0;
      if (inventorySnapshot.exists()) {
        const inventoryData = inventorySnapshot.val();
        inventoryCount = Object.values(inventoryData).reduce((total, category) => {
          if (typeof category === 'object' && category !== null) {
            return total + Object.keys(category).length;
          }
          return total;
        }, 0);
      }

      // Fetch Usage History for efficiency calculation
      const usageRef = ref(database, 'usageHistory');
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
      const scansRef = ref(database, 'recentScans');
      const scansSnapshot = await get(scansRef);
      const recentScans = scansSnapshot.exists() ? Object.keys(scansSnapshot.val()).length : 0;

      // Calculate critical alerts (low stock items)
      let criticalAlerts = 0;
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
    navigation.navigate(screenName, params);
  };

  const handleUsageAnalyticsPress = (chartType) => {
    handleFeaturePress('UsageAnalyticsScreen', { chartType });
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
        {/* Welcome Header - Not sticky, scrolls with content */}
        <View style={styles.welcomeHeader}>
          <SafeAreaView>
            <View style={styles.welcomeContent}>
              <View style={styles.welcomeLeft}>
                <Text style={styles.greetingText}>{getGreeting()}</Text>
                <Text style={styles.userNameText}>{userName || 'Administrator'}</Text>
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
                  onPress={fetchDashboardAnalytics}
                  style={styles.refreshButton}
                />
              </View>
            </View>
          </SafeAreaView>
        </View>

        {/* Analytics Card */}
        <View style={styles.analyticsContainer}>
          <UsageAnalyticsCard onChartPress={handleUsageAnalyticsPress} />
        </View>

        {/* Real-time Stats Grid - FIXED */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>System Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              icon="account-group"
              value={dashboardStats.totalUsers}
              label="Total Users"
              color="#3498db"
              trend={5}
            />
            <StatCard
              icon="account-heart"
              value={dashboardStats.totalPatients}
              label="Patients"
              color="#e74c3c"
              trend={2}
            />
            <StatCard
              icon="package-variant"
              value={dashboardStats.totalInventoryItems}
              label="Inventory Items"
              color="#2ecc71"
              trend={-1}
            />
            <StatCard
              icon="hospital-building"
              value={dashboardStats.totalDepartments}
              label="Departments"
              color="#9b59b6"
            />
            <StatCard
              icon="qrcode-scan"
              value={dashboardStats.activeScans}
              label="Recent Scans"
              color="#f39c12"
            />
            <StatCard
              icon="chart-line"
              value={`${dashboardStats.systemEfficiency}%`}
              label="Efficiency"
              color="#1abc9c"
              trend={3}
            />
          </View>
        </View>

        {/* Quick Actions */}
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
                {dashboardStats.criticalAlerts > 0 && (
                  <Badge style={styles.alertBadge}>{dashboardStats.criticalAlerts}</Badge>
                )}
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
                onPress={() => handleFeaturePress('PatientScanner')}
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
                badge={dashboardStats.criticalAlerts}
                onPress={() => handleFeaturePress('InventoryHistory')}
              />
            </View>
          </ScrollView>
        </Surface>
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
  // Main ScrollView - this makes everything scrollable including header
  mainScrollView: {
    flex: 1,
  },
  // Welcome Header - no longer sticky
  welcomeHeader: {
    backgroundColor: '#34495e',
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
  analyticsContainer: {
    paddingHorizontal: 20,
    marginTop: -10,
  },
  // FIXED STATS GRID STYLES
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
    width: (width - 52) / 3, // Fixed calculation: total width - padding / 3 columns
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
    minHeight: 100, // Ensures consistent height
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
  // Dashboard container and other styles remain the same
  dashboardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    margin: 20,
    marginTop: 10,
  },
  headerContainer: {
    backgroundColor: '#34495e',
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
    backgroundColor: '#e74c3c',
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
