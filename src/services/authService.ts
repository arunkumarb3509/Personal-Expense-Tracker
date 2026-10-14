import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile, ThemeMode } from '@/types/auth';
import { DEFAULT_CURRENCY } from '@/constants/currencies';
import { DEFAULT_WALLETS } from '@/constants/wallets';
import { sanitizeFirestoreData } from './firestoreService';

/**
 * Strict Email validation utility
 * Rejects: arun123@gmail, arun@, @gmail.com, arun@gmail, testgmail.com
 * Accepts: arun123@gmail.com, name.surname@company.co.in
 */
export function validateEmailStrict(email: string): { isValid: boolean; error?: string } {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email address is required.' };
  }
  const cleanEmail = email.trim();
  const strictEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!strictEmailRegex.test(cleanEmail)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address (e.g. name@example.com).',
    };
  }

  // Double check domain parts
  const parts = cleanEmail.split('@');
  if (parts.length !== 2) return { isValid: false, error: 'Invalid email format.' };
  const [local, domain] = parts;
  if (!local || local.length === 0) return { isValid: false, error: 'Email username cannot be empty.' };
  if (!domain || !domain.includes('.')) return { isValid: false, error: 'Email must include a valid domain (e.g. .com).' };

  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2) return { isValid: false, error: 'Invalid top-level domain in email.' };

  return { isValid: true };
}

/**
 * Friendly error messages for Firebase Authentication
 */
export function getFriendlyAuthErrorMessage(error: any): string {
  const code = error?.code || '';
  switch (code) {
    case 'auth/invalid-email':
      return 'The email address is invalid. Please check and try again.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please check or sign up.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email address.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please check your internet connection.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please wait a few minutes and try again.';
    case 'auth/requires-recent-login':
      return 'Please sign out and sign in again before performing this action.';
    case 'auth/unverified-email':
      return 'Please verify your email address to continue.';
    default:
      return error?.message || 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Register a new user with Firebase Auth + Create Firestore user profile document & default wallets
 */
export async function registerUser(
  email: string,
  password: string,
  fullName: string
): Promise<{ user: UserProfile; firebaseUser: FirebaseUser }> {
  // Validate Email
  const emailVal = validateEmailStrict(email);
  if (!emailVal.isValid) {
    throw new Error(emailVal.error);
  }

  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  if (!fullName || fullName.trim().length < 2) {
    throw new Error('Please enter your full name.');
  }

  // 1. Create Firebase Auth User
  const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const fbUser = userCredential.user;

  // 2. Update Auth display name
  await updateProfile(fbUser, {
    displayName: fullName.trim(),
  });

  // 3. Send Verification Email
  try {
    await sendEmailVerification(fbUser);
  } catch (err) {
    console.warn('Failed to send verification email automatically:', err);
  }

  const now = Date.now();
  const userProfile: UserProfile = {
    uid: fbUser.uid,
    email: fbUser.email || email.trim(),
    displayName: fullName.trim(),
    photoURL: fbUser.photoURL || null,
    emailVerified: false,
    currency: DEFAULT_CURRENCY,
    themeMode: 'system' as ThemeMode,
    createdAt: now,
    updatedAt: now,
  };

  // 4. Create Firestore User Profile Document
  try {
    const userRef = doc(db, 'users', fbUser.uid);
    await setDoc(userRef, sanitizeFirestoreData(userProfile));

    // 5. Initialize default wallets (GPay, Bank, Cash)
    for (const defaultWallet of DEFAULT_WALLETS) {
      const walletId = defaultWallet.name.toLowerCase().replace(/\s+/g, '_');
      const walletRef = doc(db, 'users', fbUser.uid, 'wallets', walletId);
      await setDoc(walletRef, sanitizeFirestoreData({
        id: walletId,
        userId: fbUser.uid,
        name: defaultWallet.name,
        type: defaultWallet.type,
        openingBalance: 0,
        currentBalance: 0,
        currency: DEFAULT_CURRENCY,
        color: defaultWallet.color,
        icon: defaultWallet.icon,
        accountNumberLast4: '',
        isDefault: defaultWallet.isDefault,
        createdAt: now,
        updatedAt: now,
      }));
    }
  } catch (firestoreErr) {
    console.warn('Firestore initial profile creation warning:', firestoreErr);
  }

  return { user: userProfile, firebaseUser: fbUser };
}

/**
 * Login user with email & password
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ user: UserProfile | null; isEmailVerified: boolean; firebaseUser: FirebaseUser }> {
  const emailVal = validateEmailStrict(email);
  if (!emailVal.isValid) {
    throw new Error(emailVal.error);
  }
  if (!password) {
    throw new Error('Please enter your password.');
  }

  const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
  const fbUser = userCredential.user;

  // Fetch or construct profile
  let profile: UserProfile | null = null;
  try {
    const userRef = doc(db, 'users', fbUser.uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      profile = snap.data() as UserProfile;
      // Update emailVerified in profile if changed
      if (profile.emailVerified !== fbUser.emailVerified) {
        profile.emailVerified = fbUser.emailVerified;
        await updateDoc(userRef, { emailVerified: fbUser.emailVerified, updatedAt: Date.now() });
      }
    } else {
      // Create fallback profile if missing
      profile = {
        uid: fbUser.uid,
        email: fbUser.email || email.trim(),
        displayName: fbUser.displayName || 'User',
        photoURL: fbUser.photoURL || null,
        emailVerified: fbUser.emailVerified,
        currency: DEFAULT_CURRENCY,
        themeMode: 'system',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await setDoc(userRef, sanitizeFirestoreData(profile));
    }
  } catch (e) {
    profile = {
      uid: fbUser.uid,
      email: fbUser.email || email.trim(),
      displayName: fbUser.displayName || 'User',
      photoURL: fbUser.photoURL || null,
      emailVerified: fbUser.emailVerified,
      currency: DEFAULT_CURRENCY,
      themeMode: 'system',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  return {
    user: profile,
    isEmailVerified: fbUser.emailVerified,
    firebaseUser: fbUser,
  };
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('No user is currently signed in.');
  }
  await sendEmailVerification(auth.currentUser);
}

/**
 * Refresh current user's email verification status
 */
export async function checkEmailVerification(): Promise<boolean> {
  if (!auth.currentUser) {
    return false;
  }
  await auth.currentUser.reload();
  const isVerified = auth.currentUser.emailVerified;

  if (isVerified) {
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        emailVerified: true,
        updatedAt: Date.now(),
      });
    } catch (e) {
      console.warn('Could not update emailVerified in firestore:', e);
    }
  }

  return isVerified;
}

/**
 * Send password reset email
 */
export async function sendPasswordReset(email: string): Promise<void> {
  const emailVal = validateEmailStrict(email);
  if (!emailVal.isValid) {
    throw new Error(emailVal.error);
  }
  await sendPasswordResetEmail(auth, email.trim());
}

/**
 * Sign out current user
 */
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Update user display name and profile
 */
export async function updateUserProfile(
  displayName: string,
  currency?: string,
  themeMode?: ThemeMode,
  photoURL?: string | null
): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('Not authenticated');
  }
  const uid = auth.currentUser.uid;
  const authUpdates: any = {};
  if (displayName && auth.currentUser.displayName !== displayName) {
    authUpdates.displayName = displayName;
  }
  if (photoURL !== undefined) {
    authUpdates.photoURL = photoURL;
  }

  if (Object.keys(authUpdates).length > 0) {
    try {
      await updateProfile(auth.currentUser, authUpdates);
    } catch (e) {
      console.warn('Firebase Auth updateProfile warning:', e);
    }
  }

  const userRef = doc(db, 'users', uid);
  const updates: any = {
    updatedAt: Date.now(),
  };
  if (displayName) updates.displayName = displayName;
  if (currency) updates.currency = currency;
  if (themeMode) updates.themeMode = themeMode;
  if (photoURL !== undefined) updates.photoURL = photoURL;

  await updateDoc(userRef, sanitizeFirestoreData(updates));
}

/**
 * Upload and persist user profile photo.
 * Tries Firebase Storage first; if storage rules or bucket are unavailable,
 * reliably falls back to local data URI / base64 persisted in Firestore.
 */
export async function uploadProfilePhoto(
  uid: string,
  imageUri: string,
  base64Data?: string | null
): Promise<string> {
  if (!auth.currentUser) {
    throw new Error('Not authenticated');
  }

  let finalPhotoUrl = imageUri;

  try {
    const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
    const { storage } = await import('./firebase');

    const response = await fetch(imageUri);
    const blob = await response.blob();
    const filename = `profile_${uid}_${Date.now()}.jpg`;
    const storageRef = ref(storage, `users/${uid}/profile/${filename}`);

    const snapshot = await uploadBytes(storageRef, blob);
    finalPhotoUrl = await getDownloadURL(snapshot.ref);
  } catch (storageErr) {
    console.warn('Firebase Storage upload notice (falling back to direct URI/base64):', storageErr);
    if (base64Data) {
      finalPhotoUrl = `data:image/jpeg;base64,${base64Data}`;
    } else {
      finalPhotoUrl = imageUri;
    }
  }

  // Persist to Firebase Auth and Firestore user profile doc
  await updateUserProfile(auth.currentUser.displayName || 'User', undefined, undefined, finalPhotoUrl);
  return finalPhotoUrl;
}

/**
 * Removes user profile photo
 */
export async function removeProfilePhoto(uid: string): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('Not authenticated');
  }
  await updateUserProfile(auth.currentUser.displayName || 'User', undefined, undefined, null);
}
