import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
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

export default function RequestsScreen({ navigation, route }) {
  const {
    requests,
    friends,
    acceptTimeProposal,
    confirmMatch,
    completeMatch,
    cancelRequest,
    acceptResponse,
    declineResponse,
    deleteRequest,
    currentUser,
    userId,
  } = useApp();
  const { t } = useLanguage();
  const { requestId } = route.params || {};
  const request = requests.find(r => r.id === requestId);
  
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [acceptingFriendId, setAcceptingFriendId] = useState(null);
  const [proposedStartTime, setProposedStartTime] = useState(request.startTime);

  if (!request) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.errorText}>{t('details.notFound')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const responses = request.responses || {};
  const requestFriends = request.friendIds.map((friendId) => {
    const friend = friends.find((f) => f.id === friendId);
    if (friend) {
      return friend;
    }
    const response = responses[friendId] || {};
    return {
      id: friendId,
      displayName: response.responderName || '',
      username: response.responderUsername || '',
      photoURL: response.responderPhotoURL || '',
    };
  });
  const requestFriendLabel = (friend) =>
    friend.displayName || friend.username || friend.email || friend.id;
  const hasAcceptedResponses = Object.keys(responses).length > 0;
  const isCreator = request.creatorId === userId;
  const isCancelled = request.status === 'cancelled';
  const isCompleted = request.status === 'completed';
  const acceptedBy = Object.values(responses)
    .filter((resp) => resp.status === 'accepted')
    .map((resp) => resp.responderName || resp.responderUsername || resp.responderId)
    .filter(Boolean);
  const declinedBy = Object.values(responses)
    .filter((resp) => resp.status === 'declined')
    .map((resp) => resp.responderName || resp.responderUsername || resp.responderId)
    .filter(Boolean);

  const timeStringToDate = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const handleAcceptTime = (friendId) => {
    setAcceptingFriendId(friendId);
    setSelectedTime(timeStringToDate(proposedStartTime));
    setShowTimePicker(true);
  };

  const timeToMinutes = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
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

  const sendProposal = (startTime) => {
    const duration = request.durationMinutes;
    if (duration) {
      const requestStart = timeToMinutes(request.startTime);
      const requestEnd = timeToMinutes(request.endTime);
      const proposedStartMinutes = timeToMinutes(startTime);
      const proposedEndMinutes = proposedStartMinutes + duration;

      if (proposedStartMinutes < requestStart || proposedEndMinutes > requestEnd) {
        Alert.alert(t('request.errorTime'), t('details.durationOutOfRange'));
        return;
      }

      const proposedEnd = minutesToTime(proposedEndMinutes);
      acceptTimeProposal(request.id, userId, startTime, proposedEnd);
    } else {
      acceptTimeProposal(request.id, userId, startTime, null);
    }
    Alert.alert(t('request.success'), t('details.accepted'));
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
    const endRange = timeToMinutes(request.endTime);
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

  const handleConfirmMatch = () => {
    if (!isCreator) {
      Alert.alert('Error', t('details.onlyCreatorConfirm'));
      return;
    }
    if (!hasAcceptedResponses) {
      Alert.alert('Error', t('details.errorNoAcceptances'));
      return;
    }

    const hasDeclined = Object.values(responses).some((resp) => resp.status === 'declined');
    if (hasDeclined) {
      Alert.alert('Error', t('details.hasDeclines'));
      return;
    }
    
    confirmMatch(request.id);
    Alert.alert(t('request.success'), t('details.matchConfirmed'), [
      { text: t('common.ok'), onPress: () => navigation.goBack() }
    ]);
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getFinalTimeRange = () => {
    const accepted = Object.values(responses).filter(
      (resp) => resp.status === 'accepted' && resp.acceptedStart
    );
    if (accepted.length === 0) {
      return null;
    }
    const acceptedTime = accepted[0];
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
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('details.title')}</Text>
          <View style={styles.creatorAvatar}>
            {request.creatorPhotoURL ? (
              <Image source={{ uri: request.creatorPhotoURL }} style={styles.creatorAvatarImage} />
            ) : (
              <Text style={styles.creatorAvatarText}>
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
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.label}>{t('details.date')}</Text>
          <Text style={styles.value}>{formatDate(request.date)}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.label}>{t('details.timeRange')}</Text>
          <Text style={styles.value}>
            {finalTime?.start
              ? `${finalTime.start} - ${finalTime.end || request.endTime}`
              : `${request.startTime} - ${request.endTime}`}
          </Text>
        </View>

        {request.sport ? (
          <View style={styles.infoSection}>
            <Text style={styles.label}>{t('details.sport')}</Text>
            <Text style={styles.value}>{request.sport}</Text>
          </View>
        ) : null}

        {request.durationMinutes ? (
          <View style={styles.infoSection}>
            <Text style={styles.label}>{t('details.duration')}</Text>
            <Text style={styles.value}>{request.durationMinutes} min</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('details.friendsInvited')}</Text>
          {requestFriends.map((friend) => {
            const response = responses[friend.id];
            const isCurrentUser = friend.id === userId;
            const canRespond = isCurrentUser && request.creatorId !== userId;
            
            return (
              <View key={friend.id} style={styles.friendCard}>
                <Text style={styles.friendName}>
                  {requestFriendLabel(friend)}
                </Text>
                {isCancelled ? (
                  <View style={styles.responseContainer}>
                    <Text style={styles.cancelledText}>{t('details.cancelled')}</Text>
                  </View>
                ) : response?.status === 'proposed' && isCreator ? (
                  <View style={styles.responseContainer}>
                    <Text style={styles.acceptedText}>
                      {t('details.proposed')} {response.acceptedStart}
                      {response.acceptedEnd ? ` - ${response.acceptedEnd}` : ''}
                    </Text>
                    <View style={styles.responseActions}>
                      <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() => acceptResponse(request.id, friend.id)}
                      >
                        <Text style={styles.acceptButtonText}>{t('details.accept')}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.declineButton}
                        onPress={() => declineResponse(request.id, friend.id)}
                      >
                        <Text style={styles.declineButtonText}>{t('details.decline')}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : response?.status === 'accepted' ? (
                  <View style={styles.responseContainer}>
                    <Text style={styles.acceptedText}>
                      {t('details.accepted')} {response.acceptedStart}
                      {response.acceptedEnd ? ` - ${response.acceptedEnd}` : ''}
                    </Text>
                  </View>
                ) : response?.status === 'declined' ? (
                  <View style={styles.responseContainer}>
                    <Text style={styles.declinedText}>{t('details.declined')}</Text>
                  </View>
                ) : canRespond ? (
                  <View>
                    <View style={styles.timeRow}>
                      <TouchableOpacity
                        style={styles.timePickerButton}
                        onPress={() => handleAcceptTime(userId)}
                      >
                        <Text style={styles.timePickerText}>
                          {t('details.startTime')}: {proposedStartTime}
                        </Text>
                      </TouchableOpacity>
                      <Text style={styles.timePickerText}>
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
                        onPress={() =>
                          declineResponse(request.id, userId, {
                            id: userId,
                            name: currentUser?.displayName || '',
                            username: currentUser?.username || '',
                            photoURL: currentUser?.photoURL || '',
                          })
                        }
                      >
                        <Text style={styles.declineButtonText}>{t('details.decline')}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.waitingText}>{t('details.waiting')}</Text>
                )}

                {canRespond && request.durationMinutes && !isCancelled && (
                  <View style={styles.suggestionSection}>
                    <Text style={styles.suggestionLabel}>{t('details.suggestedTimes')}</Text>
                    <View style={styles.suggestionRow}>
                      {getSuggestedTimes().map((slot) => {
                        const isSelected = proposedStartTime === slot.start;
                        return (
                        <TouchableOpacity
                          key={`${slot.start}-${slot.end}`}
                          style={[styles.suggestionChip, isSelected && styles.suggestionChipSelected]}
                          onPress={() => setProposedStartTime(slot.start)}
                        >
                          <Text style={styles.suggestionChipText}>
                            {slot.start} - {slot.end}
                          </Text>
                        </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {isCreator && (acceptedBy.length > 0 || declinedBy.length > 0) && (
          <View style={styles.section}>
            {acceptedBy.length > 0 && (
              <Text style={styles.responseSummary}>
                {t('details.acceptedBy')}: {acceptedBy.join(', ')}
              </Text>
            )}
            {declinedBy.length > 0 && (
              <Text style={styles.responseSummary}>
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
            onChange={confirmTimeAcceptance}
          />
        )}

        {hasAcceptedResponses && request.status !== 'confirmed' && !isCancelled && !isCompleted && isCreator && (
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmMatch}
          >
            <Text style={styles.confirmButtonText}>{t('details.confirmMatch')}</Text>
          </TouchableOpacity>
        )}

        {request.status === 'confirmed' && !isCancelled && isCreator && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleCompleteMatch}
          >
            <Text style={styles.completeButtonText}>{t('details.completeMatch')}</Text>
          </TouchableOpacity>
        )}

        {isCreator && request.status === 'pending' && !isCancelled && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelRequest}
          >
            <Text style={styles.cancelButtonText}>{t('details.cancelRequest')}</Text>
          </TouchableOpacity>
        )}

        {isCreator && isCancelled && (
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
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  creatorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  creatorAvatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  creatorAvatarText: {
    color: '#555',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  confirmedBadge: {
    backgroundColor: '#4CAF50',
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
    backgroundColor: '#1565c0',
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
  cancelledText: {
    color: '#e53935',
    fontWeight: '600',
  },
  infoSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  suggestionSection: {
    marginTop: 10,
  },
  suggestionLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  suggestionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  suggestionChip: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
  },
  suggestionChipSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#e8f5e9',
  },
  suggestionChipText: {
    fontSize: 12,
    color: '#2c3e50',
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
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
  },
  responseContainer: {
    marginTop: 5,
  },
  acceptedText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  proposedText: {
    color: '#1976d2',
    fontWeight: '600',
  },
  declinedText: {
    color: '#e53935',
    fontWeight: '600',
  },
  responseActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  timePickerButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
    marginRight: 10,
  },
  timePickerText: {
    fontSize: 12,
    color: '#2c3e50',
    fontWeight: '600',
  },
  declineButton: {
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#e53935',
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
  },
  declineButtonText: {
    color: '#e53935',
    fontWeight: '600',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
    marginTop: 5,
  },
  acceptButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  waitingText: {
    fontSize: 14,
    color: '#95a5a6',
    fontStyle: 'italic',
  },
  responseSummary: {
    fontSize: 13,
    color: '#7f8c8d',
    marginBottom: 6,
  },
  confirmButton: {
    backgroundColor: '#2196F3',
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
    backgroundColor: '#1565c0',
    borderRadius: 8,
    padding: 18,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 12,
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e53935',
  },
  cancelButtonText: {
    color: '#e53935',
    fontSize: 18,
    fontWeight: 'bold',
  },
  deleteButton: {
    marginTop: 12,
    padding: 18,
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
