import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';

// Your Firebase config (from GoogleService-Info.plist)
const firebaseConfig = {
  apiKey: "AIzaSyCrmfYJ0JFhc81GaRGgCEj-s6zXpo8PaIY",
  authDomain: "leaflens-yourproject.firebaseapp.com",
  projectId: "leaflens-4e327",
  storageBucket: "leaflens-4e327.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "your-ios-app-id",
  measurementId: "G-XXXXXXXXXX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage for persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export { auth };

