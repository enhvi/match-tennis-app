/** Deterministic id for a 1:1 thread between two users. */
export function getConversationId(uidA, uidB) {
  if (!uidA || !uidB || uidA === uidB) {
    throw new Error('Invalid conversation participants');
  }
  return [uidA, uidB].sort().join('_');
}

export const MAX_MESSAGE_LENGTH = 500;
