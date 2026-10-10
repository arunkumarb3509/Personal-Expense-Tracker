import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useCurrency } from '@/hooks/useCurrency';
import { Budget } from '@/types/app';
import { getCategoryById } from '@/constants/categories';
import { Card } from '../common/Card';
import { AlertTriangle, CheckCircle, Trash2 } from 'lucide-react-native';

export interface BudgetProgressCardProps {
  budget: Budget;
  onDelete?: (budgetId: string) => void;
  onPress?: (budget: Budget) => void;
}

export function BudgetProgressCard({
  budget,
  onDelete,
  onPress,
}: BudgetProgressCardProps) {
  const { colors, typography, radius, spacing } = useTheme();
  const { format } = useCurrency();

  const category = getCategoryById(budget.categoryId);
  const percentUsed = budget.amount > 0 ? Math.min(100, Math.round((budget.spent / budget.amount) * 100)) : 0;
  const rawPercent = budget.amount > 0 ? Math.round((budget.spent / budget.amount) * 100) : 0;
  const remaining = Math.max(0, budget.amount - budget.spent);
  const isOverBudget = budget.spent > budget.amount;
  const isWarning = rawPercent >= 80 && !isOverBudget;

  let barColor = colors.primary;
  let statusText = `${format(remaining)} remaining`;
  let statusBadgeColor = colors.incomeLight;
  let statusTextColor = colors.income;

  if (isOverBudget) {
    barColor = colors.error;
    statusText = `Exceeded by ${format(budget.spent - budget.amount)}`;
    statusBadgeColor = colors.errorLight;
    statusTextColor = colors.error;
  } else if (isWarning) {
    barColor = colors.warning;
    statusText = `80%+ used (${format(remaining)} left)`;
    statusBadgeColor = colors.warningLight;
    statusTextColor = colors.warning;
  }

  return (
    <Card
      variant="outlined"
      padding={spacing.lg}
      onPress={onPress ? () => onPress(budget) : undefined}
      style={styles.card}
    >
      <View style={styles.topRow}>
        <View style={styles.titleRow}>
          <View
            style={[
              styles.catDot,
              { backgroundColor: category.color || colors.primary, borderRadius: 4 },
            ]}
          />
          <Text
            style={[
              styles.categoryName,
              {
                color: colors.text,
                fontSize: typography.sizes.md,
                fontWeight: typography.weights.bold,
              },
            ]}
          >
            {budget.categoryName || category.name}
          </Text>
        </View>

        {onDelete && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onDelete(budget.id)}
            style={{ padding: 4 }}
          >
            <Trash2 size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Amounts and Percentage */}
      <View style={[styles.amountRow, { marginTop: spacing.sm }]}>
        <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs }}>
          <Text style={{ color: colors.text, fontWeight: '700' }}>{format(budget.spent)}</Text> of{' '}
          {format(budget.amount)}
        </Text>
        <Text
          style={{
            color: isOverBudget ? colors.error : isWarning ? colors.warning : colors.primary,
            fontSize: typography.sizes.xs,
            fontWeight: typography.weights.bold,
          }}
        >
          {rawPercent}%
        </Text>
      </View>

      {/* Progress Bar */}
      <View
        style={[
          styles.progressTrack,
          {
            backgroundColor: colors.surfaceSecondary,
            borderRadius: radius.full,
            marginVertical: spacing.sm,
          },
        ]}
      >
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: barColor,
              borderRadius: radius.full,
              width: `${percentUsed}%`,
            },
          ]}
        />
      </View>

      {/* Status Footer Badge */}
      <View style={styles.footerRow}>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: statusBadgeColor,
              borderRadius: radius.full,
            },
          ]}
        >
          {isOverBudget ? (
            <AlertTriangle size={12} color={colors.error} style={{ marginRight: 4 }} />
          ) : isWarning ? (
            <AlertTriangle size={12} color={colors.warning} style={{ marginRight: 4 }} />
          ) : (
            <CheckCircle size={12} color={colors.income} style={{ marginRight: 4 }} />
          )}
          <Text
            style={{
              color: statusTextColor,
              fontSize: typography.sizes.xxs,
              fontWeight: typography.weights.bold,
            }}
          >
            {statusText}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  catDot: {
    width: 10,
    height: 10,
    marginRight: 8,
  },
  categoryName: {
    letterSpacing: -0.2,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressTrack: {
    height: 8,
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
});
