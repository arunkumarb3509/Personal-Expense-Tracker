import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Button } from './Button';
import {
  Receipt,
  Wallet,
  HandCoins,
  PiggyBank,
  SearchX,
  BellOff,
  CheckCircle2,
  CalendarCheck,
  TrendingUp,
} from 'lucide-react-native';

export type EmptyStateType =
  | 'transactions'
  | 'expenses'
  | 'wallets'
  | 'lending'
  | 'borrowing'
  | 'budgets'
  | 'search'
  | 'notifications'
  | 'recurring'
  | 'verified'
  | 'budget_complete';

export interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  actionTitle?: string;
  onActionPress?: () => void;
  style?: ViewStyle;
}

export function EmptyState({
  type = 'transactions',
  title,
  description,
  actionTitle,
  onActionPress,
  style,
}: EmptyStateProps) {
  const { colors, typography, radius, spacing } = useTheme();

  // Preset configurations
  let defaultIcon = <Receipt size={40} color={colors.primary} />;
  let defaultTitle = 'No transactions yet';
  let defaultDesc = 'Start tracking your expenses and incomes by adding your first transaction.';
  let iconBgColor = colors.primaryLight;

  switch (type) {
    case 'expenses':
      defaultIcon = <Receipt size={40} color={colors.expense} />;
      defaultTitle = 'No expenses recorded';
      defaultDesc = 'Keep your finances on track by logging your daily expenses.';
      iconBgColor = colors.expenseLight;
      break;
    case 'wallets':
      defaultIcon = <Wallet size={40} color={colors.accentPurple} />;
      defaultTitle = 'No wallets found';
      defaultDesc = 'Create a Bank, UPI, or Cash wallet to begin managing your money.';
      iconBgColor = colors.transferLight;
      break;
    case 'lending':
      defaultIcon = <HandCoins size={40} color={colors.lend} />;
      defaultTitle = 'No money given records';
      defaultDesc = 'Keep track of money you have lent to friends and family with due dates.';
      iconBgColor = colors.lendLight;
      break;
    case 'borrowing':
      defaultIcon = <HandCoins size={40} color={colors.borrow} />;
      defaultTitle = 'No money borrowed records';
      defaultDesc = 'Keep track of money you owe or borrowed with payment status.';
      iconBgColor = colors.borrowLight;
      break;
    case 'budgets':
      defaultIcon = <PiggyBank size={40} color={colors.income} />;
      defaultTitle = 'No budgets set';
      defaultDesc = 'Set monthly spending targets for categories like Food, Travel, and Shopping.';
      iconBgColor = colors.incomeLight;
      break;
    case 'search':
      defaultIcon = <SearchX size={40} color={colors.textTertiary} />;
      defaultTitle = 'No results found';
      defaultDesc = 'Try searching with a different keyword, category, person, or date.';
      iconBgColor = colors.surfaceSecondary;
      break;
    case 'notifications':
      defaultIcon = <BellOff size={40} color={colors.textTertiary} />;
      defaultTitle = 'No new notifications';
      defaultDesc = 'You are all caught up! Smart financial alerts and updates will appear here.';
      iconBgColor = colors.surfaceSecondary;
      break;
    case 'recurring':
      defaultIcon = <CalendarCheck size={40} color={colors.accentTeal} />;
      defaultTitle = 'No recurring payments';
      defaultDesc = 'Add recurring subscriptions, rent, insurance, or EMIs to never miss a due date.';
      iconBgColor = colors.incomeLight;
      break;
    case 'verified':
      defaultIcon = <CheckCircle2 size={44} color={colors.success} />;
      defaultTitle = 'Email Verified!';
      defaultDesc = 'Your email has been successfully verified. You can now access your private dashboard.';
      iconBgColor = colors.successLight;
      break;
    case 'budget_complete':
      defaultIcon = <TrendingUp size={44} color={colors.success} />;
      defaultTitle = 'Under Budget!';
      defaultDesc = 'Congratulations! You successfully stayed within your budget limit this month.';
      iconBgColor = colors.successLight;
      break;
  }

  const finalTitle = title || defaultTitle;
  const finalDesc = description || defaultDesc;

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: iconBgColor,
            borderRadius: radius.full,
            width: 80,
            height: 80,
          },
        ]}
      >
        {defaultIcon}
      </View>

      <Text
        style={[
          styles.title,
          {
            color: colors.text,
            fontSize: typography.sizes.lg,
            fontWeight: typography.weights.bold,
            marginTop: spacing.lg,
          },
        ]}
      >
        {finalTitle}
      </Text>

      <Text
        style={[
          styles.description,
          {
            color: colors.textSecondary,
            fontSize: typography.sizes.sm,
            marginTop: spacing.xs,
            lineHeight: 20,
          },
        ]}
      >
        {finalDesc}
      </Text>

      {actionTitle && onActionPress && (
        <View style={{ marginTop: spacing.xl, width: '100%', maxWidth: 220 }}>
          <Button
            title={actionTitle}
            onPress={onActionPress}
            size="sm"
            variant="primary"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
  },
  iconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  description: {
    textAlign: 'center',
    maxWidth: 300,
  },
});
