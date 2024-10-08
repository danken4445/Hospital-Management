import React, { useState } from 'react';
import { View, Alert, StyleSheet, Image } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator, Provider as PaperProvider } from 'react-native-paper';
import { auth, database } from '../../firebaseConfig'; // Ensure the correct path
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ref, get } from 'firebase/database';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      // Sign in with email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user role and department from Firebase Realtime Database
      const userRef = ref(database, `users/${user.uid}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();

        // Check user role and navigate accordingly
        switch (userData.role) {
          case 'admin':
            navigation.navigate('Dashboard'); // Admin Dashboard
            break;
          case 'csr':
            navigation.navigate('CSRdashboardScreen'); // CSR-specific screen
            break;
          case 'pharmacy':
            navigation.navigate('PharmacyScreen'); // Pharmacy-specific screen
            break;
          case 'ICU':
            navigation.navigate('ICUdashboard'); // ICU-specific screen
            break;
          case 'inpatient':
            navigation.navigate('InpatientsScreen'); // Inpatients-specific screen
            break;
          default:
            Alert.alert('Access Denied', 'You do not have permission to access this app.');
        }
      } else {
        Alert.alert('Error', 'User data not found.');
      }
    } catch (error) {
      console.error('Error during login:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Image source={require('../../assets/hospitalmanagementsys.png')} style={styles.logo} />
        <Text style={styles.title}>Staff Login</Text>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          mode="outlined"
          style={styles.input}
          theme={{ colors: { primary: themeColors.primary, text: themeColors.text } }}
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          mode="outlined"
          style={styles.input}
          theme={{ colors: { primary: themeColors.primary, text: themeColors.text } }}
        />

        {loading ? (
          <ActivityIndicator animating={true} size="large" color={themeColors.primary} />
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
  primary: '#7a0026',
  accent: '#b3003a',
  text: '#fff',
  background: '#fff',
  buttonText: '#fff',
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
    height: 150,
    marginBottom: 10,
    marginTop:24
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: themeColors.primary,
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
  forgotPassword: {
    marginTop: 10,
    width: '100%',
    color: themeColors.primary,
  },
});

export default LoginScreen;
