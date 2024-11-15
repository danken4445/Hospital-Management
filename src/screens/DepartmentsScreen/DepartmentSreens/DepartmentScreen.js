import React, { useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet, SafeAreaView, Dimensions, StatusBar, Text, ImageBackground, Platform } from 'react-native';
import FeatureCard from '../../../components/Card';
import Toast from 'react-native-toast-message';
import { auth, database } from '../../../../firebaseConfig'; // Adjust the import path if needed
import { ref, get } from 'firebase/database';
import DepartmentUsageAnalyticsCard from '../../../components/DeptUsageAnalytics';

const { height } = Dimensions.get('window');

const Dashboard = ({ navigation }) => {
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    // Fetch the logged-in user's role from the database
    const fetchUserRole = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setUserRole(userData.department); // Set the user role for dynamic rendering
        }
      }
    };

    fetchUserRole();
  }, []);

  const handleFeaturePress = (screenName, department, params = {}) => {
    Toast.show({
      type: 'success',
      position: 'bottom',
      text1: `Navigating to  ${screenName}`,
      visibilityTime: 3000,
      autoHide: true,
      bottomOffset: 40,
    });
    navigation.navigate(screenName, params);
  };

  // Render department-specific cards
  const renderDepartmentDashboard = (department) => {
    return (
      <View style={styles.featureCardContainer}>
        <Text style={styles.titleText}>{`${department} Dashboard`}</Text>
        <View style={styles.grid}>
          
          <FeatureCard
            title="Patient Scanner"
            icon={require('../../../../assets/patientScanner.png')}
            onPress={() => handleFeaturePress('DeptPatientScanner', { department })}
          />
          <FeatureCard
                title="Transfer History"
                icon={require('../../../../assets/stockTransfer.png')}
                onPress={() => navigation.navigate('DeptTransferHistory')}
              />
              <FeatureCard
            title="Local Inventory"
            icon={require('../../../../assets/inventory.png')}
            onPress={() => handleFeaturePress('DeptLocalInventory', { department })}
          />
          <FeatureCard
            title="Usage History"
            icon={require('../../../../assets/inventoryHistory.png')}
            onPress={() => handleFeaturePress('DeptUsageHistory', { department })}
          />
        </View>
      </View>
    );
  };

  return (
    <ImageBackground source={require('../../../../assets/background.png')} style={styles.imageBackground}>
      <SafeAreaView style={styles.safeAreaView}>
        <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent={true} />
        <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.scrollView}>
          <View style={styles.cardContainer}>
            <DepartmentUsageAnalyticsCard onChartPress={(chartType) => handleFeaturePress('DeptAnalyticsScreen', { chartType })} />
          </View>

          {/* Conditional rendering based on user role */}
          {userRole === 'admin' && (
            <View style={styles.featureCardContainer}>
              <Text style={styles.titleText}>ADMIN DASHBOARD</Text>
              <View style={styles.grid}>
                <FeatureCard
                  title="Inventory"
                  icon={require('../../../../assets/inventory.png')}
                  onPress={() => handleFeaturePress('InventoryScreen')}
                />
                <FeatureCard
                  title="Create an Account"
                  icon={require('../../../../assets/inventoryOverall.png')}
                  onPress={() => handleFeaturePress('CreateAccountScreen')}
                />
                <FeatureCard
                  title="Patient Scanner"
                  icon={require('../../../../assets/patientScanner.png')}
                  onPress={() => handleFeaturePress('DeptPatientScanner')}
                />
                <FeatureCard
                  title="Inventory Scanner"
                  icon={require('../../../../assets/inventoryScanner.png')}
                  onPress={() => handleFeaturePress('InventoryScanner')}
                />
                <FeatureCard
                  title="Access Department"
                  icon={require('../../../../assets/accessDept.png')}
                  onPress={() => handleFeaturePress('AccessDepartment')}
                />
                <FeatureCard
                  title="Inventory History"
                  icon={require('../../../../assets/inventoryHistory.png')}
                  onPress={() => handleFeaturePress('InventoryHistory')}
                />
              </View>
            </View>
          )}

 
      

          {/* Common dashboard for departments like ICU, Inpatient, ER, etc. */}
          {['ICU', 'ER', 'Inpatient', 'Outpatient'].includes(userRole) && renderDepartmentDashboard(userRole)}

        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  imageBackground: {
    flex: 1,
    resizeMode: 'cover',
  },
  safeAreaView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
    justifyContent: 'flex-start',
  },
  cardContainer: {
    marginTop: -26,
    elevation: 0,
  },
  featureCardContainer: {
    backgroundColor: 'rgba(251, 251, 249,1)',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 44,
    height: '80%',
    paddingTop: 34,
    paddingHorizontal: 10,
    borderTopLeftRadius: 64,
    borderTopRightRadius: 64,
    marginTop: -34,   
    paddingBottom: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: Platform.OS === 'ios' ? 20 : 10,
  },
  titleText: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: -21,
    color: 'maroon',
  },
});

export default Dashboard;
