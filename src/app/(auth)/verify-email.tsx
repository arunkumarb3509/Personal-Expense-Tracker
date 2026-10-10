import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { Button } from '@/components/common/Button';
import {
  MailCheck,
  RefreshCw,
  Send,
  AlertCircle,
  CheckCircle2,
  LogOut,
} from 'lucide-react-native';

export default function VerifyEmailScreen() {
  const { colors, typography, radius, spacing, shadows } = useTheme();
  const {
    user,
    firebaseUser,
    resendVerification,
    refreshVerificationStatus,
    logout,
  } = useAuth();
  const router = useRouter();

  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const email = firebaseUser?.email || user?.email || 'your email';

  const handleResend = async () => {
    setErrorMessage('');
    setInfoMessage('');
    try {
      setResending(true);
      await resendVerification();
      setInfoMessage('A new verification email has been sent! Please check your inbox and spam folder.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  const handleCheckStatus = async () => {
    setErrorMessage('');
    setInfoMessage('');
    try {
      setChecking(true);
      const isVerified = await refreshVerificationStatus();
      if (isVerified) {
        setInfoMessage('Email verified successfully! Redirecting to your dashboard...');
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 1000);
      } else {
        setErrorMessage('Email is not verified yet. Please click the link in your email and try checking again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error checking verification status.');
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/welcome');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { padding: spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.centerSection}>
          {/* Animated Illustration Icon */}
          <View
            style={[
              styles.iconBox,
              {
                backgroundColor: colors.primaryLight,
                borderColor: colors.primary,
                borderRadius: radius['3xl'],
              },
              shadows.sm,
            ]}
          >
            <MailCheck size={54} color={colors.primary} />
          </View>

          <Text
            style={[
              styles.title,
              {
                color: colors.text,
                fontSize: typography.sizes['2xl'],
                fontWeight: typography.weights.bold,
                marginTop: spacing.xl,
              },
            ]}
          >
            Verify Your Email
          </Text>

          <Text
            style={[
              styles.description,
              {
                color: colors.textSecondary,
                fontSize: typography.sizes.sm,
                marginTop: spacing.sm,
                lineHeight: 22,
              },
            ]}
          >
            We've sent a verification link to:
          </Text>

          <View
            style={[
              styles.emailPill,
              {
                backgroundColor: colors.surfaceSecondary,
                borderColor: colors.border,
                borderRadius: radius.full,
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.sm,
                marginTop: spacing.sm,
              },
            ]}
          >
            <Text
              style={{
                color: colors.primary,
                fontSize: typography.sizes.sm,
                fontWeight: typography.weights.bold,
              }}
            >
              {email}
            </Text>
          </View>

          <Text
            style={[
              styles.subNotice,
              {
                color: colors.textTertiary,
                fontSize: typography.sizes.xs,
                marginTop: spacing.md,
                lineHeight: 18,
              },
            ]}
          >
            To keep your financial data completely secure, you must verify your email before accessing your dashboard.
          </Text>
        </View>

        {/* Feedback Messages */}
        {infoMessage ? (
          <View
            style={[
              styles.messageBanner,
              {
                backgroundColor: colors.successLight,
                borderColor: colors.success,
                borderRadius: radius.lg,
                padding: spacing.md,
                marginVertical: spacing.md,
              },
            ]}
          >
            <CheckCircle2 size={18} color={colors.success} style={{ marginRight: 8 }} />
            <Text
              style={{
                color: colors.success,
                fontSize: typography.sizes.xs,
                fontWeight: typography.weights.medium,
                flex: 1,
              }}
            >
              {infoMessage}
            </Text>
          </View>
        ) : null}

        {errorMessage ? (
          <View
            style={[
              styles.messageBanner,
              {
                backgroundColor: colors.errorLight,
                borderColor: colors.error,
                borderRadius: radius.lg,
                padding: spacing.md,
                marginVertical: spacing.md,
              },
            ]}
          >
            <AlertCircle size={18} color={colors.error} style={{ marginRight: 8 }} />
            <Text
              style={{
                color: colors.error,
                fontSize: typography.sizes.xs,
                fontWeight: typography.weights.medium,
                flex: 1,
              }}
            >
              {errorMessage}
            </Text>
          </View>
        ) : null}

        {/* Action Buttons */}
        <View style={[styles.actionSection, { marginTop: spacing.xl }]}>
          <Button
            title="I've Verified My Email"
            onPress={handleCheckStatus}
            variant="primary"
            size="lg"
            loading={checking}
            icon={<RefreshCw size={18} color="#FFFFFF" />}
            iconPosition="left"
          />

          <View style={{ marginTop: spacing.md }}>
            <Button
              title="Resend Verification Email"
              onPress={handleResend}
              variant="secondary"
              size="md"
              loading={resending}
              icon={<Send size={16} color={colors.text} />}
              iconPosition="left"
            />
          </View>

          <View style={{ marginTop: spacing.lg }}>
            <Button
              title="Sign Out / Change Account"
              onPress={handleLogout}
              variant="ghost"
              size="sm"
              icon={<LogOut size={16} color={colors.textSecondary} />}
              iconPosition="left"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  centerSection: {
    alignItems: 'center',
    textAlign: 'center',
    marginTop: 20,
  },
  iconBox: {
    width: 96,
    height: 96,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  description: {
    textAlign: 'center',
  },
  emailPill: {
    borderWidth: 1,
  },
  subNotice: {
    textAlign: 'center',
    maxWidth: 290,
  },
  messageBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  actionSection: {
    width: '100%',
  },
});
