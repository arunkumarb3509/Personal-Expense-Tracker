import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useCurrency } from '@/hooks/useCurrency';
import { Card } from '../common/Card';
import {
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export interface BalanceCardProps {
  totalBalance: number;
  totalReceivable: number;
  totalPayable: number;
  netWorth: number;
}

export function BalanceCard({
  totalBalance,
  totalReceivable,
  totalPayable,
  netWorth,
}: BalanceCardProps) {
  const { colors, typography, radius, spacing, shadows } = useTheme();
  const { format } = useCurrency();
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [hideAmount, setHideAmount] = useState(false);

  const toggleHide = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setHideAmount(!hideAmount);
  };

  const toggleBreakdown = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setShowBreakdown(!showBreakdown);
  };

  return (
    <Card variant="elevated" padding={spacing.xl} style={[styles.container, shadows.md]}>
      {/* Top Header */}
      <View style={styles.topRow}>
        <View style={styles.badgeRow}>
          <View
            style={[
              styles.netWorthBadge,
              {
                backgroundColor: colors.surfaceSecondary,
                borderColor: colors.border,
              },
            ]}
          >
            <ShieldCheck size={14} color={colors.primary} style={{ marginRight: 4 }} />
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: typography.sizes.xs,
                fontWeight: typography.weights.semibold,
              }}
            >
              Net Worth: {hideAmount ? '••••••' : format(netWorth)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={toggleHide}
          style={[styles.iconButton, { backgroundColor: colors.surfaceSecondary }]}
        >
          {hideAmount ? (
            <EyeOff size={18} color={colors.textSecondary} />
          ) : (
            <Eye size={18} color={colors.textSecondary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Main Balance */}
      <View style={{ marginTop: spacing.md }}>
        <Text
          style={[
            styles.label,
            {
              color: colors.textSecondary,
              fontSize: typography.sizes.sm,
              fontWeight: typography.weights.medium,
            },
          ]}
        >
          Total Balance
        </Text>
        <Text
          style={[
            styles.amount,
            {
              color: colors.text,
              fontSize: typography.sizes['4xl'],
              fontWeight: typography.weights.bold,
              letterSpacing: -0.5,
              marginTop: 2,
            },
          ]}
        >
          {hideAmount ? '₹ ••••••' : format(totalBalance)}
        </Text>
      </View>

      {/* Debt Summary Pills */}
      <View
        style={[
          styles.summaryRow,
          {
            backgroundColor: colors.surfaceSecondary,
            borderRadius: radius.lg,
            padding: spacing.md,
            marginTop: spacing.lg,
          },
        ]}
      >
        <View style={styles.summaryItem}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={[
                styles.miniDot,
                { backgroundColor: colors.lend, width: 8, height: 8, borderRadius: 4, marginRight: 6 },
              ]}
            />
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: typography.sizes.xs,
                fontWeight: typography.weights.medium,
              }}
            >
              To Receive
            </Text>
          </View>
          <Text
            style={{
              color: colors.lend,
              fontSize: typography.sizes.sm,
              fontWeight: typography.weights.bold,
              marginTop: 2,
            }}
          >
            {hideAmount ? '••••' : format(totalReceivable)}
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.summaryItem}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={[
                styles.miniDot,
                { backgroundColor: colors.borrow, width: 8, height: 8, borderRadius: 4, marginRight: 6 },
              ]}
            />
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: typography.sizes.xs,
                fontWeight: typography.weights.medium,
              }}
            >
              To Pay
            </Text>
          </View>
          <Text
            style={{
              color: colors.borrow,
              fontSize: typography.sizes.sm,
              fontWeight: typography.weights.bold,
              marginTop: 2,
            }}
          >
            {hideAmount ? '••••' : format(totalPayable)}
          </Text>
        </View>
      </View>

      {/* Toggle Details Breakdown */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={toggleBreakdown}
        style={[
          styles.breakdownToggle,
          {
            borderTopColor: colors.borderLight,
            marginTop: spacing.md,
            paddingTop: spacing.sm,
          },
        ]}
      >
        <Text
          style={{
            color: colors.primary,
            fontSize: typography.sizes.xs,
            fontWeight: typography.weights.semibold,
          }}
        >
          {showBreakdown ? 'Hide Breakdown' : 'Financial Breakdown'}
        </Text>
        {showBreakdown ? (
          <ChevronUp size={16} color={colors.primary} />
        ) : (
          <ChevronDown size={16} color={colors.primary} />
        )}
      </TouchableOpacity>

      {showBreakdown && (
        <View style={[styles.breakdownContent, { marginTop: spacing.sm }]}>
          <View style={styles.breakdownRow}>
            <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs }}>
              Liquid Wallets Balance
            </Text>
            <Text
              style={{
                color: colors.text,
                fontSize: typography.sizes.xs,
                fontWeight: typography.weights.bold,
              }}
            >
              {hideAmount ? '••••' : format(totalBalance)}
            </Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs }}>
              + Money Given (Receivable)
            </Text>
            <Text
              style={{
                color: colors.lend,
                fontSize: typography.sizes.xs,
                fontWeight: typography.weights.bold,
              }}
            >
              +{hideAmount ? '••••' : format(totalReceivable)}
            </Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs }}>
              - Money Borrowed (Payable)
            </Text>
            <Text
              style={{
                color: colors.borrow,
                fontSize: typography.sizes.xs,
                fontWeight: typography.weights.bold,
              }}
            >
              -{hideAmount ? '••••' : format(totalPayable)}
            </Text>
          </View>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  netWorthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {},
  amount: {},
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
  },
  divider: {
    width: 1,
    height: 28,
    marginHorizontal: 12,
  },
  miniDot: {},
  breakdownToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
  },
  breakdownContent: {
    gap: 6,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
