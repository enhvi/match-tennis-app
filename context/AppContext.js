import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNotifications, DEFAULT_PREFS } from './NotificationContext';
import { getPrefKeyForNotificationType } from '../utils/notificationPrefsMap';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where,
  startAt,
  endAt,
} from 'firebase/firestore';
import { db, serverTimestamp } from '../firebaseConfig';
import { scheduleConfirmedMatchReminder, cancelMatchReminder } from '../utils/matchReminders';

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
  const { prefs: notificationPrefs } = useNotifications(); // requestExpiryTiming, local fallback
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);

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

    const notificationsRef = collection(db, 'users', userId, 'notifications');
    const notificationsQuery = query(
      notificationsRef,
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    const unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
      const list = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setNotifications(list);
    });

  const enrichRequests = async (requestsList) => {
    const allFriendIds = [...new Set(requestsList.flatMap((r) => r.friendIds || []))];
    const friendDetailsMap = {};
    await Promise.all(
      allFriendIds.map(async (friendId) => {
        try {
          const userSnap = await getDoc(doc(db, 'users', friendId));
          if (userSnap.exists()) {
            const d = userSnap.data();
            friendDetailsMap[friendId] = {
              displayName: d.displayName || '',
              username: d.username || '',
              email: d.email || '',
              photoURL: d.photoURL || '',
            };
          }
        } catch (e) {
          console.error('Error loading friend profile:', e);
        }
      })
    );

    const enriched = await Promise.all(
      requestsList.map(async (request) => {
        let result = { ...request, friendDetails: friendDetailsMap };
        if (!request.creatorDisplayName && !request.creatorUsername && !request.creatorPhotoURL) {
          try {
            const creatorSnap = await getDoc(doc(db, 'users', request.creatorId));
            if (creatorSnap.exists()) {
              const creatorData = creatorSnap.data();
              result = {
                ...result,
                creatorDisplayName: creatorData.displayName || '',
                creatorUsername: creatorData.username || '',
                creatorPhotoURL: creatorData.photoURL || '',
              };
            }
          } catch (error) {
            console.error('Error loading creator profile:', error);
          }
        }
        return result;
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
      unsubscribeNotifications();
    unsubscribeCreated();
    unsubscribeInvited();
    };
  }, [userId]);

  const markNotificationAsRead = async (notificationId) => {
    if (!userId || userId === 'me' || !notificationId) return;
    try {
      const notifRef = doc(db, 'users', userId, 'notifications', notificationId);
      await updateDoc(notifRef, { read: true });
    } catch (e) {
      console.warn('Failed to mark notification as read', e);
    }
  };

  const addNotification = async (targetUserId, data) => {
    if (!targetUserId) return;
    try {
      const prefKey = getPrefKeyForNotificationType(data.type);
      if (prefKey) {
        const targetSnap = await getDoc(doc(db, 'users', targetUserId));
        const remote = targetSnap.exists() ? targetSnap.data().notificationPrefs : null;
        const allowed = remote?.[prefKey] ?? DEFAULT_PREFS[prefKey] ?? true;
        if (allowed === false) return;
      }
      await addDoc(collection(db, 'users', targetUserId, 'notifications'), {
        ...data,
        createdAt: serverTimestamp(),
        read: false,
      });
    } catch (e) {
      console.warn('Failed to create notification', e);
    }
  };

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
    if (friendId !== userId) throw new Error('FORBIDDEN');
    const requestRef = doc(db, 'matchRequests', requestId);
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(requestRef);
      if (!snap.exists()) return;
      const data = snap.data();
      if (data.status === 'confirmed' || data.status === 'completed') {
        throw new Error('MATCH_FULL');
      }
      const playersNeeded = data.playersNeeded || 2;
      const requiredAcceptances = Math.max(playersNeeded - 1, 1);
      const existingAcceptedCount = Object.values(data.responses || {}).filter(
        (r) => r?.status === 'accepted'
      ).length;
      if (existingAcceptedCount >= requiredAcceptances) {
        throw new Error('MATCH_FULL');
      }
      const responses = data.responses || {};
      const updated = {
        status: 'accepted',
        acceptedStart,
        acceptedEnd,
        responderId: friendId,
        responderName: displayName || '',
        responderUsername: username || '',
        responderPhotoURL: photoURL || '',
        updatedAt: serverTimestamp(),
      };
      const updatedResponses = { ...responses, [friendId]: updated };
      const acceptedCount = Object.values(updatedResponses).filter(
        (r) => r?.status === 'accepted'
      ).length;
      const updateData = { [`responses.${friendId}`]: updated };
      if (acceptedCount >= requiredAcceptances) {
        updateData.readyForConfirmation = true;
      }
      transaction.update(requestRef, updateData);
    });
  };

  const confirmMatch = async (requestId, finalStartTime, finalEndTime = null) => {
    const requestRef = doc(db, 'matchRequests', requestId);
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(requestRef);
      if (!snap.exists()) throw new Error('NOT_FOUND');
      const d = snap.data();
      if (d.creatorId !== userId) throw new Error('FORBIDDEN');
      if (d.status !== 'pending') throw new Error('INVALID_STATE');
      const accepted = Object.values(d.responses || {}).filter((r) => r?.status === 'accepted');
      const declined = Object.values(d.responses || {}).filter((r) => r?.status === 'declined');
      const requiredAcceptances = Math.max((d.playersNeeded || 2) - 1, 1);
      if (accepted.length < requiredAcceptances || declined.length > 0) {
        throw new Error('INVALID_STATE');
      }
      if (!finalStartTime) throw new Error('INVALID_FINAL_TIME');
      transaction.update(requestRef, {
        status: 'confirmed',
        finalStartTime,
        finalEndTime: finalEndTime || null,
        readyForConfirmation: false,
        finalizedBy: userId,
        finalizedAt: serverTimestamp(),
      });
    });
    const freshSnap = await getDoc(requestRef);
    if (freshSnap.exists()) {
      await scheduleConfirmedMatchReminder(requestId, freshSnap.data(), notificationPrefs);
    }
  };

  const completeMatch = async (requestId, feedbackRating = null) => {
    await cancelMatchReminder(requestId);
    const requestRef = doc(db, 'matchRequests', requestId);
    const snap = await getDoc(requestRef);
    if (!snap.exists()) throw new Error('NOT_FOUND');
    const d = snap.data();
    if (d.creatorId !== userId) throw new Error('FORBIDDEN');
    if (d.status !== 'confirmed') throw new Error('INVALID_STATE');
    const payload = {
      status: 'completed',
      completedAt: serverTimestamp(),
    };
    if (feedbackRating != null && Number.isFinite(feedbackRating) && feedbackRating >= 1 && feedbackRating <= 5) {
      payload.creatorFeedbackRating = feedbackRating;
    }
    await updateDoc(requestRef, payload);
  };

  const cancelRequest = async (requestId, reason = '') => {
    const requestRef = doc(db, 'matchRequests', requestId);
    const requestSnap = await getDoc(requestRef);
    if (!requestSnap.exists()) throw new Error('NOT_FOUND');
    const requestData = requestSnap.data();
    if (requestData.creatorId !== userId) throw new Error('FORBIDDEN');
    const trimmedReason = reason.trim();
    await updateDoc(requestRef, {
      status: 'cancelled',
      cancelledAt: serverTimestamp(),
      cancelReason: trimmedReason,
      cancelledBy: userId,
      cancelledByName: displayName || username || '',
    });
    await cancelMatchReminder(requestId);
    if (requestData) {
      // Match notifications are generated by Cloud Functions.
    }
  };

  const deleteRequest = async (requestId) => {
    await cancelMatchReminder(requestId);
    const requestRef = doc(db, 'matchRequests', requestId);
    const snap = await getDoc(requestRef);
    if (!snap.exists()) throw new Error('NOT_FOUND');
    if (snap.data().creatorId !== userId) throw new Error('FORBIDDEN');
    await deleteDoc(requestRef);
  };

  const updateRequest = async (requestId, requestData) => {
    const requestRef = doc(db, 'matchRequests', requestId);
    const snap = await getDoc(requestRef);
    if (!snap.exists()) throw new Error('NOT_FOUND');
    if (snap.data().creatorId !== userId) throw new Error('FORBIDDEN');
    await updateDoc(requestRef, {
      ...requestData,
      status: 'pending',
      responses: {},
      updatedAt: serverTimestamp(),
    });
  };

  const acceptResponse = async (requestId, friendId) => {
    if (friendId !== userId) throw new Error('FORBIDDEN');
    const requestRef = doc(db, 'matchRequests', requestId);
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(requestRef);
      if (!snap.exists()) {
        return;
      }
      const data = snap.data();
      if (data.status === 'confirmed' || data.status === 'completed') {
        throw new Error('MATCH_FULL');
      }
      const playersNeeded = data.playersNeeded || 2;
      const requiredAcceptances = Math.max(playersNeeded - 1, 1);
      const existingAcceptedCount = Object.values(data.responses || {}).filter(
        (r) => r?.status === 'accepted'
      ).length;
      if (existingAcceptedCount >= requiredAcceptances) {
        throw new Error('MATCH_FULL');
      }
      const responses = data.responses || {};
      const existing = responses[friendId] || {};
      const updated = {
        ...existing,
        status: 'accepted',
        acceptedStart: data.startTime,
        acceptedEnd: data.endTime || null,
        responderId: friendId,
        responderName: displayName || '',
        responderUsername: username || '',
        responderPhotoURL: photoURL || '',
        updatedAt: serverTimestamp(),
      };

      const updatedResponses = { ...responses, [friendId]: updated };
      const acceptedCount = Object.values(updatedResponses).filter(
        (resp) => resp?.status === 'accepted'
      ).length;
      const declinedCount = Object.values(updatedResponses).filter(
        (resp) => resp?.status === 'declined'
      ).length;

      const updatePayload = {
        [`responses.${friendId}`]: updated,
      };
      if (acceptedCount >= requiredAcceptances) {
        updatePayload.readyForConfirmation = true;
      }
      transaction.update(requestRef, updatePayload);
    });
  };

  const declineResponse = async (requestId, friendId, responderInfo = null) => {
    if (friendId !== userId) throw new Error('FORBIDDEN');
    const requestRef = doc(db, 'matchRequests', requestId);
    const requestSnap = await getDoc(requestRef);
    const requestData = requestSnap.exists() ? requestSnap.data() : null;
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
    if (requestData?.creatorId) {
      // Match notifications are generated by Cloud Functions.
    }
  };

  const withdrawFromMatch = async (requestId, friendId, reason = '') => {
    if (friendId !== userId) throw new Error('FORBIDDEN');
    const requestRef = doc(db, 'matchRequests', requestId);
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(requestRef);
      if (!snap.exists()) return;
      const data = snap.data();
      const responses = data.responses || {};
      const myResponse = responses[friendId];
      if (myResponse?.status !== 'accepted') return;

      const updated = {
        ...myResponse,
        status: 'withdrawn',
        acceptedStart: null,
        acceptedEnd: null,
        updatedAt: serverTimestamp(),
        withdrawReason: reason || null,
      };
      const updatedResponses = { ...responses, [friendId]: updated };
      const acceptedCount = Object.values(updatedResponses).filter(
        (r) => r?.status === 'accepted'
      ).length;
      const playersNeeded = data.playersNeeded || 2;
      const requiredAcceptances = Math.max(playersNeeded - 1, 1);

      transaction.update(requestRef, {
        [`responses.${friendId}`]: updated,
        status: acceptedCount < requiredAcceptances ? 'pending' : 'confirmed',
        readyForConfirmation: acceptedCount >= requiredAcceptances,
        finalStartTime: acceptedCount < requiredAcceptances ? null : data.finalStartTime || null,
        finalEndTime: acceptedCount < requiredAcceptances ? null : data.finalEndTime || null,
      });
    });

    const afterSnap = await getDoc(requestRef);
    if (afterSnap.exists()) {
      const d = afterSnap.data();
      if (d.status === 'pending') {
        await cancelMatchReminder(requestId);
      }
    }
  };

  const sendFriendInvite = async () => {
    return username || '';
  };

  const searchUsers = async (searchTerm) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term || term.length < 2) {
      return [];
    }

    const usersRef = collection(db, 'users');
    const friendIds = new Set(friends.map((f) => f.id));
    friendIds.add(userId);

    const resultsMap = new Map();

    try {
      const usernameQuery = query(
        usersRef,
        orderBy('usernameLower'),
        startAt(term),
        endAt(term + '\uf8ff'),
        limit(20)
      );
      const usernameSnap = await getDocs(usernameQuery);
      usernameSnap.docs.forEach((d) => {
        if (!friendIds.has(d.id) && d.id !== userId) {
          resultsMap.set(d.id, { id: d.id, ...d.data() });
        }
      });

      try {
        const displayNameQuery = query(
          usersRef,
          orderBy('displayNameLower'),
          startAt(term),
          endAt(term + '\uf8ff'),
          limit(15)
        );
        const displayNameSnap = await getDocs(displayNameQuery);
        displayNameSnap.docs.forEach((d) => {
          if (!friendIds.has(d.id) && d.id !== userId) {
            resultsMap.set(d.id, { id: d.id, ...d.data() });
          }
        });
      } catch (_) {
        // displayNameLower index may not exist or some users lack the field
      }
    } catch (e) {
      console.error('Search error:', e);
      return [];
    }

    return Array.from(resultsMap.values());
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

    await addNotification(targetUser.id, {
      type: 'friendRequest',
      fromName: displayName || username,
      fromUsername: username,
      fromPhotoURL: photoURL,
      relatedId: targetUser.id,
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

    await addNotification(friendUid, {
      type: 'friendAccepted',
      fromName: displayName || username,
      fromPhotoURL: photoURL,
      relatedId: friendUid,
    });
  };

  const declineFriendRequest = async (requestId) => {
    await deleteDoc(doc(db, 'users', userId, 'friendRequests', requestId));
  };

  const deleteFriendRequest = async (requestId) => {
    await deleteDoc(doc(db, 'users', userId, 'friendRequests', requestId));
  };

  return (
    <AppContext.Provider
      value={{
        friends,
        requests,
        friendRequests,
        notifications,
        sendRequest,
        acceptTimeProposal,
        confirmMatch,
        completeMatch,
        cancelRequest,
        deleteRequest,
        updateRequest,
        acceptResponse,
        declineResponse,
        withdrawFromMatch,
        sendFriendInvite,
        searchUsers,
        addFriendByUsername,
        acceptFriendRequest,
        declineFriendRequest,
        deleteFriendRequest,
        markNotificationAsRead,
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
