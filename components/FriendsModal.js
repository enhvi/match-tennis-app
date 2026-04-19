import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function FriendsModal({
  visible,
  onClose,
  title,
  friends = [],
  onFriendPress,
  t,
}) {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) return friends;
    const q = searchQuery.trim().toLowerCase();
    return friends.filter(
      (f) =>
        (f.displayName || '').toLowerCase().includes(q) ||
        (f.username || '').toLowerCase().includes(q)
    );
  }, [friends, searchQuery]);

  const renderFriend = ({ item: friend }) => {
    const row = (
      <View style={[styles.friendRow, { borderBottomColor: colors.border }]}>
        {friend.photoURL ? (
          <Image source={{ uri: friend.photoURL }} style={styles.friendAvatar} />
        ) : (
          <View style={styles.friendAvatarPlaceholder}>
            <Text style={styles.friendAvatarText}>
              {(friend.displayName || friend.username || '?')[0].toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.friendTextBlock}>
          <Text style={[styles.friendName, { color: colors.text }]} numberOfLines={1}>
            {friend.displayName || friend.username || friend.id}
          </Text>
          {friend.username ? (
            <Text style={[styles.friendUsername, { color: colors.textSecondary }]} numberOfLines={1}>
              @{friend.username}
            </Text>
          ) : null}
        </View>
      </View>
    );
    return onFriendPress ? (
      <TouchableOpacity
        onPress={() => {
          onFriendPress(friend);
          onClose();
        }}
        activeOpacity={0.7}
      >
        {row}
      </TouchableOpacity>
    ) : (
      <View>{row}</View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={12}>
              <Text style={[styles.closeText, { color: colors.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={[
              styles.searchInput,
              { backgroundColor: colors.inputBg, color: colors.text },
            ]}
            placeholder={t('friends.searchPlaceholder')}
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {filteredFriends.length === 0 ? (
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {searchQuery.trim()
                  ? t('friends.noResults')
                  : t('friendProfile.noFriends')}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredFriends}
              renderItem={renderFriend}
              keyExtractor={(item) => item.id}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
    minHeight: 300,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
  },
  closeBtn: {
    padding: 4,
  },
  closeText: {
    fontSize: 22,
    color: '#7f8c8d',
    fontWeight: '300',
  },
  searchInput: {
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    fontSize: 16,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  friendAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
    backgroundColor: '#e0e0e0',
  },
  friendAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
    backgroundColor: '#6FD08B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendAvatarText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
  },
  friendTextBlock: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  friendUsername: {
    fontSize: 13,
    color: '#7f8c8d',
    marginTop: 2,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
    color: '#7f8c8d',
  },
});
