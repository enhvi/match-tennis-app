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
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';

export default function MenuScreen({ navigation }) {
  const { t } = useLanguage();

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
        // Close menu and navigate
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
        // Use a small delay to ensure menu closes
        setTimeout(() => {
          console.log('Navigating to Friends screen');
          navigation.navigate('Friends');
        }, 300);
      },
    },
    {
      id: 'matchHistory',
      title: t('menu.matchHistory'),
      icon: '📊',
      screen: 'MatchHistory',
      onPress: () => {
        // TODO: Navigate to Match History screen when implemented
        console.log('Match History - Coming soon');
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
      title: t('menu.settings'),
      icon: '⚙️',
      screen: 'Settings',
      onPress: () => {
        navigation.goBack();
        setTimeout(() => {
          navigation.navigate('Settings');
        }, 100);
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('menu.title')}</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => {
              console.log(`Menu item pressed: ${item.id}`);
              item.onPress();
            }}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemIcon}>{item.icon}</Text>
              <Text style={styles.menuItemTitle}>{item.title}</Text>
            </View>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#4CAF50',
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
  menuItemArrow: {
    fontSize: 24,
    color: '#7f8c8d',
    fontWeight: '300',
  },
});
