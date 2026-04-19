/** @param {import('firebase/auth').User | null} user */
export function usesEmailPassword(user) {
  return Boolean(user?.providerData?.some((p) => p.providerId === 'password'));
}

/** @param {import('firebase/auth').User | null} user */
export function usesGoogle(user) {
  return Boolean(user?.providerData?.some((p) => p.providerId === 'google.com'));
}
