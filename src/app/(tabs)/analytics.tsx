import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useData } from '@/context/DataContext';
import { useCurrency } from '@/hooks/useCurrency';
import { Header } from '@/components/common/Header';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { BarChart } from '@/components/analytics/BarChart';
import { CategoryPieChart } from '@/components/analytics/CategoryPieChart';
import { StatCard } from '@/components/analytics/StatCard';
import { Card } from '@/components/common/Card';
import {
  computeWeeklyAnalytics,
  computeMonthlyAnalytics,
} from '@/services/analyticsCalculator';
import { format, subMonths, addMonths, parseISO } from 'date-fns';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Activity,
  Award,
  ShieldCheck,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function AnalyticsScreen() {
  const { colors, typography, radius, spacing } = useTheme();
  const { transactions } = useData();
  const { format: formatMoney } = useCurrency();

  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly' | 'categories'>('weekly');
  const [selectedMonthDate, setSelectedMonthDate] = useState<Date>(new Date());

  const monthStr = format(selectedMonthDate, 'yyyy-MM');
  const formattedMonthName = format(selectedMonthDate, 'MMMM yyyy');

  // Compute Weekly Analytics
  const weeklyData = useMemo(() => {
    return computeWeeklyAnalytics(transactions, new Date());
  }, [transactions]);

  // Compute Monthly Analytics
  const monthlyData = useMemo(() => {
    return computeMonthlyAnalytics(transactions, monthStr);
  }, [transactions, monthStr]);

  const handlePrevMonth = () => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setSelectedMonthDate(subMonths(selectedMonthDate, 1));
  };

  const handleNextMonth = () => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setSelectedMonthDate(addMonths(selectedMonthDate, 1));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <Header title="Financial Analytics" />

      {/* Segmented Mode Selector */}
      <View style={{ paddingHorizontal: spacing.lg, marginVertical: spacing.sm }}>
        <SegmentedControl
          options={[
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' },
            { value: 'categories', label: 'Categories' },
          ]}
          selectedValue={activeTab}
          onValueChange={(tab) => setActiveTab(tab as any)}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 40 }}
      >
        {/* ========================================================= */}
        {/* WEEKLY ANALYTICS VIEW */}
        {/* ========================================================= */}
        {activeTab === 'weekly' && (
          <View>
            {/* Weekly Total Spent Banner */}
            <Card variant="outlined" padding={spacing.lg} style={{ marginBottom: spacing.md }}>
              <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs, fontWeight: '500' }}>
                Total Spent This Week
              </Text>
              <Text
                style={{
                  color: colors.text,
                  fontSize: typography.sizes['3xl'],
                  fontWeight: typography.weights.bold,
                  letterSpacing: -0.4,
                  marginTop: 2,
                }}
              >
                {formatMoney(weeklyData.totalSpent)}
              </Text>

              {/* Interactive Daily Bar Chart (Mon - Sun) */}
              <BarChart data={weeklyData.dailyBreakdown} height={160} />
            </Card>

            {/* Weekly Stats Grid */}
            <View style={styles.statsGrid}>
              <StatCard
                title="Daily Average"
                value={formatMoney(weeklyData.dailyAverage)}
                subtitle="Average daily spending"
                icon={<Activity size={18} color={colors.primary} />}
                variant="primary"
              />
              <StatCard
                title="Highest Spend Day"
                value={weeklyData.highestDay ? `${weeklyData.highestDay.dayName} (${formatMoney(weeklyData.highestDay.amount)})` : 'None'}
                subtitle="Peak spending day"
                icon={<TrendingUp size={18} color={colors.warning} />}
                variant="warning"
              />
            </View>

            {/* Weekly Category Distribution */}
            <View style={{ marginTop: spacing.lg }}>
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
                Weekly Category Breakdown
              </Text>
              <CategoryPieChart
                categories={weeklyData.categoryDistribution}
                totalAmount={weeklyData.totalSpent}
              />
            </View>
          </View>
        )}

        {/* ========================================================= */}
        {/* MONTHLY ANALYTICS VIEW */}
        {/* ========================================================= */}
        {activeTab === 'monthly' && (
          <View>
            {/* Month Navigator */}
            <View
              style={[
                styles.monthNavBar,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: radius.xl,
                  padding: spacing.sm,
                  marginBottom: spacing.md,
                  borderWidth: 1,
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handlePrevMonth}
                style={[styles.arrowBtn, { backgroundColor: colors.surfaceSecondary }]}
              >
                <ChevronLeft size={20} color={colors.text} />
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Calendar size={16} color={colors.primary} style={{ marginRight: 6 }} />
                <Text
                  style={{
                    color: colors.text,
                    fontSize: typography.sizes.md,
                    fontWeight: typography.weights.bold,
                  }}
                >
                  {formattedMonthName}
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleNextMonth}
                style={[styles.arrowBtn, { backgroundColor: colors.surfaceSecondary }]}
              >
                <ChevronRight size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Income / Expense / Net Balance Summary */}
            <Card variant="elevated" padding={spacing.lg} style={{ marginBottom: spacing.md }}>
              <View style={styles.monthlyTopRow}>
                <View>
                  <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs }}>
                    Total Income
                  </Text>
                  <Text
                    style={{
                      color: colors.income,
                      fontSize: typography.sizes.xl,
                      fontWeight: typography.weights.bold,
                      marginTop: 2,
                    }}
                  >
                    +{formatMoney(monthlyData.totalIncome)}
                  </Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs }}>
                    Total Expenses
                  </Text>
                  <Text
                    style={{
                      color: colors.expense,
                      fontSize: typography.sizes.xl,
                      fontWeight: typography.weights.bold,
                      marginTop: 2,
                    }}
                  >
                    -{formatMoney(monthlyData.totalExpense)}
                  </Text>
                </View>
              </View>

              {/* Net Savings Bar */}
              <View
                style={[
                  styles.netSavingsBox,
                  {
                    backgroundColor: colors.surfaceSecondary,
                    borderRadius: radius.lg,
                    padding: spacing.md,
                    marginTop: spacing.md,
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs, fontWeight: '600' }}>
                    Net Remaining Savings:
                  </Text>
                  <Text
                    style={{
                      color: monthlyData.netSavings >= 0 ? colors.income : colors.expense,
                      fontSize: typography.sizes.md,
                      fontWeight: typography.weights.bold,
                    }}
                  >
                    {formatMoney(monthlyData.netSavings)}
                  </Text>
                </View>
                {monthlyData.totalIncome > 0 && (
                  <Text style={{ color: colors.textTertiary, fontSize: typography.sizes.xxs, marginTop: 4 }}>
                    Savings Rate: {monthlyData.savingsRate}% of total income retained
                  </Text>
                )}
              </View>
            </Card>

            {/* Month-over-Month Comparison Note */}
            {monthlyData.previousMonthExpense > 0 && (
              <Card variant="outlined" padding={spacing.md} style={{ marginBottom: spacing.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {monthlyData.expenseChangePercentage > 0 ? (
                    <TrendingUp size={20} color={colors.warning} style={{ marginRight: 10 }} />
                  ) : (
                    <TrendingDown size={20} color={colors.income} style={{ marginRight: 10 }} />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text, fontSize: typography.sizes.xs, fontWeight: '700' }}>
                      {monthlyData.expenseChangePercentage > 0
                        ? `Spending increased by ${monthlyData.expenseChangePercentage}%`
                        : `Spending reduced by ${Math.abs(monthlyData.expenseChangePercentage)}%`}
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xxs, marginTop: 2 }}>
                      Compared to previous month's total of {formatMoney(monthlyData.previousMonthExpense)}.
                    </Text>
                  </View>
                </View>
              </Card>
            )}

            {/* Monthly Category Distribution */}
            <View style={{ marginTop: spacing.sm }}>
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
                Monthly Spending by Category
              </Text>
              <CategoryPieChart
                categories={monthlyData.categoryDistribution}
                totalAmount={monthlyData.totalExpense}
              />
            </View>
          </View>
        )}

        {/* ========================================================= */}
        {/* CATEGORY DEEP DIVE VIEW */}
        {/* ========================================================= */}
        {activeTab === 'categories' && (
          <View>
            <View style={{ marginBottom: spacing.md }}>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: colors.text,
                    fontSize: typography.sizes.lg,
                    fontWeight: typography.weights.bold,
                  },
                ]}
              >
                Category Deep Dive ({formattedMonthName})
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs, marginTop: 2 }}>
                Detailed breakdown of subcategories (Breakfast, Lunch, Dinner, Taxi, etc.)
              </Text>
            </View>

            {monthlyData.categoryDistribution.map((cat) => (
              <Card
                key={cat.categoryId}
                variant="outlined"
                padding={spacing.lg}
                style={{ marginBottom: spacing.md }}
              >
                {/* Category Header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View
                      style={[
                        styles.catDot,
                        { backgroundColor: cat.color, borderRadius: 4, width: 12, height: 12, marginRight: 8 },
                      ]}
                    />
                    <Text style={{ color: colors.text, fontSize: typography.sizes.md, fontWeight: '700' }}>
                      {cat.categoryName}
                    </Text>
                  </View>
                  <Text style={{ color: colors.text, fontSize: typography.sizes.md, fontWeight: '700' }}>
                    {formatMoney(cat.amount)} ({cat.percentage}%)
                  </Text>
                </View>

                {/* Subcategories list */}
                <View
                  style={{
                    borderTopColor: colors.borderLight,
                    borderTopWidth: 1,
                    marginTop: spacing.md,
                    paddingTop: spacing.sm,
                  }}
                >
                  {cat.subcategories.map((sub, i) => (
                    <View
                      key={i}
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingVertical: 5,
                      }}
                    >
                      <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs }}>
                        {sub.name}
                      </Text>
                      <Text style={{ color: colors.text, fontSize: typography.sizes.xs, fontWeight: '600' }}>
                        {formatMoney(sub.amount)} ({sub.percentage}%)
                      </Text>
                    </View>
                  ))}
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  sectionTitle: {
    letterSpacing: -0.2,
  },
  monthNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthlyTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  netSavingsBox: {},
  catDot: {},
});
