import React, { createContext, useState, useContext, useEffect } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db, serverTimestamp } from '../firebaseConfig';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({
  children,
  userId = 'me',
  userEmail = '',
  username = '',
  displayName = '',
  bio = '',
  photoURL = '',
  sports = [],
}) => {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);

  useEffect(() => {
    if (!userId || userId === 'me') {
      setFriends([]);
      setFriendRequests([]);
    return undefined;
    }

    const friendsRef = collection(db, 'users', userId, 'friends');
    const requestsRef = collection(db, 'users', userId, 'friendRequests');
  const matchesRef = collection(db, 'matchRequests');

    const unsubscribeFriends = onSnapshot(friendsRef, async (snapshot) => {
      const baseFriends = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      const enrichedFriends = await Promise.all(
        baseFriends.map(async (friend) => {
          try {
            const userSnap = await getDoc(doc(db, 'users', friend.id));
            return userSnap.exists()
              ? { ...friend, ...userSnap.data() }
              : friend;
          } catch (error) {
            console.error('Error loading friend profile:', error);
            return friend;
          }
        })
      );

      setFriends(enrichedFriends);
    });

    const unsubscribeRequests = onSnapshot(requestsRef, (snapshot) => {
      const list = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setFriendRequests(list);
    });

  const enrichRequests = async (requestsList) => {
    const enriched = await Promise.all(
      requestsList.map(async (request) => {
        if (request.creatorDisplayName || request.creatorUsername || request.creatorPhotoURL) {
          return request;
        }
        try {
          const creatorSnap = await getDoc(doc(db, 'users', request.creatorId));
          if (!creatorSnap.exists()) {
            return request;
          }
          const creatorData = creatorSnap.data();
          return {
            ...request,
            creatorDisplayName: creatorData.displayName || '',
            creatorUsername: creatorData.username || '',
            creatorPhotoURL: creatorData.photoURL || '',
          };
        } catch (error) {
          console.error('Error loading creator profile:', error);
          return request;
        }
      })
    );
    return enriched;
  };

  const unsubscribeCreated = onSnapshot(
    query(matchesRef, where('creatorId', '==', userId)),
    (snapshot) => {
      const createdRequests = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      (async () => {
        const enriched = await enrichRequests(createdRequests);
        setRequests((prev) => {
          const invited = prev.filter((req) => req.creatorId !== userId);
          return [...invited, ...enriched];
        });
      })();
    }
  );

  const unsubscribeInvited = onSnapshot(
    query(matchesRef, where('friendIds', 'array-contains', userId)),
    (snapshot) => {
      const invitedRequests = snapshot.docs
        .map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))
        .filter((req) => req.responses?.[userId]?.status !== 'declined');
      (async () => {
        const enriched = await enrichRequests(invitedRequests);
        setRequests((prev) => {
          const created = prev.filter((req) => req.creatorId === userId);
          return [...created, ...enriched];
        });
      })();
    }
  );

    return () => {
      unsubscribeFriends();
      unsubscribeRequests();
    unsubscribeCreated();
    unsubscribeInvited();
    };
  }, [userId]);

  const sendRequest = async (requestData) => {
    const newRequest = {
      ...requestData,
      creatorId: userId,
      creatorDisplayName: displayName || '',
      creatorUsername: username || '',
      creatorPhotoURL: photoURL || '',
      status: 'pending',
      createdAt: serverTimestamp(),
      responses: {},
    };
    const docRef = await addDoc(collection(db, 'matchRequests'), newRequest);
    return { id: docRef.id, ...newRequest };
  };

  const acceptTimeProposal = async (requestId, friendId, acceptedStart, acceptedEnd) => {
    const requestRef = doc(db, 'matchRequests', requestId);
    const updatedResponses = {};
    updatedResponses[friendId] = {
      status: 'proposed',
      acceptedStart: acceptedStart,
      acceptedEnd: acceptedEnd,
      responderId: friendId,
      responderName: displayName || '',
      responderUsername: username || '',
      responderPhotoURL: photoURL || '',
      updatedAt: serverTimestamp(),
    };
    await updateDoc(requestRef, {
      [`responses.${friendId}`]: updatedResponses[friendId],
    });
  };

  const confirmMatch = async (requestId) => {
    const requestRef = doc(db, 'matchRequests', requestId);
    await updateDoc(requestRef, { status: 'confirmed' });
  };

  const completeMatch = async (requestId) => {
    const requestRef = doc(db, 'matchRequests', requestId);
    await updateDoc(requestRef, { status: 'completed', completedAt: serverTimestamp() });
  };

  const cancelRequest = async (requestId) => {
    const requestRef = doc(db, 'matchRequests', requestId);
    await updateDoc(requestRef, { status: 'cancelled' });
  };

  const deleteRequest = async (requestId) => {
    await deleteDoc(doc(db, 'matchRequests', requestId));
  };

  const updateRequest = async (requestId, requestData) => {
    const requestRef = doc(db, 'matchRequests', requestId);
    await updateDoc(requestRef, {
      ...requestData,
      status: 'pending',
      responses: {},
      updatedAt: serverTimestamp(),
    });
  };

  const acceptResponse = async (requestId, friendId) => {
    const requestRef = doc(db, 'matchRequests', requestId);
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(requestRef);
      if (!snap.exists()) {
        return;
      }
      const data = snap.data();
      const responses = data.responses || {};
      const existing = responses[friendId] || {};
      const updated = {
        ...existing,
        status: 'accepted',
        updatedAt: serverTimestamp(),
      };

      transaction.update(requestRef, {
        [`responses.${friendId}`]: updated,
      });

      const playersNeeded = data.playersNeeded || 2;
      const requiredAcceptances = Math.max(playersNeeded - 1, 1);
      const updatedResponses = { ...responses, [friendId]: updated };
      const acceptedCount = Object.values(updatedResponses).filter(
        (resp) => resp.status === 'accepted'
      ).length;
      const declinedCount = Object.values(updatedResponses).filter(
        (resp) => resp.status === 'declined'
      ).length;

      if (acceptedCount >= requiredAcceptances && declinedCount === 0) {
        transaction.update(requestRef, { status: 'confirmed' });
      }
    });
  };

  const declineResponse = async (requestId, friendId, responderInfo = null) => {
    const requestRef = doc(db, 'matchRequests', requestId);
    const updates = {
      [`responses.${friendId}.status`]: 'declined',
      [`responses.${friendId}.updatedAt`]: serverTimestamp(),
    };

    if (responderInfo) {
      updates[`responses.${friendId}.responderId`] = responderInfo.id || friendId;
      updates[`responses.${friendId}.responderName`] = responderInfo.name || '';
      updates[`responses.${friendId}.responderUsername`] = responderInfo.username || '';
      updates[`responses.${friendId}.responderPhotoURL`] = responderInfo.photoURL || '';
    }

    await updateDoc(requestRef, updates);
  };

  const sendFriendInvite = async () => {
    return username || '';
  };

  const addFriendByUsername = async (usernameInput) => {
    const cleanedUsername = usernameInput.trim().toLowerCase();

    if (!cleanedUsername) {
      throw new Error('Username is required');
    }

    const usersRef = collection(db, 'users');
    const usersQuery = query(usersRef, where('usernameLower', '==', cleanedUsername));
    const results = await getDocs(usersQuery);

    if (results.empty) {
      throw new Error('User not found');
    }

    const targetUser = results.docs[0];
    const targetData = targetUser.data();

    if (targetUser.id === userId) {
      throw new Error('You cannot add yourself');
    }

    const existingFriends = friends.find((friend) => friend.id === targetUser.id);
    if (existingFriends) {
      throw new Error('User is already a friend');
    }

    await addDoc(collection(db, 'users', targetUser.id, 'friendRequests'), {
      fromUid: userId,
      fromUsername: username,
      fromDisplayName: displayName,
      fromBio: bio,
      fromPhotoURL: photoURL,
      fromEmail: userEmail,
      createdAt: serverTimestamp(),
    });

    return targetUser.id;
  };

  const acceptFriendRequest = async (requestId) => {
    const request = friendRequests.find((req) => req.id === requestId);
    if (!request) {
      return;
    }

    const friendUid = request.fromUid;
    if (!friendUid) {
      throw new Error('Invalid friend request');
    }

    const friendData = {
      uid: friendUid,
      username: request.fromUsername || '',
      displayName: request.fromDisplayName || '',
      bio: request.fromBio || '',
      photoURL: request.fromPhotoURL || '',
      email: request.fromEmail || '',
      status: 'active',
      createdAt: serverTimestamp(),
    };

    const currentUserData = {
      uid: userId,
      username: username || '',
      displayName: displayName || '',
      bio: bio || '',
      photoURL: photoURL || '',
      sports: sports || [],
      email: userEmail || '',
      status: 'active',
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'users', userId, 'friends', friendUid), friendData, { merge: true });
    await setDoc(doc(db, 'users', friendUid, 'friends', userId), currentUserData, { merge: true });
    await deleteDoc(doc(db, 'users', userId, 'friendRequests', requestId));
  };

  return (
    <AppContext.Provider
      value={{
        friends,
        requests,
        friendRequests,
        sendRequest,
        acceptTimeProposal,
        confirmMatch,
        completeMatch,
        cancelRequest,
        deleteRequest,
        updateRequest,
        acceptResponse,
        declineResponse,
        sendFriendInvite,
        addFriendByUsername,
        acceptFriendRequest,
        userId,
        currentUser: {
          uid: userId,
          email: userEmail,
          username: username,
          displayName: displayName,
          bio: bio,
          photoURL: photoURL,
          sports: sports,
        },
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
