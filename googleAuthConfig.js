import Constants from 'expo-constants';

/**
 * Google Sign-In (Firebase Auth)
 *
 * 1. Firebase Console → Authentication → Sign-in method → Google → aktivieren
 * 2. Web-Client-ID: app.json → expo.extra.googleWebClientId ODER unten als Fallback.
 */
const fromExpoExtra = Constants.expoConfig?.extra?.googleWebClientId;
export const GOOGLE_WEB_CLIENT_ID =
  (typeof fromExpoExtra === 'string' && fromExpoExtra.trim() !== '')
    ? fromExpoExtra.trim()
    : '';
