import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_PREFIX = '@findamatch_notif_id_';

function getStartDateTime(request) {
  if (!request?.date) return null;
  const [y, m, d] = request.date.split('-').map(Number);
  if (!y || !m || !d) return null;
  const responses = request.responses || {};
  const accepted = Object.values(responses).find((r) => r?.status === 'accepted');
  const timeStr = accepted?.acceptedStart || request.startTime;
  if (!timeStr) return null;
  const [h, min] = timeStr.split(':').map(Number);
  return new Date(y, m - 1, d, h || 0, min || 0, 0, 0);
}

export async function scheduleConfirmedMatchReminder(requestId, request, prefs) {
  // Emergency safe mode: disable local notification scheduling in release builds.
  return;
  if (Platform.OS === 'web' || !prefs?.matchReminder || !requestId) return;
  await cancelMatchReminder(requestId);
  const start = getStartDateTime(request);
  if (!start) return;
  const triggerDate = new Date(start.getTime() - 60 * 60 * 1000);
  if (triggerDate <= new Date()) return;
  try {
    const Notifications = require('expo-notifications');
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Match in 1 hour',
        body: request.sport
          ? `${request.sport} — ${request.date}`
          : `Match — ${request.date}`,
        data: { requestId, type: 'matchReminder' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
    await AsyncStorage.setItem(`${STORAGE_PREFIX}${requestId}`, id);
  } catch (e) {
    console.warn('scheduleMatchReminder', e);
  }
}

export async function cancelMatchReminder(requestId) {
  // Emergency safe mode: disable local notification cancellation in release builds.
  return;
  if (Platform.OS === 'web' || !requestId) return;
  try {
    const raw = await AsyncStorage.getItem(`${STORAGE_PREFIX}${requestId}`);
    if (!raw) return;
    const Notifications = require('expo-notifications');
    await Notifications.cancelScheduledNotificationAsync(raw);
    await AsyncStorage.removeItem(`${STORAGE_PREFIX}${requestId}`);
  } catch (e) {
    console.warn('cancelMatchReminder', e);
  }
}
