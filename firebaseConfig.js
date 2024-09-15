// firebaseConfig.js

import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { getFirestore } from 'firebase/firestore'; // Import Firestore

// Your web app's Firebase configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication with AsyncStorage for persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firestore
const firestore = getFirestore(app);

export { auth, firestore };
