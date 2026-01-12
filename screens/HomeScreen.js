import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  FlatList,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

export default function HomeScreen({ navigation }) {
  const { requests, friends } = useApp();
  const { t } = useLanguage();
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const confirmedMatches = requests.filter(r => r.status === 'confirmed');

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const renderRequestItem = ({ item }) => {
    const requestFriends = friends.filter(f => item.friendIds.includes(f.id));
    return (
      <TouchableOpacity
        style={styles.requestCard}
        onPress={() => navigation.navigate('Requests', { requestId: item.id })}
      >
        <Text style={styles.requestDate}>{formatDate(item.date)}</Text>
        <Text style={styles.requestTime}>{item.startTime} - {item.endTime}</Text>
        <Text style={styles.requestFriends}>
          {requestFriends.length} friend(s) invited
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="auto" />
      
      {/* Menu button in top right corner */}
      <TouchableOpacity
        style={styles.headerMenuButton}
        onPress={() => {
          console.log('Header menu button pressed');
          navigation.navigate('Menu');
        }}
        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        activeOpacity={0.7}
      >
        <Text style={styles.headerMenuIcon}>☰</Text>
      </TouchableOpacity>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t('app.title')}</Text>
        <Text style={styles.subtitle}>{t('app.subtitle')}</Text>

        {pendingRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('app.pendingRequests')}</Text>
            <FlatList
              data={pendingRequests}
              renderItem={renderRequestItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}

        {confirmedMatches.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('app.confirmedMatches')}</Text>
            <FlatList
              data={confirmedMatches}
              renderItem={renderRequestItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}

        {requests.length === 0 && (
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
        <Text style={styles.versionText}>v0.1.0</Text>
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
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
  requestDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  requestTime: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  requestFriends: {
    fontSize: 12,
    color: '#95a5a6',
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
  headerMenuButton: {
    position: 'absolute',
    top: 10,
    right: 15,
    zIndex: 1000,
    padding: 12,
    minWidth: 50,
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerMenuIcon: {
    color: '#fff',
    fontSize: 32,
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
