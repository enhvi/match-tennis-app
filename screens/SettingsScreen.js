import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';

export default function SettingsScreen({ navigation }) {
  let languageContext;
  try {
    languageContext = useLanguage();
  } catch (error) {
    console.error('Language context error:', error);
    // Fallback if context not available
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text>Settings loading...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const { selectedLanguages, primaryLanguage, setLanguages, t, availableLanguages } = languageContext;
  const [tempSelected, setTempSelected] = useState([...selectedLanguages]);
  const [tempPrimary, setTempPrimary] = useState(primaryLanguage);

  const toggleLanguage = (langCode) => {
    if (tempSelected.includes(langCode)) {
      // If it's the primary language and there are other languages, don't allow removal
      if (langCode === tempPrimary && tempSelected.length > 1) {
        // Set another language as primary first
        const otherLang = tempSelected.find(l => l !== langCode);
        setTempPrimary(otherLang);
        setTempSelected(tempSelected.filter(l => l !== langCode));
      } else if (tempSelected.length > 1) {
        // Can remove if not primary or if it's the only one
        setTempSelected(tempSelected.filter(l => l !== langCode));
        if (langCode === tempPrimary) {
          const otherLang = tempSelected.find(l => l !== langCode);
          setTempPrimary(otherLang);
        }
      }
    } else {
      // Add language
      setTempSelected([...tempSelected, langCode]);
      if (tempSelected.length === 0) {
        setTempPrimary(langCode);
      }
    }
  };

  const setPrimary = (langCode) => {
    if (tempSelected.includes(langCode)) {
      setTempPrimary(langCode);
    }
  };

  const handleSave = () => {
    setLanguages(tempSelected, tempPrimary);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t('settings.title')}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.languages')}</Text>
          <Text style={styles.sectionSubtitle}>{t('settings.selectLanguages')}</Text>

          {availableLanguages.map((lang) => {
            const isSelected = tempSelected.includes(lang.code);
            const isPrimary = tempPrimary === lang.code;

            return (
              <View key={lang.code} style={styles.languageItem}>
                <TouchableOpacity
                  style={styles.languageRow}
                  onPress={() => toggleLanguage(lang.code)}
                >
                  <View style={styles.checkboxContainer}>
                    <View style={[
                      styles.checkbox,
                      isSelected && styles.checkboxSelected,
                    ]}>
                      {isSelected && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={[
                      styles.languageName,
                      isSelected && styles.languageNameSelected,
                    ]}>
                      {lang.nativeName} ({lang.name})
                    </Text>
                  </View>
                </TouchableOpacity>

                {isSelected && (
                  <TouchableOpacity
                    style={[
                      styles.primaryButton,
                      isPrimary && styles.primaryButtonActive,
                    ]}
                    onPress={() => setPrimary(lang.code)}
                  >
                    <Text style={[
                      styles.primaryButtonText,
                      isPrimary && styles.primaryButtonTextActive,
                    ]}>
                      {isPrimary ? '✓ Primary' : 'Set as Primary'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.saveButton}
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
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 30,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 20,
  },
  languageItem: {
    marginBottom: 15,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 15,
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#dee2e6',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  languageName: {
    fontSize: 16,
    color: '#2c3e50',
  },
  languageNameSelected: {
    fontWeight: '600',
    color: '#2e7d32',
  },
  primaryButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#e3f2fd',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  primaryButtonActive: {
    backgroundColor: '#4CAF50',
  },
  primaryButtonText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '600',
  },
  primaryButtonTextActive: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
