import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export default function NotificationsScreen({ navigation }) {
  const { notifications, markNotificationAsRead } = useApp();
  const { t, primaryLanguage } = useLanguage();
  const { colors } = useTheme();

  const getNotificationTitle = (item) => {
    switch (item.type) {
      case 'friendRequest':
        return item.fromName ? t('notifications.type.friendRequest') + ': ' + item.fromName : t('notifications.type.friendRequest');
      case 'matchRequest':
        return item.fromName ? t('notifications.type.matchRequest') + ': ' + item.fromName : t('notifications.type.matchRequest');
      case 'matchConfirmed':
        return t('notifications.type.matchConfirmed');
      case 'matchDeclined':
        return item.fromName ? t('notifications.type.matchDeclined') + ': ' + item.fromName : t('notifications.type.matchDeclined');
      case 'matchWithdrawn':
        return item.fromName ? t('notifications.type.matchWithdrawn') + ': ' + item.fromName : t('notifications.type.matchWithdrawn');
      case 'matchCancelled':
        return t('notifications.type.matchCancelled');
      case 'matchLateCancel':
        return t('notifications.type.matchLateCancel');
      case 'matchReminder':
        return t('notifications.type.matchReminder');
      case 'matchExpired':
        return t('notifications.type.matchExpired');
      case 'friendAccepted':
        return item.fromName ? t('notifications.type.friendAccepted') + ': ' + item.fromName : t('notifications.type.friendAccepted');
      default:
        return item.title || '';
    }
  };

  const getNotificationSubtext = (item) => {
    if (item.body) return item.body;
    switch (item.type) {
      case 'friendRequest':
        return item.fromName ? t('notifications.body.friendRequest', { name: item.fromName }) : '';
      case 'matchRequest':
        return item.sport && item.date ? t('notifications.body.matchRequest', { sport: item.sport, date: item.date }) : (item.sport || '');
      case 'matchConfirmed':
        return item.sport ? t('notifications.body.matchConfirmed', { sport: item.sport }) : '';
      case 'matchExpired':
        return item.sport && item.date ? t('notifications.body.matchExpired', { sport: item.sport, date: item.date }) : (item.sport || '');
      case 'matchWithdrawn':
        return item.body || (item.sport && item.date ? t('notifications.body.matchWithdrawn', { sport: item.sport, date: item.date }) : (item.sport || ''));
      case 'friendAccepted':
        return item.fromName ? t('notifications.body.friendAccepted', { name: item.fromName }) : '';
      default:
        return item.body || '';
    }
  };

  const handleNotificationPress = (item) => {
    if (!item.read) {
      markNotificationAsRead(item.id);
    }
    if (item.type === 'friendRequest' && item.relatedId) {
      navigation.navigate('Friends');
    } else if ((item.type === 'matchRequest' || item.type === 'matchConfirmed' || item.type === 'matchCancelled' || item.type === 'matchLateCancel' || item.type === 'matchExpired' || item.type === 'matchWithdrawn' || item.type === 'matchReminder') && item.requestId) {
      navigation.navigate('Requests', { requestId: item.requestId });
    } else if (item.type === 'friendAccepted' && item.relatedId) {
      navigation.navigate('Friends');
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp?.toDate) return '';
    const d = timestamp.toDate();
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return t('notifications.justNow');
    if (diffMins < 60) return t('notifications.minAgo', { n: diffMins });
    if (diffHours < 24) return t('notifications.hoursAgo', { n: diffHours });
    if (diffDays < 7) return t('notifications.daysAgo', { n: diffDays });
    const locale = primaryLanguage === 'de' ? 'de-DE' : 'en-US';
    return d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const renderItem = ({ item }) => {
    const unread = !item.read;
    return (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        {
          backgroundColor: unread ? (colors.card || '#f0f7ff') : (colors.card2 || colors.card || '#f5f5f5'),
        },
        unread && {
          borderLeftWidth: 4,
          borderLeftColor: colors.primary || '#6FD08B',
        },
      ]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationLeft}>
        <View style={styles.avatarWrapper}>
          {item.fromPhotoURL ? (
            <Image source={{ uri: item.fromPhotoURL }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {(item.fromName || item.fromUsername || '?').slice(0, 1).toUpperCase()}
              </Text>
            </View>
          )}
          {unread && (
            <View style={[styles.unreadDot, { backgroundColor: colors.primary || '#6FD08B' }]} />
          )}
        </View>
        <View style={styles.notificationContent}>
          <Text style={[styles.notificationTitle, { color: colors.text }]} numberOfLines={1}>
            {getNotificationTitle(item)}
          </Text>
          {(getNotificationSubtext(item)) ? (
            <Text style={[styles.notificationBody, { color: colors.textSecondary }]} numberOfLines={2}>
              {getNotificationSubtext(item)}
            </Text>
          ) : null}
          <Text style={[styles.notificationTime, { color: colors.textMuted }]}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t('notifications.empty')}
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
            {t('notifications.emptySubtext')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  notificationLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  avatarWrapper: {
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  notificationBody: {
    fontSize: 14,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});
