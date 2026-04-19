import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { GOOGLE_WEB_CLIENT_ID } from '../googleAuthConfig';
import { usesEmailPassword, usesGoogle } from '../utils/authProviders';

export default function AccountScreen({ navigation }) {
  const {
    profile,
    user,
    updateEmailWithPassword,
    updatePasswordWithPassword,
    sendPasswordReset,
    deleteAccountWithPassword,
    deleteAccountWithGoogleIdToken,
    logout,
  } = useAuth();
  const { t } = useLanguage();
  const { colors } = useTheme();
  const [email, setEmail] = useState(profile?.email || user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [showGoogleDeleteStep, setShowGoogleDeleteStep] = useState(false);

  const hasPassword = usesEmailPassword(user);
  const hasGoogle = usesGoogle(user);

  useEffect(() => {
    setEmail(profile?.email || user?.email || '');
  }, [profile, user]);

  const handleUpdateEmail = async () => {
    if (!currentPassword) {
      Alert.alert(t('settings.account'), t('settings.passwordRequired'));
      return;
    }

    try {
      setSaving(true);
      await updateEmailWithPassword(email, currentPassword);
      setCurrentPassword('');
      Alert.alert(t('settings.account'), t('settings.emailUpdated'));
    } catch (error) {
      Alert.alert(t('settings.account'), error.message || t('settings.emailError'));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword) {
      Alert.alert(t('settings.account'), t('settings.passwordRequired'));
      return;
    }

    if (!newPassword) {
      Alert.alert(t('settings.account'), t('settings.newPasswordRequired'));
      return;
    }

    try {
      setSaving(true);
      await updatePasswordWithPassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      Alert.alert(t('settings.account'), t('settings.passwordUpdated'));
    } catch (error) {
      Alert.alert(t('settings.account'), error.message || t('settings.passwordError'));
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      setSaving(true);
      await sendPasswordReset(email);
      Alert.alert(t('settings.account'), t('settings.resetSent'));
    } catch (error) {
      Alert.alert(t('settings.account'), error.message || t('settings.resetError'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('settings.deleteAccount'),
      t('settings.deleteWarning'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.deleteConfirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              setSaving(true);
              await deleteAccountWithPassword(currentPassword);
            } catch (error) {
              Alert.alert(t('settings.deleteAccount'), error.message || t('settings.deleteError'));
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  const runGoogleDelete = async (idToken) => {
    try {
      setSaving(true);
      await deleteAccountWithGoogleIdToken(idToken);
      setShowGoogleDeleteStep(false);
    } catch (error) {
      Alert.alert(t('settings.deleteAccount'), error.message || t('settings.deleteError'));
    } finally {
      setSaving(false);
    }
  };

  const promptGoogleDelete = () => {
    Alert.alert(t('settings.deleteAccount'), t('settings.deleteWarning'), [
      { text: t('common.cancel'), style: 'cancel', onPress: () => setShowGoogleDeleteStep(false) },
      {
        text: t('settings.deleteConfirm'),
        style: 'destructive',
        onPress: () => setShowGoogleDeleteStep(true),
      },
    ]);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>{t('settings.accountSubtitle')}</Text>

          {hasGoogle && !hasPassword && (
            <Text style={[styles.googleHint, { color: colors.textSecondary, marginBottom: 16 }]}>
              {t('settings.googleOnlyHint')}
            </Text>
          )}

          {!GOOGLE_WEB_CLIENT_ID && (
            <Text style={[styles.googleHint, { color: colors.warning || '#c0392b', marginBottom: 12 }]}>
              {t('settings.googleNotConfigured')}
            </Text>
          )}

          <Text style={[styles.label, { color: colors.text }]}>{t('settings.email')}</Text>
          {hasPassword ? (
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          ) : (
            <Text style={[styles.readOnlyEmail, { color: colors.text, marginBottom: 16 }]}>
              {user?.email || profile?.email || '—'}
            </Text>
          )}

          {hasPassword && (
            <>
              <Text style={[styles.subSectionTitle, { color: colors.text }]}>{t('settings.passwordSectionTitle')}</Text>

              <Text style={[styles.label, { color: colors.text }]}>{t('settings.currentPassword')}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="••••••••"
              />

              <Text style={[styles.label, { color: colors.text }]}>{t('settings.newPassword')}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="••••••••"
              />

              <TouchableOpacity
                style={[styles.primaryButton, saving && styles.disabledButton]}
                onPress={handleUpdateEmail}
                disabled={saving}
              >
                <Text style={styles.primaryButtonText}>{t('settings.updateEmail')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryButton, saving && styles.disabledButton]}
                onPress={handleUpdatePassword}
                disabled={saving}
              >
                <Text style={styles.secondaryButtonText}>{t('settings.updatePassword')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.linkButton, saving && styles.disabledButton]}
                onPress={handleResetPassword}
                disabled={saving}
              >
                <Text style={styles.linkButtonText}>{t('settings.resetPassword')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.dangerButton, saving && styles.disabledButton]}
                onPress={handleDeleteAccount}
                disabled={saving}
              >
                <Text style={styles.dangerButtonText}>{t('settings.deleteAccount')}</Text>
              </TouchableOpacity>
            </>
          )}

          {hasGoogle && !hasPassword && (
            <>
              {!showGoogleDeleteStep ? (
                <TouchableOpacity
                  style={[styles.dangerButton, saving && styles.disabledButton]}
                  onPress={promptGoogleDelete}
                  disabled={saving}
                >
                  <Text style={styles.dangerButtonText}>{t('settings.deleteAccount')}</Text>
                </TouchableOpacity>
              ) : (
                <GoogleSignInButton
                  mode="reauthenticate"
                  label={t('settings.googleDeleteLabel')}
                  disabled={saving}
                  onIdToken={runGoogleDelete}
                  onError={(msg) => Alert.alert(t('settings.deleteAccount'), msg)}
                />
              )}
            </>
          )}

          <TouchableOpacity
            style={[styles.logoutButton, saving && styles.disabledButton]}
            onPress={handleLogout}
            disabled={saving}
          >
            <Text style={styles.logoutButtonText}>{t('profile.logout')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 20,
  },
  readOnlyEmail: {
    fontSize: 16,
    paddingVertical: 4,
  },
  subSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 4,
  },
  googleHint: {
    fontSize: 13,
    lineHeight: 18,
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
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.7,
  },
  secondaryButton: {
    backgroundColor: '#7ed99a',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 14,
  },
  linkButtonText: {
    color: '#6FD08B',
    fontWeight: '600',
  },
  dangerButton: {
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e53935',
  },
  dangerButtonText: {
    color: '#e53935',
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e53935',
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#e53935',
    fontWeight: '600',
  },
});
