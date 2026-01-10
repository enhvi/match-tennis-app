import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

export default function RequestsScreen({ navigation, route }) {
  const { requests, friends, acceptTimeProposal, confirmMatch, userId } = useApp();
  const { t } = useLanguage();
  const { requestId } = route.params || {};
  const request = requests.find(r => r.id === requestId);
  
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [acceptingFriendId, setAcceptingFriendId] = useState(null);

  if (!request) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.errorText}>{t('details.notFound')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const requestFriends = friends.filter(f => request.friendIds.includes(f.id));
  const hasAcceptedResponses = request.responses && Object.keys(request.responses).length > 0;

  const handleAcceptTime = (friendId) => {
    setAcceptingFriendId(friendId);
    setShowTimePicker(true);
  };

  const confirmTimeAcceptance = (event, time) => {
    setShowTimePicker(false);
    if (event.type !== 'dismissed' && time && acceptingFriendId) {
      acceptTimeProposal(request.id, acceptingFriendId, time.toTimeString().slice(0, 5));
      setAcceptingFriendId(null);
      Alert.alert(t('request.success'), t('details.accepted'));
    } else {
      setAcceptingFriendId(null);
    }
  };

  const handleConfirmMatch = () => {
    if (!hasAcceptedResponses) {
      Alert.alert('Error', t('details.errorNoAcceptances'));
      return;
    }
    
    confirmMatch(request.id);
    Alert.alert(t('request.success'), t('details.matchConfirmed'), [
      { text: t('common.ok'), onPress: () => navigation.goBack() }
    ]);
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('details.title')}</Text>
          {request.status === 'confirmed' && (
            <View style={styles.confirmedBadge}>
              <Text style={styles.confirmedText}>{t('details.confirmed')}</Text>
            </View>
          )}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.label}>{t('details.date')}</Text>
          <Text style={styles.value}>{formatDate(request.date)}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.label}>{t('details.timeRange')}</Text>
          <Text style={styles.value}>{request.startTime} - {request.endTime}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('details.friendsInvited')}</Text>
          {requestFriends.map((friend) => {
            const response = request.responses?.[friend.id];
            const isCurrentUser = friend.id === userId;
            const canAccept = !isCurrentUser && request.creatorId !== userId;
            
            return (
              <View key={friend.id} style={styles.friendCard}>
                <Text style={styles.friendName}>
                  {friend.name} {isCurrentUser && `(${t('details.you')})`}
                </Text>
                {response ? (
                  <View style={styles.responseContainer}>
                    <Text style={styles.acceptedText}>
                      {t('details.accepted')} {response.acceptedTime}
                    </Text>
                  </View>
                ) : canAccept ? (
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => handleAcceptTime(userId)}
                  >
                    <Text style={styles.acceptButtonText}>{t('details.acceptTime')}</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.waitingText}>{t('details.waiting')}</Text>
                )}
              </View>
            );
          })}
        </View>

        {showTimePicker && (
          <DateTimePicker
            value={selectedTime}
            mode="time"
            display="spinner"
            onChange={confirmTimeAcceptance}
          />
        )}

        {hasAcceptedResponses && request.status !== 'confirmed' && (
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmMatch}
          >
            <Text style={styles.confirmButtonText}>{t('details.confirmMatch')}</Text>
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
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
  },
});
