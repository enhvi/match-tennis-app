import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Share,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const appVersion =
  Constants.expoConfig?.version ||
  Constants.manifest?.version ||
  Constants.nativeAppVersion ||
  '0.3.2';

const HEADER_HEIGHT = Platform.select({ ios: 44, android: 56 });

export default function MenuScreen({ navigation }) {
  const { t } = useLanguage();
  const { friendRequests = [] } = useApp();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const friendRequestCount = friendRequests?.length || 0;

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: t('share.message'),
        title: t('share.title'),
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Shared with activity type of result.activityType
          console.log('Shared via:', result.activityType);
        } else {
          // Shared
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        // Dismissed
        console.log('Share dismissed');
      }
    } catch (error) {
      Alert.alert('Error', t('share.error'));
      console.error('Error sharing:', error);
    }
  };

  const menuItems = [
    {
      id: 'friends',
      title: t('menu.friends'),
      icon: '👥',
      screen: 'Friends',
      onPress: () => {
        console.log('Friends button pressed');
        navigation.navigate('Friends');
      },
    },
    {
      id: 'share',
      title: t('menu.share'),
      icon: '📤',
      screen: 'Share',
      onPress: handleShare,
    },
    {
      id: 'settings',
      title: t('menu.options'),
      icon: '⚙️',
      screen: 'Settings',
      onPress: () => {
        navigation.navigate('Settings');
      },
    },
    {
      id: 'account',
      title: t('menu.account'),
      icon: '🔐',
      screen: 'Account',
      onPress: () => {
        navigation.navigate('Account');
      },
    },
    {
      id: 'about',
      title: t('menu.about'),
      icon: 'ℹ️',
      screen: 'About',
      onPress: () => {
        // TODO: Navigate to About screen when implemented
        console.log('About - Coming soon');
      },
    },
  ];

  const headerTotalHeight = insets.top + HEADER_HEIGHT;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { height: headerTotalHeight, paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{t('menu.title')}</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: 24 + insets.bottom }]}
      >
        {menuItems.map((item) => {
          const showBadge = item.id === 'friends' && friendRequestCount > 0;
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => {
                console.log(`Menu item pressed: ${item.id}`);
                item.onPress();
              }}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <Text style={styles.menuItemIcon}>{item.icon}</Text>
                <Text style={[styles.menuItemTitle, { color: colors.text }]}>{item.title}</Text>
                  {showBadge && (
                  <View style={styles.menuBadge}>
                    <Text style={styles.menuBadgeText}>
                      {friendRequestCount > 9 ? '9+' : friendRequestCount}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.menuItemArrow}>›</Text>
            </TouchableOpacity>
          );
        })}
        <Text style={[styles.versionText, { color: colors.textMuted }]}>v{appVersion}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    justifyContent: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    backgroundColor: '#6FD08B',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: HEADER_HEIGHT,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 10,
    paddingBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  menuItemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  menuBadge: {
    marginLeft: 10,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ff9800',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  menuBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  menuItemArrow: {
    fontSize: 24,
    color: '#7f8c8d',
    fontWeight: '300',
  },
  versionText: {
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'center',
    marginTop: 20,
  },
});
