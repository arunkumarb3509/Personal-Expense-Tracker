import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import {
  HandCoins,
  PiggyBank,
  CalendarDays,
  PieChart,
  Wallet,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export interface QuickActionsProps {
  onRecordSavings?: () => void;
}

export function QuickActions({ onRecordSavings }: QuickActionsProps) {
  const { colors, typography, radius, spacing, shadows } = useTheme();
  const router = useRouter();

  const handleAction = (item: any) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    if (item.id === 'savings' && onRecordSavings) {
      onRecordSavings();
    } else if (item.route) {
      router.push(item.route as any);
    }
  };

  const actions = [
    {
      id: 'settlements',
      label: 'Cash & Dues',
      icon: <HandCoins size={20} color={colors.lend} />,
      bgColor: colors.lendLight,
      route: '/lending',
    },
    {
      id: 'savings',
      label: 'Savings',
      icon: <PiggyBank size={20} color={colors.income} />,
      bgColor: colors.incomeLight,
    },
    {
      id: 'daily',
      label: 'Daily View',
      icon: <CalendarDays size={20} color={colors.primary} />,
      bgColor: colors.primaryLight,
      route: '/daily-view',
    },
    {
      id: 'budgets',
      label: 'Budgets',
      icon: <PieChart size={20} color={colors.accentPurple} />,
      bgColor: colors.transferLight,
      route: '/budgets',
    },
    {
      id: 'wallets',
      label: 'Wallets',
      icon: <Wallet size={20} color={colors.accentTeal} />,
      bgColor: colors.borrowLight,
      route: '/wallets',
    },
  ];

  return (
    <View style={[styles.container, { paddingHorizontal: spacing.lg, marginVertical: spacing.xs }]}>
      <View
        style={[
          styles.actionRow,
          {
            backgroundColor: colors.card,
            borderRadius: radius['2xl'],
            borderColor: colors.border,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.sm,
          },
          shadows.sm,
        ]}
      >
        {actions.map((act) => (
          <TouchableOpacity
            key={act.id}
            activeOpacity={0.75}
            onPress={() => handleAction(act)}
            style={styles.actionItem}
          >
            <View
              style={[
                styles.iconCircle,
                {
                  backgroundColor: act.bgColor,
                  borderRadius: radius.xl,
                },
              ]}
            >
              {act.icon}
            </View>
            <Text
              style={[
                styles.actionLabel,
                {
                  color: colors.text,
                  fontSize: typography.sizes.xxs,
                  fontWeight: '600',
                  marginTop: 4,
                },
              ]}
              numberOfLines={1}
            >
              {act.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  actionItem: {
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    textAlign: 'center',
  },
});
