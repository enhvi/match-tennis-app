import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';

export default function UserSelectScreen({ onSelectUser }) {
  const [selectedUser, setSelectedUser] = useState('user1');

  const users = [
    { id: 'user1', name: 'You (User 1)' },
    { id: 'user2', name: 'Friend 1 (User 2)' },
    { id: 'user3', name: 'Friend 2 (User 3)' },
  ];

  const handleContinue = () => {
    if (selectedUser) {
      onSelectUser(selectedUser);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Select Your User</Text>
        <Text style={styles.subtitle}>
          Choose which user you want to test as
        </Text>

        {users.map((user) => (
          <TouchableOpacity
            key={user.id}
            style={[
              styles.userButton,
              selectedUser === user.id && styles.userButtonSelected,
            ]}
            onPress={() => setSelectedUser(user.id)}
          >
            <Text
              style={[
                styles.userText,
                selectedUser === user.id && styles.userTextSelected,
              ]}
            >
              {user.name}
            </Text>
            {selectedUser === user.id && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          💡 Tip: For testing with a friend, have them select a different user
          (e.g., User 2) on their phone
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 40,
  },
  userButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#dee2e6',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },
  userButtonSelected: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4CAF50',
  },
  userText: {
    fontSize: 18,
    color: '#2c3e50',
  },
  userTextSelected: {
    fontWeight: '600',
    color: '#2e7d32',
  },
  checkmark: {
    fontSize: 24,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 30,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  note: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
  },
});
