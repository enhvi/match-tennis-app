const { onSchedule } = require('firebase-functions/v2/scheduler');
const { onDocumentWritten } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

initializeApp();
const db = getFirestore();

function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = String(timeStr).split(':').map(Number);
  return h * 60 + (m || 0);
}

function getPendingDeadlineStart(req) {
  const [y, m, d] = (req.date || '').split('-').map(Number);
  if (!y || !m || !d) return null;
  const [startH, startM] = (req.startTime || '00:00').split(':').map(Number);
  return new Date(y, m - 1, d, startH || 0, startM || 0, 0, 0);
}

function getUserLabel(data) {
  return data?.displayName || data?.username || '';
}

function getAcceptedEntries(req) {
  return Object.entries(req?.responses || {}).filter(([, r]) => r?.status === 'accepted');
}

function toResponseStatusMap(req) {
  const map = {};
  Object.entries(req?.responses || {}).forEach(([uid, resp]) => {
    map[uid] = resp?.status || null;
  });
  return map;
}

function getNewlyChangedStatuses(beforeReq, afterReq, targetStatus) {
  const before = toResponseStatusMap(beforeReq);
  const after = toResponseStatusMap(afterReq);
  return Object.keys(after).filter((uid) => after[uid] === targetStatus && before[uid] !== targetStatus);
}

function shouldExpirePending(req) {
  if (req.status !== 'pending') return false;
  const deadline = getPendingDeadlineStart(req);
  if (!deadline || deadline >= new Date()) return false;
  const playersNeeded = req.playersNeeded || 2;
  const requiredAcceptances = Math.max(playersNeeded - 1, 1);
  const acceptedCount = Object.values(req.responses || {}).filter((r) => r?.status === 'accepted').length;
  return acceptedCount < requiredAcceptances;
}

function getMatchEndDateTimeParts(req) {
  if (req.finalEndTime) return req.finalEndTime;
  if (req.finalStartTime && req.durationMinutes) {
    const [h, m] = req.finalStartTime.split(':').map(Number);
    const totalMin = h * 60 + m + req.durationMinutes;
    const endH = Math.floor(totalMin / 60) % 24;
    const endM = totalMin % 60;
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  }
  if (req.finalStartTime) return req.endTime || null;
  const accepted = Object.values(req.responses || {}).filter((r) => r?.status === 'accepted' && r?.acceptedStart);
  if (accepted.length === 0) return null;
  const a = accepted[0];
  if (!a.acceptedStart) return null;
  if (a.acceptedEnd) return a.acceptedEnd;
  if (!req.durationMinutes) return req.endTime || null;
  const [h, m] = a.acceptedStart.split(':').map(Number);
  const totalMin = h * 60 + m + req.durationMinutes;
  const endH = Math.floor(totalMin / 60) % 24;
  const endM = totalMin % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
}

function confirmedMatchEnded(req) {
  const endTimeStr = getMatchEndDateTimeParts(req);
  if (!endTimeStr || !req.date) return false;
  const [y, m, d] = req.date.split('-').map(Number);
  const [endH, endM] = endTimeStr.split(':').map(Number);
  const startMins = timeToMinutes(req.startTime);
  const endMins = (endH || 0) * 60 + (endM || 0);
  const isNextDay = endMins <= startMins;
  const endDateTime = isNextDay
    ? new Date(y, m - 1, d + 1, endH || 0, endM || 0, 0, 0)
    : new Date(y, m - 1, d, endH || 0, endM || 0, 0, 0);
  return endDateTime < new Date();
}

async function addNotification(targetUserId, data) {
  if (!targetUserId) return;
  await db.collection('users').doc(targetUserId).collection('notifications').add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    read: false,
  });
}

exports.onMatchRequestWrite = onDocumentWritten('matchRequests/{requestId}', async (event) => {
  const before = event.data?.before?.exists ? event.data.before.data() : null;
  const after = event.data?.after?.exists ? event.data.after.data() : null;
  const requestId = event.params.requestId;

  if (!after) return;

  // New request: notify invited friends.
  if (!before) {
    const creatorName = getUserLabel(after.creatorDisplayName ? {
      displayName: after.creatorDisplayName,
      username: after.creatorUsername,
    } : null);
    const ops = (after.friendIds || []).map((fid) =>
      addNotification(fid, {
        type: 'matchRequest',
        fromName: creatorName,
        fromUsername: after.creatorUsername || '',
        fromPhotoURL: after.creatorPhotoURL || '',
        requestId,
        sport: after.sport,
        date: after.date,
        relatedId: requestId,
      })
    );
    await Promise.all(ops);
    return;
  }

  const creatorName = getUserLabel({
    displayName: after.creatorDisplayName || before.creatorDisplayName,
    username: after.creatorUsername || before.creatorUsername,
  });

  const newlyDeclined = getNewlyChangedStatuses(before, after, 'declined');
  const newlyWithdrawn = getNewlyChangedStatuses(before, after, 'withdrawn');
  for (const uid of newlyDeclined) {
    const r = after.responses?.[uid] || {};
    await addNotification(after.creatorId, {
      type: 'matchDeclined',
      fromName: getUserLabel({ displayName: r.responderName, username: r.responderUsername }),
      fromPhotoURL: r.responderPhotoURL || '',
      requestId,
      sport: after.sport,
      relatedId: requestId,
    });
  }
  for (const uid of newlyWithdrawn) {
    const r = after.responses?.[uid] || {};
    await addNotification(after.creatorId, {
      type: 'matchWithdrawn',
      fromName: getUserLabel({ displayName: r.responderName, username: r.responderUsername }),
      fromPhotoURL: r.responderPhotoURL || '',
      requestId,
      sport: after.sport,
      date: after.date,
      body: r.withdrawReason || undefined,
      relatedId: requestId,
    });
  }

  // pending -> confirmed
  if (before.status !== 'confirmed' && after.status === 'confirmed') {
    const acceptedEntries = getAcceptedEntries(after);
    if (after.creatorId) {
      await addNotification(after.creatorId, {
        type: 'matchConfirmed',
        fromName: creatorName,
        fromPhotoURL: after.creatorPhotoURL || '',
        requestId,
        sport: after.sport,
        date: after.date,
        relatedId: requestId,
      });
    }
    for (const [uid] of acceptedEntries) {
      if (uid === after.creatorId) continue;
      await addNotification(uid, {
        type: 'matchConfirmed',
        fromName: creatorName,
        fromPhotoURL: after.creatorPhotoURL || '',
        requestId,
        sport: after.sport,
        date: after.date,
        relatedId: requestId,
      });
    }
  }

  if (before.status !== 'expired' && after.status === 'expired' && after.creatorId) {
    await addNotification(after.creatorId, {
      type: 'matchExpired',
      requestId,
      sport: after.sport,
      date: after.date,
      relatedId: requestId,
    });
  }

  if (before.status !== 'cancelled' && after.status === 'cancelled') {
    const acceptedEntries = getAcceptedEntries(before);
    const hoursToStart = (() => {
      const [y, m, d] = (after.date || '').split('-').map(Number);
      const [h, min] = (after.finalStartTime || after.startTime || '00:00').split(':').map(Number);
      if (!y || !m || !d) return null;
      const start = new Date(y, m - 1, d, h || 0, min || 0, 0, 0);
      return (start.getTime() - Date.now()) / 3600000;
    })();
    const isLateCancel = before.status === 'confirmed' && hoursToStart != null && hoursToStart < 24 && hoursToStart >= 0;
    for (const [uid] of acceptedEntries) {
      if (uid === after.cancelledBy) continue;
      await addNotification(uid, {
        type: isLateCancel ? 'matchLateCancel' : 'matchCancelled',
        fromName: creatorName,
        fromPhotoURL: after.creatorPhotoURL || '',
        requestId,
        sport: after.sport,
        body: after.cancelReason || undefined,
        relatedId: requestId,
      });
    }
  }
});

exports.scheduledMatchMaintenance = onSchedule('every 60 minutes', async () => {
  const pendingSnap = await db.collection('matchRequests').where('status', '==', 'pending').get();
  let batch = db.batch();
  let ops = 0;
  const commitIfNeeded = async () => {
    if (ops === 0) return;
    await batch.commit();
    batch = db.batch();
    ops = 0;
  };

  for (const docSnap of pendingSnap.docs) {
    const req = docSnap.data();
    if (shouldExpirePending(req)) {
      batch.update(docSnap.ref, {
        status: 'expired',
        expiredAt: FieldValue.serverTimestamp(),
      });
      ops += 1;
      if (ops >= 400) await commitIfNeeded();
    }
  }
  await commitIfNeeded();

  const confirmedSnap = await db.collection('matchRequests').where('status', '==', 'confirmed').get();
  for (const docSnap of confirmedSnap.docs) {
    const req = docSnap.data();
    if (confirmedMatchEnded(req)) {
      batch.update(docSnap.ref, {
        status: 'completed',
        completedAt: FieldValue.serverTimestamp(),
      });
      ops += 1;
      if (ops >= 400) await commitIfNeeded();
    }
  }
  await commitIfNeeded();
});
