import React, { useState, useRef } from 'react';
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
  ImageBackground,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Ionicons from '@expo/vector-icons/Ionicons';
import Constants from 'expo-constants';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const appVersion = Constants.expoConfig?.version || require('../package.json').version || '0.3.2';

export default function HomeScreen({ navigation }) {
  const { requests, friends, currentUser, cancelRequest } = useApp();
  const { t, primaryLanguage } = useLanguage();
  const { colors: themeColors } = useTheme();
  const [selectedTab, setSelectedTab] = useState('mine');
  const swipeableRefs = useRef({});

  const isMatchFull = (req) => {
    const playersNeeded = req.playersNeeded || 2;
    const requiredAcceptances = Math.max(playersNeeded - 1, 1);
    const acceptedCount = Object.values(req.responses || {}).filter((r) => r?.status === 'accepted').length;
    return acceptedCount >= requiredAcceptances;
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const myCreatedRequests = pendingRequests.filter(
    (req) => req.creatorId === currentUser?.uid
  );
  const incomingRequests = pendingRequests.filter(
    (req) =>
      req.creatorId !== currentUser?.uid &&
      req.responses?.[currentUser?.uid]?.status !== 'declined' &&
      req.responses?.[currentUser?.uid]?.status !== 'withdrawn' &&
      !isMatchFull(req)
  );
  const confirmedMatches = requests.filter((r) => {
    if (r.status !== 'confirmed') {
      return false;
    }
    const hasDeclined = Object.values(r.responses || {}).some((resp) => resp?.status === 'declined');
    if (hasDeclined) return false;
    if (r.creatorId === currentUser?.uid) return true;
    const myResponse = (r.responses || {})[currentUser?.uid];
    return myResponse && myResponse.status === 'accepted';
  });
  const tabRequests = {
    mine: myCreatedRequests,
    incoming: incomingRequests,
    confirmed: confirmedMatches,
  };
  const sortRequestsByDateTime = (list) => {
    return [...list].sort((a, b) => {
      const aDate = new Date(a.date);
      const bDate = new Date(b.date);
      if (aDate.getTime() !== bDate.getTime()) {
        return aDate - bDate;
      }
      const toMinutes = (time) => {
        if (!time) {
          return 0;
        }
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
      };
      return toMinutes(a.startTime) - toMinutes(b.startTime);
    });
  };
  const activeRequests = sortRequestsByDateTime(tabRequests[selectedTab] || []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const locale = primaryLanguage === 'de' ? 'de-DE' : 'en-US';
    return date.toLocaleDateString(locale, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const sportColors = {
    Tennis: { bg: '#e8f5e9', border: '#6FD08B' },
    Padel: { bg: '#e8f5e9', border: '#7ed99a' },
    Golf: { bg: '#e8f5e9', border: '#5bb87a' },
    Basketball: { bg: '#fff3e0', border: '#ff9800' },
  };
  const sportBackgrounds = {
    Tennis: require('../assets/sportBackgrounds/tennis.png'),
    Padel: require('../assets/sportBackgrounds/padel.png'),
    Golf: require('../assets/sportBackgrounds/golf.png'),
    Basketball: require('../assets/sportBackgrounds/basketball.png'),
  };
  const getCardStyle = (sport) => {
    const sc = sportColors[sport] || { bg: '#f8f9fa', border: '#dee2e6' };
    const hasBgImage = sportBackgrounds[sport];
    const bg = hasBgImage ? 'transparent' : themeColors.card2;
    return {
      backgroundColor: bg,
      borderLeftWidth: 4,
      borderLeftColor: sc.border,
      overflow: 'hidden',
    };
  };
  const textOnBg = {
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  };
  const textOnCard = {
    color: themeColors.text,
  };
  const renderCardContent = (item, content) => {
    const bg = sportBackgrounds[item.sport];
    const ts = bg ? textOnBg : textOnCard;
    if (bg) {
      return (
        <>
          <ImageBackground source={bg} style={styles.cardBgImage} resizeMode="cover" />
          <View style={styles.cardOverlay} />
          <View style={styles.cardContent}>{typeof content === 'function' ? content(ts) : content}</View>
        </>
      );
    }
    return <View style={styles.cardContent}>{typeof content === 'function' ? content({}) : content}</View>;
  };

  const getFinalTimeRange = (request) => {
    if (!request) {
      return null;
    }
    if (!request.finalStartTime) {
      return null;
    }
    const endTime = request.finalEndTime ||
      (request.durationMinutes
        ? (() => {
            const [hours, minutes] = (request.finalStartTime || '').split(':').map(Number);
            const totalMinutes = hours * 60 + minutes + request.durationMinutes;
            const endHours = Math.floor(totalMinutes / 60) % 24;
            const endMinutes = totalMinutes % 60;
            return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
          })()
        : request.endTime || null);
    return {
      start: request.finalStartTime,
      end: endTime,
    };
  };

  const renderRequestItem = ({ item }) => {
    const requestFriends = friends.filter(f => (item.friendIds || []).includes(f.id));
    const responses = item.responses || {};
    const responseList = Object.values(responses);
    const accepted = responseList.filter((resp) => resp?.status === 'accepted');
    const declined = responseList.filter((resp) => resp?.status === 'declined');
    const acceptedCount = Object.values(responses).filter(
      (resp) => resp?.status === 'accepted'
    ).length;
    const declinedCount = declined.length;
    const invitedCount = (item.friendIds || []).length;
    const allDeclined = invitedCount > 0 && declinedCount === invitedCount;
    const requiredAcceptances = Math.max((item.playersNeeded || 2) - 1, 1);
    const isConfirmed = item.status === 'confirmed' || item.status === 'completed';
    const finalTime = isConfirmed ? getFinalTimeRange(item) : null;
    const displayTime = finalTime && finalTime.start
      ? `${finalTime.start} - ${finalTime.end || item.endTime}`
      : isConfirmed
        ? '—'
        : `${item.startTime} - ${item.endTime}`;

    const acceptedWithPhotos = Object.entries(responses)
      .filter(([, r]) => r?.status === 'accepted')
      .map(([friendId, r]) => ({
        id: friendId,
        photoURL: r.responderPhotoURL || requestFriends.find((f) => f.id === friendId)?.photoURL,
        name: r.responderName || r.responderUsername || requestFriends.find((f) => f.id === friendId)?.displayName,
      }));

    if (isConfirmed) {
      const participantNames = [
        item.creatorDisplayName || item.creatorUsername || item.creatorId,
        ...accepted.map((r) => r.responderName || r.responderUsername || r.responderId),
      ].filter(Boolean);
      return (
        <TouchableOpacity
          style={[styles.requestCard, styles.requestCardCompact, getCardStyle(item.sport)]}
          onPress={() => navigation.navigate('Requests', { requestId: item.id })}
        >
          {renderCardContent(item, (ts) => (
            <>
              <View style={styles.cardTopRow}>
                <View style={styles.cardLeftBlock}>
                  <Text style={[styles.cardDate, ts]}>{formatDate(item.date)}</Text>
                  <Text style={[styles.cardTime, ts]}>{displayTime}</Text>
                  <Text style={[styles.cardSport, ts]}>{item.sport || '—'}</Text>
                  {item.status === 'completed' && (
                    <Text style={[styles.compactBadge, ts]}>{t('details.completed')}</Text>
                  )}
                </View>
                <View>
                  {item.creatorPhotoURL ? (
                    <Image source={{ uri: item.creatorPhotoURL }} style={styles.creatorAvatarRight} />
                  ) : (
                    <View style={[styles.creatorAvatarRightPlaceholder, { backgroundColor: themeColors.card3 || '#e0e0e0' }]}>
                      <Text style={[styles.creatorAvatarText, { color: themeColors.text || '#555' }]}>
                        {(item.creatorDisplayName || item.creatorUsername || '?').slice(0, 1).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              {acceptedWithPhotos.length > 0 && (
                <View style={styles.acceptedAvatarsRow}>
                  {acceptedWithPhotos.map((a, idx) => (
                    <View key={a.id} style={[styles.acceptedAvatar, { borderColor: themeColors.card || 'rgba(255,255,255,0.9)' }, idx > 0 && styles.acceptedAvatarOverlap]}>
                      {a.photoURL ? (
                        <Image source={{ uri: a.photoURL }} style={styles.acceptedAvatarImage} />
                      ) : (
                        <View style={[styles.acceptedAvatarPlaceholder, { backgroundColor: themeColors.card3 || '#95a5a6' }]}>
                          <Text style={styles.acceptedAvatarText}>
                            {(a.name || '?').slice(0, 1).toUpperCase()}
                          </Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}
              <Text style={[styles.compactWith, ts]} numberOfLines={1}>
                {t('app.with')}: {participantNames.join(', ')}
              </Text>
            </>
          ))}
        </TouchableOpacity>
      );
    }

    const isCreator = item.creatorId === currentUser?.uid;
    const showAllDeclinedCard = isCreator && allDeclined;

    const triggerCancelDialog = () => {
      swipeableRefs.current[item.id]?.close?.();
      Alert.alert(
        t('details.cancelRequest'),
        t('details.cancelConfirm'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('details.cancelRequest'),
            style: 'destructive',
            onPress: async () => {
              try {
                await cancelRequest(item.id);
              } catch (e) {
                Alert.alert(t('auth.loginTitle'), e.message === 'FORBIDDEN' ? t('errors.forbidden') : (e.message || t('auth.errorGeneric')));
              }
            },
          },
        ]
      );
    };

    const renderSwipeCancelAction = () => (
      <View style={styles.swipeCancelAction}>
        <View style={styles.swipeCancelActionContent}>
          <View style={styles.swipeCancelIconWrap}>
            <Ionicons name="trash-outline" size={28} color="#fff" />
          </View>
          <Text style={styles.swipeCancelActionText}>{t('details.cancelRequest')}</Text>
        </View>
      </View>
    );

    const cardContent = (
      <TouchableOpacity
        style={[
          styles.requestCard,
          getCardStyle(item.sport),
          showAllDeclinedCard && styles.requestCardAllDeclined,
        ]}
        onPress={() => navigation.navigate('Requests', { requestId: item.id })}
        onLongPress={() => {
          if (isCreator && item.status === 'pending' && !allDeclined) {
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
        {renderCardContent(item, (ts) => (
          <>
            <View style={styles.cardTopRow}>
              <View style={styles.cardLeftBlock}>
                <Text style={[styles.cardDate, ts]}>{formatDate(item.date)}</Text>
                <Text style={[styles.cardTime, ts]}>{displayTime}</Text>
                <Text style={[styles.cardSport, ts]}>{item.sport || '—'}</Text>
              </View>
              <View style={styles.creatorBlock}>
                {item.creatorPhotoURL ? (
                  <Image source={{ uri: item.creatorPhotoURL }} style={styles.creatorAvatarRight} />
                ) : (
                  <View style={[styles.creatorAvatarRightPlaceholder, { backgroundColor: themeColors.card3 || '#e0e0e0' }]}>
                    <Text style={[styles.creatorAvatarText, { color: themeColors.text || '#555' }]}>
                      {(item.creatorDisplayName || item.creatorUsername || '?').slice(0, 1).toUpperCase()}
                    </Text>
                  </View>
                )}
                {showAllDeclinedCard ? (
                  <View style={styles.allDeclinedBadge}>
                    <Text style={styles.allDeclinedBadgeText}>{t('app.allDeclined')}</Text>
                  </View>
                ) : (
                  <Text style={[styles.acceptedCountBadge, { color: themeColors.primary || '#6FD08B' }]}>
                    {acceptedCount}/{requiredAcceptances}
                  </Text>
                )}
              </View>
            </View>
            {allDeclined && !showAllDeclinedCard && (
              <Text style={[styles.requestAllDeclined, ts]}>{t('app.allDeclined')}</Text>
            )}
            {acceptedWithPhotos.length > 0 && (
              <View style={styles.acceptedAvatarsRow}>
                {acceptedWithPhotos.map((a, idx) => (
                  <View key={a.id} style={[styles.acceptedAvatar, { borderColor: themeColors.card || 'rgba(255,255,255,0.9)' }, idx > 0 && styles.acceptedAvatarOverlap]}>
                    {a.photoURL ? (
                      <Image source={{ uri: a.photoURL }} style={styles.acceptedAvatarImage} />
                    ) : (
                      <View style={[styles.acceptedAvatarPlaceholder, { backgroundColor: themeColors.card3 || '#95a5a6' }]}>
                        <Text style={styles.acceptedAvatarText}>
                          {(a.name || '?').slice(0, 1).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
            {showAllDeclinedCard && (
              <View style={styles.cancelRow}>
                <TouchableOpacity
                  style={styles.reinviteButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    navigation.navigate('Request', { copyFromRequestId: item.id });
                  }}
                >
                  <Text style={styles.reinviteButtonText}>{t('details.reinvite')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelOnCardButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    Alert.alert(
                      t('details.cancelRequest'),
                      t('details.cancelConfirm'),
                      [
                        { text: t('common.cancel'), style: 'cancel' },
                        {
                          text: t('details.cancelRequest'),
                          style: 'destructive',
                          onPress: async () => {
                            try {
                              await cancelRequest(item.id);
                            } catch (e) {
                              Alert.alert(
                                t('auth.loginTitle'),
                                e.message === 'FORBIDDEN'
                                  ? t('errors.forbidden')
                                  : e.message || t('auth.errorGeneric')
                              );
                            }
                          },
                        },
                      ]
                    );
                  }}
                >
                  <Text style={styles.cancelOnCardButtonText}>{t('details.cancelRequest')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ))}
      </TouchableOpacity>
    );

    if (showAllDeclinedCard) {
      return (
        <Swipeable
          ref={(r) => { if (r) swipeableRefs.current[item.id] = r; }}
          renderRightActions={renderSwipeCancelAction}
          overshootRight={false}
          friction={1.5}
          rightThreshold={50}
          onSwipeableRightOpen={triggerCancelDialog}
        >
          {cardContent}
        </Swipeable>
      );
    }
    return cardContent;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ExpoStatusBar style="auto" />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              { backgroundColor: themeColors.card, borderColor: themeColors.border },
              selectedTab === 'mine' && styles.tabButtonActive,
            ]}
            onPress={() => setSelectedTab('mine')}
          >
            <Text
              style={[
                styles.tabText,
                { color: themeColors.text },
                selectedTab === 'mine' && styles.tabTextActive,
              ]}
            >
              {t('app.myRequests')} ({myCreatedRequests.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              { backgroundColor: themeColors.card, borderColor: themeColors.border },
              selectedTab === 'incoming' && styles.tabButtonActive,
            ]}
            onPress={() => setSelectedTab('incoming')}
          >
            <Text
              style={[
                styles.tabText,
                { color: themeColors.text },
                selectedTab === 'incoming' && styles.tabTextActive,
              ]}
            >
              {t('app.incomingRequests')} ({incomingRequests.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              { backgroundColor: themeColors.card, borderColor: themeColors.border },
              selectedTab === 'confirmed' && styles.tabButtonActive,
            ]}
            onPress={() => setSelectedTab('confirmed')}
          >
            <Text
              style={[
                styles.tabText,
                { color: themeColors.text },
                selectedTab === 'confirmed' && styles.tabTextActive,
              ]}
            >
              {t('app.confirmedMatches')} ({confirmedMatches.length})
            </Text>
          </TouchableOpacity>
        </View>

        {activeRequests.length > 0 ? (
          <FlatList
            style={{ backgroundColor: themeColors.background }}
            data={activeRequests}
            renderItem={renderRequestItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
              {t('app.noRequests')}
            </Text>
            <Text style={[styles.emptySubtext, { color: themeColors.textMuted }]}>
              {t('app.noRequestsSubtext')}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Version Display */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>v{appVersion}</Text>
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
    paddingBottom: 90,
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
  requestCardAllDeclined: {
    borderLeftColor: '#e53935',
    borderLeftWidth: 4,
  },
  cardBgImage: {
    ...StyleSheet.absoluteFillObject,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 1,
  },
  cardContent: {
    zIndex: 2,
  },
  requestCardCompact: {
    padding: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardLeftBlock: {
    flex: 1,
  },
  cardDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  cardTime: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  cardSport: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  creatorBlock: {
    alignItems: 'flex-end',
  },
  creatorAvatarRight: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e0e0e0',
  },
  creatorAvatarRightPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptedCountBadge: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#6FD08B',
  },
  acceptedAvatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  acceptedAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    overflow: 'hidden',
  },
  acceptedAvatarOverlap: {
    marginLeft: -8,
  },
  acceptedAvatarImage: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  acceptedAvatarPlaceholder: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptedAvatarText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  compactSport: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
  },
  compactBadge: {
    fontSize: 11,
    color: '#5bb87a',
    fontWeight: '600',
  },
  compactDateTime: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  compactWith: {
    fontSize: 12,
    color: '#95a5a6',
  },
  requestHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  dateTimeBlock: {
    flex: 1,
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
    marginBottom: 2,
  },
  requestCreator: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  requestTime: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 0,
  },
  requestAllDeclined: {
    alignSelf: 'flex-end',
    fontSize: 12,
    color: '#e53935',
    fontWeight: '700',
    marginBottom: 6,
  },
  allDeclinedBadge: {
    alignSelf: 'center',
    backgroundColor: '#ffebee',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#e53935',
  },
  cancelRow: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  reinviteButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2e7d32',
    backgroundColor: 'rgba(46, 125, 50, 0.12)',
  },
  reinviteButtonText: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '600',
  },
  allDeclinedBadgeText: {
    fontSize: 13,
    color: '#c62828',
    fontWeight: '700',
  },
  cancelOnCardButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e53935',
  },
  cancelOnCardButtonText: {
    fontSize: 14,
    color: '#e53935',
    fontWeight: '600',
  },
  swipeCancelAction: {
    width: 100,
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: '#e53935',
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeCancelActionContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeCancelIconWrap: {
    marginBottom: 4,
  },
  swipeCancelActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  requestSport: {
    fontSize: 13,
    color: '#2c3e50',
    fontWeight: '600',
    marginBottom: 4,
  },
  requestLocation: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  requestFriends: {
    fontSize: 12,
    color: '#95a5a6',
  },
  requestAccepted: {
    marginTop: 4,
    fontSize: 12,
    color: '#6FD08B',
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
    backgroundColor: '#6FD08B',
    borderColor: '#6FD08B',
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
