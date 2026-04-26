import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  fetchSignInMethodsForEmail,
  GoogleAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  deleteUser,
  updateEmail,
  updatePassword,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  setDoc,
  collection,
  where,
} from 'firebase/firestore';
import { auth, db, serverTimestamp } from '../firebaseConfig';
import { usesEmailPassword } from '../utils/authProviders';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser || null);
      if (firebaseUser) {
        try {
          // Warten, bis Auth-Token an Firestore übergeben ist (verhindert permission-denied)
          await firebaseUser.getIdToken(true);
          const profileSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
          setProfile(profileSnap.exists() ? profileSnap.data() : null);
        } catch (error) {
          console.error('Error loading user profile:', error);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    const trimmedEmail = email.trim();
    return signInWithEmailAndPassword(auth, trimmedEmail, password);
  };

  const isUsernameTaken = async (usernameLower, currentUid = null) => {
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef, where('usernameLower', '==', usernameLower));
    const snapshot = await getDocs(userQuery);

    if (snapshot.empty) {
      return false;
    }

    if (currentUid) {
      return snapshot.docs.some((docSnap) => docSnap.id !== currentUid);
    }

    return true;
  };

  const sanitizeUsernameFromEmail = (email) => {
    const local = (email || '').split('@')[0] || 'user';
    const cleaned = local.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20);
    return cleaned || 'user';
  };

  const ensureFirestoreProfileIfMissing = async (firebaseUser) => {
    const ref = doc(db, 'users', firebaseUser.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return;
    }

    const email = firebaseUser.email || '';
    const displayName = firebaseUser.displayName || '';
    const photoURL = firebaseUser.photoURL || '';

    let base = sanitizeUsernameFromEmail(email);
    let username = base;
    let n = 0;
    while (await isUsernameTaken(username.toLowerCase())) {
      username = `${base}${++n}`;
    }

    await setDoc(ref, {
      uid: firebaseUser.uid,
      email,
      username,
      usernameLower: username.toLowerCase(),
      displayName: displayName || '',
      displayNameLower: displayName ? displayName.toLowerCase() : '',
      bio: '',
      sports: [],
      photoURL: photoURL || '',
      createdAt: serverTimestamp(),
    });
  };

  const signInWithGoogleIdToken = async (idToken) => {
    const credential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(auth, credential);
    await ensureFirestoreProfileIfMissing(result.user);
    const profileSnap = await getDoc(doc(db, 'users', result.user.uid));
    setProfile(profileSnap.exists() ? profileSnap.data() : null);
  };

  const signup = async (email, password, username) => {
    const trimmedEmail = email.trim();
    const trimmedUsername = username.trim();
    const usernameLower = trimmedUsername.toLowerCase();

    const usernameAlreadyUsed = await isUsernameTaken(usernameLower);
    if (usernameAlreadyUsed) {
      throw new Error('Username already taken');
    }

    const credential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);

    await updateProfile(credential.user, {
      displayName: trimmedUsername,
    });

    await setDoc(
      doc(db, 'users', credential.user.uid),
      {
        uid: credential.user.uid,
        email: trimmedEmail,
        username: trimmedUsername,
        usernameLower: usernameLower,
        displayName: '',
        displayNameLower: '',
        bio: '',
        sports: [],
        photoURL: '',
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );

    return credential.user;
  };

  const updateProfileInfo = async ({
    username: newUsername,
    displayName,
    bio,
    sports,
    photoURL,
  }) => {
    if (!auth.currentUser) {
      throw new Error('Not authenticated');
    }

    const trimmedUsername = newUsername.trim();
    if (!trimmedUsername) {
      throw new Error('Username is required');
    }

    const usernameLower = trimmedUsername.toLowerCase();
    const trimmedDisplayName = (displayName || '').trim();
    const trimmedBio = (bio || '').trim();
    const selectedSports = Array.isArray(sports) ? sports : [];
    const usernameAlreadyUsed = await isUsernameTaken(usernameLower, auth.currentUser.uid);
    if (usernameAlreadyUsed) {
      throw new Error('Username already taken');
    }

    await updateProfile(auth.currentUser, {
      displayName: trimmedDisplayName || trimmedUsername,
      photoURL: photoURL || '',
    });

    const displayNameLower = trimmedDisplayName ? trimmedDisplayName.toLowerCase() : '';
    await setDoc(
      doc(db, 'users', auth.currentUser.uid),
      {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email || '',
        username: trimmedUsername,
        usernameLower: usernameLower,
        displayName: trimmedDisplayName,
        displayNameLower: displayNameLower,
        bio: trimmedBio,
        sports: selectedSports,
        photoURL: photoURL || '',
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    const updatedProfile = await getDoc(doc(db, 'users', auth.currentUser.uid));
    setProfile(updatedProfile.exists() ? updatedProfile.data() : null);
  };

  const updateEmailWithPassword = async (newEmail, currentPassword) => {
    if (!usesEmailPassword(auth.currentUser)) {
      throw new Error('Password sign-in required');
    }
    if (!auth.currentUser || !auth.currentUser.email) {
      throw new Error('Not authenticated');
    }

    const trimmedEmail = newEmail.trim();
    if (!trimmedEmail) {
      throw new Error('Email is required');
    }

    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      currentPassword
    );
    await reauthenticateWithCredential(auth.currentUser, credential);
    await updateEmail(auth.currentUser, trimmedEmail);

    await setDoc(
      doc(db, 'users', auth.currentUser.uid),
      {
        uid: auth.currentUser.uid,
        email: trimmedEmail,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    const updatedProfile = await getDoc(doc(db, 'users', auth.currentUser.uid));
    setProfile(updatedProfile.exists() ? updatedProfile.data() : null);
  };

  const updatePasswordWithPassword = async (currentPassword, newPassword) => {
    if (!usesEmailPassword(auth.currentUser)) {
      throw new Error('Password sign-in required');
    }
    if (!auth.currentUser || !auth.currentUser.email) {
      throw new Error('Not authenticated');
    }

    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      currentPassword
    );
    await reauthenticateWithCredential(auth.currentUser, credential);
    await updatePassword(auth.currentUser, newPassword);
  };

  const sendPasswordReset = async (email) => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      throw new Error('Email is required');
    }
    const signInMethods = await fetchSignInMethodsForEmail(auth, trimmedEmail);
    if (!signInMethods.includes('password')) {
      throw new Error('No password login found for this email');
    }

    await sendPasswordResetEmail(auth, trimmedEmail, {
      url: 'https://match-tennis-app-c65eb.firebaseapp.com/__/auth/action',
      handleCodeInApp: false,
    });
  };

  const deleteAccountWithPassword = async (currentPassword) => {
    if (!usesEmailPassword(auth.currentUser)) {
      throw new Error('Password sign-in required');
    }
    if (!auth.currentUser || !auth.currentUser.email) {
      throw new Error('Not authenticated');
    }
    if (!currentPassword) {
      throw new Error('Current password required');
    }

    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      currentPassword
    );
    await reauthenticateWithCredential(auth.currentUser, credential);

    await deleteDoc(doc(db, 'users', auth.currentUser.uid));
    await deleteUser(auth.currentUser);
  };

  const deleteAccountWithGoogleIdToken = async (idToken) => {
    if (!auth.currentUser) {
      throw new Error('Not authenticated');
    }
    const credential = GoogleAuthProvider.credential(idToken);
    await reauthenticateWithCredential(auth.currentUser, credential);
    await deleteDoc(doc(db, 'users', auth.currentUser.uid));
    await deleteUser(auth.currentUser);
  };

  const logout = async () => signOut(auth);

  const value = {
    user,
    profile,
    loading,
    login,
    signup,
    signInWithGoogleIdToken,
    updateProfileInfo,
    updateEmailWithPassword,
    updatePasswordWithPassword,
    sendPasswordReset,
    deleteAccountWithPassword,
    deleteAccountWithGoogleIdToken,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
