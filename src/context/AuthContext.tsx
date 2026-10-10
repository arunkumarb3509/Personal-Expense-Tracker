import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/services/firebase';
import {
  registerUser,
  loginUser,
  logoutUser,
  resendVerificationEmail,
  checkEmailVerification,
  sendPasswordReset,
  updateUserProfile as updateProfileService,
  getFriendlyAuthErrorMessage,
} from '@/services/authService';
import { UserProfile, ThemeMode } from '@/types/auth';
import { DEFAULT_CURRENCY } from '@/constants/currencies';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  login: (email: string, pass: string) => Promise<{ user: UserProfile | null; isEmailVerified: boolean; firebaseUser: FirebaseUser }>;
  register: (email: string, pass: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  resendVerification: () => Promise<void>;
  refreshVerificationStatus: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (displayName: string, currency?: string, themeMode?: ThemeMode) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let unsubscribeFirestore: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        // Subscribe to user's profile document in Firestore
        const userDocRef = doc(db, 'users', fbUser.uid);
        unsubscribeFirestore = onSnapshot(
          userDocRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data() as UserProfile;
              setUser({
                ...data,
                emailVerified: fbUser.emailVerified,
              });
            } else {
              // Construct profile from Firebase auth
              setUser({
                uid: fbUser.uid,
                email: fbUser.email || '',
                displayName: fbUser.displayName || 'User',
                photoURL: fbUser.photoURL || null,
                emailVerified: fbUser.emailVerified,
                currency: DEFAULT_CURRENCY,
                themeMode: 'system',
                createdAt: Date.now(),
                updatedAt: Date.now(),
              });
            }
            setIsLoading(false);
          },
          (err) => {
            console.warn('Firestore user profile listener error:', err);
            setUser({
              uid: fbUser.uid,
              email: fbUser.email || '',
              displayName: fbUser.displayName || 'User',
              photoURL: fbUser.photoURL || null,
              emailVerified: fbUser.emailVerified,
              currency: DEFAULT_CURRENCY,
              themeMode: 'system',
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });
            setIsLoading(false);
          }
        );
      } else {
        setUser(null);
        if (unsubscribeFirestore) {
          unsubscribeFirestore();
          unsubscribeFirestore = null;
        }
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const res = await loginUser(email, pass);
      setFirebaseUser(res.firebaseUser);
      if (res.user) setUser(res.user);
      return res;
    } catch (err: any) {
      throw new Error(getFriendlyAuthErrorMessage(err));
    }
  };

  const register = async (email: string, pass: string, fullName: string) => {
    try {
      const res = await registerUser(email, pass, fullName);
      setFirebaseUser(res.firebaseUser);
      setUser(res.user);
    } catch (err: any) {
      throw new Error(getFriendlyAuthErrorMessage(err));
    }
  };

  const logout = async () => {
    await logoutUser();
    setFirebaseUser(null);
    setUser(null);
  };

  const resendVerification = async () => {
    try {
      await resendVerificationEmail();
    } catch (err: any) {
      throw new Error(getFriendlyAuthErrorMessage(err));
    }
  };

  const refreshVerificationStatus = async (): Promise<boolean> => {
    const verified = await checkEmailVerification();
    if (firebaseUser) {
      setFirebaseUser({
        ...firebaseUser,
        emailVerified: verified,
      } as FirebaseUser);
    }
    if (user) {
      setUser({
        ...user,
        emailVerified: verified,
      });
    }
    return verified;
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordReset(email);
    } catch (err: any) {
      throw new Error(getFriendlyAuthErrorMessage(err));
    }
  };

  const updateProfile = async (displayName: string, currency?: string, themeMode?: ThemeMode) => {
    try {
      await updateProfileService(displayName, currency, themeMode);
      if (user) {
        setUser({
          ...user,
          displayName,
          currency: currency || user.currency,
          themeMode: themeMode || user.themeMode,
        });
      }
    } catch (err: any) {
      throw new Error(getFriendlyAuthErrorMessage(err));
    }
  };

  const isAuthenticated = !!firebaseUser;
  const isEmailVerified = !!firebaseUser?.emailVerified;

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isLoading,
        isAuthenticated,
        isEmailVerified,
        login,
        register,
        logout,
        resendVerification,
        refreshVerificationStatus,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
