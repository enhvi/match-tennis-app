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
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

export default function RequestScreen({ navigation }) {
  const { friends, sendRequest } = useApp();
  const { t } = useLanguage();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const toggleFriend = (friendId) => {
    if (selectedFriends.includes(friendId)) {
      setSelectedFriends(selectedFriends.filter(id => id !== friendId));
    } else {
      setSelectedFriends([...selectedFriends, friendId]);
    }
  };

  const handleSendRequest = () => {
    if (selectedFriends.length === 0) {
      Alert.alert('Error', t('request.errorNoFriends'));
      return;
    }

    if (startTime >= endTime) {
      Alert.alert('Error', t('request.errorTime'));
      return;
    }

    const requestData = {
      date: selectedDate.toISOString().split('T')[0],
      startTime: startTime.toTimeString().slice(0, 5),
      endTime: endTime.toTimeString().slice(0, 5),
      friendIds: selectedFriends,
    };

    sendRequest(requestData);
    
    Alert.alert(
      t('request.success'),
      t('request.sent', { count: selectedFriends.length }),
      [
        {
          text: t('common.ok'),
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t('request.title')}</Text>
        
        {/* Date Picker */}
        <View style={styles.section}>
          <Text style={styles.label}>{t('request.date')}</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.pickerText}>{formatDate(selectedDate)}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) setSelectedDate(date);
              }}
              minimumDate={new Date()}
            />
          )}
        </View>

        {/* Start Time Picker */}
        <View style={styles.section}>
          <Text style={styles.label}>{t('request.startTime')}</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowStartTimePicker(true)}
          >
            <Text style={styles.pickerText}>{formatTime(startTime)}</Text>
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

        {/* End Time Picker */}
        <View style={styles.section}>
          <Text style={styles.label}>{t('request.endTime')}</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowEndTimePicker(true)}
          >
            <Text style={styles.pickerText}>{formatTime(endTime)}</Text>
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

        {/* Friend Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>
            {t('request.selectFriends')} ({selectedFriends.length} {t('request.selected')})
          </Text>
          {friends.length === 0 ? (
            <View style={styles.emptyFriendsContainer}>
              <Text style={styles.emptyFriendsText}>{t('request.noFriends')}</Text>
              <Text style={styles.emptyFriendsSubtext}>
                {t('request.noFriendsSubtext')}
              </Text>
            </View>
          ) : (
            friends.map((friend) => (
              <TouchableOpacity
                key={friend.id}
                style={[
                  styles.friendItem,
                  selectedFriends.includes(friend.id) && styles.friendItemSelected,
                ]}
                onPress={() => toggleFriend(friend.id)}
              >
                <Text style={[
                  styles.friendName,
                  selectedFriends.includes(friend.id) && styles.friendNameSelected,
                ]}>
                  {friend.name}
                </Text>
                {selectedFriends.includes(friend.id) && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Send Button */}
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSendRequest}
        >
          <Text style={styles.sendButtonText}>{t('request.send')}</Text>
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
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 10,
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
  friendItemSelected: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  friendName: {
    fontSize: 16,
    color: '#2c3e50',
  },
  friendNameSelected: {
    fontWeight: '600',
    color: '#2e7d32',
  },
  checkmark: {
    fontSize: 20,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
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
