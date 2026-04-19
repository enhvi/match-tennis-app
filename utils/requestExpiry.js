/**
 * When a pending match request (not enough acceptances) should be considered past deadline.
 * @param {'start' | 'end'} timing — start: at scheduled start time; end: at end of time slot
 */
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + (m || 0);
};

export function getPendingUnfilledDeadline(req, timing) {
  const [y, m, d] = (req.date || '').split('-').map(Number);
  if (!y || !m || !d) return null;
  if (timing === 'end') {
    const startMins = timeToMinutes(req.startTime || '00:00');
    const endMins = timeToMinutes(req.endTime || '23:59');
    const isNextDay = endMins <= startMins;
    const [endHours, endMinutes] = (req.endTime || '23:59').split(':').map(Number);
    return isNextDay
      ? new Date(y, m - 1, d + 1, endHours || 0, endMinutes || 0, 0, 0)
      : new Date(y, m - 1, d, endHours || 23, endMinutes || 59, 0, 0);
  }
  const [startH, startM] = (req.startTime || '00:00').split(':').map(Number);
  return new Date(y, m - 1, d, startH || 0, startM || 0, 0, 0);
}

export function isPendingCreatorUnfilledPastDeadline(req, timing) {
  if (req.status === 'expired' || req.status === 'cancelled') return true;
  const deadline = getPendingUnfilledDeadline(req, timing);
  if (!deadline) return false;
  if (deadline >= new Date()) return false;
  const playersNeeded = req.playersNeeded || 2;
  const requiredAcceptances = Math.max(playersNeeded - 1, 1);
  const acceptedCount = Object.values(req.responses || {}).filter((r) => r?.status === 'accepted').length;
  return acceptedCount < requiredAcceptances;
}

export function shouldAutoExpirePendingRequest(r, userId, timing) {
  if (r.status !== 'pending' || r.creatorId !== userId) return false;
  const deadline = getPendingUnfilledDeadline(r, timing);
  if (!deadline || deadline >= new Date()) return false;
  const playersNeeded = r.playersNeeded || 2;
  const requiredAcceptances = Math.max(playersNeeded - 1, 1);
  const acceptedCount = Object.values(r.responses || {}).filter((resp) => resp?.status === 'accepted').length;
  return acceptedCount < requiredAcceptances;
}
