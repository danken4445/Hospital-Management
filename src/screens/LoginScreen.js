import React, { useState } from 'react';
import { View, Alert, StyleSheet, Image } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator, Provider as PaperProvider } from 'react-native-paper';
import { auth, database } from '../../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ref, get } from 'firebase/database';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const findUserClinic = async (userId) => {
    try {
      // First check if user exists in global users collection
      const globalUserRef = ref(database, `users/${userId}`);
      const globalUserSnapshot = await get(globalUserRef);
      
      if (globalUserSnapshot.exists()) {
        const globalUserData = globalUserSnapshot.val();
        if (globalUserData.clinicId || globalUserData.clinic) {
          return {
            clinic: globalUserData.clinicId || globalUserData.clinic,
            userData: globalUserData,
            source: 'global'
          };
        }
      }

      // If not found globally, search through all clinics
      const clinicsRef = ref(database, '/');
      const allDataSnapshot = await get(clinicsRef);
      const allData = allDataSnapshot.val();

      // Look for Clinic1, Clinic2, etc.
      const clinicKeys = Object.keys(allData || {}).filter(key => key.startsWith('Clinic'));
      
      for (const clinicKey of clinicKeys) {
        const clinicUserRef = ref(database, `${clinicKey}/users/${userId}`);
        const clinicUserSnapshot = await get(clinicUserRef);
        
        if (clinicUserSnapshot.exists()) {
          return {
            clinic: clinicKey,
            userData: clinicUserSnapshot.val(),
            source: 'clinic'
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Error finding user clinic:', error);
      return null;
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      // Sign in with email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Find which clinic the user belongs to
      const userInfo = await findUserClinic(user.uid);

      if (!userInfo) {
        Alert.alert('Error', 'User data not found in any clinic. Please contact administrator.');
        return;
      }

      const { clinic, userData, source } = userInfo;

      // Store clinic info for future use
      // You might want to use AsyncStorage or Context for this
      console.log(`User found in ${clinic} (source: ${source})`);

      // Navigate based on department and clinic
      navigateToScreen(userData, clinic);
      
    } catch (error) {
      console.error('Error during login:', error);
      
      // Better error handling
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      
      Alert.alert('Login Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const navigateToScreen = (userData, clinic) => {
    // Pass clinic information to all screens
    const navigationParams = {
      clinic: clinic,
      userRole: userData.role || userData.department,
      department: userData.department,
      permissions: userData.permissions || {}
    };

    // Check role first for admin accounts, then department for others
    const userRole = userData.role?.toLowerCase();
    const userDepartment = userData.department?.toLowerCase();

    // Navigate based on role (for admin) or department with clinic context
    if (userRole === 'admin') {
      navigation.navigate('AdminDashboard', navigationParams);
    } else {
      switch (userDepartment) {
        case 'csr':
          navigation.navigate('CSRdashboardScreen', navigationParams);
          break;
        case 'pharmacy':
          navigation.navigate('PharmaDashboard', navigationParams);
          break;
        case 'laboratory':
        case 'laboratories':
          navigation.navigate('DepartmentScreen', {
            ...navigationParams,
            department: 'Laboratory'
          });
          break;
        case 'icu':
        case 'intensive care unit':
          navigation.navigate('DepartmentScreen', {
            ...navigationParams,
            department: 'ICU'
          });
          break;
        case 'inpatient':
        case 'inpatient department':
          navigation.navigate('DepartmentScreen', {
            ...navigationParams,
            department: 'Inpatient'
          });
          break;
        case 'emergency':
        case 'emergency room':
        case 'er':
          navigation.navigate('DepartmentScreen', {
            ...navigationParams,
            department: 'Emergency'
          });
          break;
        default:
          // For any other departments
          navigation.navigate('DepartmentScreen', {
            ...navigationParams,
            department: userData.department || 'General'
          });
          break;
      }
    }
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Image source={require('../../assets/oddysseyTransparent.png')} style={styles.logo} />
        <Text style={styles.title}>Staff Login</Text>
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          mode="outlined"
          style={styles.input}
          theme={{ colors: { primary: themeColors.primary, text: themeColors.text } }}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!passwordVisible}
          mode="outlined"
          style={styles.input}
          theme={{ colors: { primary: themeColors.primary, text: themeColors.text } }}
          right={
            <TextInput.Icon
              icon={passwordVisible ? 'eye-off' : 'eye'}
              onPress={() => setPasswordVisible(!passwordVisible)}
            />
          }
        />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator animating={true} size="large" color={themeColors.primary} />
            <Text style={styles.loadingText}>Signing in...</Text>
          </View>
        ) : (
          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.button}
            labelStyle={{ color: themeColors.buttonText }}
            buttonColor={themeColors.primary}
          >
            Login
          </Button>
        )}
      </View>
    </PaperProvider>
  );
};

const themeColors = {
  primary: '#1C2B39',
  accent: '#D74610',
  text: '#fff',
  background: '#fff',
  buttonText: '#fff',
  secondary: '#7f8c8d',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'start',
    alignItems: 'center',
    padding: 20,
    backgroundColor: themeColors.background,
  },
  logo: {
    width: 300,
    height: 300,
    marginBottom: 2,
    marginTop: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: -34,
    marginBottom: 8,
    color: themeColors.primary,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    color: themeColors.secondary,
  },
  input: {
    width: '100%',
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    width: '100%',
    paddingVertical: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    marginTop: 10,
    color: themeColors.secondary,
    fontSize: 16,
  },

});

export default LoginScreen;
