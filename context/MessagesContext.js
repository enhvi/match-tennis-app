import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from './AuthContext';
import { useApp } from './AppContext';
import { getConversationId, MAX_MESSAGE_LENGTH } from '../utils/conversationId';

const MessagesContext = createContext(null);

export const useMessages = () => {
  const ctx = useContext(MessagesContext);
  if (!ctx) {
    throw new Error('useMessages must be used within MessagesProvider');
  }
  return ctx;
};

export function MessagesProvider({ children }) {
  const { user } = useAuth();
  const { friends = [] } = useApp();
  const userId = user?.uid;
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(null);

  const toMillis = (ts) => {
    if (!ts) return 0;
    if (typeof ts.toMillis === 'function') return ts.toMillis();
    if (typeof ts.seconds === 'number') return ts.seconds * 1000;
    return 0;
  };

  useEffect(() => {
    if (!userId) {
      setConversations([]);
      setLoading(false);
      setListError(null);
      return undefined;
    }

    // Kein orderBy auf lastMessageAt: sonst braucht Firestore einen zusammengesetzten Index (oft nicht deployt).
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId),
      limit(50)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setListError(null);
        const list = snap.docs.map((d) => {
          const data = d.data();
          const parts = data.participants || [];
          const otherId = parts.find((p) => p !== userId) || '';
          return {
            id: d.id,
            ...data,
            otherUserId: otherId,
          };
        });
        list.sort((a, b) => {
          const bt = Math.max(toMillis(b.lastMessageAt), toMillis(b.createdAt));
          const at = Math.max(toMillis(a.lastMessageAt), toMillis(a.createdAt));
          return bt - at;
        });
        setConversations(list);
        setLoading(false);
      },
      (err) => {
        console.warn('Conversations subscription', err);
        setListError(err?.message || String(err));
        setConversations([]);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [userId]);

  const sendMessage = useCallback(
    async (friendId, text) => {
      if (!userId) {
        throw new Error('Not signed in');
      }
      const trimmed = (text || '').trim();
      if (!trimmed) {
        throw new Error('Empty message');
      }
      if (trimmed.length > MAX_MESSAGE_LENGTH) {
        throw new Error('Message too long');
      }
      const isFriend = friends.some((f) => f.id === friendId);
      if (!isFriend) {
        throw new Error('MESSAGES_FRIENDS_ONLY');
      }

      const cid = getConversationId(userId, friendId);
      const convRef = doc(db, 'conversations', cid);
      const messagesCol = collection(db, 'conversations', cid, 'messages');

      const convSnap = await getDoc(convRef);
      const preview = trimmed.slice(0, 120);
      const meta = {
        lastMessageAt: serverTimestamp(),
        lastMessagePreview: preview,
        lastMessageSenderId: userId,
      };

      if (!convSnap.exists()) {
        await setDoc(convRef, {
          participants: [userId, friendId].sort(),
          createdAt: serverTimestamp(),
          ...meta,
        });
      } else {
        await updateDoc(convRef, meta);
      }

      await addDoc(messagesCol, {
        senderId: userId,
        text: trimmed,
        createdAt: serverTimestamp(),
      });
    },
    [userId, friends]
  );

  const value = useMemo(
    () => ({
      conversations: userId ? conversations : [],
      loading: userId ? loading : false,
      listError: userId ? listError : null,
      sendMessage,
      maxMessageLength: MAX_MESSAGE_LENGTH,
    }),
    [userId, conversations, loading, listError, sendMessage]
  );

  return <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>;
}
