import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import {
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  HandCoins,
  CalendarDays,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export function QuickActions() {
  const { colors, typography, radius, spacing } = useTheme();
  const router = useRouter();

  const handleAction = (route: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    router.push(route as any);
  };

  const actions = [
    {
      id: 'expense',
      label: 'Expense',
      icon: <ArrowUpRight size={22} color={colors.expense} />,
      bgColor: colors.expenseLight,
      route: '/add-transaction?type=expense',
    },
    {
      id: 'income',
      label: 'Income',
      icon: <ArrowDownLeft size={22} color={colors.income} />,
      bgColor: colors.incomeLight,
      route: '/add-transaction?type=income',
    },
    {
      id: 'transfer',
      label: 'Transfer',
      icon: <ArrowLeftRight size={22} color={colors.transfer} />,
      bgColor: colors.transferLight,
      route: '/wallets/transfer',
    },
    {
      id: 'lending',
      label: 'Lending',
      icon: <HandCoins size={22} color={colors.lend} />,
      bgColor: colors.lendLight,
      route: '/lending',
    },
    {
      id: 'daily',
      label: 'Daily View',
      icon: <CalendarDays size={22} color={colors.primary} />,
      bgColor: colors.primaryLight,
      route: '/daily-view',
    },
  ];

  return (
    <View style={[styles.container, { paddingHorizontal: spacing.lg, marginVertical: spacing.md }]}>
      <View style={styles.actionRow}>
        {actions.map((act) => (
          <TouchableOpacity
            key={act.id}
            activeOpacity={0.7}
            onPress={() => handleAction(act.route)}
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
                  fontSize: typography.sizes.xs,
                  fontWeight: typography.weights.medium,
                  marginTop: 6,
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
  },
  actionItem: {
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    textAlign: 'center',
  },
});
