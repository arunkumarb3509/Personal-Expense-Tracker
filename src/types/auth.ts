export type ThemeMode = 'light' | 'dark' | 'system';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
  emailVerified: boolean;
  currency: string;
  themeMode: ThemeMode;
  createdAt: number;
  updatedAt: number;
}

export interface AuthState {
  user: UserProfile | null;
  firebaseUser: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
}
