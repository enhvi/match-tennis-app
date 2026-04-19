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
import { useAuth } from '../context/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { GOOGLE_WEB_CLIENT_ID } from '../googleAuthConfig';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export default function SignupScreen({ navigation }) {
  const { signup, signInWithGoogleIdToken } = useAuth();
  const { t } = useLanguage();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSignup = async () => {
    if (!email.trim() || !password || !username.trim()) {
      Alert.alert(t('auth.signupTitle'), t('auth.errorRequired'));
      return;
    }
    if (password.length < 6) {
      Alert.alert(t('auth.signupTitle'), t('auth.errorPassword'));
      return;
    }

    try {
      setSubmitting(true);
      await signup(email, password, username);
    } catch (error) {
      Alert.alert(t('auth.signupTitle'), error.message || t('auth.errorGeneric'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>{t('auth.signupTitle')}</Text>

        <Text style={[styles.label, { color: colors.text }]}>{t('auth.username')}</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
          autoCapitalize="none"
          placeholder="username"
          value={username}
          onChangeText={setUsername}
        />

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
          style={[styles.primaryButton, submitting && styles.disabledButton]}
          onPress={handleSignup}
          disabled={submitting}
        >
          <Text style={styles.primaryButtonText}>{t('auth.signup')}</Text>
        </TouchableOpacity>

        <Text style={[styles.orText, { color: colors.textSecondary }]}>{t('auth.or')}</Text>

        <GoogleSignInButton
          mode="signIn"
          label={t('auth.googleSignUp')}
          disabled={submitting}
          onIdToken={async (idToken) => {
            try {
              setSubmitting(true);
              await signInWithGoogleIdToken(idToken);
            } catch (error) {
              Alert.alert(t('auth.signupTitle'), error.message || t('auth.errorGeneric'));
            } finally {
              setSubmitting(false);
            }
          }}
          onError={(msg) => Alert.alert(t('auth.signupTitle'), msg)}
        />

        {!GOOGLE_WEB_CLIENT_ID ? (
          <Text style={[styles.configHint, { color: colors.textMuted || colors.textSecondary }]}>
            {t('settings.googleNotConfigured')}
          </Text>
        ) : null}

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('Login')}
          disabled={submitting}
        >
          <Text style={[styles.linkText, { color: colors.primary }]}>{t('auth.haveAccount')}</Text>
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
