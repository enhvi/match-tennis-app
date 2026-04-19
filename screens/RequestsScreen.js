import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export default function RequestsScreen({ navigation, route }) {
  const {
    requests,
    friends,
    acceptTimeProposal,
    completeMatch,
    cancelRequest,
    declineResponse,
    withdrawFromMatch,
    deleteRequest,
    currentUser,
    userId,
  } = useApp();
  const { t, primaryLanguage } = useLanguage();
  const { colors } = useTheme();
  const { requestId } = (route && route.params) || {};
  const request = requests.find(r => r.id === requestId);
  
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [acceptingFriendId, setAcceptingFriendId] = useState(null);
  const [proposedStartTime, setProposedStartTime] = useState(
    request && request.startTime ? request.startTime : '10:00'
  );
  const [showCancelReason, setShowCancelReason] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  if (!request) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>{t('details.notFound')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const responses = request.responses || {};
  const requestFriends = (request.friendIds || []).map((friendId) => {
    const friend = friends.find((f) => f.id === friendId);
    if (friend) {
      return friend;
    }
    const response = responses[friendId] || {};
    const details = (request.friendDetails && request.friendDetails[friendId]) || {};
    return {
      id: friendId,
      displayName: response.responderName || details.displayName || '',
      username: response.responderUsername || details.username || '',
      email: details.email || '',
      photoURL: response.responderPhotoURL || details.photoURL || '',
    };
  });
  const requestFriendLabel = (friend) =>
    friend.displayName || friend.username || friend.email || friend.id;
  const isCreator = request.creatorId === userId;
  const isCancelled = request.status === 'cancelled';
  const isExpired = request.status === 'expired';
  const isCompleted = request.status === 'completed';
  const acceptedBy = Object.values(responses)
    .filter((resp) => resp?.status === 'accepted')
    .map((resp) => resp.responderName || resp.responderUsername || resp.responderId)
    .filter(Boolean);
  const declinedBy = Object.values(responses)
    .filter((resp) => resp?.status === 'declined')
    .map((resp) => resp.responderName || resp.responderUsername || resp.responderId)
    .filter(Boolean);

  const playersNeeded = request.playersNeeded || 2;
  const requiredAcceptances = Math.max(playersNeeded - 1, 1);
  const acceptedCount = Object.values(responses).filter((r) => r?.status === 'accepted').length;
  const isMatchFull = acceptedCount >= requiredAcceptances;

  const isConfirmedOrCompleted = request.status === 'confirmed' || request.status === 'completed';
  const participantsList = isConfirmedOrCompleted || isCancelled
    ? [
        {
          id: request.creatorId,
          displayName: request.creatorDisplayName || '',
          username: request.creatorUsername || '',
          email: '',
          photoURL: request.creatorPhotoURL || '',
          isCreator: true,
        },
        ...requestFriends.filter((f) => f?.id && responses[f.id]?.status === 'accepted'),
      ]
    : [
        {
          id: request.creatorId,
          displayName: request.creatorDisplayName || '',
          username: request.creatorUsername || '',
          email: '',
          photoURL: request.creatorPhotoURL || '',
          isCreator: true,
        },
        ...requestFriends,
      ];

  const timeStringToDate = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const timeToMinutes = (timeString) => {
    const [hours, minutes] = (timeString || '00:00').split(':').map(Number);
    return hours * 60 + (minutes || 0);
  };

  const isRequestExpired = () => {
    const [y, m, d] = (request.date || '').split('-').map(Number);
    if (!y || !m || !d) return false;
    const startMins = timeToMinutes(request.startTime || '00:00');
    const endMins = timeToMinutes(request.endTime || '23:59');
    const isNextDay = endMins <= startMins;
    const [endHours, endMinutes] = (request.endTime || '23:59').split(':').map(Number);
    const endDate = isNextDay ? new Date(y, m - 1, d + 1, endHours || 0, endMinutes || 0, 0, 0) : new Date(y, m - 1, d, endHours || 23, endMinutes || 59, 0, 0);
    return endDate < new Date();
  };

  const handleAcceptTime = (friendId) => {
    setAcceptingFriendId(friendId);
    setSelectedTime(timeStringToDate(proposedStartTime));
    setShowTimePicker(true);
  };

  const getEffectiveEndMinutes = (startStr, endStr) => {
    const start = timeToMinutes(startStr);
    const end = timeToMinutes(endStr);
    return end <= start ? end + 24 * 60 : end;
  };

  const minutesToTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    const paddedHours = hours.toString().padStart(2, '0');
    const paddedMinutes = minutes.toString().padStart(2, '0');
    return `${paddedHours}:${paddedMinutes}`;
  };

  const getProposedEnd = (startTime, duration) => {
    if (!duration) {
      return null;
    }
    const startMinutes = timeToMinutes(startTime);
    return minutesToTime(startMinutes + duration);
  };

  const sendProposal = async (startTime) => {
    try {
      const duration = request.durationMinutes;
      if (duration) {
        const requestStart = timeToMinutes(request.startTime);
        const requestEnd = getEffectiveEndMinutes(request.startTime, request.endTime);
        const proposedStartMinutes = timeToMinutes(startTime);
        const proposedEndMinutes = proposedStartMinutes + duration;

        if (proposedStartMinutes < requestStart || proposedEndMinutes > requestEnd) {
          Alert.alert(t('request.errorTime'), t('details.durationOutOfRange'));
          return;
        }

        const proposedEnd = minutesToTime(proposedEndMinutes);
        await acceptTimeProposal(request.id, userId, startTime, proposedEnd);
      } else {
        await acceptTimeProposal(request.id, userId, startTime, null);
      }
      Alert.alert(t('request.success'), t('details.matchConfirmed'));
    } catch (err) {
      const message = err.message === 'MATCH_FULL' ? t('details.matchFullError') : (err.message || t('auth.errorGeneric'));
      Alert.alert(t('auth.loginTitle'), message);
    }
  };

  const confirmTimeAcceptance = (event, time) => {
    setShowTimePicker(false);
    if (event.type !== 'dismissed' && time && acceptingFriendId) {
      const proposedStart = time.toTimeString().slice(0, 5);
      setProposedStartTime(proposedStart);
      setAcceptingFriendId(null);
    } else {
      setAcceptingFriendId(null);
    }
  };

  const getSuggestedTimes = () => {
    if (!request.durationMinutes) {
      return [];
    }

    const startRange = timeToMinutes(request.startTime);
    const endRange = getEffectiveEndMinutes(request.startTime, request.endTime);
    const latestStart = endRange - request.durationMinutes;
    const suggestions = [];
    const step = 30;
    for (let start = startRange; start <= latestStart; start += step) {
      suggestions.push({
        start: minutesToTime(start),
        end: minutesToTime(start + request.durationMinutes),
      });
      if (suggestions.length >= 6) {
        break;
      }
    }
    return suggestions;
  };

  const handleCompleteMatch = () => {
    Alert.alert(
      t('details.completeMatch'),
      t('details.completeMatchConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('details.completeMatch'),
          onPress: async () => {
            await completeMatch(request.id);
            Alert.alert(t('request.success'), t('details.matchCompleted'));
          },
        },
      ]
    );
  };

  const handleCancelRequest = () => {
    Alert.alert(
      t('details.cancelRequest'),
      t('details.cancelConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('details.cancelRequest'),
          style: 'destructive',
          onPress: async () => {
            await cancelRequest(request.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleCancelConfirmedMatch = () => {
    const trimmedReason = cancelReason.trim();
    if (!trimmedReason) {
      Alert.alert(t('details.cancelReasonRequired'));
      return;
    }
    Alert.alert(
      t('details.cancelMatch'),
      t('details.cancelMatchConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('details.cancelMatch'),
          style: 'destructive',
          onPress: async () => {
            await cancelRequest(request.id, trimmedReason);
            setCancelReason('');
            setShowCancelReason(false);
          },
        },
      ]
    );
  };

  const handleDeclineMatch = () => {
    Alert.alert(
      t('details.declineMatch'),
      t('details.declineMatchConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('details.decline'),
          style: 'destructive',
          onPress: async () => {
            await declineResponse(request.id, userId, {
              id: userId,
              name: (currentUser && currentUser.displayName) || '',
              username: (currentUser && currentUser.username) || '',
              photoURL: (currentUser && currentUser.photoURL) || '',
            });
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleWithdrawFromMatch = () => {
    Alert.alert(
      t('details.withdrawMatch'),
      t('details.withdrawMatchConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('details.withdrawMatch'),
          style: 'destructive',
          onPress: async () => {
            await withdrawFromMatch(request.id, userId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleDeleteRequest = () => {
    Alert.alert(
      t('details.deleteRequest'),
      t('details.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('details.deleteRequest'),
          style: 'destructive',
          onPress: async () => {
            await deleteRequest(request.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const isInvitedWithNoResponse =
    !isCreator &&
    (request.friendIds || []).includes(userId) &&
    !(responses[userId] && responses[userId].status);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const locale = primaryLanguage === 'de' ? 'de-DE' : 'en-US';
    return date.toLocaleDateString(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getFinalTimeRange = () => {
    const accepted = Object.entries(responses)
      .filter(([_, resp]) => resp?.status === 'accepted' && resp?.acceptedStart)
      .map(([id, resp]) => ({ responderId: id, ...resp }));
    if (accepted.length === 0) {
      return null;
    }
    const myAccepted = accepted.find((r) => r.responderId === userId);
    const acceptedTime = myAccepted || accepted[0];
    const endTime =
      acceptedTime.acceptedEnd ||
      (request.durationMinutes
        ? getProposedEnd(acceptedTime.acceptedStart, request.durationMinutes)
        : null);
    return {
      start: acceptedTime.acceptedStart,
      end: endTime,
    };
  };

  const finalTime = (request.status === 'confirmed' || request.status === 'completed')
    ? getFinalTimeRange()
    : null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.headingBlue }]}>
            {request.sport ? t('details.titleWithSport', { sport: request.sport }) : t('details.title')}
          </Text>
          <View style={[styles.creatorAvatar, { backgroundColor: colors.card3 }]}>
            {request.creatorPhotoURL ? (
              <Image source={{ uri: request.creatorPhotoURL }} style={styles.creatorAvatarImage} />
            ) : (
              <Text style={[styles.creatorAvatarText, { color: colors.text }]}>
                {(request.creatorDisplayName || request.creatorUsername || '?')
                  .slice(0, 1)
                  .toUpperCase()}
              </Text>
            )}
          </View>
          {request.status === 'confirmed' && (
            <View style={styles.confirmedBadge}>
              <Text style={styles.confirmedText}>{t('details.confirmed')}</Text>
            </View>
          )}
          {isCompleted && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>{t('details.completed')}</Text>
            </View>
          )}
          {isExpired && (
            <View style={styles.expiredBadge}>
              <Text style={styles.expiredBadgeText}>{t('details.expired')}</Text>
            </View>
          )}
        </View>

        {!isCreator && isMatchFull && !(responses[userId]?.status === 'accepted') && (
          <View style={styles.matchFullBanner}>
            <Text style={styles.matchFullBannerText}>{t('details.matchFullInfo')}</Text>
          </View>
        )}

        <View style={[styles.infoGrid, { backgroundColor: colors.card }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('details.date')}</Text>
            <Text style={[styles.value, { color: colors.text }]}>{formatDate(request.date)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {finalTime ? t('details.time') : t('details.timeRange')}
            </Text>
            <Text style={[styles.value, { color: colors.text }]}>
              {finalTime && finalTime.start
                ? `${finalTime.start} - ${finalTime.end || request.endTime}`
                : `${request.startTime} - ${request.endTime}`}
            </Text>
          </View>
          {request.sport ? (
            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{t('details.sport')}</Text>
              <Text style={[styles.value, { color: colors.text }]}>{request.sport}</Text>
            </View>
          ) : null}
          {request.location ? (
            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{t('details.location')}</Text>
              <Text style={[styles.value, { color: colors.text }]}>{request.location}</Text>
            </View>
          ) : null}
          {request.comment ? (
            <View style={styles.commentRow}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{t('details.comment')}</Text>
              <Text style={[styles.commentValue, { color: colors.text }]}>{request.comment}</Text>
            </View>
          ) : null}
          {request.durationMinutes && !finalTime ? (
            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{t('details.duration')}</Text>
              <Text style={[styles.value, { color: colors.text }]}>{request.durationMinutes} min</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.headingBlue }]}>{t('details.participants')}</Text>
          {participantsList.map((person) => {
            const friend = person.isCreator ? person : { ...person, isCreator: false };
            const isCreator = friend.id === request.creatorId;
            const response = responses[friend.id];
            const isCurrentUser = friend.id === userId;
            const wasInvitedToRespond = isCurrentUser && request.creatorId !== userId;
            const canRespond = wasInvitedToRespond && !isRequestExpired() && !isMatchFull;
            
            return (
              <TouchableOpacity
                key={friend.id}
                style={[styles.friendCard, { backgroundColor: colors.card2, borderColor: colors.border }]}
                onPress={() => navigation.navigate('FriendProfile', { friendId: friend.id, friend })}
                activeOpacity={0.7}
              >
                <Text style={[styles.friendName, { color: colors.text }]} numberOfLines={1}>
                  {requestFriendLabel(friend)}
                  {isCreator && <Text style={[styles.organizerSymbol, { color: colors.warning }]}> ★</Text>}
                </Text>
                {isCancelled && friend.id === request.cancelledBy ? (
                  <View style={styles.responseContainer}>
                    <Text style={styles.cancelledText}>{t('details.cancelled')}</Text>
                    {request.cancelReason ? (
                      <Text style={[styles.cancelReasonText, { color: colors.textSecondary }]}>{request.cancelReason}</Text>
                    ) : null}
                  </View>
                ) : isExpired ? (
                  <View style={styles.responseContainer}>
                    <Text style={styles.expiredText}>{t('details.expired')}</Text>
                  </View>
                ) : isCreator || (response && response.status === 'accepted') ? null : (response && (response.status === 'declined' || response.status === 'withdrawn')) ? (
                  <View style={styles.responseContainer}>
                    <Text style={styles.declinedText}>
                      {(response && response.status === 'withdrawn') ? t('details.withdrawn') : t('details.declined')}
                    </Text>
                  </View>
                ) : wasInvitedToRespond && isRequestExpired() && !(response && response.status) ? (
                  <View style={styles.responseContainer}>
                    <Text style={styles.expiredText}>{t('details.expired')}</Text>
                  </View>
                ) : wasInvitedToRespond && isMatchFull && !(response && response.status) ? (
                  <View style={styles.responseContainer}>
                    <Text style={styles.matchFullText}>{t('details.matchFull')}</Text>
                  </View>
                ) : canRespond ? (
                  <View>
                    <View style={styles.timeRow}>
                      <TouchableOpacity
                        style={[styles.timePickerButton, { backgroundColor: colors.card3, borderColor: colors.border }]}
                        onPress={() => handleAcceptTime(userId)}
                      >
                        <Text style={[styles.timePickerText, { color: colors.text }]}>
                          {t('details.startTime')}: {proposedStartTime}
                        </Text>
                      </TouchableOpacity>
                      <Text style={[styles.timePickerText, { color: colors.text }]}>
                        {t('details.endTime')}: {getProposedEnd(proposedStartTime, request.durationMinutes) || '--'}
                      </Text>
                    </View>
                    <View style={styles.responseActions}>
                      <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() => sendProposal(proposedStartTime)}
                      >
                        <Text style={styles.acceptButtonText}>{t('details.acceptTime')}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.declineButton}
                        onPress={handleDeclineMatch}
                      >
                        <Text style={styles.declineButtonText}>{t('details.decline')}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <Text style={[styles.waitingText, { color: colors.textSecondary }]}>{t('details.waiting')}</Text>
                )}

                {canRespond && request.durationMinutes && !isCancelled && !isExpired && request.status === 'pending' && (
                  <View style={styles.suggestionSection}>
                    <Text style={[styles.suggestionLabel, { color: colors.textSecondary }]}>{t('details.suggestedTimes')}</Text>
                    <View style={styles.suggestionRow}>
                      {getSuggestedTimes().map((slot) => {
                        const isSelected = proposedStartTime === slot.start;
                        return (
                        <TouchableOpacity
                          key={`${slot.start}-${slot.end}`}
                          style={[
                            styles.suggestionChip,
                            { backgroundColor: colors.card3, borderColor: colors.border },
                            isSelected && { borderColor: colors.primary, backgroundColor: 'rgba(111, 208, 139, 0.2)' },
                          ]}
                          onPress={() => setProposedStartTime(slot.start)}
                        >
                          <Text style={[styles.suggestionChipText, { color: colors.text }]}>
                            {slot.start} - {slot.end}
                          </Text>
                        </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {isCreator && request.status === 'pending' && !isExpired && (acceptedBy.length > 0 || declinedBy.length > 0) && (
          <View style={styles.section}>
            {acceptedBy.length > 0 && (
              <Text style={[styles.responseSummary, { color: colors.textSecondary }]}>
                {t('details.acceptedBy')}: {acceptedBy.join(', ')}
              </Text>
            )}
            {declinedBy.length > 0 && (
              <Text style={[styles.responseSummary, { color: colors.textSecondary }]}>
                {t('details.declinedBy')}: {declinedBy.join(', ')}
              </Text>
            )}
          </View>
        )}

        {showTimePicker && (
          <DateTimePicker
            value={selectedTime}
            mode="time"
            display="spinner"
            locale={primaryLanguage === 'de' ? 'de-DE' : undefined}
            onChange={confirmTimeAcceptance}
          />
        )}

        {request.status === 'confirmed' && !isCancelled && isCreator && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleCompleteMatch}
          >
            <Text style={styles.completeButtonText}>{t('details.completeMatch')}</Text>
          </TouchableOpacity>
        )}

        {request.status === 'confirmed' && !isCancelled && isCreator && (
          <>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCancelReason((prev) => !prev)}
            >
              <Text style={styles.cancelButtonText}>{t('details.cancelMatch')}</Text>
            </TouchableOpacity>
            {showCancelReason && (
              <View style={[styles.cancelReasonCard, { backgroundColor: colors.card2, borderColor: colors.danger + '60' }]}>
                <Text style={[styles.label, { color: colors.text }]}>{t('details.cancelReason')}</Text>
                <TextInput
                  style={[styles.cancelReasonInput, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                  placeholder={t('details.cancelReasonPlaceholder')}
                  placeholderTextColor={colors.textSecondary}
                  value={cancelReason}
                  onChangeText={setCancelReason}
                  multiline
                />
                <View style={styles.cancelReasonActions}>
                  <TouchableOpacity
                    style={styles.cancelReasonConfirm}
                    onPress={handleCancelConfirmedMatch}
                  >
                    <Text style={styles.cancelReasonConfirmText}>
                      {t('details.cancelMatch')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelReasonDismiss}
                    onPress={() => setShowCancelReason(false)}
                  >
                    <Text style={styles.cancelReasonDismissText}>{t('common.cancel')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}

        {request.status === 'confirmed' && !isCancelled && !isCreator && responses[userId] && responses[userId].status === 'accepted' && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleWithdrawFromMatch}
          >
            <Text style={styles.cancelButtonText}>{t('details.withdrawMatch')}</Text>
          </TouchableOpacity>
        )}

        {isInvitedWithNoResponse && !isCancelled && !isExpired && !isMatchFull && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteRequest}
          >
            <Text style={styles.deleteButtonText}>{t('details.deleteRequest')}</Text>
          </TouchableOpacity>
        )}

        {isCreator && request.status === 'pending' && !isCancelled && !isExpired && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelRequest}
          >
            <Text style={styles.cancelButtonText}>{t('details.cancelRequest')}</Text>
          </TouchableOpacity>
        )}

        {isCreator && (isCancelled || isExpired) && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteRequest}
          >
            <Text style={styles.deleteButtonText}>{t('details.deleteRequest')}</Text>
          </TouchableOpacity>
        )}
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  creatorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  creatorAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  creatorAvatarText: {
    color: '#555',
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  confirmedBadge: {
    backgroundColor: '#6FD08B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  confirmedText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  completedBadge: {
    backgroundColor: '#5bb87a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginLeft: 8,
  },
  completedText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  expiredBadge: {
    backgroundColor: '#ff9800',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginLeft: 8,
  },
  expiredBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  cancelledText: {
    fontSize: 12,
    color: '#e53935',
    fontWeight: '500',
  },
  cancelReasonText: {
    fontSize: 12,
    marginTop: 4,
  },
  infoGrid: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    marginBottom: 2,
  },
  label: {
    fontSize: 13,
    color: '#7f8c8d',
    flex: 1,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
    textAlign: 'right',
  },
  commentRow: {
    paddingVertical: 4,
    marginBottom: 2,
  },
  commentValue: {
    fontSize: 16,
    color: '#2c3e50',
    marginTop: 4,
  },
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
    marginBottom: 6,
  },
  suggestionSection: {
    marginTop: 8,
  },
  suggestionLabel: {
    fontSize: 11,
    color: '#7f8c8d',
    marginBottom: 6,
  },
  suggestionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  suggestionChip: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: '#f8f9fa',
  },
  suggestionChipSelected: {
    borderColor: '#6FD08B',
    backgroundColor: '#e3f2fd',
  },
  suggestionChipText: {
    fontSize: 11,
    color: '#2c3e50',
    fontWeight: '500',
  },
  friendCard: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 6,
    padding: 8,
    marginBottom: 4,
  },
  friendName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 2,
  },
  organizerSymbol: {
    fontSize: 12,
    color: '#f9a825',
  },
  responseContainer: {
    marginTop: 2,
  },
  acceptedText: {
    fontSize: 12,
    color: '#6FD08B',
    fontWeight: '500',
  },
  proposedText: {
    color: '#6FD08B',
    fontWeight: '600',
  },
  declinedText: {
    fontSize: 12,
    color: '#e53935',
    fontWeight: '500',
  },
  responseActions: {
    flexDirection: 'row',
    marginTop: 6,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  timePickerButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 4,
    backgroundColor: '#f8f9fa',
    marginRight: 8,
  },
  timePickerText: {
    fontSize: 11,
    color: '#2c3e50',
    fontWeight: '500',
  },
  declineButton: {
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#e53935',
    borderRadius: 4,
    padding: 8,
    alignItems: 'center',
  },
  declineButtonText: {
    color: '#e53935',
    fontSize: 12,
    fontWeight: '600',
  },
  acceptButton: {
    backgroundColor: '#6FD08B',
    borderRadius: 4,
    padding: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  waitingText: {
    fontSize: 12,
    color: '#95a5a6',
    fontStyle: 'italic',
  },
  expiredText: {
    fontSize: 12,
    color: '#e65100',
    fontWeight: '500',
  },
  matchFullText: {
    fontSize: 12,
    color: '#ff9800',
    fontWeight: '500',
  },
  matchFullBanner: {
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  matchFullBannerText: {
    fontSize: 14,
    color: '#e65100',
    fontWeight: '500',
  },
  responseSummary: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  confirmButton: {
    backgroundColor: '#7ed99a',
    borderRadius: 8,
    padding: 18,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  completeButton: {
    backgroundColor: '#5bb87a',
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 6,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 4,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e53935',
  },
  cancelButtonText: {
    color: '#e53935',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelReasonCard: {
    marginTop: 12,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f0b4b4',
    backgroundColor: '#fff5f5',
  },
  cancelReasonInput: {
    marginTop: 8,
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
  },
  cancelReasonActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  cancelReasonConfirm: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#e53935',
    alignItems: 'center',
  },
  cancelReasonConfirmText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelReasonDismiss: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e53935',
    alignItems: 'center',
  },
  cancelReasonDismissText: {
    color: '#e53935',
    fontWeight: 'bold',
  },
  deleteButton: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#b71c1c',
  },
  deleteButtonText: {
    color: '#b71c1c',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
  },
});
