import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Google Sign-In (Firebase Auth)
 *
 * 1. Firebase Console → Authentication → Sign-in method → Google → aktivieren
 * 2. Web-Client-ID: app.json → expo.extra.googleWebClientId ODER unten als Fallback.
 */
const fromExpoExtra = Constants.expoConfig?.extra?.googleWebClientId;
const fromExpoAndroidExtra = Constants.expoConfig?.extra?.googleAndroidClientId;
const fromExpoIosExtra = Constants.expoConfig?.extra?.googleIosClientId;
const fromExpoClientExtra = Constants.expoConfig?.extra?.googleExpoClientId;
export const GOOGLE_WEB_CLIENT_ID =
  (typeof fromExpoExtra === 'string' && fromExpoExtra.trim() !== '')
    ? fromExpoExtra.trim()
    : '';

export const GOOGLE_ANDROID_CLIENT_ID =
  (typeof fromExpoAndroidExtra === 'string' && fromExpoAndroidExtra.trim() !== '')
    ? fromExpoAndroidExtra.trim()
    : '';

export const GOOGLE_IOS_CLIENT_ID =
  (typeof fromExpoIosExtra === 'string' && fromExpoIosExtra.trim() !== '')
    ? fromExpoIosExtra.trim()
    : '';

export const GOOGLE_EXPO_CLIENT_ID =
  (typeof fromExpoClientExtra === 'string' && fromExpoClientExtra.trim() !== '')
    ? fromExpoClientExtra.trim()
    : GOOGLE_WEB_CLIENT_ID;

export const isGoogleAuthConfiguredForPlatform = () => {
  const hasSharedClient = Boolean(GOOGLE_WEB_CLIENT_ID || GOOGLE_EXPO_CLIENT_ID);
  if (!hasSharedClient) {
    return false;
  }
  const appOwnership = Constants.appOwnership;
  if (appOwnership === 'expo') {
    return Boolean(GOOGLE_EXPO_CLIENT_ID || GOOGLE_WEB_CLIENT_ID);
  }
  if (Platform.OS === 'android') {
    return Boolean(GOOGLE_ANDROID_CLIENT_ID);
  }
  if (Platform.OS === 'ios') {
    return Boolean(GOOGLE_IOS_CLIENT_ID);
  }
  return true;
};
