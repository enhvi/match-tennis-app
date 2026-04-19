import React, { useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export default function MatchHistoryScreen({ navigation, route }) {
  const { requests } = useApp();
  const { t, primaryLanguage } = useLanguage();
  const { colors } = useTheme();
  const { friendId, friendName } = route?.params || {};

  useEffect(() => {
    if (friendName) {
      navigation.setOptions({
        title: t('matchHistory.titleForFriend', { name: friendName }),
      });
    }
  }, [navigation, friendName, t]);

  const history = requests
    .filter((request) => request.status === 'completed')
    .filter((request) => {
      if (!friendId) {
        return true;
      }
      const invited = Array.isArray(request.friendIds) ? request.friendIds : [];
      return request.creatorId === friendId || invited.includes(friendId);
    })
    .sort((a, b) => {
      const aTime = a.completedAt?.toDate ? a.completedAt.toDate().getTime() : 0;
      const bTime = b.completedAt?.toDate ? b.completedAt.toDate().getTime() : 0;
      return bTime - aTime;
    });

  const formatDate = (dateString) => {
    if (!dateString) {
      return '';
    }
    const locale = primaryLanguage === 'de' ? 'de-DE' : 'en-US';
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getFinalTimeRange = (request) => {
    if (!request?.responses) {
      return null;
    }
    const accepted = Object.values(request.responses || {}).filter(
      (resp) => resp?.status === 'accepted' && resp?.acceptedStart
    );
    if (accepted.length === 0) {
      return null;
    }
    const acceptedTime = accepted[0];
    if (!acceptedTime?.acceptedStart) return null;
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {history.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t('matchHistory.noMatches')}
            </Text>
          </View>
        ) : (
          history.map((match) => {
            const finalTime = getFinalTimeRange(match);
            const displayTime = finalTime?.start
              ? `${finalTime.start} - ${finalTime.end || match.endTime}`
              : '—';
            return (
              <View
                key={match.id}
                style={[styles.matchCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Text style={[styles.matchDate, { color: colors.text }]}>{formatDate(match.date)}</Text>
                <Text style={[styles.matchTime, { color: colors.textSecondary }]}>{displayTime}</Text>
              {match.sport ? (
                <Text style={[styles.matchSport, { color: colors.text }]}>{match.sport}</Text>
              ) : null}
              {match.location ? (
                <Text style={[styles.matchLocation, { color: colors.textSecondary }]}>{match.location}</Text>
              ) : null}
              <Text style={[styles.matchCreator, { color: colors.textSecondary }]}>
                {t('app.creator')}: {match.creatorDisplayName || match.creatorUsername || match.creatorId}
              </Text>
              </View>
            );
          })
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  matchCard: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  matchDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  matchTime: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  matchSport: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
    marginBottom: 6,
  },
  matchLocation: {
    fontSize: 13,
    color: '#7f8c8d',
    marginBottom: 6,
  },
  matchCreator: {
    fontSize: 12,
    color: '#7f8c8d',
  },
});
