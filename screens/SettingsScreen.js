import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { GOOGLE_WEB_CLIENT_ID } from '../googleAuthConfig';

export default function SettingsScreen({ navigation }) {
  const { primaryLanguage, setLanguages, t, availableLanguages } = useLanguage();
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const { prefs, updatePref } = useNotifications();
  const [selectedLanguage, setSelectedLanguage] = useState(primaryLanguage);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSave = () => {
    setLanguages([selectedLanguage], selectedLanguage);
    navigation.goBack();
  };

  const cardStyle = { backgroundColor: colors.card, borderColor: colors.border };
  const sectionLabelStyle = { color: colors.textSecondary };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Appearance */}
        <View style={[styles.card, cardStyle]}>
          <View style={[styles.sectionLabelRow, { borderLeftColor: colors.primary }]}>
            <Text style={[styles.sectionLabel, sectionLabelStyle]}>
              {t('settings.sectionAppearance')}
            </Text>
          </View>
          <View style={styles.toggleRow}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>
              {t('settings.darkMode')}
            </Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#ccc', true: colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Language */}
        <View style={[styles.card, cardStyle]}>
          <View style={[styles.sectionLabelRow, { borderLeftColor: colors.primary }]}>
            <Text style={[styles.sectionLabel, sectionLabelStyle]}>
              {t('settings.sectionLanguage')}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.dropdownButton, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
            onPress={() => setDropdownOpen(!dropdownOpen)}
          >
            <Text style={[styles.dropdownButtonText, { color: colors.text }]}>
              {availableLanguages.find((lang) => lang.code === selectedLanguage)?.nativeName ||
                selectedLanguage}
            </Text>
            <Text style={[styles.dropdownChevron, { color: colors.textSecondary }]}>
              {dropdownOpen ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>

          {dropdownOpen && (
            <View style={[styles.dropdownList, { backgroundColor: colors.card2 || colors.card, borderColor: colors.border }]}>
              {availableLanguages.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setSelectedLanguage(lang.code);
                    setDropdownOpen(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, { color: colors.text }]}>
                    {lang.nativeName}
                  </Text>
                  {selectedLanguage === lang.code && (
                    <Text style={[styles.checkmark, { color: colors.primary }]}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Google / account sign-in note */}
        <View style={[styles.card, cardStyle]}>
          <View style={[styles.sectionLabelRow, { borderLeftColor: colors.primary }]}>
            <Text style={[styles.sectionLabel, sectionLabelStyle]}>{t('settings.sectionAccountAuth')}</Text>
          </View>
          <Text style={[styles.googleSetupNote, { color: colors.textSecondary }]}>{t('settings.googleAccountSetupNote')}</Text>
          {!GOOGLE_WEB_CLIENT_ID ? (
            <Text style={[styles.googleSetupWarn, { color: colors.warning || '#c0392b', marginTop: 10 }]}>
              {t('settings.googleNotConfigured')}
            </Text>
          ) : null}
        </View>

        {/* Planning: when pending requests expire */}
        <View style={[styles.card, cardStyle]}>
          <View style={[styles.sectionLabelRow, { borderLeftColor: colors.primary }]}>
            <Text style={[styles.sectionLabel, sectionLabelStyle]}>
              {t('settings.sectionPlanning')}
            </Text>
          </View>
          <Text style={[styles.planningTitle, { color: colors.text }]}>{t('settings.requestExpiryTitle')}</Text>
          <Text style={[styles.planningHint, { color: colors.textSecondary }]}>
            {t('settings.requestExpiryHint')}
          </Text>
          {(['start', 'end']).map((value) => {
            const selected = (prefs.requestExpiryTiming || 'start') === value;
            return (
              <TouchableOpacity
                key={value}
                style={[
                  styles.radioRow,
                  {
                    borderColor: selected ? colors.primary : colors.border,
                    backgroundColor: selected ? colors.inputBg : 'transparent',
                  },
                ]}
                onPress={() => updatePref('requestExpiryTiming', value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.radioLabel, { color: colors.text }]}>
                  {value === 'start' ? t('settings.requestExpiry.start') : t('settings.requestExpiry.end')}
                </Text>
                {selected ? <Text style={[styles.radioCheck, { color: colors.primary }]}>✓</Text> : null}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Notifications */}
        <View style={[styles.card, cardStyle]}>
          <View style={[styles.sectionLabelRow, { borderLeftColor: colors.primary }]}>
            <Text style={[styles.sectionLabel, sectionLabelStyle]}>
              {t('settings.sectionNotifications')}
            </Text>
          </View>
          <View style={[styles.toggleRow, styles.toggleRowFirst]}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>{t('notifications.friendRequest')}</Text>
            <Switch value={prefs.friendRequest} onValueChange={(v) => updatePref('friendRequest', v)} trackColor={{ false: '#ccc', true: colors.primary }} thumbColor="#fff" />
          </View>
          <View style={styles.toggleRow}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>{t('notifications.matchRequest')}</Text>
            <Switch value={prefs.matchRequest} onValueChange={(v) => updatePref('matchRequest', v)} trackColor={{ false: '#ccc', true: colors.primary }} thumbColor="#fff" />
          </View>
          <View style={styles.toggleRow}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>{t('notifications.matchConfirmed')}</Text>
            <Switch value={prefs.matchConfirmed} onValueChange={(v) => updatePref('matchConfirmed', v)} trackColor={{ false: '#ccc', true: colors.primary }} thumbColor="#fff" />
          </View>
          <View style={styles.toggleRow}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>{t('notifications.friendAccepted')}</Text>
            <Switch value={prefs.friendAccepted} onValueChange={(v) => updatePref('friendAccepted', v)} trackColor={{ false: '#ccc', true: colors.primary }} thumbColor="#fff" />
          </View>
          <View style={styles.toggleRow}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>{t('notifications.matchCancelled')}</Text>
            <Switch value={prefs.matchCancelled} onValueChange={(v) => updatePref('matchCancelled', v)} trackColor={{ false: '#ccc', true: colors.primary }} thumbColor="#fff" />
          </View>
          <View style={styles.toggleRow}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>{t('notifications.matchExpired')}</Text>
            <Switch value={prefs.matchExpired} onValueChange={(v) => updatePref('matchExpired', v)} trackColor={{ false: '#ccc', true: colors.primary }} thumbColor="#fff" />
          </View>
          <View style={styles.toggleRow}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>{t('notifications.matchDeclined')}</Text>
            <Switch value={prefs.matchDeclined} onValueChange={(v) => updatePref('matchDeclined', v)} trackColor={{ false: '#ccc', true: colors.primary }} thumbColor="#fff" />
          </View>
          <View style={styles.toggleRow}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>{t('notifications.matchWithdrawn')}</Text>
            <Switch value={prefs.matchWithdrawn} onValueChange={(v) => updatePref('matchWithdrawn', v)} trackColor={{ false: '#ccc', true: colors.primary }} thumbColor="#fff" />
          </View>
          <View style={[styles.toggleRow, styles.toggleRowLast]}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>{t('notifications.matchReminder')}</Text>
            <Switch value={prefs.matchReminder !== false} onValueChange={(v) => updatePref('matchReminder', v)} trackColor={{ false: '#ccc', true: colors.primary }} thumbColor="#fff" />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>{t('common.ok')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  sectionLabelRow: {
    borderLeftWidth: 3,
    paddingLeft: 10,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  dropdownButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  dropdownChevron: {
    fontSize: 12,
  },
  dropdownList: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  dropdownItemText: {
    fontSize: 15,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  googleSetupNote: {
    fontSize: 13,
    lineHeight: 19,
  },
  googleSetupWarn: {
    fontSize: 13,
    lineHeight: 18,
  },
  planningTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  planningHint: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  radioLabel: {
    fontSize: 15,
    flex: 1,
    paddingRight: 8,
  },
  radioCheck: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128,128,128,0.2)',
  },
  toggleRowFirst: {
    borderTopWidth: 0,
    marginTop: 0,
    paddingTop: 0,
  },
  toggleRowLast: {
    paddingBottom: 0,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  saveButton: {
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
