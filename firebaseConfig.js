// Import necessary Firebase modules
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

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

// Initialize Firebase only if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Auth with error handling
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} catch (error) {
  // If already initialized, get the existing instance
  auth = getAuth(app);
}

// Initialize other services
export const firestore = getFirestore(app);
export const database = getDatabase(app);

export { auth };
export default app;
