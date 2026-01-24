import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  FlatList,
  Alert,
  Image,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

export default function HomeScreen({ navigation }) {
  const { requests, friends, currentUser } = useApp();
  const { t, primaryLanguage } = useLanguage();
  const [selectedTab, setSelectedTab] = useState('mine');
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const myCreatedRequests = pendingRequests.filter(
    (req) => req.creatorId === currentUser?.uid
  );
  const incomingRequests = pendingRequests.filter(
    (req) => req.creatorId !== currentUser?.uid
  );
  const confirmedMatches = requests.filter((r) => {
    if (r.status !== 'confirmed') {
      return false;
    }
    const hasDeclined = Object.values(r.responses || {}).some((resp) => resp.status === 'declined');
    return !hasDeclined;
  });
  const cancelledRequests = requests.filter(r => r.status === 'cancelled');
  const tabRequests = {
    mine: myCreatedRequests,
    incoming: incomingRequests,
    confirmed: confirmedMatches,
    cancelled: cancelledRequests,
  };
  const activeRequests = tabRequests[selectedTab] || [];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const locale = primaryLanguage === 'de' ? 'de-DE' : 'en-US';
    return date.toLocaleDateString(locale, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getFinalTimeRange = (request) => {
    if (!request?.responses) {
      return null;
    }
    const accepted = Object.values(request.responses).filter(
      (resp) => resp.status === 'accepted' && resp.acceptedStart
    );
    if (accepted.length === 0) {
      return null;
    }
    const acceptedTime = accepted[0];
    const endTime =
      acceptedTime.acceptedEnd ||
      (request.durationMinutes
        ? (() => {
            const [hours, minutes] = acceptedTime.acceptedStart.split(':').map(Number);
            const totalMinutes = hours * 60 + minutes + request.durationMinutes;
            const endHours = Math.floor(totalMinutes / 60) % 24;
            const endMinutes = totalMinutes % 60;
            return `${endHours.toString().padStart(2, '0')}:${endMinutes
              .toString()
              .padStart(2, '0')}`;
          })()
        : null);
    return {
      start: acceptedTime.acceptedStart,
      end: endTime,
    };
  };

  const renderRequestItem = ({ item }) => {
    const requestFriends = friends.filter(f => item.friendIds.includes(f.id));
    const responses = item.responses || {};
    const responseList = Object.values(responses);
    const accepted = responseList.filter((resp) => resp.status === 'accepted');
    const declined = responseList.filter((resp) => resp.status === 'declined');
    const acceptedCount = Object.values(responses).filter(
      (resp) => resp.status === 'accepted'
    ).length;
    const declinedCount = declined.length;
    const allDeclined = requestFriends.length > 0 && declinedCount === requestFriends.length;
    const requiredAcceptances = Math.max((item.playersNeeded || 2) - 1, 1);
    const isCancelled = item.status === 'cancelled';
    const isConfirmed = item.status === 'confirmed' || item.status === 'completed';
    const finalTime = isConfirmed ? getFinalTimeRange(item) : null;
    const displayTime = finalTime?.start
      ? `${finalTime.start} - ${finalTime.end || item.endTime}`
      : `${item.startTime} - ${item.endTime}`;
    return (
      <TouchableOpacity
        style={styles.requestCard}
        onPress={() => navigation.navigate('Requests', { requestId: item.id })}
        onLongPress={() => {
          if (item.creatorId === currentUser?.uid && item.status === 'pending') {
            Alert.alert(
              t('details.editRequest'),
              t('details.editRequestPrompt'),
              [
                { text: t('common.cancel'), style: 'cancel' },
                {
                  text: t('details.editRequest'),
                  onPress: () => navigation.navigate('Request', { requestId: item.id }),
                },
              ]
            );
          }
        }}
      >
        <View style={styles.requestHeaderRow}>
          <View style={styles.creatorInfo}>
            {item.creatorPhotoURL ? (
              <Image source={{ uri: item.creatorPhotoURL }} style={styles.creatorAvatar} />
            ) : (
              <View style={styles.creatorAvatarPlaceholder}>
                <Text style={styles.creatorAvatarText}>
                  {(item.creatorDisplayName || item.creatorUsername || '?')
                    .slice(0, 1)
                    .toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={styles.requestCreator}>
              {t('app.creator')}: {item.creatorDisplayName || item.creatorUsername || item.creatorId}
            </Text>
          </View>
        </View>
        <Text style={styles.requestDate}>{formatDate(item.date)}</Text>
        <Text style={styles.requestTime}>{displayTime}</Text>
        {allDeclined && (
          <Text style={styles.requestAllDeclined}>{t('app.allDeclined')}</Text>
        )}
        {item.sport ? (
          <Text style={styles.requestSport}>{item.sport}</Text>
        ) : null}
        <Text style={styles.requestFriends}>
          {requestFriends.length} friend(s) invited
        </Text>
        <Text style={styles.requestAccepted}>
          {t('app.acceptedCount', { count: acceptedCount, total: requiredAcceptances })}
        </Text>
        {accepted.length > 0 && (
          <Text style={styles.requestResponse}>
            {t('app.accepted')}: {accepted.map((resp) => resp.responderName || resp.responderUsername || resp.responderId).join(', ')}
          </Text>
        )}
        {declined.length > 0 && (
          <Text style={styles.requestResponse}>
            {t('app.declinedBy')} ({declinedCount}): {declined.map((resp) => resp.responderName || resp.responderUsername || resp.responderId).join(', ')}
          </Text>
        )}
        {isCancelled && (
          <Text style={styles.requestCancelled}>{t('app.cancelled')}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="auto" />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabButton, selectedTab === 'mine' && styles.tabButtonActive]}
            onPress={() => setSelectedTab('mine')}
          >
            <Text style={[styles.tabText, selectedTab === 'mine' && styles.tabTextActive]}>
              {t('app.myRequests')} ({myCreatedRequests.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, selectedTab === 'incoming' && styles.tabButtonActive]}
            onPress={() => setSelectedTab('incoming')}
          >
            <Text style={[styles.tabText, selectedTab === 'incoming' && styles.tabTextActive]}>
              {t('app.incomingRequests')} ({incomingRequests.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, selectedTab === 'confirmed' && styles.tabButtonActive]}
            onPress={() => setSelectedTab('confirmed')}
          >
            <Text style={[styles.tabText, selectedTab === 'confirmed' && styles.tabTextActive]}>
              {t('app.confirmedMatches')} ({confirmedMatches.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, selectedTab === 'cancelled' && styles.tabButtonActive]}
            onPress={() => setSelectedTab('cancelled')}
          >
            <Text style={[styles.tabText, selectedTab === 'cancelled' && styles.tabTextActive]}>
              {t('app.cancelledRequests')} ({cancelledRequests.length})
            </Text>
          </TouchableOpacity>
        </View>

        {activeRequests.length > 0 ? (
          <FlatList
            data={activeRequests}
            renderItem={renderRequestItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{t('app.noRequests')}</Text>
            <Text style={styles.emptySubtext}>{t('app.noRequestsSubtext')}</Text>
          </View>
        )}
      </ScrollView>
      
      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Request')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Version Display */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>v0.2.4</Text>
      </View>
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
    paddingBottom: 100,
  },
  section: {
    marginBottom: 30,
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
  requestHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    backgroundColor: '#e0e0e0',
  },
  creatorAvatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  creatorAvatarText: {
    color: '#555',
    fontSize: 12,
    fontWeight: '600',
  },
  requestDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  requestCreator: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  requestTime: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  requestAllDeclined: {
    alignSelf: 'flex-end',
    fontSize: 12,
    color: '#e53935',
    fontWeight: '700',
    marginBottom: 6,
  },
  requestSport: {
    fontSize: 13,
    color: '#2c3e50',
    fontWeight: '600',
    marginBottom: 4,
  },
  requestFriends: {
    fontSize: 12,
    color: '#95a5a6',
  },
  requestAccepted: {
    marginTop: 4,
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  requestResponse: {
    marginTop: 4,
    fontSize: 12,
    color: '#7f8c8d',
  },
  sectionHint: {
    marginTop: 6,
    fontSize: 12,
    color: '#95a5a6',
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    backgroundColor: '#f8f9fa',
    marginHorizontal: 3,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  tabText: {
    fontSize: 11,
    color: '#2c3e50',
    fontWeight: '600',
    textAlign: 'center',
  },
  tabTextActive: {
    color: '#fff',
  },
  requestCancelled: {
    marginTop: 6,
    fontSize: 12,
    color: '#e53935',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#95a5a6',
  },
  fab: {
    position: 'absolute',
    left: '50%',
    marginLeft: -30, // Half of width (60/2) to center it
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  versionContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  versionText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
  },
});
