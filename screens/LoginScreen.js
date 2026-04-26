import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { isGoogleAuthConfiguredForPlatform } from '../googleAuthConfig';

const FIREBASE_CHECKLIST =
  '1. console.firebase.google.com/project/match-tennis-app-c65eb/firestore\n' +
  '2. Datenbank existiert? Nein → "Datenbank erstellen" (Native-Modus)\n' +
  '3. Tab "Regeln" → ersetzen mit: match /{document=**} { allow read, write: if true; }\n' +
  '4. "Veröffentlichen" klicken\n' +
  '5. App Check: Wenn "Erzwingen" für Firestore an → deaktivieren';

export default function LoginScreen({ navigation }) {
  const googleAuthConfigured = isGoogleAuthConfiguredForPlatform();

  const { login, sendPasswordReset, signInWithGoogleIdToken } = useAuth();
  const { t } = useLanguage();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleForgotPassword = async () => {
    const emailToUse = email.trim();
    if (!emailToUse) {
      Alert.alert(t('auth.loginTitle'), t('auth.resetPasswordPrompt'));
      return;
    }
    try {
      setSubmitting(true);
      await sendPasswordReset(emailToUse);
      Alert.alert(t('auth.loginTitle'), t('auth.resetPasswordSent'));
    } catch (error) {
      Alert.alert(t('auth.loginTitle'), error.message || t('auth.errorGeneric'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert(t('auth.loginTitle'), t('auth.errorRequired'));
      return;
    }

    try {
      setSubmitting(true);
      await login(email, password);
    } catch (error) {
      Alert.alert(t('auth.loginTitle'), error.message || t('auth.errorGeneric'));
    } finally {
      setSubmitting(false);
    }
  };

  const testFirestoreConnection = async () => {
    try {
      await getDoc(doc(db, '_connection_test', 'ping'));
      Alert.alert('Firestore OK', 'Verbindung funktioniert. Die Regeln sind korrekt.');
    } catch (err) {
      const msg = err?.code === 'permission-denied' || err?.message?.includes('permission')
        ? `Permission-Denied\n\n${FIREBASE_CHECKLIST}`
        : err?.message || String(err);
      Alert.alert('Firestore Fehler', msg);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>{t('auth.loginTitle')}</Text>

        <Text style={[styles.label, { color: colors.text }]}>{t('auth.email')}</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@email.com"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={[styles.label, { color: colors.text }]}>{t('auth.password')}</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
          secureTextEntry
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={[
            styles.primaryButton,
            { backgroundColor: colors.primary },
            submitting && styles.disabledButton,
          ]}
          onPress={handleLogin}
          disabled={submitting}
        >
          <Text style={styles.primaryButtonText}>{t('auth.login')}</Text>
        </TouchableOpacity>

        <Text style={[styles.orText, { color: colors.textSecondary }]}>{t('auth.or')}</Text>

        <GoogleSignInButton
          mode="signIn"
          label={t('auth.googleSignIn')}
          disabled={submitting}
          onIdToken={async (idToken) => {
            try {
              setSubmitting(true);
              await signInWithGoogleIdToken(idToken);
            } catch (error) {
              Alert.alert(t('auth.loginTitle'), error.message || t('auth.errorGeneric'));
            } finally {
              setSubmitting(false);
            }
          }}
          onError={(msg) => Alert.alert(t('auth.loginTitle'), msg)}
        />

        {!googleAuthConfigured ? (
          <Text style={[styles.configHint, { color: colors.textMuted || colors.textSecondary }]}>
            {t('settings.googleNotConfigured')}
          </Text>
        ) : null}

        <TouchableOpacity
          style={styles.linkButton}
          onPress={handleForgotPassword}
          disabled={submitting}
        >
          <Text style={[styles.linkText, { color: colors.primary }]}>{t('auth.forgotPassword')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('Signup')}
          disabled={submitting}
        >
          <Text style={[styles.linkText, { color: colors.primary }]}>{t('auth.noAccount')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.linkButton, { marginTop: 24 }]}
          onPress={testFirestoreConnection}
          disabled={submitting}
        >
          <Text style={[styles.linkText, { color: colors.primary, fontSize: 12, opacity: 0.7 }]}>
            Firestore-Verbindung testen
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    backgroundColor: '#fafafa',
  },
  primaryButton: {
    backgroundColor: '#6FD08B',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  linkButton: {
    alignItems: 'center',
  },
  linkText: {
    color: '#6FD08B',
    fontWeight: '600',
  },
  orText: {
    textAlign: 'center',
    marginVertical: 12,
    fontSize: 14,
  },
  configHint: {
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 8,
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
});
