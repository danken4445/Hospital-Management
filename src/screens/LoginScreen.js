import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert, StyleSheet } from 'react-native';
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
    <Box flex={1} justifyContent="center" alignItems="center" bg="gray.100" px={4}>
      <VStack space={5} w="full" maxW="300px">
        <Text fontSize="2xl" textAlign="center" fontWeight="bold">
          Login
        </Text>

        <Input
          placeholder="Department ID"
          value={departmentID}
          onChangeText={setDepartmentID}
          keyboardType="email-address"
          w="full"
          bg="white"
          borderRadius="md"
          px={3}
          py={2}
        />

        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          w="full"
          bg="white"
          borderRadius="md"
          px={3}
          py={2}
        />

        <Button
          isLoading={loading}
          onPress={handleLogin}
          w="full"
          bg="blue.500"
          _text={{ color: 'white' }}
          borderRadius="md"
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>

        <HStack justifyContent="center">
          <Text color="blue.500" onPress={() => navigation.navigate('ForgotPassword')}>
            Forgot Password?
          </Text>
        </HStack>
      </VStack>
    </Box>
  );
};


export default LoginScreen;
