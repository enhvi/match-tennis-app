import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export default function RequestScreen({ navigation, route }) {
  const { friends, sendRequest, updateRequest, currentUser, requests } = useApp();
  const { t, primaryLanguage } = useLanguage();
  const { colors } = useTheme();
  const { requestId } = (route && route.params) || {};
  const existingRequest = requestId ? requests.find((req) => req.id === requestId) : null;
  
  const getNextFullHour = () => {
    const now = new Date();
    const next = new Date(now);
    next.setMinutes(0, 0, 0);
    if (next <= now) {
      next.setHours(next.getHours() + 1);
    }
    return next;
  };

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startTime, setStartTime] = useState(getNextFullHour());
  const [endTime, setEndTime] = useState(() => {
    const next = getNextFullHour();
    const end = new Date(next);
    end.setHours(end.getHours() + 1);
    return end;
  });
  const [durationMinutes, setDurationMinutes] = useState('');
  const [location, setLocation] = useState('');
  const [comment, setComment] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [excludedFriends, setExcludedFriends] = useState([]);
  const [selectedSport, setSelectedSport] = useState('');
  const [playersNeeded, setPlayersNeeded] = useState('2');
  const [inviteAll, setInviteAll] = useState(true);
  const [timeMode, setTimeMode] = useState('range');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const availableSports = (currentUser && currentUser.sports && currentUser.sports.length > 0)
    ? currentUser.sports
    : ['Tennis', 'Padel', 'Golf', 'Basketball'];

  const eligibleFriends = selectedSport
    ? friends.filter((friend) => friend.sports && friend.sports.includes(selectedSport))
    : friends;

  const toggleFriend = (friendId) => {
    if (inviteAll) {
      if (excludedFriends.includes(friendId)) {
        setExcludedFriends(excludedFriends.filter(id => id !== friendId));
      } else {
        setExcludedFriends([...excludedFriends, friendId]);
      }
    } else {
      if (selectedFriends.includes(friendId)) {
        setSelectedFriends(selectedFriends.filter(id => id !== friendId));
      } else {
        setSelectedFriends([...selectedFriends, friendId]);
      }
    }
  };

  const parseTimeForToday = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  useEffect(() => {
    if (!existingRequest) {
      return;
    }

    setSelectedDate(new Date(`${existingRequest.date}T00:00:00`));
    setStartTime(parseTimeForToday(existingRequest.startTime));
    setEndTime(parseTimeForToday(existingRequest.endTime));
    setSelectedSport(existingRequest.sport || '');
    setPlayersNeeded(existingRequest.playersNeeded ? String(existingRequest.playersNeeded) : '2');
    setDurationMinutes(
      existingRequest.durationMinutes ? String(existingRequest.durationMinutes) : ''
    );
    setTimeMode(existingRequest.timeMode === 'exact' ? 'exact' : 'range');
    setLocation(existingRequest.location || '');
    setComment(existingRequest.comment || '');
    setInviteAll(Boolean(existingRequest.inviteAll));
    const friendIds = existingRequest.friendIds || [];
    setSelectedFriends(friendIds);
    if (existingRequest.inviteAll) {
      const allIds = (existingRequest.sport ? friends.filter((f) => f.sports && f.sports.includes(existingRequest.sport)) : friends).map((f) => f.id);
      setExcludedFriends(allIds.filter((id) => !friendIds.includes(id)));
    } else {
      setExcludedFriends([]);
    }
  }, [existingRequest, friends]);

  const handleSendRequest = async () => {
    if (!selectedSport) {
      Alert.alert('Error', t('request.errorNoSport'));
      return;
    }
    const selectedFriendIds = inviteAll
      ? eligibleFriends.filter((f) => !excludedFriends.includes(f.id)).map((friend) => friend.id)
      : selectedFriends;

    if (selectedFriendIds.length === 0) {
      Alert.alert('Error', t('request.errorNoFriends'));
      return;
    }

    if (timeMode === 'exact') {
      const durationMin = getCalculatedDuration();
      if (durationMin <= 0) {
        Alert.alert('Error', t('request.errorTime'));
        return;
      }
    }

    const durationValue = timeMode === 'exact'
      ? getCalculatedDuration()
      : (durationMinutes.trim() === '' ? null : parseInt(durationMinutes, 10));
    if (timeMode === 'range') {
      if (durationMinutes.trim() === '') {
        Alert.alert('Error', t('request.errorDurationRequired'));
        return;
      }
      if (Number.isNaN(durationValue) || durationValue <= 0) {
        Alert.alert('Error', t('request.errorDuration'));
        return;
      }
    }

    const totalPlayers = parseInt(playersNeeded, 10);
    if (Number.isNaN(totalPlayers) || totalPlayers < 2) {
      Alert.alert('Error', t('request.errorPlayers'));
      return;
    }

    if (totalPlayers - 1 > selectedFriendIds.length) {
      Alert.alert('Error', t('request.errorPlayersTooMany'));
      return;
    }

    const requestData = {
      date: selectedDate.toISOString().split('T')[0],
      startTime: startTime.toTimeString().slice(0, 5),
      endTime: endTime.toTimeString().slice(0, 5),
      sport: selectedSport,
      playersNeeded: totalPlayers,
      inviteAll: inviteAll,
      durationMinutes: durationValue,
      timeMode,
      location: location.trim() || null,
      comment: comment.trim() || null,
      friendIds: selectedFriendIds,
    };

    try {
      if (existingRequest) {
        await updateRequest(existingRequest.id, requestData);
      } else {
        await sendRequest(requestData);
      }
      Alert.alert(
        t('request.success'),
        t('request.sent', { count: selectedFriendIds.length }),
        [
          {
            text: t('common.ok'),
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert(t('friends.error'), error.message || t('friends.requestError'));
    }
  };

  const formatDate = (date) => {
    const locale = primaryLanguage === 'de' ? 'de-DE' : 'en-US';
    return date.toLocaleDateString(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date) => {
    const locale = primaryLanguage === 'de' ? 'de-DE' : 'en-US';
    return date.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: primaryLanguage !== 'de',
    });
  };

  const getCalculatedDuration = () => {
    let end = endTime;
    if (end <= startTime) {
      // End time is on next day (e.g. 0:00 after 20:00)
      end = new Date(end);
      end.setDate(end.getDate() + 1);
    }
    return Math.round((end - startTime) / 60000);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.headingBlue }]}>{t('request.title')}</Text>
        
        {/* Date Picker */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>{t('request.date')}</Text>
          <TouchableOpacity
            style={[styles.pickerButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={[styles.pickerText, { color: colors.text }]}>{formatDate(selectedDate)}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              locale={primaryLanguage === 'de' ? 'de-DE' : undefined}
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) setSelectedDate(date);
              }}
              minimumDate={new Date()}
            />
          )}
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>{t('request.timeSection')}</Text>
          <View style={styles.timeModeRow}>
            <TouchableOpacity
              style={[
                styles.timeModeToggle,
                { backgroundColor: colors.card, borderColor: colors.border },
                timeMode === 'range' && { borderColor: colors.primary, backgroundColor: 'rgba(111, 208, 139, 0.2)' },
              ]}
              onPress={() => {
                setTimeMode('range');
                if (timeMode === 'exact') {
                  setDurationMinutes(String(getCalculatedDuration()));
                }
              }}
            >
              <Text style={[
                styles.timeModeText,
                { color: colors.text },
                timeMode === 'range' && { color: colors.primary },
              ]}>
                {t('request.timeRangeMode')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.timeModeToggle,
                { backgroundColor: colors.card, borderColor: colors.border },
                timeMode === 'exact' && { borderColor: colors.primary, backgroundColor: 'rgba(111, 208, 139, 0.2)' },
              ]}
              onPress={() => setTimeMode('exact')}
            >
              <Text style={[
                styles.timeModeText,
                { color: colors.text },
                timeMode === 'exact' && { color: colors.primary },
              ]}>
                {t('request.exactTimeMode')}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.hintText, { color: colors.textSecondary }]}>
            {timeMode === 'range' ? t('request.timeRangeHint') : t('request.exactTimeHint')}
          </Text>
          <View style={styles.timeRow}>
            <View style={styles.timeHalf}>
              <Text style={[styles.timeLabel, { color: colors.text }]}>{t('request.startTime')}</Text>
              <TouchableOpacity
                style={[styles.pickerButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => setShowStartTimePicker(true)}
              >
                <Text style={[styles.pickerText, { color: colors.text }]}>{formatTime(startTime)}</Text>
              </TouchableOpacity>
              {showStartTimePicker && (
                <DateTimePicker
                  value={startTime}
                  mode="time"
                  display="spinner"
                  onChange={(event, time) => {
                    setShowStartTimePicker(false);
                    if (time) setStartTime(time);
                  }}
                />
              )}
            </View>
            <View style={styles.timeHalf}>
              <Text style={[styles.timeLabel, { color: colors.text }]}>{t('request.endTime')}</Text>
              <TouchableOpacity
                style={[styles.pickerButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => setShowEndTimePicker(true)}
              >
                <Text style={[styles.pickerText, { color: colors.text }]}>{formatTime(endTime)}</Text>
              </TouchableOpacity>
              {showEndTimePicker && (
                <DateTimePicker
                  value={endTime}
                  mode="time"
                  display="spinner"
                  onChange={(event, time) => {
                    setShowEndTimePicker(false);
                    if (time) setEndTime(time);
                  }}
                />
              )}
            </View>
          </View>
        </View>

        {/* Duration & Players - compact row */}
        <View style={styles.compactRowSection}>
          <View style={styles.compactRow}>
            <View style={[styles.compactField, styles.compactFieldFirst]}>
              <Text style={[styles.compactLabel, { color: colors.textSecondary }]}>
                {timeMode === 'exact' ? t('request.durationCalculated') : t('request.durationRequired')}
              </Text>
              {timeMode === 'exact' ? (
                <View style={[styles.compactInput, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.compactValue, { color: colors.text }]}>{getCalculatedDuration()} min</Text>
                </View>
              ) : (
                <TextInput
                  style={[styles.compactInput, styles.compactTextInput, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                  keyboardType="number-pad"
                  value={durationMinutes}
                  onChangeText={setDurationMinutes}
                  placeholder={t('request.durationPlaceholder')}
                  placeholderTextColor={colors.textSecondary}
                  maxLength={3}
                />
              )}
            </View>
            <View style={styles.compactField}>
              <Text style={[styles.compactLabel, { color: colors.textSecondary }]}>{t('request.players')}</Text>
              <TextInput
                style={[styles.compactInput, styles.compactTextInput, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                keyboardType="number-pad"
                value={playersNeeded}
                onChangeText={setPlayersNeeded}
                maxLength={2}
              />
            </View>
          </View>
        </View>

        {/* Sport Selection */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>{t('request.selectSport')}</Text>
          <View style={styles.sportsGrid}>
            {availableSports.map((sport) => {
              const selected = selectedSport === sport;
              return (
                <TouchableOpacity
                  key={sport}
                  style={[
                    styles.sportChip,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    selected && { borderColor: colors.primary, backgroundColor: 'rgba(111, 208, 139, 0.2)' },
                  ]}
                  onPress={() => {
                    setSelectedSport(sport);
                    setSelectedFriends([]);
                    setExcludedFriends([]);
                  }}
                >
                  <Text style={[
                    styles.sportChipText,
                    { color: colors.text },
                    selected && { color: colors.primary },
                  ]}>
                    {sport}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Location & Comment */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>{t('request.locationOptional')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
            value={location}
            onChangeText={setLocation}
            placeholder={t('request.locationPlaceholder')}
            placeholderTextColor={colors.textSecondary}
            maxLength={100}
          />
          <Text style={[styles.label, { color: colors.text, marginTop: 14 }]}>{t('request.comment')}</Text>
          <TextInput
            style={[styles.input, styles.commentInput, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
            value={comment}
            onChangeText={setComment}
            placeholder={t('request.commentPlaceholder')}
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={3}
            maxLength={300}
          />
        </View>

        {/* Friend Selection */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>{t('request.selectFriends')}</Text>
          <View style={styles.inviteRow}>
            <TouchableOpacity
              style={[
                styles.inviteToggle,
                { backgroundColor: colors.card, borderColor: colors.border },
                inviteAll && { borderColor: colors.primary, backgroundColor: 'rgba(111, 208, 139, 0.2)' },
              ]}
              onPress={() => {
                setInviteAll(true);
                setSelectedFriends([]);
                setExcludedFriends([]);
              }}
            >
              <Text style={[
                styles.inviteToggleText,
                { color: colors.text },
                inviteAll && { color: colors.primary },
              ]}>
                {inviteAll
                  ? t('request.inviteAllWithCount', { count: eligibleFriends.length - excludedFriends.length })
                  : t('request.inviteAll')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.inviteToggle,
                { backgroundColor: colors.card, borderColor: colors.border },
                !inviteAll && { borderColor: colors.primary, backgroundColor: 'rgba(111, 208, 139, 0.2)' },
              ]}
              onPress={() => {
                setInviteAll(false);
                if (!inviteAll) {
                  return;
                }
                // Neues Match: bei „Freunde auswählen“ nicht alle vorauswählen
                if (existingRequest) {
                  setSelectedFriends(
                    eligibleFriends.filter((f) => !excludedFriends.includes(f.id)).map((f) => f.id)
                  );
                } else {
                  setSelectedFriends([]);
                }
              }}
            >
              <Text style={[
                styles.inviteToggleText,
                { color: colors.text },
                !inviteAll && { color: colors.primary },
              ]}>
                {!inviteAll ? t('request.inviteSomeWithCount', { count: selectedFriends.length }) : t('request.inviteSome')}
              </Text>
            </TouchableOpacity>
          </View>
          {eligibleFriends.length === 0 ? (
            <View style={[styles.emptyFriendsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.emptyFriendsText, { color: colors.textSecondary }]}>{t('request.noFriends')}</Text>
              <Text style={[styles.emptyFriendsSubtext, { color: colors.textMuted }]}>
                {selectedSport ? t('request.noFriendsForSport') : t('request.noFriendsSubtext')}
              </Text>
            </View>
          ) : (
            eligibleFriends.map((friend) => {
              const isSelected = inviteAll
                ? !excludedFriends.includes(friend.id)
                : selectedFriends.includes(friend.id);
              return (
                <TouchableOpacity
                  key={friend.id}
                  style={[
                    styles.friendItem,
                    { backgroundColor: colors.card2, borderColor: colors.border },
                    isSelected && { borderColor: colors.primary, backgroundColor: 'rgba(111, 208, 139, 0.2)' },
                  ]}
                  onPress={() => toggleFriend(friend.id)}
                >
                  <Text style={[
                    styles.friendName,
                    { color: colors.text },
                    isSelected && { color: colors.primary },
                  ]}>
                    {friend.displayName || friend.username || friend.email || friend.id}
                  </Text>
                  {isSelected && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Send Button */}
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSendRequest}
        >
          <Text style={styles.sendButtonText}>
            {existingRequest ? t('request.update') : t('request.send')}
          </Text>
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
    padding: 16,
    paddingTop: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inviteRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  inviteToggle: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: '#f8f9fa',
  },
  inviteToggleSelected: {
    borderColor: '#6FD08B',
    backgroundColor: '#e3f2fd',
  },
  inviteToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2c3e50',
  },
  inviteToggleTextSelected: {
    color: '#5bb87a',
  },
  timeModeRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  timeModeToggle: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: '#f8f9fa',
  },
  timeModeToggleSelected: {
    borderColor: '#6FD08B',
    backgroundColor: '#e3f2fd',
  },
  timeModeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  timeModeTextSelected: {
    color: '#5bb87a',
  },
  hintText: {
    fontSize: 13,
    color: '#7f8c8d',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  timeRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timeHalf: {
    flex: 1,
    marginRight: 8,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#34495e',
    marginBottom: 6,
  },
  compactRowSection: {
    marginBottom: 16,
  },
  compactRow: {
    flexDirection: 'row',
  },
  compactField: {
    flex: 1,
  },
  compactFieldFirst: {
    marginRight: 12,
  },
  compactLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
  },
  compactInput: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 10,
  },
  compactTextInput: {
    fontSize: 14,
  },
  compactValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  commentInput: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  pickerButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 15,
  },
  pickerText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  friendItem: {
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
  sportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  friendItemSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#6FD08B',
    borderWidth: 2,
  },
  friendName: {
    fontSize: 16,
    color: '#2c3e50',
  },
  friendNameSelected: {
    fontWeight: '600',
    color: '#5bb87a',
  },
  checkmark: {
    fontSize: 20,
    color: '#6FD08B',
    fontWeight: 'bold',
  },
  sendButton: {
    backgroundColor: '#6FD08B',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyFriendsContainer: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  emptyFriendsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7f8c8d',
    marginBottom: 5,
  },
  emptyFriendsSubtext: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
  },
});
