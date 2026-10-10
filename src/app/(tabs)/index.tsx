import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { Avatar } from '@/components/common/Avatar';
import { BalanceCard } from '@/components/dashboard/BalanceCard';
import { WalletCarousel } from '@/components/dashboard/WalletCarousel';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { InsightCard } from '@/components/dashboard/InsightCard';
import { TransactionItem } from '@/components/transactions/TransactionItem';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingState } from '@/components/common/LoadingState';
import { generateDashboardInsights } from '@/services/analyticsCalculator';
import { Bell, ChevronRight, Sparkles } from 'lucide-react-native';

export default function HomeDashboardScreen() {
  const { colors, typography, radius, spacing } = useTheme();
  const { user } = useAuth();
  const {
    wallets,
    transactions,
    totalWalletBalance,
    totalReceivable,
    totalPayable,
    netWorth,
    unreadNotificationCount,
    isLoadingData,
  } = useData();
  const { currencySymbol } = useCurrency();
  const router = useRouter();

  // Dynamic Greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Friend';
  const todayFormatted = format(new Date(), 'EEEE, d MMMM yyyy');

  // Generate dynamic insights
  const insights = useMemo(() => {
    return generateDashboardInsights(transactions, totalReceivable, currencySymbol);
  }, [transactions, totalReceivable, currencySymbol]);

  // Recent 5 transactions
  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 5);
  }, [transactions]);

  const handleTransactionPress = (tx: any) => {
    router.push({
      pathname: '/edit-transaction',
      params: { id: tx.id },
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isLoadingData} onRefresh={() => {}} tintColor={colors.primary} />}
      >
        {/* Top Header */}
        <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingVertical: spacing.md }]}>
          <View style={styles.headerLeft}>
            <Avatar name={displayName} photoUrl={user?.photoURL} size={46} />
            <View style={{ marginLeft: 12 }}>
              <Text
                style={[
                  styles.greetingText,
                  {
                    color: colors.textSecondary,
                    fontSize: typography.sizes.xs,
                    fontWeight: typography.weights.medium,
                  },
                ]}
              >
                {greeting},
              </Text>
              <Text
                style={[
                  styles.nameText,
                  {
                    color: colors.text,
                    fontSize: typography.sizes.lg,
                    fontWeight: typography.weights.bold,
                  },
                ]}
                numberOfLines={1}
              >
                {displayName}
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/notifications')}
              style={[
                styles.notificationBtn,
                {
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.border,
                },
              ]}
            >
              <Bell size={20} color={colors.text} />
              {unreadNotificationCount > 0 && (
                <View style={[styles.badgeDot, { backgroundColor: colors.error }]}>
                  <Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold' }}>
                    {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Display */}
        <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.xs }}>
          <Text style={{ color: colors.textTertiary, fontSize: typography.sizes.xs, fontWeight: '500' }}>
            {todayFormatted}
          </Text>
        </View>

        {/* Balance Card with Net Worth */}
        <View style={{ paddingHorizontal: spacing.lg }}>
          <BalanceCard
            totalBalance={totalWalletBalance}
            totalReceivable={totalReceivable}
            totalPayable={totalPayable}
            netWorth={netWorth}
          />
        </View>

        {/* Quick Actions (Add Expense, Income, Transfer, Lending, Daily View) */}
        <QuickActions />

        {/* Wallets Carousel (GPay, Bank, Cash, etc.) */}
        <WalletCarousel wallets={wallets} />

        {/* Smart Financial Insights (if available) */}
        {insights.length > 0 && (
          <View style={{ marginTop: spacing.sm }}>
            <View style={[styles.sectionHeader, { paddingHorizontal: spacing.lg, marginBottom: 8 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Sparkles size={16} color={colors.primary} style={{ marginRight: 6 }} />
                <Text
                  style={[
                    styles.sectionTitle,
                    {
                      color: colors.text,
                      fontSize: typography.sizes.md,
                      fontWeight: typography.weights.bold,
                    },
                  ]}
                >
                  Smart Insights
                </Text>
              </View>
            </View>
            {insights.slice(0, 2).map((item) => (
              <InsightCard key={item.id} insight={item} />
            ))}
          </View>
        )}

        {/* Recent Transactions */}
        <View style={{ marginTop: spacing.md, paddingBottom: spacing['2xl'] }}>
          <View style={[styles.sectionHeader, { paddingHorizontal: spacing.lg, marginBottom: 8 }]}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: colors.text,
                  fontSize: typography.sizes.md,
                  fontWeight: typography.weights.bold,
                },
              ]}
            >
              Recent Transactions
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/(tabs)/transactions')}
              style={{ flexDirection: 'row', alignItems: 'center' }}
            >
              <Text
                style={{
                  color: colors.primary,
                  fontSize: typography.sizes.xs,
                  fontWeight: typography.weights.semibold,
                  marginRight: 2,
                }}
              >
                View All
              </Text>
              <ChevronRight size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {recentTransactions.length > 0 ? (
            <View
              style={[
                styles.transactionListCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: radius.xl,
                  marginHorizontal: spacing.lg,
                  borderWidth: 1,
                  overflow: 'hidden',
                },
              ]}
            >
              {recentTransactions.map((tx) => (
                <TransactionItem
                  key={tx.id}
                  transaction={tx}
                  showDate
                  onPress={handleTransactionPress}
                />
              ))}
            </View>
          ) : (
            <EmptyState
              type="transactions"
              title="No transactions yet"
              description="Tap + to add your first expense or income and start tracking."
              actionTitle="Add Transaction"
              onActionPress={() => router.push('/add-transaction')}
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
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  greetingText: {
    letterSpacing: 0.1,
  },
  nameText: {
    letterSpacing: -0.3,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    letterSpacing: -0.2,
  },
  transactionListCard: {},
});
