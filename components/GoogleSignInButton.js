import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { useIdTokenAuthRequest } from 'expo-auth-session/providers/google';
import {
  GOOGLE_ANDROID_CLIENT_ID,
  GOOGLE_EXPO_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_WEB_CLIENT_ID,
  isGoogleAuthConfiguredForPlatform,
} from '../googleAuthConfig';

WebBrowser.maybeCompleteAuthSession();

/**
 * @param {'signIn' | 'reauthenticate'} props.mode
 * @param {(idToken: string) => Promise<void>} props.onIdToken
 * @param {(msg: string) => void} [props.onError]
 * @param {string} props.label
 */
function GoogleSignInConfiguredButton({ mode, onIdToken, onError, label, disabled }) {
  const [busy, setBusy] = useState(false);

  const [request, , promptAsync] = useIdTokenAuthRequest({
    expoClientId: GOOGLE_EXPO_CLIENT_ID || undefined,
    webClientId: GOOGLE_WEB_CLIENT_ID || undefined,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID || undefined,
    iosClientId: GOOGLE_IOS_CLIENT_ID || undefined,
    selectAccount: mode === 'signIn',
  });

  const handlePress = async () => {
    try {
      setBusy(true);
      const useExpoProxy = Constants.appOwnership === 'expo';
      const result = await promptAsync(useExpoProxy ? { useProxy: true } : undefined);
      if (result.type !== 'success') {
        if (result.type !== 'dismiss' && result.type !== 'cancel') {
          const message =
            result.error?.message ||
            result.params?.error_description ||
            result.params?.error ||
            'Google sign-in failed';
          onError?.(message);
        }
        return;
      }
      const idToken = result.params?.id_token;
      if (!idToken) {
        onError?.('No ID token from Google');
        return;
      }
      await onIdToken(idToken);
    } catch (e) {
      onError?.(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  };

  const configured = Boolean(request);

  return (
    <TouchableOpacity
      style={[styles.btn, (!configured || disabled || busy) && styles.btnDisabled]}
      onPress={handlePress}
      disabled={!configured || disabled || busy}
    >
      <View style={styles.row}>
        {busy ? (
          <ActivityIndicator color="#333" style={styles.spinner} />
        ) : (
          <Text style={styles.icon}>G</Text>
        )}
        <Text style={styles.text}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function GoogleSignInButton(props) {
  // Avoid startup crashes when required OAuth client ids are missing.
  if (!isGoogleAuthConfiguredForPlatform()) {
    return null;
  }
  return <GoogleSignInConfiguredButton {...props} />;
}

const styles = StyleSheet.create({
  btn: {
    borderWidth: 1,
    borderColor: '#dadce0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  btnDisabled: {
    opacity: 0.55,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4285F4',
    marginRight: 10,
    width: 22,
    textAlign: 'center',
  },
  spinner: {
    marginRight: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3c4043',
  },
});
