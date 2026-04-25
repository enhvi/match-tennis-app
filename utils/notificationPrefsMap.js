/** Maps Firestore notification `type` to NotificationContext pref key */
export function getPrefKeyForNotificationType(type) {
  const map = {
    friendRequest: 'friendRequest',
    matchRequest: 'matchRequest',
    matchConfirmed: 'matchConfirmed',
    matchDeclined: 'matchDeclined',
    matchCancelled: 'matchCancelled',
    matchWithdrawn: 'matchWithdrawn',
    matchExpired: 'matchExpired',
    friendAccepted: 'friendAccepted',
    matchLateCancel: 'matchCancelled',
    matchReminder: 'matchReminder',
  };
  return map[type] || null;
}
