import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { WalletCards, ShieldCheck, Sparkles } from 'lucide-react-native';

export default function IndexGateway() {
  const { isLoading, isAuthenticated, isEmailVerified } = useAuth();
  const { colors, typography, radius, spacing } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/(auth)/welcome');
    } else if (!isEmailVerified) {
      router.replace('/(auth)/verify-email');
    } else {
      router.replace('/(tabs)');
    }
  }, [isLoading, isAuthenticated, isEmailVerified]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Brand Splash Graphic */}
      <View
        style={[
          styles.logoContainer,
          {
            backgroundColor: colors.primaryLight,
            borderColor: colors.border,
            borderRadius: radius['3xl'],
          },
        ]}
      >
        <WalletCards size={56} color={colors.primary} />
      </View>

      <Text
        style={[
          styles.appName,
          {
            color: colors.text,
            fontSize: typography.sizes['3xl'],
            fontWeight: typography.weights.bold,
            marginTop: spacing.xl,
          },
        ]}
      >
        PET Finance
      </Text>

      <Text
        style={[
          styles.tagline,
          {
            color: colors.textSecondary,
            fontSize: typography.sizes.sm,
            marginTop: spacing.xs,
          },
        ]}
      >
        Personal Expense & Wealth Tracker
      </Text>

      <View style={{ marginTop: 40 }}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    letterSpacing: -0.5,
  },
  tagline: {
    letterSpacing: 0.2,
  },
});
