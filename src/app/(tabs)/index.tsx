import React, { useMemo, useState } from 'react';
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
import { QuickSettlementsRow } from '@/components/dashboard/QuickSettlementsRow';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { WalletCarousel } from '@/components/dashboard/WalletCarousel';
import { InsightCard } from '@/components/dashboard/InsightCard';
import { TransactionItem } from '@/components/transactions/TransactionItem';
import { EmptyState } from '@/components/common/EmptyState';
import { ReconcileGPayModal } from '@/components/dashboard/ReconcileGPayModal';
import { SetGPayBalanceModal } from '@/components/dashboard/SetGPayBalanceModal';
import { RecordSavingsModal } from '@/components/dashboard/RecordSavingsModal';
import { generateDashboardInsights } from '@/services/analyticsCalculator';
import { Bell, ChevronRight, Sparkles, Search } from 'lucide-react-native';

export default function HomeDashboardScreen() {
  const { colors, typography, radius, spacing } = useTheme();
  const { user } = useAuth();
  const {
    wallets,
    transactions,
    totalReceivable,
    unreadNotificationCount,
    isLoadingData,
  } = useData();
  const { currencySymbol } = useCurrency();
  const router = useRouter();

  // Modals state
  const [showReconcileModal, setShowReconcileModal] = useState(false);
  const [showStartingBalanceModal, setShowStartingBalanceModal] = useState(false);
  const [showSavingsModal, setShowSavingsModal] = useState(false);

  // Dynamic Greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Friend';
  const firstName = displayName.split(' ')[0] || displayName;

  // Generate dynamic insights
  const insights = useMemo(() => {
    return generateDashboardInsights(transactions, totalReceivable, currencySymbol);
  }, [transactions, totalReceivable, currencySymbol]);

  // Recent 6 transactions
  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 6);
  }, [transactions]);

  const handleTransactionPress = (tx: any) => {
    router.push({
      pathname: '/edit-transaction',
      params: { id: tx.id },
    });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingData}
            onRefresh={() => {}}
            tintColor={colors.primary}
          />
        }
      >
        {/* Top Header - Reference styling */}
        <View
          style={[
            styles.header,
            { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
          ]}
        >
          <View style={styles.headerLeft}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <Avatar name={displayName} photoUrl={user?.photoURL} size={48} />
            </TouchableOpacity>
            <View style={{ marginLeft: 12 }}>
              <Text
                style={[
                  styles.greetingTitle,
                  {
                    color: colors.text,
                    fontSize: typography.sizes.xl,
                    fontWeight: '800',
                    letterSpacing: -0.3,
                  },
                ]}
                numberOfLines={1}
              >
                Hello {firstName}!
              </Text>
              <Text
                style={[
                  styles.greetingSubtitle,
                  {
                    color: colors.textSecondary,
                    fontSize: typography.sizes.xs,
                    fontWeight: '500',
                  },
                ]}
              >
                Manage your budget and expenses.
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/(tabs)/transactions')}
              style={[
                styles.iconBtn,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  marginRight: 8,
                },
              ]}
            >
              <Search size={19} color={colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/notifications')}
              style={[
                styles.iconBtn,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Bell size={19} color={colors.text} />
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

        {/* Primary Wallet Balance Card */}
        <View style={{ paddingHorizontal: spacing.lg }}>
          <BalanceCard
            onAddExpense={() => router.push('/add-transaction?type=expense')}
            onAddIncome={() => router.push('/add-transaction?type=income')}
            onTransfer={() => router.push('/add-transaction?type=transfer')}
            onReconcile={() => router.push('/wallets')}
          />
        </View>

        {/* Wallets & Accounts Carousel */}
        <WalletCarousel wallets={wallets} />

        {/* Quick Transfer & Personal Settlements Bar */}
        <QuickSettlementsRow />

        {/* Smart Financial Insights (if available) */}
        {insights.length > 0 && (
          <View style={{ marginTop: spacing.xs }}>
            <View
              style={[
                styles.sectionHeader,
                { paddingHorizontal: spacing.lg, marginBottom: 8 },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Sparkles size={16} color={colors.primary} style={{ marginRight: 6 }} />
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
                  Smart Insights
                </Text>
              </View>
            </View>
            {insights.slice(0, 2).map((item) => (
              <InsightCard key={item.id} insight={item} />
            ))}
          </View>
        )}

        {/* Feature Shortcuts (Cash & Dues, Savings, Daily, Budgets, Wallets) */}
        <QuickActions onRecordSavings={() => setShowSavingsModal(true)} />

        {/* Recent Activity */}
        <View style={{ marginTop: spacing.sm, paddingBottom: spacing['4xl'] }}>
          <View
            style={[
              styles.sectionHeader,
              { paddingHorizontal: spacing.lg, marginBottom: 10 },
            ]}
          >
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
              Recent Activity
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
                  fontWeight: '600',
                  marginRight: 2,
                }}
              >
                See All
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
                  borderRadius: radius['2xl'],
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
              description="Tap + to record your first GPay expense or income."
              actionTitle="Add Transaction"
              onActionPress={() => router.push('/add-transaction')}
            />
          )}
        </View>
      </ScrollView>

      {/* Manual GPay Reconciliation Modal */}
      <ReconcileGPayModal
        visible={showReconcileModal}
        onClose={() => setShowReconcileModal(false)}
        onReviewTransactions={() => router.push('/(tabs)/transactions')}
      />

      {/* Set Verified Starting GPay Balance Modal */}
      <SetGPayBalanceModal
        visible={showStartingBalanceModal}
        onClose={() => setShowStartingBalanceModal(false)}
      />

      {/* Record Dedicated Savings Contribution Modal */}
      <RecordSavingsModal
        visible={showSavingsModal}
        onClose={() => setShowSavingsModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
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
  greetingTitle: {},
  greetingSubtitle: {
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: -2,
    right: -2,
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
