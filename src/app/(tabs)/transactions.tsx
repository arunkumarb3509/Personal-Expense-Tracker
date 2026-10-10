import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useData } from '@/context/DataContext';
import { useCurrency } from '@/hooks/useCurrency';
import { useRouter } from 'expo-router';
import { TransactionItem } from '@/components/transactions/TransactionItem';
import { FilterModal, FilterOptions } from '@/components/transactions/FilterModal';
import { EmptyState } from '@/components/common/EmptyState';
import { Header } from '@/components/common/Header';
import { format, isToday, isYesterday, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, isWithinInterval } from 'date-fns';
import { Search, SlidersHorizontal, X, ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';

export default function TransactionsScreen() {
  const { colors, typography, radius, spacing } = useTheme();
  const { transactions, wallets } = useData();
  const { format: formatMoney } = useCurrency();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    type: 'all',
    categoryId: 'all',
    walletId: 'all',
    minAmount: '',
    maxAmount: '',
    timeRange: 'all',
  });

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // 1. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const descMatch = (tx.description || '').toLowerCase().includes(q);
        const catMatch = (tx.categoryName || '').toLowerCase().includes(q);
        const subMatch = (tx.subcategory || '').toLowerCase().includes(q);
        const personMatch = (tx.personName || '').toLowerCase().includes(q);
        const walletMatch = (tx.walletName || '').toLowerCase().includes(q);
        const amountMatch = tx.amount.toString().includes(q);

        if (!descMatch && !catMatch && !subMatch && !personMatch && !walletMatch && !amountMatch) {
          return false;
        }
      }

      // 2. Type filter
      if (filters.type && filters.type !== 'all' && tx.type !== filters.type) {
        return false;
      }

      // 3. Category filter
      if (filters.categoryId && filters.categoryId !== 'all' && tx.categoryId !== filters.categoryId) {
        return false;
      }

      // 4. Wallet filter
      if (
        filters.walletId &&
        filters.walletId !== 'all' &&
        tx.walletId !== filters.walletId &&
        tx.targetWalletId !== filters.walletId
      ) {
        return false;
      }

      // 5. Min/Max Amount
      if (filters.minAmount && tx.amount < Number(filters.minAmount)) {
        return false;
      }
      if (filters.maxAmount && tx.amount > Number(filters.maxAmount)) {
        return false;
      }

      // 6. Time Range
      if (filters.timeRange && filters.timeRange !== 'all' && tx.date) {
        try {
          const txDate = parseISO(tx.date);
          const now = new Date();
          if (filters.timeRange === 'this_week') {
            const wStart = startOfWeek(now, { weekStartsOn: 1 });
            const wEnd = endOfWeek(now, { weekStartsOn: 1 });
            if (!isWithinInterval(txDate, { start: wStart, end: wEnd })) return false;
          } else if (filters.timeRange === 'this_month') {
            const mStart = startOfMonth(now);
            const mEnd = endOfMonth(now);
            if (!isWithinInterval(txDate, { start: mStart, end: mEnd })) return false;
          } else if (filters.timeRange === 'last_month') {
            const prev = subMonths(now, 1);
            const pStart = startOfMonth(prev);
            const pEnd = endOfMonth(prev);
            if (!isWithinInterval(txDate, { start: pStart, end: pEnd })) return false;
          }
        } catch {}
      }

      return true;
    });
  }, [transactions, searchQuery, filters]);

  // Group transactions by date header
  const groupedData = useMemo(() => {
    const groups: { dateHeader: string; rawDate: string; items: typeof transactions }[] = [];
    const dateMap = new Map<string, typeof transactions>();

    for (const tx of filteredTransactions) {
      const d = tx.date || 'Unknown Date';
      if (!dateMap.has(d)) {
        dateMap.set(d, []);
      }
      dateMap.get(d)!.push(tx);
    }

    dateMap.forEach((items, dateStr) => {
      let headerText = dateStr;
      try {
        const parsed = parseISO(dateStr);
        if (isToday(parsed)) {
          headerText = 'TODAY';
        } else if (isYesterday(parsed)) {
          headerText = 'YESTERDAY';
        } else {
          headerText = format(parsed, 'EEEE, d MMMM yyyy').toUpperCase();
        }
      } catch {}

      groups.push({
        dateHeader: headerText,
        rawDate: dateStr,
        items,
      });
    });

    return groups;
  }, [filteredTransactions]);

  // Summary of filtered items
  const { totalExpense, totalIncome } = useMemo(() => {
    let exp = 0;
    let inc = 0;
    for (const tx of filteredTransactions) {
      if (tx.type === 'expense' || tx.type === 'lend') exp += tx.amount;
      if (tx.type === 'income' || tx.type === 'repayment_received') inc += tx.amount;
    }
    return { totalExpense: exp, totalIncome: inc };
  }, [filteredTransactions]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.type && filters.type !== 'all') count++;
    if (filters.categoryId && filters.categoryId !== 'all') count++;
    if (filters.walletId && filters.walletId !== 'all') count++;
    if (filters.timeRange && filters.timeRange !== 'all') count++;
    if (filters.minAmount || filters.maxAmount) count++;
    return count;
  }, [filters]);

  const handleTransactionPress = (tx: any) => {
    router.push({
      pathname: '/edit-transaction',
      params: { id: tx.id },
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      {/* Header */}
      <Header
        title="Transactions"
        subtitle={`${filteredTransactions.length} records`}
        rightAction={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setFilterModalVisible(true)}
            style={[
              styles.filterIconBtn,
              {
                backgroundColor: activeFiltersCount > 0 ? colors.primaryLight : colors.surfaceSecondary,
                borderColor: activeFiltersCount > 0 ? colors.primary : colors.border,
              },
            ]}
          >
            <SlidersHorizontal
              size={18}
              color={activeFiltersCount > 0 ? colors.primary : colors.text}
            />
            {activeFiltersCount > 0 && (
              <View style={[styles.filterBadge, { backgroundColor: colors.primary }]}>
                <Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold' }}>
                  {activeFiltersCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        }
      />

      {/* Search Input Bar */}
      <View style={[styles.searchContainer, { paddingHorizontal: spacing.lg, marginBottom: spacing.sm }]}>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.surfaceSecondary,
              borderColor: colors.border,
              borderRadius: radius.xl,
            },
          ]}
        >
          <Search size={18} color={colors.textTertiary} style={{ marginRight: 8 }} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search description, category, person, amount..."
            placeholderTextColor={colors.textTertiary}
            style={[styles.searchInput, { color: colors.text, fontSize: typography.sizes.sm }]}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Filtered Totals Pill */}
      <View style={[styles.summaryPillsRow, { paddingHorizontal: spacing.lg, marginBottom: spacing.md }]}>
        <View
          style={[
            styles.summaryPill,
            {
              backgroundColor: colors.expenseLight,
              borderRadius: radius.lg,
            },
          ]}
        >
          <ArrowUpRight size={14} color={colors.expense} style={{ marginRight: 4 }} />
          <Text style={{ color: colors.expense, fontSize: typography.sizes.xs, fontWeight: '700' }}>
            Expense: {formatMoney(totalExpense)}
          </Text>
        </View>

        <View
          style={[
            styles.summaryPill,
            {
              backgroundColor: colors.incomeLight,
              borderRadius: radius.lg,
              marginLeft: spacing.sm,
            },
          ]}
        >
          <ArrowDownLeft size={14} color={colors.income} style={{ marginRight: 4 }} />
          <Text style={{ color: colors.income, fontSize: typography.sizes.xs, fontWeight: '700' }}>
            Income: {formatMoney(totalIncome)}
          </Text>
        </View>
      </View>

      {/* Transaction List grouped by Date */}
      {groupedData.length > 0 ? (
        <FlatList
          data={groupedData}
          keyExtractor={(group) => group.rawDate}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
          renderItem={({ item: group }) => (
            <View style={{ marginBottom: spacing.md }}>
              {/* Date Group Header */}
              <View
                style={[
                  styles.dateHeaderRow,
                  {
                    paddingHorizontal: spacing.lg,
                    paddingVertical: 6,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.dateHeaderText,
                    {
                      color: colors.textSecondary,
                      fontSize: typography.sizes.xs,
                      fontWeight: typography.weights.bold,
                    },
                  ]}
                >
                  {group.dateHeader}
                </Text>
              </View>

              {/* Transactions in Date */}
              <View
                style={[
                  styles.cardGroup,
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
                {group.items.map((tx) => (
                  <TransactionItem
                    key={tx.id}
                    transaction={tx}
                    onPress={handleTransactionPress}
                  />
                ))}
              </View>
            </View>
          )}
        />
      ) : (
        <EmptyState
          type={searchQuery || activeFiltersCount > 0 ? 'search' : 'transactions'}
          title={searchQuery || activeFiltersCount > 0 ? 'No matching transactions' : 'No transactions recorded'}
          description={
            searchQuery || activeFiltersCount > 0
              ? 'Try changing or resetting your search and filter criteria.'
              : 'Add your first transaction by tapping the + button.'
          }
          actionTitle={searchQuery || activeFiltersCount > 0 ? 'Reset Filters' : 'Add Transaction'}
          onActionPress={
            searchQuery || activeFiltersCount > 0
              ? () => {
                  setSearchQuery('');
                  setFilters({ type: 'all', categoryId: 'all', walletId: 'all' });
                }
              : () => router.push('/add-transaction')
          }
        />
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        wallets={wallets}
        currentFilters={filters}
        onApply={(newFilters) => setFilters(newFilters)}
        onReset={() =>
          setFilters({
            type: 'all',
            categoryId: 'all',
            walletId: 'all',
            minAmount: '',
            maxAmount: '',
            timeRange: 'all',
          })
        }
        onClose={() => setFilterModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {},
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 0,
  },
  summaryPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dateHeaderRow: {},
  dateHeaderText: {
    letterSpacing: 0.5,
  },
  cardGroup: {},
});
