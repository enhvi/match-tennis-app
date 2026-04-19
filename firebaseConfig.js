import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore, serverTimestamp } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCNMEeozaWHClIBYqp3AS1Psj4pKLc1kX8',
  authDomain: 'match-tennis-app-c65eb.firebaseapp.com',
  projectId: 'match-tennis-app-c65eb',
  storageBucket: 'match-tennis-app-c65eb.firebasestorage.app',
  messagingSenderId: '1083932941306',
  appId: '1:1083932941306:android:a1c166c0e27d54158e6243',
};

if (!getApps().length) {
  const app = initializeApp(firebaseConfig);
  initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
}

const app = getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, serverTimestamp, storage };
