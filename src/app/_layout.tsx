import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import { ToastProvider } from '@/context/ToastContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function RootLayoutContent() {
  const { isDark, colors } = useTheme();
  const { isAuthenticated, isEmailVerified, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const currentScreen = segments[1];

    if (!isAuthenticated) {
      // User is not signed in, ensure they stay within (auth) screens
      if (!inAuthGroup) {
        router.replace('/(auth)/welcome');
      }
    } else if (!isEmailVerified) {
      // User is signed in but hasn't verified email
      if (currentScreen !== 'verify-email') {
        router.replace('/(auth)/verify-email');
      }
    } else {
      // User is authenticated and email is verified
      if (inAuthGroup && currentScreen !== 'verify-email') {
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, isEmailVerified, isLoading, segments]);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="add-transaction"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="edit-transaction"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="daily-view" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="wallets/index" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="wallets/add-wallet" options={{ presentation: 'modal' }} />
        <Stack.Screen name="wallets/transfer" options={{ presentation: 'modal' }} />
        <Stack.Screen name="lending/index" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="lending/add-record" options={{ presentation: 'modal' }} />
        <Stack.Screen name="lending/person-detail" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="budgets/index" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="budgets/add-budget" options={{ presentation: 'modal' }} />
        <Stack.Screen name="recurring/index" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="recurring/add-recurring" options={{ presentation: 'modal' }} />
        <Stack.Screen name="notifications/index" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="settings/export-data" options={{ animation: 'slide_from_right' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <ToastProvider>
              <RootLayoutContent />
            </ToastProvider>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
