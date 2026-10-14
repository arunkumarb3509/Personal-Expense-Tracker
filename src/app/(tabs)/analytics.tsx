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
import { BarChart } from '@/components/analytics/BarChart';
import { CategoryPieChart } from '@/components/analytics/CategoryPieChart';
import { StatCard } from '@/components/analytics/StatCard';
import { Card } from '@/components/common/Card';
import {
  computeWeeklyAnalytics,
  computeMonthlyAnalytics,
} from '@/services/analyticsCalculator';
import { format, subMonths, addMonths } from 'date-fns';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  CalendarCheck,
  Repeat,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function AnalyticsScreen() {
  const { colors, typography, radius, spacing, shadows } = useTheme();
  const { transactions, recurring, totalWalletBalance } = useData();
  const { format: formatMoney } = useCurrency();

  const [metricMode, setMetricMode] = useState<'expense' | 'income'>('expense');
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly' | 'categories'>('weekly');
  const [selectedMonthDate, setSelectedMonthDate] = useState<Date>(new Date());

  const monthStr = format(selectedMonthDate, 'yyyy-MM');
  const formattedMonthName = format(selectedMonthDate, 'MMMM yyyy');

  // Filter transactions based on metricMode (expense vs income)
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => t.type === metricMode);
  }, [transactions, metricMode]);

  // Compute Weekly Analytics
  const weeklyData = useMemo(() => {
    return computeWeeklyAnalytics(filteredTransactions, new Date());
  }, [filteredTransactions]);

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
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <Header title="Analytics" />

      {/* Reference Screenshot Top Pill: Income vs Expense */}
      <View style={{ paddingHorizontal: spacing.lg, marginVertical: spacing.xs }}>
        <View
          style={[
            styles.metricToggleContainer,
            {
              backgroundColor: colors.forestCard,
              borderRadius: radius.full,
              borderColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              try {
                Haptics.selectionAsync();
              } catch {}
              setMetricMode('income');
            }}
            style={[
              styles.metricToggleBtn,
              metricMode === 'income' && {
                backgroundColor: colors.lime,
                borderRadius: radius.full,
              },
            ]}
          >
            <Text
              style={[
                styles.metricToggleText,
                {
                  color: metricMode === 'income' ? '#0B291F' : '#A0C2B0',
                  fontWeight: metricMode === 'income' ? '800' : '600',
                },
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              try {
                Haptics.selectionAsync();
              } catch {}
              setMetricMode('expense');
            }}
            style={[
              styles.metricToggleBtn,
              metricMode === 'expense' && {
                backgroundColor: colors.lime,
                borderRadius: radius.full,
              },
            ]}
          >
            <Text
              style={[
                styles.metricToggleText,
                {
                  color: metricMode === 'expense' ? '#0B291F' : '#A0C2B0',
                  fontWeight: metricMode === 'expense' ? '800' : '600',
                },
              ]}
            >
              Expense
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sub Tabs: Weekly / Monthly / Categories */}
      <View style={{ paddingHorizontal: spacing.lg, marginVertical: spacing.xs }}>
        <View style={styles.subTabsRow}>
          {[
            { id: 'weekly', label: 'Weekly' },
            { id: 'monthly', label: 'Monthly' },
            { id: 'categories', label: 'Categories' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                activeOpacity={0.75}
                onPress={() => {
                  try {
                    Haptics.selectionAsync();
                  } catch {}
                  setActiveTab(tab.id as any);
                }}
                style={[
                  styles.subTabItem,
                  {
                    backgroundColor: isActive ? colors.surface : 'transparent',
                    borderColor: isActive ? colors.border : 'transparent',
                    borderRadius: radius.lg,
                  },
                ]}
              >
                <Text
                  style={{
                    color: isActive ? colors.text : colors.textSecondary,
                    fontSize: typography.sizes.xs,
                    fontWeight: isActive ? '700' : '500',
                  }}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 110 }}
      >
        {/* Total Balance Headline (Inspired by Screenshot) */}
        <View style={styles.totalBalanceHeader}>
          <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs, fontWeight: '500' }}>
            Total Balance
          </Text>
          <Text
            style={{
              color: colors.text,
              fontSize: typography.sizes['3xl'],
              fontWeight: '800',
              letterSpacing: -0.5,
              marginTop: 2,
            }}
          >
            {formatMoney(totalWalletBalance)}
          </Text>
        </View>

        {/* ========================================================= */}
        {/* WEEKLY ANALYTICS VIEW */}
        {/* ========================================================= */}
        {activeTab === 'weekly' && (
          <View>
            {/* Reference Forest Green Analytics Card with Bar Chart */}
            <View
              style={[
                styles.forestAnalyticsCard,
                {
                  backgroundColor: colors.forestCard,
                  borderRadius: radius['3xl'],
                },
                shadows.md,
              ]}
            >
              <View style={styles.cardHeaderRow}>
                <View>
                  <Text style={{ color: '#8BAF9C', fontSize: 11, fontWeight: '600' }}>
                    {metricMode === 'expense' ? 'Total Expenses This Week' : 'Total Income This Week'}
                  </Text>
                  <Text style={styles.forestAmount}>
                    {formatMoney(weeklyData.totalSpent)}
                  </Text>
                </View>
                <View style={styles.trendArrowCircle}>
                  <ArrowUpRight size={18} color="#B4F06A" strokeWidth={2.5} />
                </View>
              </View>

              {/* Bar Chart with neon lime peak highlight */}
              <BarChart
                data={weeklyData.dailyBreakdown}
                height={170}
                isDarkTheme={true}
              />
            </View>

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
                value={
                  weeklyData.highestDay
                    ? `${weeklyData.highestDay.dayName} (${formatMoney(weeklyData.highestDay.amount)})`
                    : 'None'
                }
                subtitle="Peak spending day"
                icon={<TrendingUp size={18} color={colors.warning} />}
                variant="warning"
              />
            </View>

            {/* Upcoming Payments / Subscriptions (As in Screenshot) */}
            <View style={{ marginTop: spacing.lg }}>
              <View style={[styles.sectionHeader, { marginBottom: 10 }]}>
                <Text
                  style={[
                    styles.sectionTitle,
                    {
                      color: colors.text,
                      fontSize: typography.sizes.md,
                      fontWeight: '700',
                    },
                  ]}
                >
                  Upcoming Payments & Recurring
                </Text>
              </View>

              {recurring.length > 0 ? (
                <View
                  style={[
                    styles.recurringCard,
                    {
                      backgroundColor: colors.card,
                      borderRadius: radius['2xl'],
                      borderColor: colors.border,
                      borderWidth: 1,
                      overflow: 'hidden',
                    },
                  ]}
                >
                  {recurring.slice(0, 4).map((rec, idx) => (
                    <View
                      key={rec.id}
                      style={[
                        styles.recurringRow,
                        {
                          borderBottomWidth: idx === recurring.length - 1 ? 0 : 1,
                          borderBottomColor: colors.borderLight,
                          padding: spacing.md,
                        },
                      ]}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View
                          style={[
                            styles.recIconBox,
                            { backgroundColor: colors.surfaceSecondary, borderRadius: radius.lg },
                          ]}
                        >
                          <Repeat size={18} color={colors.primary} />
                        </View>
                        <View style={{ marginLeft: 12 }}>
                          <Text style={{ color: colors.text, fontSize: typography.sizes.sm, fontWeight: '700' }}>
                            {rec.name}
                          </Text>
                          <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xxs, marginTop: 1 }}>
                            Due: {rec.nextDueDate} • {rec.frequency}
                          </Text>
                        </View>
                      </View>
                      <Text style={{ color: colors.text, fontSize: typography.sizes.sm, fontWeight: '800' }}>
                        {formatMoney(rec.amount)}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View
                  style={[
                    styles.emptyBox,
                    {
                      backgroundColor: colors.card,
                      borderRadius: radius.xl,
                      borderColor: colors.border,
                      borderWidth: 1,
                      padding: spacing.md,
                      alignItems: 'center',
                    },
                  ]}
                >
                  <CalendarCheck size={24} color={colors.textTertiary} style={{ marginBottom: 6 }} />
                  <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs }}>
                    No upcoming recurring payments scheduled.
                  </Text>
                </View>
              )}
            </View>

            {/* Weekly Category Distribution */}
            <View style={{ marginTop: spacing.lg }}>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: colors.text,
                    fontSize: typography.sizes.md,
                    fontWeight: '700',
                    marginBottom: spacing.sm,
                  },
                ]}
              >
                Weekly Category Distribution
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
                style={[styles.navArrowBtn, { backgroundColor: colors.surfaceSecondary }]}
              >
                <ChevronLeft size={18} color={colors.text} />
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Calendar size={16} color={colors.primary} style={{ marginRight: 6 }} />
                <Text
                  style={{
                    color: colors.text,
                    fontSize: typography.sizes.sm,
                    fontWeight: '700',
                  }}
                >
                  {formattedMonthName}
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleNextMonth}
                style={[styles.navArrowBtn, { backgroundColor: colors.surfaceSecondary }]}
              >
                <ChevronRight size={18} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Monthly In/Out Summary */}
            <Card variant="outlined" padding={spacing.lg} style={{ marginBottom: spacing.md, borderRadius: radius['2xl'] }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs }}>
                    Total Inflow
                  </Text>
                  <Text style={{ color: colors.income, fontSize: typography.sizes.xl, fontWeight: '800', marginTop: 2 }}>
                    +{formatMoney(monthlyData.totalIncome)}
                  </Text>
                </View>
                <View style={{ width: 1, height: 36, backgroundColor: colors.border }} />
                <View>
                  <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs }}>
                    Total Outflow
                  </Text>
                  <Text style={{ color: colors.expense, fontSize: typography.sizes.xl, fontWeight: '800', marginTop: 2 }}>
                    -{formatMoney(monthlyData.totalExpense)}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.netRemainingBox,
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
                    Net Remaining:
                  </Text>
                  <Text
                    style={{
                      color: monthlyData.netSavings >= 0 ? colors.income : colors.expense,
                      fontSize: typography.sizes.md,
                      fontWeight: '800',
                    }}
                  >
                    {formatMoney(monthlyData.netSavings)}
                  </Text>
                </View>
              </View>
            </Card>

            {/* Monthly Category Distribution */}
            <View style={{ marginTop: spacing.sm }}>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: colors.text,
                    fontSize: typography.sizes.md,
                    fontWeight: '700',
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
                    fontWeight: '800',
                  },
                ]}
              >
                Category Deep Dive ({formattedMonthName})
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs, marginTop: 2 }}>
                Detailed breakdown of spending categories
              </Text>
            </View>

            {monthlyData.categoryDistribution.map((cat) => (
              <Card
                key={cat.categoryId}
                variant="outlined"
                padding={spacing.lg}
                style={{ marginBottom: spacing.md, borderRadius: radius.xl }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View
                      style={[
                        styles.catDot,
                        { backgroundColor: cat.color, borderRadius: 4, width: 12, height: 12, marginRight: 8 },
                      ]}
                    />
                    <Text style={{ color: colors.text, fontSize: typography.sizes.sm, fontWeight: '700' }}>
                      {cat.categoryName}
                    </Text>
                  </View>
                  <Text style={{ color: colors.text, fontSize: typography.sizes.sm, fontWeight: '800' }}>
                    {formatMoney(cat.totalAmount)} ({cat.percentage}%)
                  </Text>
                </View>

                {cat.subcategories && cat.subcategories.length > 0 && (
                  <View style={{ marginTop: spacing.sm, paddingTop: spacing.xs, borderTopWidth: 1, borderTopColor: colors.borderLight }}>
                    {cat.subcategories.map((sub, sIdx) => (
                      <View key={sIdx} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 }}>
                        <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs }}>
                          {sub.name}
                        </Text>
                        <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs, fontWeight: '600' }}>
                          {formatMoney(sub.amount)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
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
  metricToggleContainer: {
    flexDirection: 'row',
    padding: 4,
    borderWidth: 1,
  },
  metricToggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricToggleText: {
    fontSize: 13,
  },
  subTabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  subTabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
    borderWidth: 1,
    marginHorizontal: 3,
  },
  totalBalanceHeader: {
    alignItems: 'center',
    marginVertical: 14,
  },
  forestAnalyticsCard: {
    padding: 20,
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  forestAmount: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginTop: 2,
  },
  trendArrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    letterSpacing: -0.2,
  },
  recurringCard: {},
  recurringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recIconBox: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBox: {},
  monthNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navArrowBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  netRemainingBox: {},
  catDot: {},
});
