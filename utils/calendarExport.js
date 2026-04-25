import { Linking, Platform } from 'react-native';

function pad(n) {
  return String(n).padStart(2, '0');
}

/**
 * Opens Google Calendar compose with a single event (works on mobile web / device browsers).
 */
export function openMatchInGoogleCalendar(request, finalStart, finalEnd) {
  if (!request?.date || !finalStart) return;
  const [y, m, d] = request.date.split('-').map(Number);
  if (!y || !m || !d) return;
  const [sh, sm] = finalStart.split(':').map(Number);
  let endH = sh;
  let endM = sm || 0;
  if (finalEnd) {
    const [eh, em] = finalEnd.split(':').map(Number);
    endH = eh;
    endM = em || 0;
  } else if (request.durationMinutes) {
    const total = sh * 60 + sm + request.durationMinutes;
    endH = Math.floor(total / 60) % 24;
    endM = total % 60;
  } else {
    endH = (sh + 1) % 24;
  }
  const dtStart = `${y}${pad(m)}${pad(d)}T${pad(sh)}${pad(sm)}00`;
  const dtEnd = `${y}${pad(m)}${pad(d)}T${pad(endH)}${pad(endM)}00`;
  const title = encodeURIComponent(
    request.sport ? `${request.sport} — Match` : 'Match'
  );
  const details = encodeURIComponent(request.comment || '');
  const loc = encodeURIComponent(request.location || '');
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dtStart}/${dtEnd}&details=${details}&location=${loc}`;
  if (Platform.OS === 'web') {
    Linking.openURL(url);
  } else {
    Linking.openURL(url).catch(() => {});
  }
}
