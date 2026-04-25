import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, serverTimestamp } from '../firebaseConfig';
import { useAuth } from './AuthContext';

const STORAGE_KEY = '@findamatch_notifications';

export const DEFAULT_PREFS = {
  friendRequest: true,
  matchRequest: true,
  matchConfirmed: true,
  matchDeclined: false,
  matchWithdrawn: true,
  matchCancelled: true,
  matchExpired: true,
  friendAccepted: true,
  matchReminder: true,
  /** 'start' = expire when slot start time reached; 'end' = when slot end time reached */
  requestExpiryTiming: 'start',
};

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          setPrefs({ ...DEFAULT_PREFS, ...parsed });
        } catch (e) {
          console.warn('Failed to parse notification prefs', e);
        }
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!user?.uid) return undefined;
    let cancelled = false;
    getDoc(doc(db, 'users', user.uid)).then((snap) => {
      if (cancelled || !snap.exists()) return;
      const remote = snap.data()?.notificationPrefs;
      if (remote && typeof remote === 'object') {
        const merged = { ...DEFAULT_PREFS, ...remote };
        setPrefs(merged);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  const updatePref = (key, value) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    if (user?.uid) {
      setDoc(
        doc(db, 'users', user.uid),
        { notificationPrefs: next, updatedAt: serverTimestamp() },
        { merge: true }
      ).catch((e) => console.warn('Failed to sync notification prefs', e));
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        prefs,
        updatePref,
        loaded,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
