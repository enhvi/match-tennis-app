import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useMessages } from '../context/MessagesContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export default function MessagesScreen({ navigation }) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { friends = [] } = useApp();
  const { conversations, loading, listError } = useMessages();

  const friendMap = useMemo(() => {
    const m = {};
    friends.forEach((f) => {
      if (f?.id) m[f.id] = f;
    });
    return m;
  }, [friends]);

  const rows = useMemo(() => {
    return conversations.map((c) => {
      const f = friendMap[c.otherUserId];
      return {
        ...c,
        displayName: f?.displayName || f?.username || c.otherUserId || '',
        username: f?.username || '',
        photoURL: f?.photoURL || '',
      };
    });
  }, [conversations, friendMap]);

  const formatPreview = (c) => {
    const prev = c.lastMessagePreview || '';
    const mine = c.lastMessageSenderId === user?.uid;
    return mine ? `${t('messages.youPrefix')} ${prev}` : prev;
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() =>
        navigation.navigate('Chat', {
          friendId: item.otherUserId,
          friendName: item.displayName,
        })
      }
    >
      {item.photoURL ? (
        <Image source={{ uri: item.photoURL }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarLetter}>{(item.displayName || '?').slice(0, 1).toUpperCase()}</Text>
        </View>
      )}
      <View style={styles.rowBody}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {item.displayName || item.otherUserId}
        </Text>
        <Text style={[styles.preview, { color: colors.textSecondary }]} numberOfLines={2}>
          {formatPreview(item)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('messages.subtitle')}</Text>
      {listError ? (
        <Text style={[styles.errorBanner, { color: colors.warning || '#c0392b' }]}>{t('messages.listLoadError')}</Text>
      ) : null}
      {loading ? (
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      ) : rows.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('messages.emptyTitle')}</Text>
          <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>{t('messages.emptyBody')}</Text>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  subtitle: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13,
    lineHeight: 18,
  },
  errorBanner: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    fontSize: 13,
    lineHeight: 18,
  },
  loader: {
    marginTop: 32,
  },
  list: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  rowBody: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  preview: {
    fontSize: 14,
    lineHeight: 18,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyBody: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
