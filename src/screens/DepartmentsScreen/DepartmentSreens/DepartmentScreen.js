import React, { useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet, SafeAreaView, Dimensions, StatusBar, Text, ImageBackground, Platform } from 'react-native';
import FeatureCard from '../../../components/Card';
import Toast from 'react-native-toast-message';
import { auth, database } from '../../../../firebaseConfig'; // Adjust the import path if needed
import { ref, get } from 'firebase/database';
import DepartmentUsageAnalyticsCard from '../../../components/DeptUsageAnalytics';

const Dashboard = ({ navigation }) => {
  const [userRole, setUserRole] = useState('');
  const [departments, setDepartments] = useState([]); // State to hold department list

  useEffect(() => {
    // Fetch the logged-in user's role
    const fetchUserRole = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setUserRole(userData.department); // Set user department role
        }
      }
    };

    // Fetch all departments from Firebase
    const fetchDepartments = async () => {
      const departmentsRef = ref(database, 'departments');
      const snapshot = await get(departmentsRef);
      if (snapshot.exists()) {
        const departmentData = snapshot.val();
        const departmentList = Object.keys(departmentData);
        setDepartments(departmentList); // Store departments in state
      }
    };

    fetchUserRole();
    fetchDepartments();
  }, []);

  // Exclude these departments from the dynamic list
  const excludedDepartments = ['Admin', 'CSR', 'Pharmacy'];

  // Filter departments to exclude certain roles
  const filteredDepartments = departments.filter(dept => !excludedDepartments.includes(dept));

  // Render department-specific cards
  const renderDepartmentDashboard = (department) => {
    return (
      <View style={styles.featureCardContainer}>
        <Text style={styles.titleText}>{`${department} Dashboard`}</Text>
        <View style={styles.grid}>
          <FeatureCard
            title="Patient Scanner"
            icon={require('../../../../assets/patientScanner.png')}
            onPress={() => navigation.navigate('DeptPatientScanner', { department })}
          />
          <FeatureCard
            title="Transfer History"
            icon={require('../../../../assets/stockTransfer.png')}
            onPress={() => navigation.navigate('DeptTransferHistory')}
          />
          <FeatureCard
            title="Local Inventory"
            icon={require('../../../../assets/inventory.png')}
            onPress={() => navigation.navigate('DeptLocalInventory', { department })}
          />
          <FeatureCard
            title="Usage History"
            icon={require('../../../../assets/inventoryHistory.png')}
            onPress={() => navigation.navigate('DeptUsageHistory', { department })}
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
            <DepartmentUsageAnalyticsCard onChartPress={(chartType) => navigation.navigate('DeptAnalyticsScreen', { chartType })} />
          </View>

          {/* Render department dashboard for dynamic roles */}
          {filteredDepartments.includes(userRole) && renderDepartmentDashboard(userRole)}

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
