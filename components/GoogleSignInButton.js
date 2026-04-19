import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useIdTokenAuthRequest } from 'expo-auth-session/providers/google';
import { GOOGLE_WEB_CLIENT_ID } from '../googleAuthConfig';

WebBrowser.maybeCompleteAuthSession();

/**
 * @param {'signIn' | 'reauthenticate'} props.mode
 * @param {(idToken: string) => Promise<void>} props.onIdToken
 * @param {(msg: string) => void} [props.onError]
 * @param {string} props.label
 */
export default function GoogleSignInButton({ mode, onIdToken, onError, label, disabled }) {
  const [busy, setBusy] = useState(false);

  const [request, , promptAsync] = useIdTokenAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID || undefined,
    selectAccount: mode === 'signIn',
  });

  const handlePress = async () => {
    try {
      setBusy(true);
      const result = await promptAsync();
      if (result.type !== 'success') {
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

  const configured = Boolean(GOOGLE_WEB_CLIENT_ID && request);

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
