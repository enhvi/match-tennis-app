import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  limit,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { useMessages } from '../context/MessagesContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { getConversationId } from '../utils/conversationId';

const APPROX_HEADER_HEIGHT = 56;

/** Zusätzlicher Abstand unter Android — gemeldete Tastaturhöhe ist oft zu klein (Expo Go / Hersteller). */
const ANDROID_KEYBOARD_BUFFER_PX = 96;

/**
 * Robuste Tastaturhöhe: max(height, Fenster bis screenY), plus Puffer + Safe-Area.
 */
function computeAndroidBottomInset(e, safeBottom) {
  const end = e?.endCoordinates;
  if (!end) {
    return ANDROID_KEYBOARD_BUFFER_PX + safeBottom;
  }
  const winH = Dimensions.get('window').height;
  let h = typeof end.height === 'number' ? end.height : 0;
  if (typeof end.screenY === 'number' && winH > 0) {
    const fromLayout = winH - end.screenY;
    if (fromLayout > 120 && fromLayout < winH * 0.65) {
      h = Math.max(h, fromLayout);
    }
  }
  return h + ANDROID_KEYBOARD_BUFFER_PX + safeBottom;
}

export default function ChatScreen({ route, navigation }) {
  const { friendId, friendName: nameParam } = route.params || {};
  const { user } = useAuth();
  const { sendMessage, maxMessageLength, markConversationRead } = useMessages();
  const { t, primaryLanguage } = useLanguage();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const userId = user?.uid;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  /** Android (v. a. Expo Go): Fenster wird oft nicht mit der Tastatur verkleinert — Abstand = Tastaturhöhe */
  const [androidKeyboardInset, setAndroidKeyboardInset] = useState(0);
  const listRef = useRef(null);
  const conversationId = userId && friendId ? getConversationId(userId, friendId) : null;

  const title = nameParam || friendId || t('messages.title');

  useEffect(() => {
    navigation.setOptions({ title });
  }, [navigation, title]);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return undefined;
    }
    const safeBottom = insets.bottom;
    const onShow = Keyboard.addListener('keyboardDidShow', (e) => {
      setAndroidKeyboardInset(computeAndroidBottomInset(e, safeBottom));
    });
    const onHide = Keyboard.addListener('keyboardDidHide', () => {
      setAndroidKeyboardInset(0);
    });
    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, [insets.bottom]);

  useEffect(() => {
    if (androidKeyboardInset > 0 && listRef.current) {
      const t = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 120);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [androidKeyboardInset, messages.length]);

  useEffect(() => {
    if (!userId || !friendId) {
      setLoading(false);
      return undefined;
    }
    const cid = getConversationId(userId, friendId);
    const q = query(
      collection(db, 'conversations', cid, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(200)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setMessages(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }))
        );
        setLoading(false);
      },
      (err) => {
        console.warn('Messages listener', err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [userId, friendId]);

  useEffect(() => {
    if (!conversationId || !markConversationRead || messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.senderId === userId) return;
    const ts = lastMessage.createdAt;
    const lastMessageMs =
      typeof ts?.toMillis === 'function'
        ? ts.toMillis()
        : typeof ts?.seconds === 'number'
          ? ts.seconds * 1000
          : Date.now();
    markConversationRead(conversationId, lastMessageMs);
  }, [conversationId, markConversationRead, messages, userId]);

  const formatTime = (ts) => {
    if (!ts?.toDate) return '';
    const d = ts.toDate();
    const locale = primaryLanguage === 'de' ? 'de-DE' : 'en-US';
    return d.toLocaleString(locale, {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !friendId || sending) return;
    try {
      setSending(true);
      setInput('');
      await sendMessage(friendId, text);
    } catch (e) {
      const msg = e?.message === 'MESSAGES_FRIENDS_ONLY' ? t('messages.friendsOnly') : e?.message || t('auth.errorGeneric');
      Alert.alert(t('messages.title'), msg);
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item }) => {
    const mine = item.senderId === userId;
    return (
      <View
        style={[
          styles.bubbleRow,
          mine ? styles.bubbleRowMine : styles.bubbleRowTheirs,
        ]}
      >
        <View
          style={[
            styles.bubble,
            { backgroundColor: mine ? colors.primary : colors.card },
            mine ? styles.bubbleMine : { borderColor: colors.border, borderWidth: 1 },
          ]}
        >
          <Text style={[styles.bubbleText, { color: mine ? '#fff' : colors.text }]}>{item.text}</Text>
          <Text style={[styles.timeText, { color: mine ? 'rgba(255,255,255,0.85)' : colors.textSecondary }]}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  const bottomPadNav = Math.max(insets.bottom, Platform.OS === 'android' ? 12 : 8);
  const inputBottomPad =
    Platform.OS === 'android' && androidKeyboardInset > 0 ? 10 : bottomPadNav;

  const keyboardVerticalOffsetIOS = insets.top + APPROX_HEADER_HEIGHT;

  if (!friendId) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <Text style={{ color: colors.textSecondary }}>{t('details.notFound')}</Text>
      </SafeAreaView>
    );
  }

  const inner = (
    <View style={styles.inner}>
      <Text style={[styles.hint, { color: colors.textSecondary }]}>{t('messages.coordinationHint')}</Text>
      {loading ? (
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      ) : (
        <FlatList
          ref={listRef}
          style={styles.list}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            messages.length === 0 && styles.listContentEmpty,
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        />
      )}
      <View
        style={[
          styles.inputWrap,
          {
            borderTopColor: colors.border,
            backgroundColor: colors.card,
            paddingBottom: inputBottomPad,
          },
        ]}
      >
        <View style={styles.inputRow}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder={t('messages.placeholder')}
            placeholderTextColor={colors.textSecondary}
            value={input}
            onChangeText={setInput}
            maxLength={maxMessageLength}
            multiline
            scrollEnabled
            textAlignVertical="top"
            underlineColorAndroid="transparent"
            importantForAutofill="no"
          />
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: colors.primary }, sending && styles.sendDisabled]}
            onPress={handleSend}
            disabled={sending || !input.trim()}
          >
            <Text style={styles.sendBtnText}>{t('messages.send')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingBottom: Platform.OS === 'android' ? androidKeyboardInset : 0,
        },
      ]}
    >
      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior="padding"
          keyboardVerticalOffset={keyboardVerticalOffsetIOS}
        >
          {inner}
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.flex}>{inner}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  inner: {
    flex: 1,
  },
  hint: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 12,
    lineHeight: 16,
  },
  loader: { marginTop: 24 },
  list: {
    flex: 1,
    minHeight: 0,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 12,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  bubbleRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bubbleRowMine: { justifyContent: 'flex-end' },
  bubbleRowTheirs: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '85%',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bubbleMine: {},
  bubbleText: {
    fontSize: 16,
    lineHeight: 20,
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
  },
  inputWrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'android' ? 10 : 10,
    paddingBottom: Platform.OS === 'android' ? 10 : 10,
    marginRight: 8,
    maxHeight: 100,
    minHeight: 44,
    fontSize: 16,
  },
  sendBtn: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sendDisabled: {
    opacity: 0.6,
  },
  sendBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
