// Import necessary Firebase modules
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database'; // Import Realtime Database if needed

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAweN0wKRogH43dfla4RBtMbdSmJ_MaKh0",
  authDomain: "hospital-management-syst-315f8.firebaseapp.com",
  databaseURL: "https://hospital-management-syst-315f8-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "hospital-management-syst-315f8",
  storageBucket: "hospital-management-syst-315f8.appspot.com",
  messagingSenderId: "354772852092",
  appId: "1:354772852092:web:b812beaa4ade62246658f9",
  measurementId: "G-9D4XB73EFT"
};

// Initialize Firebase app only if it's not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase Authentication with AsyncStorage for persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firestore
const firestore = getFirestore(app);

// Initialize Realtime Database
const database = getDatabase(app);

export { auth, firestore, database };
