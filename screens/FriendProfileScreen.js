import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useLanguage } from '../context/LanguageContext';
import ProfileView from '../components/ProfileView';

export default function FriendProfileScreen({ route, navigation }) {
  const { friendId, friend: initialFriend } = route?.params || {};
  const { t } = useLanguage();
  const [profile, setProfile] = useState(initialFriend || null);
  const [friendList, setFriendList] = useState([]);
  const [matchCount, setMatchCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSports, setShowSports] = useState(false);
  const [showFriends, setShowFriends] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: t('friendProfile.title') });
  }, [navigation, t]);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (!friendId) {
        if (isMounted) {
          setError(t('friendProfile.notFound'));
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        if (!profile) {
          const profileSnap = await getDoc(doc(db, 'users', friendId));
          if (profileSnap.exists() && isMounted) {
            setProfile({ id: friendId, ...profileSnap.data() });
          }
        }

        const friendsSnap = await getDocs(collection(db, 'users', friendId, 'friends'));
        const baseList = friendsSnap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        const list = await Promise.all(
          baseList.map(async (friend) => {
            if (friend.photoURL && (friend.displayName || friend.username)) {
              return friend;
            }
            try {
              const userSnap = await getDoc(doc(db, 'users', friend.id));
              return userSnap.exists() ? { ...friend, ...userSnap.data() } : friend;
            } catch (profileError) {
              console.error('Error loading friend-of-friend profile:', profileError);
              return friend;
            }
          })
        );
        if (isMounted) {
          setFriendList(list);
        }

        const createdQuery = query(
          collection(db, 'matchRequests'),
          where('status', '==', 'completed'),
          where('creatorId', '==', friendId)
        );
        const invitedQuery = query(
          collection(db, 'matchRequests'),
          where('status', '==', 'completed'),
          where('friendIds', 'array-contains', friendId)
        );
        const [createdSnap, invitedSnap] = await Promise.all([
          getDocs(createdQuery),
          getDocs(invitedQuery),
        ]);
        const matchIds = new Set();
        createdSnap.docs.forEach((docSnap) => matchIds.add(docSnap.id));
        invitedSnap.docs.forEach((docSnap) => matchIds.add(docSnap.id));
        if (isMounted) {
          setMatchCount(matchIds.size);
        }
      } catch (loadError) {
        console.error('Error loading friend profile:', loadError);
        if (isMounted) {
          setError(t('friendProfile.loadError'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [friendId, profile, t]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  const name = profile?.displayName || profile?.username || friendId || '';
  const username = profile?.username || friendId || '';
  const bio = profile?.bio || '';
  const sports = profile?.sports || [];

  return (
    <SafeAreaView style={styles.container}>
      <ProfileView
        name={name}
        username={username}
        bio={bio}
        photoURL={profile?.photoURL || ''}
        sports={sports}
        friends={friendList}
        matchCount={matchCount}
        showSports={showSports}
        onToggleSports={() => setShowSports((prev) => !prev)}
        showFriends={showFriends}
        onToggleFriends={() => setShowFriends((prev) => !prev)}
        t={t}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  errorText: {
    margin: 20,
    color: '#e53935',
    fontSize: 16,
    textAlign: 'center',
  },
});
