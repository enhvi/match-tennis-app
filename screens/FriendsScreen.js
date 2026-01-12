import React, { useState } from 'react';
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
} from 'react-native';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

export default function FriendsScreen({ navigation }) {
  const { friends = [], friendRequests = [], sendFriendInvite, addFriendByCode, acceptFriendRequest, connected } = useApp();
  const { t } = useLanguage();
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friendCode, setFriendCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInviteFriend = async () => {
    try {
      setLoading(true);
      const inviteCode = await sendFriendInvite();
      const shareMessage = t('friends.inviteMessage', { code: inviteCode });
      
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

  const handleAddFriendByCode = async () => {
    if (!friendCode.trim()) {
      Alert.alert(t('friends.error'), t('friends.emptyCode'));
      return;
    }

    if (!connected) {
      Alert.alert(t('friends.error'), 'Not connected to server. Please check your connection.');
      return;
    }

    try {
      setLoading(true);
      await addFriendByCode(friendCode.toUpperCase().trim());
      setFriendCode('');
      setShowAddFriend(false);
      Alert.alert(t('friends.success'), t('friends.requestSent'));
    } catch (error) {
      Alert.alert(t('friends.error'), error.message || 'Unable to add friend');
      console.error('Error adding friend:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = (requestId) => {
    acceptFriendRequest(requestId);
    Alert.alert(t('friends.success'), t('friends.requestAccepted'));
  };

  console.log('FriendsScreen rendering, friends count:', friends.length);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t('friends.title')}</Text>

        {/* Add Friend Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddFriend(!showAddFriend)}
          >
            <Text style={styles.addButtonText}>
              {showAddFriend ? '−' : '+'} {t('friends.addFriend')}
            </Text>
          </TouchableOpacity>

          {showAddFriend && (
            <View style={styles.addFriendContainer}>
              <Text style={styles.addFriendTitle}>{t('friends.addByCode')}</Text>
              <TextInput
                style={styles.codeInput}
                placeholder={t('friends.enterCode')}
                value={friendCode}
                onChangeText={setFriendCode}
                autoCapitalize="characters"
                maxLength={10}
              />
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleAddFriendByCode}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? '...' : t('friends.sendRequest')}
                </Text>
              </TouchableOpacity>

              <View style={styles.divider}>
                <Text style={styles.dividerText}>{t('friends.or')}</Text>
              </View>

              <TouchableOpacity
                style={[styles.inviteButton, loading && styles.inviteButtonDisabled]}
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
            <Text style={styles.sectionTitle}>{t('friends.requests')}</Text>
            {friendRequests.map((request) => (
              <View key={request.id} style={styles.requestCard}>
                <View style={styles.requestInfo}>
                  <Text style={styles.requestName}>{request.name || request.from}</Text>
                  <Text style={styles.requestText}>{t('friends.wantsToAdd')}</Text>
                </View>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => handleAcceptRequest(request.id)}
                >
                  <Text style={styles.acceptButtonText}>{t('friends.accept')}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Friends List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('friends.myFriends')} ({friends.length})
          </Text>
          {friends.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>{t('friends.noFriends')}</Text>
              <Text style={styles.emptySubtext}>{t('friends.addFirstFriend')}</Text>
            </View>
          ) : (
            friends.map((friend) => (
              <View key={friend.id} style={styles.friendCard}>
                <View style={styles.friendInfo}>
                  <Text style={styles.friendName}>{friend.name}</Text>
                  {friend.email && (
                    <Text style={styles.friendEmail}>{friend.email}</Text>
                  )}
                  {friend.status === 'pending' && (
                    <Text style={styles.pendingBadge}>{t('friends.pending')}</Text>
                  )}
                </View>
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
  addButton: {
    backgroundColor: '#4CAF50',
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
  codeInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#2196F3',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  requestInfo: {
    flex: 1,
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
    backgroundColor: '#4CAF50',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  acceptButtonText: {
    color: '#fff',
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
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  friendEmail: {
    fontSize: 14,
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
