import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useData } from '@/context/DataContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useRouter } from 'expo-router';
import { Header } from '@/components/common/Header';
import { BudgetProgressCard } from '@/components/budgets/BudgetProgressCard';
import { EmptyState } from '@/components/common/EmptyState';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { PiggyBank, Plus, AlertTriangle, ShieldCheck } from 'lucide-react-native';

export default function BudgetsScreen() {
  const { colors, typography, radius, spacing, shadows } = useTheme();
  const { budgets, transactions, removeBudget } = useData();
  const { format: formatMoney } = useCurrency();
  const router = useRouter();

  const currentMonthStr = format(new Date(), 'yyyy-MM');
  const currentMonthName = format(new Date(), 'MMMM yyyy');

  // Compute spent for each budget from current month transactions
  const populatedBudgets = useMemo(() => {
    const now = new Date();
    const mStart = startOfMonth(now);
    const mEnd = endOfMonth(now);

    return budgets.map((b) => {
      const spent = transactions
        .filter((tx) => {
          if (tx.type !== 'expense' || tx.categoryId !== b.categoryId || !tx.date) return false;
          try {
            const d = parseISO(tx.date);
            return isWithinInterval(d, { start: mStart, end: mEnd });
          } catch {
            return false;
          }
        })
        .reduce((sum, tx) => sum + (tx.amount || 0), 0);

      return {
        ...b,
        spent,
      };
    });
  }, [budgets, transactions]);

  // Overall budget summary
  const { totalBudgetLimit, totalBudgetSpent } = useMemo(() => {
    let limit = 0;
    let spent = 0;
    for (const b of populatedBudgets) {
      limit += b.amount;
      spent += b.spent;
    }
    return { totalBudgetLimit: limit, totalBudgetSpent: spent };
  }, [populatedBudgets]);

  const overallPercent =
    totalBudgetLimit > 0 ? Math.min(100, Math.round((totalBudgetSpent / totalBudgetLimit) * 100)) : 0;

  const handleDeleteBudget = async (budgetId: string) => {
    Alert.alert('Delete Budget', 'Are you sure you want to remove this category budget?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeBudget(budgetId);
          } catch (e: any) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <Header
        title="Budgets & Targets"
        subtitle={currentMonthName}
        showBack
        onBackPress={() => router.back()}
        rightAction={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/budgets/add-budget')}
            style={[
              styles.addBtn,
              { backgroundColor: colors.primaryLight, borderColor: colors.primary },
            ]}
          >
            <Plus size={18} color={colors.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 40 }}
      >
        {/* Overall Month Budget Card */}
        {populatedBudgets.length > 0 && (
          <Card variant="elevated" padding={spacing.lg} style={[styles.overallCard, shadows.sm]}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs, fontWeight: '500' }}>
                  Total Monthly Budget ({currentMonthName})
                </Text>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: typography.sizes['2xl'],
                    fontWeight: typography.weights.bold,
                    marginTop: 2,
                  }}
                >
                  {formatMoney(totalBudgetSpent)} / {formatMoney(totalBudgetLimit)}
                </Text>
              </View>

              <View
                style={[
                  styles.percentBadge,
                  {
                    backgroundColor:
                      overallPercent >= 100
                        ? colors.errorLight
                        : overallPercent >= 80
                        ? colors.warningLight
                        : colors.incomeLight,
                  },
                ]}
              >
                <Text
                  style={{
                    color:
                      overallPercent >= 100
                        ? colors.error
                        : overallPercent >= 80
                        ? colors.warning
                        : colors.income,
                    fontSize: typography.sizes.xs,
                    fontWeight: '700',
                  }}
                >
                  {overallPercent}% Used
                </Text>
              </View>
            </View>

            {/* Overall Progress Bar */}
            <View
              style={[
                styles.track,
                {
                  backgroundColor: colors.surfaceSecondary,
                  borderRadius: radius.full,
                  marginVertical: spacing.md,
                },
              ]}
            >
              <View
                style={[
                  styles.barFill,
                  {
                    backgroundColor:
                      overallPercent >= 100
                        ? colors.error
                        : overallPercent >= 80
                        ? colors.warning
                        : colors.primary,
                    borderRadius: radius.full,
                    width: `${overallPercent}%`,
                  },
                ]}
              />
            </View>

            <View style={styles.cardFooter}>
              <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs }}>
                {Math.max(0, totalBudgetLimit - totalBudgetSpent) > 0
                  ? `${formatMoney(totalBudgetLimit - totalBudgetSpent)} safe to spend this month`
                  : 'Monthly budget limit reached'}
              </Text>
            </View>
          </Card>
        )}

        {/* Category Budgets List */}
        <View style={{ marginTop: spacing.md }}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.text,
                fontSize: typography.sizes.md,
                fontWeight: typography.weights.bold,
                marginBottom: spacing.sm,
              },
            ]}
          >
            Category Budgets ({populatedBudgets.length})
          </Text>

          {populatedBudgets.length > 0 ? (
            populatedBudgets.map((budget) => (
              <BudgetProgressCard
                key={budget.id}
                budget={budget}
                onDelete={handleDeleteBudget}
              />
            ))
          ) : (
            <EmptyState
              type="budgets"
              title="No budgets created"
              description="Set spending limits for Food, Shopping, Travel, and Bills to get notified when you hit 80% or 100%."
              actionTitle="Create Monthly Budget"
              onActionPress={() => router.push('/budgets/add-budget')}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overallCard: {
    marginVertical: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  percentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  track: {
    height: 10,
    width: '100%',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    letterSpacing: -0.2,
  },
});
