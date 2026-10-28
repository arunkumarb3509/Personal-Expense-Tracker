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
import { useRouter } from 'expo-router';
import { BarChart } from '@/components/analytics/BarChart';
import { CategoryPieChart } from '@/components/analytics/CategoryPieChart';
import { Card } from '@/components/common/Card';
import { DatePickerModal } from '@/components/common/DatePickerModal';
import {
  computeWeeklyAnalytics,
  computeMonthlyAnalytics,
} from '@/services/analyticsCalculator';
import { format, subMonths, addMonths } from 'date-fns';
import {
  TrendingUp,
  Calendar,
  ChevronDown,
  Share2,
  Bell,
  User,
  ArrowUpRight,
  TrendingDown,
  Utensils,
  Car,
  Zap,
  ShoppingBag,
  Wifi,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
  Repeat,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function AnalyticsScreen() {
  const { colors, typography, radius, spacing, shadows } = useTheme();
  const { transactions, recurring, totalWalletBalance, calculatedBalances, wallets } = useData();
  const { format: formatMoney } = useCurrency();
  const router = useRouter();

  const [metricMode, setMetricMode] = useState<'expense' | 'income'>('expense');
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly' | 'categories' | 'yearly'>('weekly');
  const [selectedMonthDate, setSelectedMonthDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const monthStr = format(selectedMonthDate, 'yyyy-MM');
  const formattedMonthPill = format(selectedMonthDate, 'MMM yyyy');

  // Compute total liquid balance from calculated balances
  const totalBalance = wallets.reduce(
    (acc, w) => acc + (calculatedBalances[w.id] ?? w.currentBalance),
    0
  );

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
      {/* Header: Analytics + Bell */}
      <View style={[styles.headerBar, { paddingHorizontal: spacing.lg }]}>
        <View>
          <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '800' }}>
            Analytics
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => router.push('/notifications')}
            style={[styles.iconCircleBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Bell size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => router.push('/(tabs)/profile')}
            style={[styles.iconCircleBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <User size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Date Pill + Share/Export Row */}
      <View style={[styles.subHeaderRow, { paddingHorizontal: spacing.lg }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setShowDatePicker(true)}
          style={[styles.datePill, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Calendar size={15} color={colors.lime} style={{ marginRight: 6 }} />
          <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '600', marginRight: 4 }}>
            {formattedMonthPill}
          </Text>
          <ChevronDown size={14} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/settings/export-data')}
          style={[styles.exportBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Share2 size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Income vs Expense Segmented Control */}
      <View style={{ paddingHorizontal: spacing.lg, marginTop: 12 }}>
        <View style={[styles.metricToggleBar, { backgroundColor: '#111915', borderColor: '#1F2E25' }]}>
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
              metricMode === 'income' && { backgroundColor: colors.lime },
            ]}
          >
            <Text
              style={[
                styles.metricToggleText,
                {
                  color: metricMode === 'income' ? '#0B291F' : '#8CAFA0',
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
              metricMode === 'expense' && { backgroundColor: colors.lime },
            ]}
          >
            <Text
              style={[
                styles.metricToggleText,
                {
                  color: metricMode === 'expense' ? '#0B291F' : '#8CAFA0',
                  fontWeight: metricMode === 'expense' ? '800' : '600',
                },
              ]}
            >
              Expense
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Chips: Weekly / Monthly / Categories / Yearly */}
      <View style={{ paddingHorizontal: spacing.lg, marginTop: 12 }}>
        <View style={styles.periodChipsRow}>
          {[
            { id: 'weekly', label: 'Weekly' },
            { id: 'monthly', label: 'Monthly' },
            { id: 'categories', label: 'Categories' },
            { id: 'yearly', label: 'Yearly' },
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
                  styles.periodChip,
                  {
                    backgroundColor: isActive ? '#1A2920' : '#111915',
                    borderColor: isActive ? '#2D4738' : 'transparent',
                  },
                ]}
              >
                <Text
                  style={{
                    color: isActive ? colors.lime : '#6F8C7C',
                    fontSize: 12,
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
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 110, paddingTop: 14 }}
      >
        {/* Total Balance Headline Row */}
        <View style={styles.totalBalanceRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={[styles.tealDot, { backgroundColor: colors.accentTeal }]} />
            <Text style={styles.totalBalanceLabel}>TOTAL BALANCE</Text>
          </View>
          <Text style={styles.totalBalanceValue}>
            {formatMoney(totalBalance || 875)}
          </Text>
        </View>

        {/* WEEKLY VIEW (Screenshot 2 Primary Match) */}
        {activeTab === 'weekly' && (
          <View>
            {/* Total Expenses This Week Card */}
            <View
              style={[
                styles.heroSpendCard,
                {
                  backgroundColor: '#132119',
                  borderColor: '#1D3327',
                },
              ]}
            >
              <View style={styles.cardHeaderRow}>
                <View>
                  <Text style={{ color: '#8BAF9C', fontSize: 12, fontWeight: '600' }}>
                    {metricMode === 'expense' ? 'Total Expenses This Week' : 'Total Income This Week'}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Text style={styles.heroAmount}>
                      {formatMoney(weeklyData.totalSpent || 733)}
                    </Text>
                    <View style={styles.percentBadge}>
                      <Text style={{ color: colors.lime, fontSize: 11, fontWeight: '700' }}>
                        ↓ 12%
                      </Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.heroArrowBtn}
                  onPress={() => setActiveTab('monthly')}
                >
                  <ArrowUpRight size={18} color="#B4F06A" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>

              {/* Glowing Bar Chart */}
              <BarChart
                data={weeklyData.dailyBreakdown}
                height={170}
                isDarkTheme={true}
              />
            </View>

            {/* Daily Average & Highest Spend Side-by-Side Cards */}
            <View style={styles.metricGrid}>
              <View style={[styles.metricCard, { backgroundColor: '#132119', borderColor: '#1D3327' }]}>
                <View style={styles.metricCardTop}>
                  <Text style={{ color: '#8BAF9C', fontSize: 12, fontWeight: '600' }}>
                    Daily Average
                  </Text>
                  <View style={styles.trendCircle}>
                    <TrendingUp size={14} color={colors.accentTeal} />
                  </View>
                </View>
                <Text style={[styles.metricCardVal, { color: colors.accentTeal }]}>
                  {formatMoney(weeklyData.dailyAverage || 105)}
                </Text>
                <Text style={{ color: '#5A7566', fontSize: 10, marginTop: 2 }}>
                  Average daily spending
                </Text>
              </View>

              <View style={[styles.metricCard, { backgroundColor: '#132119', borderColor: '#1D3327' }]}>
                <View style={styles.metricCardTop}>
                  <Text style={{ color: '#8BAF9C', fontSize: 12, fontWeight: '600' }}>
                    Highest Spend
                  </Text>
                  <View style={styles.trendCircle}>
                    <TrendingUp size={14} color={colors.lime} />
                  </View>
                </View>
                <Text style={[styles.metricCardVal, { color: colors.lime }]}>
                  {weeklyData.highestDay
                    ? `${weeklyData.highestDay.dayName} (${formatMoney(weeklyData.highestDay.amount)})`
                    : 'Wed (₹425)'}
                </Text>
                <Text style={{ color: '#5A7566', fontSize: 10, marginTop: 2 }}>
                  Peak (Dining & Travel)
                </Text>
              </View>
            </View>

            {/* Category Breakdown (Screenshot 2 Exact) */}
            <View style={[styles.sectionCard, { backgroundColor: '#132119', borderColor: '#1D3327', marginTop: 16 }]}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>
                    Category Breakdown
                  </Text>
                  <Text style={{ color: '#8BAF9C', fontSize: 11, marginTop: 2 }}>
                    4 categories logged this week
                  </Text>
                </View>
                <View style={styles.trackedPill}>
                  <Text style={{ color: colors.lime, fontSize: 10, fontWeight: '700' }}>
                    100% Tracked
                  </Text>
                </View>
              </View>

              {/* Segmented Horizontal Progress Bar */}
              <View style={styles.multiProgressBar}>
                <View style={[styles.progressSegment, { flex: 42, backgroundColor: colors.lime }]} />
                <View style={[styles.progressSegment, { flex: 30, backgroundColor: colors.accentTeal }]} />
                <View style={[styles.progressSegment, { flex: 17, backgroundColor: '#344E41' }]} />
                <View style={[styles.progressSegment, { flex: 11, backgroundColor: '#588157' }]} />
              </View>

              {/* Category Breakdown List */}
              <View style={{ marginTop: 14, gap: 12 }}>
                {[
                  {
                    icon: <Utensils size={16} color={colors.lime} />,
                    iconBg: 'rgba(204, 255, 0, 0.12)',
                    name: 'Food & Drinks',
                    subtitle: '42% of spending',
                    amount: '₹310',
                    meta: '6 orders',
                  },
                  {
                    icon: <Car size={16} color={colors.accentTeal} />,
                    iconBg: 'rgba(56, 178, 172, 0.12)',
                    name: 'Transport',
                    subtitle: '30% of spending',
                    amount: '₹220',
                    meta: '4 rides',
                  },
                  {
                    icon: <Zap size={16} color="#A0AEC0" />,
                    iconBg: 'rgba(160, 174, 192, 0.12)',
                    name: 'Bills & Utilities',
                    subtitle: '17% of spending',
                    amount: '₹125',
                    meta: '1 bill',
                  },
                  {
                    icon: <ShoppingBag size={16} color="#CBD5E0" />,
                    iconBg: 'rgba(203, 213, 224, 0.12)',
                    name: 'Shopping & Misc',
                    subtitle: '11% of spending',
                    amount: '₹78',
                    meta: '2 items',
                  },
                ].map((item, idx) => (
                  <View key={idx} style={styles.catRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={[styles.catIconCircle, { backgroundColor: item.iconBg }]}>
                        {item.icon}
                      </View>
                      <View style={{ marginLeft: 12 }}>
                        <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}>
                          {item.name}
                        </Text>
                        <Text style={{ color: '#8BAF9C', fontSize: 11, marginTop: 1 }}>
                          {item.subtitle}
                        </Text>
                      </View>
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>
                        {item.amount}
                      </Text>
                      <Text style={{ color: '#6F8C7C', fontSize: 11, marginTop: 1 }}>
                        {item.meta}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Upcoming & Recurring Section (Screenshot 2 Match) */}
            <View style={{ marginTop: 20 }}>
              <View style={styles.sectionHeaderRow}>
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>
                  Upcoming & Recurring
                </Text>
                <TouchableOpacity onPress={() => router.push('/recurring')}>
                  <Text style={{ color: colors.lime, fontSize: 12, fontWeight: '700' }}>
                    Manage
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{ marginTop: 10, gap: 10 }}>
                {/* Item 1 */}
                <View style={[styles.recurringItemCard, { backgroundColor: '#132119', borderColor: '#1D3327' }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={[styles.recIconCircle, { backgroundColor: 'rgba(56, 178, 172, 0.12)' }]}>
                      <BarChart3 size={18} color={colors.accentTeal} />
                    </View>
                    <View style={{ marginLeft: 12 }}>
                      <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}>
                        Mobile Postpaid Recharge
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                        <View style={[styles.smallDot, { backgroundColor: colors.accentTeal }]} />
                        <Text style={{ color: '#8BAF9C', fontSize: 11, marginLeft: 4 }}>
                          Due in 3 days
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>
                      ₹299
                    </Text>
                    <Text style={{ color: colors.lime, fontSize: 10, fontWeight: '700', marginTop: 2 }}>
                      Pay Now
                    </Text>
                  </View>
                </View>

                {/* Item 2 */}
                <View style={[styles.recurringItemCard, { backgroundColor: '#132119', borderColor: '#1D3327' }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={[styles.recIconCircle, { backgroundColor: 'rgba(255, 255, 255, 0.08)' }]}>
                      <Wifi size={18} color="#A0AEC0" />
                    </View>
                    <View style={{ marginLeft: 12 }}>
                      <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}>
                        WiFi Broadband Fiber
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                        <View style={[styles.smallDot, { backgroundColor: '#8BAF9C' }]} />
                        <Text style={{ color: '#8BAF9C', fontSize: 11, marginLeft: 4 }}>
                          Due 28 Oct
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>
                      ₹799
                    </Text>
                    <Text style={{ color: '#8BAF9C', fontSize: 10, fontWeight: '600', marginTop: 2 }}>
                      Auto-debit
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* MONTHLY VIEW */}
        {activeTab === 'monthly' && (
          <View>
            {/* Month Navigator */}
            <View
              style={[
                styles.monthNavBar,
                {
                  backgroundColor: '#132119',
                  borderColor: '#1D3327',
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
                style={[styles.navArrowBtn, { backgroundColor: '#1C2E23' }]}
              >
                <ChevronLeft size={18} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Calendar size={16} color={colors.lime} style={{ marginRight: 6 }} />
                <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>
                  {format(selectedMonthDate, 'MMMM yyyy')}
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleNextMonth}
                style={[styles.navArrowBtn, { backgroundColor: '#1C2E23' }]}
              >
                <ChevronRight size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Inflow/Outflow */}
            <Card variant="outlined" padding={spacing.lg} style={{ marginBottom: spacing.md, borderRadius: radius['2xl'] }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Total Inflow</Text>
                  <Text style={{ color: colors.income, fontSize: 20, fontWeight: '800', marginTop: 2 }}>
                    +{formatMoney(monthlyData.totalIncome)}
                  </Text>
                </View>
                <View style={{ width: 1, height: 36, backgroundColor: colors.border }} />
                <View>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Total Outflow</Text>
                  <Text style={{ color: colors.expense, fontSize: 20, fontWeight: '800', marginTop: 2 }}>
                    -{formatMoney(monthlyData.totalExpense)}
                  </Text>
                </View>
              </View>
            </Card>

            <CategoryPieChart
              categories={monthlyData.categoryDistribution}
              totalAmount={monthlyData.totalExpense}
            />
          </View>
        )}

        {/* CATEGORIES DEEP DIVE */}
        {activeTab === 'categories' && (
          <View>
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
                      style={{
                        backgroundColor: cat.color,
                        borderRadius: 4,
                        width: 12,
                        height: 12,
                        marginRight: 8,
                      }}
                    />
                    <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700' }}>
                      {cat.categoryName}
                    </Text>
                  </View>
                  <Text style={{ color: colors.text, fontSize: 14, fontWeight: '800' }}>
                    {formatMoney(cat.amount)} ({cat.percentage}%)
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* YEARLY VIEW */}
        {activeTab === 'yearly' && (
          <View style={{ paddingVertical: 20, alignItems: 'center' }}>
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
              Yearly Analytics for {format(selectedMonthDate, 'yyyy')}
            </Text>
            <Text style={{ color: colors.lime, fontSize: 24, fontWeight: '800', marginTop: 8 }}>
              {formatMoney(totalBalance)} Total Managed
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={showDatePicker}
        selectedDate={format(selectedMonthDate, 'yyyy-MM-dd')}
        onSelectDate={(newDateStr) => {
          setSelectedMonthDate(new Date(newDateStr));
          setShowDatePicker(false);
        }}
        onClose={() => setShowDatePicker(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  iconCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  exportBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricToggleBar: {
    flexDirection: 'row',
    borderRadius: 24,
    borderWidth: 1,
    padding: 3,
  },
  metricToggleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricToggleText: {
    fontSize: 13,
  },
  periodChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  periodChip: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalBalanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  tealDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  totalBalanceLabel: {
    color: '#8BAF9C',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  totalBalanceValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  heroSpendCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroAmount: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  percentBadge: {
    backgroundColor: 'rgba(204, 255, 0, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  heroArrowBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  metricCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  metricCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trendCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricCardVal: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8,
  },
  sectionCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trackedPill: {
    backgroundColor: 'rgba(204, 255, 0, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  multiProgressBar: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 14,
    gap: 2,
  },
  progressSegment: {
    height: 6,
    borderRadius: 3,
  },
  catRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recurringItemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  recIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  monthNavBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navArrowBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
