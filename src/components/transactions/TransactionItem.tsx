import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useCurrency } from '@/hooks/useCurrency';
import { Transaction } from '@/types/transaction';
import { getCategoryById } from '@/constants/categories';
import {
  Utensils,
  Car,
  ShoppingBag,
  Zap,
  Film,
  HeartPulse,
  GraduationCap,
  Briefcase,
  Users,
  Calendar,
  Wallet,
  Laptop,
  TrendingUp,
  LineChart,
  Gift,
  ArrowLeftRight,
  HandCoins,
  Receipt,
  MoreHorizontal,
} from 'lucide-react-native';

export interface TransactionItemProps {
  transaction: Transaction;
  onPress?: (tx: Transaction) => void;
  showDate?: boolean;
}

export function TransactionItem({
  transaction,
  onPress,
  showDate = false,
}: TransactionItemProps) {
  const { colors, typography, radius, spacing } = useTheme();
  const { format } = useCurrency();

  const category = getCategoryById(transaction.categoryId);

  // Pick category icon
  const getIcon = (iconName: string, iconColor: string) => {
    const size = 18;
    switch (iconName) {
      case 'Utensils':
        return <Utensils size={size} color={iconColor} />;
      case 'Car':
        return <Car size={size} color={iconColor} />;
      case 'ShoppingBag':
        return <ShoppingBag size={size} color={iconColor} />;
      case 'Zap':
        return <Zap size={size} color={iconColor} />;
      case 'Film':
        return <Film size={size} color={iconColor} />;
      case 'HeartPulse':
        return <HeartPulse size={size} color={iconColor} />;
      case 'GraduationCap':
        return <GraduationCap size={size} color={iconColor} />;
      case 'Briefcase':
        return <Briefcase size={size} color={iconColor} />;
      case 'Users':
        return <Users size={size} color={iconColor} />;
      case 'Calendar':
        return <Calendar size={size} color={iconColor} />;
      case 'Wallet':
        return <Wallet size={size} color={iconColor} />;
      case 'Laptop':
        return <Laptop size={size} color={iconColor} />;
      case 'TrendingUp':
        return <TrendingUp size={size} color={iconColor} />;
      case 'LineChart':
        return <LineChart size={size} color={iconColor} />;
      case 'Gift':
        return <Gift size={size} color={iconColor} />;
      case 'ArrowLeftRight':
        return <ArrowLeftRight size={size} color={iconColor} />;
      case 'HandCoins':
        return <HandCoins size={size} color={iconColor} />;
      default:
        return <Receipt size={size} color={iconColor} />;
    }
  };

  // Determine amount prefix and color
  let isPositive = false;
  let prefix = '-';
  let amountColor = colors.expense;
  let iconBgColor = `${category.color || colors.primary}18`;
  let iconColor = category.color || colors.primary;

  switch (transaction.type) {
    case 'income':
    case 'repayment_received':
      isPositive = true;
      prefix = '+';
      amountColor = colors.income;
      break;
    case 'expense':
      isPositive = false;
      prefix = '-';
      amountColor = colors.expense;
      break;
    case 'transfer':
      prefix = '⇄';
      amountColor = colors.transfer;
      iconColor = colors.transfer;
      iconBgColor = colors.transferLight;
      break;
    case 'lend':
      prefix = '-';
      amountColor = colors.lend;
      iconColor = colors.lend;
      iconBgColor = colors.lendLight;
      break;
    case 'borrow':
      prefix = '+';
      amountColor = colors.borrow;
      iconColor = colors.borrow;
      iconBgColor = colors.borrowLight;
      break;
    case 'repayment_given':
      prefix = '-';
      amountColor = colors.expense;
      break;
  }

  const title = transaction.description || transaction.categoryName || 'Transaction';
  const subtitleParts: string[] = [];

  if (transaction.subcategory) {
    subtitleParts.push(transaction.subcategory);
  } else if (transaction.categoryName && transaction.categoryName !== title) {
    subtitleParts.push(transaction.categoryName);
  }

  if (transaction.type === 'transfer' && transaction.targetWalletName) {
    subtitleParts.push(`${transaction.walletName || 'Wallet'} → ${transaction.targetWalletName}`);
  } else if (transaction.walletName) {
    subtitleParts.push(transaction.walletName);
  }

  if (transaction.personName) {
    subtitleParts.push(transaction.personName);
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={!onPress}
      onPress={() => onPress && onPress(transaction)}
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.borderLight,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
        },
      ]}
    >
      <View style={styles.leftRow}>
        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor: iconBgColor,
              borderRadius: radius.lg,
            },
          ]}
        >
          {getIcon(category.icon, iconColor)}
        </View>

        <View style={styles.details}>
          <Text
            style={[
              styles.title,
              {
                color: colors.text,
                fontSize: typography.sizes.sm,
                fontWeight: typography.weights.semibold,
              },
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>

          <View style={styles.subtitleRow}>
            {subtitleParts.length > 0 && (
              <Text
                style={[
                  styles.subtitle,
                  {
                    color: colors.textSecondary,
                    fontSize: typography.sizes.xs,
                  },
                ]}
                numberOfLines={1}
              >
                {subtitleParts.join(' • ')}
              </Text>
            )}

            {showDate && transaction.date && (
              <Text
                style={[
                  styles.dateText,
                  {
                    color: colors.textTertiary,
                    fontSize: typography.sizes.xs,
                    marginLeft: subtitleParts.length > 0 ? 6 : 0,
                  },
                ]}
              >
                {subtitleParts.length > 0 ? `(${transaction.date})` : transaction.date}
              </Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.rightColumn}>
        <Text
          style={[
            styles.amount,
            {
              color: amountColor,
              fontSize: typography.sizes.md,
              fontWeight: typography.weights.bold,
              letterSpacing: -0.2,
            },
          ]}
        >
          {prefix} {format(transaction.amount)}
        </Text>
        {transaction.time && (
          <Text
            style={[
              styles.timeText,
              {
                color: colors.textTertiary,
                fontSize: typography.sizes.xxs,
                marginTop: 2,
              },
            ]}
          >
            {transaction.time}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconCircle: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  title: {
    letterSpacing: -0.1,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  subtitle: {
    maxWidth: '85%',
  },
  dateText: {},
  rightColumn: {
    alignItems: 'flex-end',
  },
  amount: {},
  timeText: {},
});
