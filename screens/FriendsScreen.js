import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  Share,
  Image,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const SEARCH_DEBOUNCE_MS = 350;

export default function FriendsScreen({ navigation }) {
  const { colors } = useTheme();
  const {
    friends = [],
    friendRequests = [],
    sendFriendInvite,
    searchUsers,
    addFriendByUsername,
    acceptFriendRequest,
    declineFriendRequest,
    deleteFriendRequest,
    currentUser,
  } = useApp();
  const { t } = useLanguage();
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sentRequestIds, setSentRequestIds] = useState(new Set());
  const [addingId, setAddingId] = useState(null);
  const debounceRef = useRef(null);
  const [selectedSport, setSelectedSport] = useState('all');

  const availableSports = currentUser?.sports?.length
    ? currentUser.sports
    : ['Tennis', 'Padel', 'Golf', 'Basketball'];
  const sportOptions = ['all', ...availableSports];
  const filteredFriends =
    selectedSport === 'all'
      ? friends
      : friends.filter((friend) => friend.sports?.includes(selectedSport));

  const runSearch = useCallback(
    async (term) => {
      if (!term || term.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      setSearching(true);
      try {
        const results = await searchUsers(term);
        setSearchResults(results);
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    },
    [searchUsers]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      runSearch(searchQuery);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, runSearch]);

  const handleInviteFriend = async () => {
    try {
      setLoading(true);
      const inviteUsername = await sendFriendInvite();
      const shareMessage = t('friends.inviteMessage', { username: inviteUsername });
      
      const result = await Share.share({
        message: shareMessage,
        title: t('friends.inviteTitle'),
      });

      if (result.action === Share.sharedAction) {
        Alert.alert(t('friends.success'), t('friends.inviteSent'));
      }
    } catch (error) {
      Alert.alert(t('friends.error'), error.message || t('friends.inviteError'));
      console.error('Error sharing invite:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (user) => {
    const usernameToUse = user?.username || user?.id;
    if (!usernameToUse) return;

    setAddingId(user.id);
    try {
      await addFriendByUsername(usernameToUse);
      setSentRequestIds((prev) => new Set(prev).add(user.id));
      Alert.alert(t('friends.success'), t('friends.requestSent'));
    } catch (error) {
      Alert.alert(t('friends.error'), error.message || t('friends.requestError'));
      console.error('Error adding friend:', error);
    } finally {
      setAddingId(null);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await acceptFriendRequest(requestId);
      Alert.alert(t('friends.success'), t('friends.requestAccepted'));
    } catch (error) {
      Alert.alert(t('friends.error'), error.message || t('friends.requestError'));
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      await declineFriendRequest(requestId);
    } catch (error) {
      Alert.alert(t('friends.error'), error.message || t('friends.requestError'));
    }
  };

  const handleDeleteRequest = async (requestId) => {
    Alert.alert(
      t('friends.deleteRequest'),
      t('friends.deleteRequestConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('friends.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFriendRequest(requestId);
            } catch (error) {
              Alert.alert(t('friends.error'), error.message || t('friends.requestError'));
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Add Friend Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              setShowAddFriend(!showAddFriend);
              if (showAddFriend) {
                setSearchQuery('');
                setSearchResults([]);
                Keyboard.dismiss();
              }
            }}
          >
            <Text style={styles.addButtonText}>
              {showAddFriend ? '−' : '+'} {t('friends.addFriend')}
            </Text>
          </TouchableOpacity>

          {showAddFriend && (
            <View style={[styles.addFriendContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.addFriendTitle, { color: colors.text }]}>{t('friends.addByUsername')}</Text>
              <TextInput
                style={[styles.searchInput, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                placeholder={t('friends.searchPlaceholder')}
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
              />
              {searchQuery.trim().length > 0 && searchQuery.trim().length < 2 && (
                <Text style={[styles.searchHint, { color: colors.textSecondary }]}>{t('friends.searchMinChars')}</Text>
              )}
              {searching && (
                <View style={styles.searchingRow}>
                  <ActivityIndicator size="small" color="#6FD08B" />
                  <Text style={styles.searchingText}>...</Text>
                </View>
              )}
              {!searching && searchQuery.trim().length >= 2 && (
                <ScrollView style={styles.searchResults} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                  {searchResults.length === 0 ? (
                    <Text style={[styles.noResultsText, { color: colors.textSecondary }]}>{t('friends.noResults')}</Text>
                  ) : (
                    searchResults.map((user) => {
                      const isSent = sentRequestIds.has(user.id);
                      const isAdding = addingId === user.id;
                      return (
                        <TouchableOpacity
                          key={user.id}
                          style={[styles.searchResultItem, { borderBottomColor: colors.border }]}
                          onPress={() => navigation.navigate('FriendProfile', { friendId: user.id, friend: user })}
                          activeOpacity={0.7}
                        >
                          {user.photoURL ? (
                            <Image source={{ uri: user.photoURL }} style={styles.searchAvatar} />
                          ) : (
                            <View style={[styles.searchAvatarPlaceholder, { backgroundColor: colors.primary }]}>
                              <Text style={styles.searchAvatarText}>
                                {(user.displayName || user.username || '?')[0].toUpperCase()}
                              </Text>
                            </View>
                          )}
                          <View style={styles.searchResultInfo}>
                            <Text style={[styles.searchResultName, { color: colors.text }]} numberOfLines={1}>
                              {user.displayName || user.username || user.id}
                            </Text>
                            <Text style={[styles.searchResultUsername, { color: colors.textSecondary }]} numberOfLines={1}>
                              @{user.username || user.id}
                            </Text>
                          </View>
                          <TouchableOpacity
                            style={[
                              styles.addFriendBtn,
                              { backgroundColor: colors.primary },
                              (isSent || isAdding) && styles.addFriendBtnDisabled,
                            ]}
                            onPress={() => !isSent && !isAdding && handleAddFriend(user)}
                            disabled={isSent || isAdding}
                          >
                            <Text style={styles.addFriendBtnText}>
                              {isAdding ? '...' : isSent ? t('friends.requestSentShort') : t('friends.add')}
                            </Text>
                          </TouchableOpacity>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </ScrollView>
              )}

              <View style={styles.divider}>
                <Text style={[styles.dividerText, { color: colors.textSecondary }]}>{t('friends.or')}</Text>
              </View>

              <TouchableOpacity
                style={[styles.inviteButton, { backgroundColor: colors.primary }, loading && styles.inviteButtonDisabled]}
                onPress={handleInviteFriend}
                disabled={loading}
              >
                <Text style={styles.inviteButtonText}>
                  {loading ? '...' : t('friends.inviteViaShare')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Friend Requests */}
        {friendRequests && friendRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('friends.requests')}</Text>
            {friendRequests.map((request) => (
              <View key={request.id} style={[styles.requestCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.requestTopRow}>
                  <View style={styles.requestInfo}>
                    <Text style={[styles.requestName, { color: colors.text }]}>
                      {request.fromDisplayName || request.fromUsername || request.fromEmail || request.fromUid}
                    </Text>
                    <Text style={[styles.requestText, { color: colors.textSecondary }]}>{t('friends.wantsToAdd')}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.acceptButton, { backgroundColor: colors.primary }]}
                    onPress={() => handleAcceptRequest(request.id)}
                  >
                    <Text style={styles.acceptButtonText}>{t('friends.accept')}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.requestBottomRow}>
                  <TouchableOpacity
                    style={[styles.declineButton, { borderColor: colors.danger || '#e53935' }]}
                    onPress={() => handleDeclineRequest(request.id)}
                  >
                    <Text style={[styles.declineButtonText, { color: colors.danger || '#e53935' }]}>{t('friends.decline')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.deleteRequestButton, { borderColor: colors.danger || '#b71c1c' }]}
                    onPress={() => handleDeleteRequest(request.id)}
                  >
                    <Text style={[styles.deleteRequestButtonText, { color: colors.danger || '#b71c1c' }]}>{t('friends.delete')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Friends List */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('friends.myFriends')} ({friends.length})
          </Text>
          {friends.length > 0 && (
            <View style={styles.sportsFilterRow}>
              <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>{t('friends.filterBySport')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {sportOptions.map((sport) => {
                  const selected = selectedSport === sport;
                  return (
                    <TouchableOpacity
                      key={sport}
                      style={[
                        styles.sportChip,
                        { backgroundColor: colors.card, borderColor: colors.border },
                        selected && { borderColor: colors.primary, backgroundColor: 'rgba(111, 208, 139, 0.12)' },
                      ]}
                      onPress={() => setSelectedSport(sport)}
                    >
                      <Text style={[
                        styles.sportChipText,
                        { color: colors.text },
                        selected && { color: colors.primary },
                      ]}>
                        {sport === 'all' ? t('friends.allSports') : sport}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}
          {filteredFriends.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('friends.noFriends')}</Text>
              <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>{t('friends.addFirstFriend')}</Text>
            </View>
          ) : (
            filteredFriends.map((friend) => (
              <View
                key={friend.id}
                style={[styles.friendCard, styles.friendCardRow, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <TouchableOpacity
                  style={styles.friendCardMain}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('FriendProfile', { friendId: friend.id, friend })}
                >
                  <View style={styles.friendRow}>
                    {friend.photoURL ? (
                      <Image source={{ uri: friend.photoURL }} style={styles.friendAvatar} />
                    ) : (
                      <View style={[styles.friendAvatarPlaceholder, { backgroundColor: colors.primary }]}>
                        <Text style={styles.friendAvatarText}>?</Text>
                      </View>
                    )}
                    <View style={styles.friendInfo}>
                      <Text style={[styles.friendName, { color: colors.text }]}>
                        {friend.displayName || friend.username || friend.id}
                      </Text>
                      <Text style={[styles.friendUsername, { color: colors.textSecondary }]}>
                        @{friend.username || friend.id}
                      </Text>
                      {friend.bio ? (
                        <Text style={[styles.friendBio, { color: colors.textSecondary }]}>{friend.bio}</Text>
                      ) : null}
                      {friend.status === 'pending' && (
                        <Text style={styles.pendingBadge}>{t('friends.pending')}</Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.friendChatBtn}
                  onPress={() =>
                    navigation.navigate('Chat', {
                      friendId: friend.id,
                      friendName: friend.displayName || friend.username || friend.id,
                    })
                  }
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel={t('messages.openChat')}
                >
                  <Ionicons name="chatbubble-outline" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>
            ))
          )}
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
  sportsFilterRow: {
    marginBottom: 15,
  },
  filterLabel: {
    fontSize: 13,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  sportChip: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    backgroundColor: '#f8f9fa',
  },
  sportChipSelected: {
    borderColor: '#6FD08B',
    backgroundColor: '#e3f2fd',
  },
  sportChipText: {
    color: '#2c3e50',
    fontSize: 12,
    fontWeight: '600',
  },
  sportChipTextSelected: {
    color: '#5bb87a',
  },
  addButton: {
    backgroundColor: '#6FD08B',
    borderRadius: 8,
    padding: 18,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addFriendContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  addFriendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  searchHint: {
    fontSize: 13,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  searchingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  searchingText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  searchResults: {
    maxHeight: 220,
    marginBottom: 12,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: '#e0e0e0',
  },
  searchAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: '#6FD08B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchAvatarText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  searchResultUsername: {
    fontSize: 13,
    color: '#7f8c8d',
    marginTop: 2,
  },
  addFriendBtn: {
    backgroundColor: '#6FD08B',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  addFriendBtnDisabled: {
    backgroundColor: '#95a5a6',
  },
  addFriendBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  noResultsText: {
    fontSize: 14,
    color: '#7f8c8d',
    paddingVertical: 16,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#7ed99a',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    alignItems: 'center',
    marginVertical: 15,
  },
  dividerText: {
    color: '#7f8c8d',
    fontSize: 14,
  },
  inviteButton: {
    backgroundColor: '#25D366',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  inviteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  requestCard: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  requestTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestInfo: {
    flex: 1,
  },
  requestBottomRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  requestName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  requestText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  acceptButton: {
    backgroundColor: '#6FD08B',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  declineButton: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 12,
  },
  declineButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  deleteRequestButton: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  deleteRequestButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  friendCard: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  friendCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendCardMain: {
    flex: 1,
    minWidth: 0,
  },
  friendChatBtn: {
    paddingLeft: 8,
    paddingVertical: 4,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
    backgroundColor: '#e0e0e0',
  },
  friendAvatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendAvatarText: {
    fontSize: 20,
    color: '#666',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  friendUsername: {
    fontSize: 13,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  friendBio: {
    fontSize: 13,
    color: '#7f8c8d',
  },
  pendingBadge: {
    marginTop: 5,
    fontSize: 12,
    color: '#ff9800',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#95a5a6',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  inviteButtonDisabled: {
    opacity: 0.6,
  },
});
