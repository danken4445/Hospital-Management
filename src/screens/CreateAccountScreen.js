import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator, Provider as PaperProvider, Menu } from 'react-native-paper';
import { auth, database } from '../../firebaseConfig'; // Adjust the import path
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Import Firebase Auth
import { ref, set, get } from 'firebase/database'; // Import Firebase Database functions

const CreateAccountScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // State to check if current user is admin

  const adminUID = 'VEsT3WTIvxZG5g1zlDcnlRAftVy1'; // Hardcoded admin UID based on the provided image

  // Check if the current user is an admin
  useEffect(() => {
    const checkIfAdmin = () => {
      const user = auth.currentUser;
      if (user && user.uid === adminUID) {
        setIsAdmin(true); // User is the admin
      } else {
        setIsAdmin(false); // User is not the admin
      }
    };
    checkIfAdmin();
  }, []);

  const handleCreateAccount = async () => {
    if (!isAdmin) {
      Alert.alert('Access Denied', 'You do not have permission to create accounts.');
      return;
    }

    if (!email || !password || !role) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      // Save user role and department in the database
      const userRef = ref(database, `users/${newUser.uid}`);
      await set(userRef, {
        uid: newUser.uid,
        email: email,
        role: role,
        department: role // Assuming the role is also the department
      });

      Alert.alert('Success', `Account created successfully for ${email} with role ${role}`);
      setEmail('');
      setPassword('');
      setRole('');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Access Denied. Only admins can create accounts.</Text>
      </View>
    );
  }

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Text style={styles.title}>Create New Account</Text>

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

        {/* Role Dropdown */}
        <RoleDropdown role={role} setRole={setRole} />

        {loading ? (
          <ActivityIndicator animating={true} size="large" color={themeColors.primary} />
        ) : (
          <Button
            mode="contained"
            onPress={handleCreateAccount}
            style={styles.button}
            labelStyle={{ color: themeColors.buttonText }}
            buttonColor={themeColors.primary}
          >
            Create Account
          </Button>
        )}
      </View>
    </PaperProvider>
  );
};

const RoleDropdown = ({ role, setRole }) => {
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    closeMenu();
  };

  return (
    <View style={styles.dropdownContainer}>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <Button onPress={openMenu} mode="outlined">
            {role ? role : "Select Role"}
          </Button>
        }
      >
        <Menu.Item onPress={() => handleRoleSelect('admin')} title="Admin" />
        <Menu.Item onPress={() => handleRoleSelect('csr')} title="CSR" />
        <Menu.Item onPress={() => handleRoleSelect('icu')} title="ICU" />
        <Menu.Item onPress={() => handleRoleSelect('inpatient')} title="Inpatient" />
        <Menu.Item onPress={() => handleRoleSelect('pharmacy')} title="Pharmacy" />
      </Menu>
    </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: themeColors.background,
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
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  dropdownContainer: {
    width: '100%',
    marginVertical: 10,
  },
});

export default CreateAccountScreen;
