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
import { Header } from '@/components/common/Header';
import { DatePickerModal } from '@/components/common/DatePickerModal';
import { EmptyState } from '@/components/common/EmptyState';
import { getCategoryById } from '@/constants/categories';
import {
  format,
  addDays,
  subDays,
  isToday,
  parseISO,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Utensils,
  Car,
  ShoppingBag,
  Zap,
  Film,
  HeartPulse,
  GraduationCap,
  Briefcase,
  Users,
  Receipt,
  Plus,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function DailyExpenseViewScreen() {
  const { colors, typography, radius, spacing } = useTheme();
  const { transactions } = useData();
  const { format: formatMoney } = useCurrency();
  const router = useRouter();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const dateStr = format(currentDate, 'yyyy-MM-dd');
  const formattedHeaderDate = format(currentDate, 'EEEE, d MMMM yyyy');

  const handlePrevDay = () => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setCurrentDate(subDays(currentDate, 1));
  };

  const handleNextDay = () => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setCurrentDate(addDays(currentDate, 1));
  };

  const handleJumpToday = () => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setCurrentDate(new Date());
  };

  // Transactions for this day
  const dayExpenses = useMemo(() => {
    return transactions.filter(
      (tx) => tx.date === dateStr && (tx.type === 'expense' || tx.type === 'lend')
    );
  }, [transactions, dateStr]);

  const totalDaySpend = useMemo(() => {
    return dayExpenses.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  }, [dayExpenses]);

  // Group by category and subcategory breakdown
  const categoryGroups = useMemo(() => {
    const map = new Map<
      string,
      {
        categoryId: string;
        categoryName: string;
        color: string;
        icon: string;
        total: number;
        items: typeof dayExpenses;
      }
    >();

    for (const tx of dayExpenses) {
      const cat = getCategoryById(tx.categoryId);
      if (!map.has(tx.categoryId)) {
        map.set(tx.categoryId, {
          categoryId: tx.categoryId,
          categoryName: tx.categoryName || cat.name,
          color: cat.color || colors.primary,
          icon: cat.icon || 'Receipt',
          total: 0,
          items: [],
        });
      }
      const grp = map.get(tx.categoryId)!;
      grp.total += tx.amount;
      grp.items.push(tx);
    }

    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [dayExpenses, colors]);

  const getCategoryIcon = (iconName: string, iconColor: string) => {
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
      default:
        return <Receipt size={size} color={iconColor} />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Daily Expense View"
        showBack
        onBackPress={() => router.back()}
        rightAction={
          !isToday(currentDate) ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleJumpToday}
              style={[
                styles.todayBtn,
                { backgroundColor: colors.primaryLight, borderColor: colors.primary },
              ]}
            >
              <Text
                style={{
                  color: colors.primary,
                  fontSize: typography.sizes.xs,
                  fontWeight: typography.weights.bold,
                }}
              >
                Today
              </Text>
            </TouchableOpacity>
          ) : null
        }
      />

      {/* Date Navigation Bar */}
      <View
        style={[
          styles.dateNavBar,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            marginHorizontal: spacing.lg,
            borderRadius: radius.xl,
            padding: spacing.sm,
            marginTop: spacing.xs,
            borderWidth: 1,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handlePrevDay}
          style={[styles.arrowBtn, { backgroundColor: colors.surfaceSecondary }]}
        >
          <ChevronLeft size={20} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setShowDatePicker(true)}
          style={styles.centerDateBtn}
        >
          <Calendar size={16} color={colors.primary} style={{ marginRight: 6 }} />
          <Text
            style={[
              styles.headerDateText,
              {
                color: colors.text,
                fontSize: typography.sizes.sm,
                fontWeight: typography.weights.bold,
              },
            ]}
          >
            {isToday(currentDate) ? `Today, ${format(currentDate, 'd MMM')}` : formattedHeaderDate}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleNextDay}
          style={[styles.arrowBtn, { backgroundColor: colors.surfaceSecondary }]}
        >
          <ChevronRight size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Total Daily Spent Header Card */}
      <View
        style={[
          styles.totalCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: radius.xl,
            marginHorizontal: spacing.lg,
            marginVertical: spacing.md,
            padding: spacing.lg,
            borderWidth: 1,
          },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: colors.textSecondary, fontSize: typography.sizes.xs, fontWeight: '500' }}>
              Total Spent on this day
            </Text>
            <Text
              style={{
                color: totalDaySpend > 0 ? colors.expense : colors.text,
                fontSize: typography.sizes['3xl'],
                fontWeight: typography.weights.bold,
                marginTop: 2,
              }}
            >
              {formatMoney(totalDaySpend)}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/add-transaction')}
            style={[
              styles.quickAddBtn,
              {
                backgroundColor: colors.primary,
                borderRadius: radius.full,
                paddingHorizontal: spacing.md,
                paddingVertical: 8,
              },
            ]}
          >
            <Plus size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={{ color: '#FFFFFF', fontSize: typography.sizes.xs, fontWeight: '700' }}>
              Add
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 32 }}
      >
        {categoryGroups.length > 0 ? (
          categoryGroups.map((grp) => (
            <View
              key={grp.categoryId}
              style={[
                styles.categoryCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: radius.xl,
                  padding: spacing.md,
                  marginBottom: spacing.md,
                  borderWidth: 1,
                },
              ]}
            >
              {/* Category Header */}
              <View style={styles.catHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={[
                      styles.catIconBox,
                      {
                        backgroundColor: `${grp.color}20`,
                        borderRadius: radius.md,
                      },
                    ]}
                  >
                    {getCategoryIcon(grp.icon, grp.color)}
                  </View>
                  <Text
                    style={[
                      styles.catTitle,
                      {
                        color: colors.text,
                        fontSize: typography.sizes.sm,
                        fontWeight: typography.weights.bold,
                        marginLeft: 10,
                      },
                    ]}
                  >
                    {grp.categoryName}
                  </Text>
                </View>

                <Text
                  style={{
                    color: colors.text,
                    fontSize: typography.sizes.sm,
                    fontWeight: typography.weights.bold,
                  }}
                >
                  {formatMoney(grp.total)}
                </Text>
              </View>

              {/* Sub items */}
              <View
                style={[
                  styles.subItemsList,
                  {
                    borderTopColor: colors.borderLight,
                    borderTopWidth: 1,
                    marginTop: spacing.sm,
                    paddingTop: spacing.xs,
                  },
                ]}
              >
                {grp.items.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.7}
                    onPress={() => router.push({ pathname: '/edit-transaction', params: { id: item.id } })}
                    style={[styles.subItemRow, { paddingVertical: 6 }]}
                  >
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text
                        style={{
                          color: colors.text,
                          fontSize: typography.sizes.xs,
                          fontWeight: typography.weights.medium,
                        }}
                        numberOfLines={1}
                      >
                        {item.description || item.subcategory || grp.categoryName}
                      </Text>
                      {item.walletName && (
                        <Text style={{ color: colors.textTertiary, fontSize: typography.sizes.xxs, marginTop: 1 }}>
                          via {item.walletName}
                        </Text>
                      )}
                    </View>

                    <Text
                      style={{
                        color: colors.expense,
                        fontSize: typography.sizes.xs,
                        fontWeight: typography.weights.bold,
                      }}
                    >
                      {formatMoney(item.amount)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))
        ) : (
          <EmptyState
            type="expenses"
            title="No expenses recorded today"
            description={`No spending logged for ${isToday(currentDate) ? 'today' : format(currentDate, 'd MMMM yyyy')}.`}
            actionTitle="Add Expense"
            onActionPress={() => router.push('/add-transaction')}
          />
        )}
      </ScrollView>

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={showDatePicker}
        selectedDate={dateStr}
        onSelectDate={(newD) => setCurrentDate(parseISO(newD))}
        onClose={() => setShowDatePicker(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  todayBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  dateNavBar: {
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
  centerDateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  headerDateText: {},
  totalCard: {},
  quickAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryCard: {},
  catHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  catIconBox: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catTitle: {},
  subItemsList: {},
  subItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
