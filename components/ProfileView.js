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
  onFriendsPress,
  onMatchesPress,
  onFriendPress,
  t,
  footer = null,
  colors: customColors,
}) {
  const colors = customColors || {
    background: '#fff',
    card: '#f8f9fa',
    cardBorder: '#dee2e6',
    text: '#2c3e50',
    textSecondary: '#7f8c8d',
  };
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
          <Text style={[styles.statNumber, { color: colors.text }]}>{value}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.statItem}>
        <Text style={[styles.statNumber, { color: colors.text }]}>{value}</Text>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
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

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={[styles.headerCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
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
            <Text style={[styles.nameText, { color: colors.text }]}>{name}</Text>
          )}
          <Text style={[styles.usernameText, { color: colors.textSecondary }]}>@{username}</Text>
          {isEditable ? (
            <TextInput
              style={styles.bioInput}
              value={bioValue}
              onChangeText={onChangeBio}
              placeholder={t('profile.bioPlaceholder')}
              multiline
            />
          ) : bio ? (
            <Text style={[styles.bioText, { color: colors.textSecondary }]}>{bio}</Text>
          ) : null}
          <View style={styles.statsRow}>
            {renderStat(sports.length, t('friendProfile.sports'), onToggleSports)}
            {renderStat(friends.length, t('friendProfile.friends'), onFriendsPress)}
            {renderStat(matchCount, t('friendProfile.matches'), onMatchesPress)}
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
    borderColor: '#6FD08B',
    backgroundColor: '#e3f2fd',
  },
  sportChipText: {
    color: '#2c3e50',
    fontSize: 13,
    fontWeight: '600',
  },
  sportChipTextSelected: {
    color: '#5bb87a',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    borderRadius: 16,
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#6FD08B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    color: '#5bb87a',
    fontSize: 12,
    fontWeight: '600',
  },
});
