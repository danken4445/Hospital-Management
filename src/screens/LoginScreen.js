import React, { useState } from 'react';
import { View, Alert, StyleSheet, Image } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator, Provider as PaperProvider } from 'react-native-paper';
import { auth } from '../../firebaseConfig'; // Adjust the import path as needed
import { signInWithEmailAndPassword } from 'firebase/auth'; // Import signInWithEmailAndPassword

const LoginScreen = ({ navigation }) => {
  const [departmentID, setDepartmentID] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, departmentID, password);
      Alert.alert('Success', 'Logged in successfully!');
      navigation.navigate('Dashboard'); // Redirect to the dashboard screen
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
        <Text style={styles.title}>Staff Login</Text>

        <TextInput
          label="Department ID"
          value={departmentID}
          onChangeText={setDepartmentID}
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
