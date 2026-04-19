import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@findamatch_notifications';

const DEFAULT_PREFS = {
  friendRequest: true,
  matchConfirmed: true,
  matchRequest: true,
  matchDeclined: false,
  matchWithdrawn: true,
  matchCancelled: true,
  matchExpired: true,
  friendAccepted: true,
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

  const updatePref = (key, value) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
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
