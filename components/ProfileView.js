import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProfileView({
  name = '',
  username = '',
  bio = '',
  photoURL = '',
  isEditable = false,
  onPickPhoto,
  displayNameValue = '',
  onChangeDisplayName,
  bioValue = '',
  onChangeBio,
  sports = [],
  availableSports = [],
  onToggleSport,
  friends = [],
  matchCount = 0,
  showSports = false,
  onToggleSports,
  showFriends = false,
  onToggleFriends,
  t,
  footer = null,
}) {
  const renderAvatar = () => {
    if (isEditable && onPickPhoto) {
      return (
        <TouchableOpacity onPress={onPickPhoto} style={styles.avatarButton} activeOpacity={0.8}>
          {photoURL ? (
            <Image source={{ uri: photoURL }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderText}>?</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    }

    return photoURL ? (
      <Image source={{ uri: photoURL }} style={styles.avatar} />
    ) : (
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarPlaceholderText}>?</Text>
      </View>
    );
  };

  const renderStat = (value, label, onPress) => {
    if (onPress) {
      return (
        <TouchableOpacity style={styles.statItem} onPress={onPress} activeOpacity={0.7}>
          <Text style={styles.statNumber}>{value}</Text>
          <Text style={styles.statLabel}>{label}</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    );
  };

  const renderSportsContent = () => {
    if (isEditable) {
      return (
        <View style={styles.sportsGrid}>
          {availableSports.map((sport) => {
            const selected = sports.includes(sport);
            return (
              <TouchableOpacity
                key={sport}
                style={[styles.sportChip, selected && styles.sportChipSelected]}
                onPress={() => onToggleSport?.(sport)}
              >
                <Text style={[styles.sportChipText, selected && styles.sportChipTextSelected]}>
                  {sport}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      );
    }

    if (sports.length === 0) {
      return <Text style={styles.emptyText}>{t('friendProfile.noSports')}</Text>;
    }

    return (
      <View style={styles.chipRow}>
        {sports.map((sport) => (
          <View key={sport} style={styles.chip}>
            <Text style={styles.chipText}>{sport}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderFriendsContent = () => {
    if (friends.length === 0) {
      return <Text style={styles.emptyText}>{t('friendProfile.noFriends')}</Text>;
    }

    return (
      <View style={styles.friendList}>
        {friends.map((friend) => (
          <View key={friend.id} style={styles.friendRow}>
            {friend.photoURL ? (
              <Image source={{ uri: friend.photoURL }} style={styles.friendAvatarSmall} />
            ) : (
              <View style={styles.friendAvatarPlaceholderSmall}>
                <Text style={styles.friendAvatarPlaceholderText}>?</Text>
              </View>
            )}
            <View style={styles.friendTextBlock}>
              <Text style={styles.friendName}>
                {friend.displayName || friend.username || friend.id}
              </Text>
              {friend.username ? (
                <Text style={styles.friendUsername}>@{friend.username}</Text>
              ) : null}
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        {renderAvatar()}
        <View style={styles.headerText}>
          {isEditable ? (
            <TextInput
              style={styles.nameInput}
              value={displayNameValue}
              onChangeText={onChangeDisplayName}
              placeholder={t('profile.namePlaceholder')}
            />
          ) : (
            <Text style={styles.nameText}>{name}</Text>
          )}
          <Text style={styles.usernameText}>@{username}</Text>
          {isEditable ? (
            <TextInput
              style={styles.bioInput}
              value={bioValue}
              onChangeText={onChangeBio}
              placeholder={t('profile.bioPlaceholder')}
              multiline
            />
          ) : bio ? (
            <Text style={styles.bioText}>{bio}</Text>
          ) : null}
          <View style={styles.statsRow}>
            {renderStat(sports.length, t('friendProfile.sports'), onToggleSports)}
            {renderStat(friends.length, t('friendProfile.friends'), onToggleFriends)}
            {renderStat(matchCount, t('friendProfile.matches'))}
          </View>
        </View>
      </View>

      {showSports && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isEditable ? t('profile.sportsTitle') : t('friendProfile.sports')}
          </Text>
          {renderSportsContent()}
        </View>
      )}

      {showFriends && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('friendProfile.friends')} ({friends.length})
          </Text>
          {renderFriendsContent()}
        </View>
      )}

      {footer}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
  },
  headerCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  avatarButton: {
    marginRight: 14,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e0e0e0',
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 24,
    color: '#666',
  },
  headerText: {
    flex: 1,
  },
  nameText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  nameInput: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    paddingBottom: 2,
  },
  usernameText: {
    fontSize: 13,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  bioText: {
    fontSize: 14,
    color: '#5f6c7b',
    marginBottom: 8,
  },
  bioInput: {
    fontSize: 13,
    color: '#5f6c7b',
    paddingVertical: 6,
    minHeight: 50,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statItem: {
    marginRight: 18,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  sportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  sportChip: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
  },
  sportChipSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#e8f5e9',
  },
  sportChipText: {
    color: '#2c3e50',
    fontSize: 13,
    fontWeight: '600',
  },
  sportChipTextSelected: {
    color: '#2e7d32',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    borderRadius: 16,
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    color: '#2e7d32',
    fontSize: 12,
    fontWeight: '600',
  },
  friendList: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 12,
    padding: 12,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e6e6e6',
  },
  friendAvatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    backgroundColor: '#e0e0e0',
  },
  friendAvatarPlaceholderSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendTextBlock: {
    flex: 1,
  },
  friendName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  friendUsername: {
    fontSize: 12,
    color: '#7f8c8d',
  },
});
