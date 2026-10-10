import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { Button } from '@/components/common/Button';
import { TextInput } from '@/components/common/Input';
import { Header } from '@/components/common/Header';
import { validateEmailStrict } from '@/services/authService';
import { Mail, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react-native';

export default function ForgotPasswordScreen() {
  const { colors, typography, radius, spacing } = useTheme();
  const { resetPassword } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleReset = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setEmailError('');

    const emailCheck = validateEmailStrict(email);
    if (!emailCheck.isValid) {
      setEmailError(emailCheck.error || 'Please enter a valid email.');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(email);
      setSuccessMessage(
        'Password reset link has been sent to your email address! Follow the instructions in the email.'
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="" showBack onBackPress={() => router.back()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.xl }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Title */}
          <View style={{ marginBottom: spacing.xl }}>
            <View
              style={[
                styles.iconBox,
                {
                  backgroundColor: colors.primaryLight,
                  borderRadius: radius.xl,
                  marginBottom: spacing.md,
                },
              ]}
            >
              <KeyRound size={28} color={colors.primary} />
            </View>

            <Text
              style={[
                styles.title,
                {
                  color: colors.text,
                  fontSize: typography.sizes['2xl'],
                  fontWeight: typography.weights.bold,
                },
              ]}
            >
              Reset Password
            </Text>
            <Text
              style={[
                styles.subtitle,
                {
                  color: colors.textSecondary,
                  fontSize: typography.sizes.sm,
                  marginTop: spacing.xs,
                  lineHeight: 20,
                },
              ]}
            >
              Enter the email address associated with your account and we'll send you a password recovery link.
            </Text>
          </View>

          {/* Success Banner */}
          {successMessage ? (
            <View
              style={[
                styles.banner,
                {
                  backgroundColor: colors.successLight,
                  borderColor: colors.success,
                  borderRadius: radius.lg,
                  padding: spacing.md,
                  marginBottom: spacing.lg,
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
                {successMessage}
              </Text>
            </View>
          ) : null}

          {/* Error Banner */}
          {errorMessage ? (
            <View
              style={[
                styles.banner,
                {
                  backgroundColor: colors.errorLight,
                  borderColor: colors.error,
                  borderRadius: radius.lg,
                  padding: spacing.md,
                  marginBottom: spacing.lg,
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

          {/* Form */}
          <View style={styles.form}>
            <TextInput
              label="Registered Email"
              value={email}
              onChangeText={(txt) => {
                setEmail(txt);
                if (emailError) setEmailError('');
              }}
              placeholder="e.g. arun123@gmail.com"
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={20} color={colors.textSecondary} />}
              error={emailError}
            />

            <View style={{ marginTop: spacing.lg }}>
              <Button
                title="Send Reset Link"
                onPress={handleReset}
                variant="primary"
                size="lg"
                loading={loading}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  iconBox: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    letterSpacing: -0.4,
  },
  subtitle: {},
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  form: {
    width: '100%',
  },
});
