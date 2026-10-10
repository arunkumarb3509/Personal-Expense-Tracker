import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import { Button } from '@/components/common/Button';
import {
  WalletCards,
  TrendingUp,
  ShieldCheck,
  HandCoins,
  Sparkles,
  PieChart,
} from 'lucide-react-native';

export default function WelcomeScreen() {
  const { colors, typography, radius, spacing, shadows } = useTheme();
  const router = useRouter();

  const features = [
    {
      icon: <WalletCards size={20} color={colors.primary} />,
      title: 'Unified Wallet Tracking',
      desc: 'Track GPay, Bank accounts, Cash, and Cards in one place.',
    },
    {
      icon: <HandCoins size={20} color={colors.lend} />,
      title: 'Lending & Borrowing',
      desc: 'Never forget money given to friends or borrowed dues.',
    },
    {
      icon: <PieChart size={20} color={colors.income} />,
      title: 'Weekly & Monthly Insights',
      desc: 'Visual charts and category breakdowns of your spending.',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { padding: spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Icon Header */}
        <View style={styles.topSection}>
          <View
            style={[
              styles.logoBox,
              {
                backgroundColor: colors.primaryLight,
                borderColor: colors.border,
                borderRadius: radius['2xl'],
              },
              shadows.sm,
            ]}
          >
            <WalletCards size={48} color={colors.primary} />
          </View>

          <View style={styles.badgePill}>
            <Sparkles size={12} color={colors.primary} style={{ marginRight: 4 }} />
            <Text
              style={{
                color: colors.primary,
                fontSize: typography.sizes.xxs,
                fontWeight: typography.weights.bold,
              }}
            >
              FINANCIAL FREEDOM
            </Text>
          </View>

          <Text
            style={[
              styles.heading,
              {
                color: colors.text,
                fontSize: typography.sizes['3xl'],
                fontWeight: typography.weights.bold,
                marginTop: spacing.sm,
              },
            ]}
          >
            Master Your Money with Precision
          </Text>

          <Text
            style={[
              styles.subheading,
              {
                color: colors.textSecondary,
                fontSize: typography.sizes.sm,
                marginTop: spacing.xs,
                lineHeight: 22,
              },
            ]}
          >
            Track daily expenses, manage multiple wallets, monitor lending & debts, and achieve your financial goals.
          </Text>
        </View>

        {/* Value Prop Features */}
        <View style={[styles.featuresSection, { marginVertical: spacing['2xl'] }]}>
          {features.map((item, idx) => (
            <View
              key={idx}
              style={[
                styles.featureCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: radius.xl,
                  padding: spacing.md,
                  marginBottom: spacing.md,
                },
                shadows.sm,
              ]}
            >
              <View
                style={[
                  styles.featureIcon,
                  {
                    backgroundColor: colors.surfaceSecondary,
                    borderRadius: radius.lg,
                  },
                ]}
              >
                {item.icon}
              </View>
              <View style={styles.featureText}>
                <Text
                  style={[
                    styles.featureTitle,
                    {
                      color: colors.text,
                      fontSize: typography.sizes.sm,
                      fontWeight: typography.weights.bold,
                    },
                  ]}
                >
                  {item.title}
                </Text>
                <Text
                  style={[
                    styles.featureDesc,
                    {
                      color: colors.textSecondary,
                      fontSize: typography.sizes.xs,
                      marginTop: 2,
                    },
                  ]}
                >
                  {item.desc}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Security Badge */}
        <View style={styles.securityRow}>
          <ShieldCheck size={16} color={colors.income} style={{ marginRight: 6 }} />
          <Text
            style={{
              color: colors.textTertiary,
              fontSize: typography.sizes.xs,
              fontWeight: typography.weights.medium,
            }}
          >
            100% Private & Secure User Isolation
          </Text>
        </View>

        {/* Bottom CTA Buttons */}
        <View style={[styles.buttonSection, { marginTop: spacing.xl }]}>
          <Button
            title="Create Free Account"
            onPress={() => router.push('/(auth)/register')}
            variant="primary"
            size="lg"
          />

          <View style={{ marginTop: spacing.md }}>
            <Button
              title="Sign In with Email"
              onPress={() => router.push('/(auth)/login')}
              variant="secondary"
              size="lg"
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
  topSection: {
    alignItems: 'center',
    textAlign: 'center',
    marginTop: 10,
  },
  logoBox: {
    width: 88,
    height: 88,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  heading: {
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subheading: {
    textAlign: 'center',
    maxWidth: 320,
  },
  featuresSection: {},
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  featureIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    letterSpacing: -0.2,
  },
  featureDesc: {},
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  buttonSection: {
    width: '100%',
  },
});
