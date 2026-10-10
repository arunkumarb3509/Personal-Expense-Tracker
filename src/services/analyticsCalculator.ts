import { Transaction } from '@/types/transaction';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, startOfMonth, endOfMonth, subMonths, isWithinInterval, parseISO } from 'date-fns';

export interface DailySpendItem {
  dayName: string; // 'Mon', 'Tue', etc.
  dateStr: string; // 'YYYY-MM-DD'
  totalAmount: number;
}

export interface CategorySpendItem {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
  subcategories: { name: string; amount: number; percentage: number }[];
}

export interface WeeklyAnalyticsData {
  totalSpent: number;
  dailyAverage: number;
  highestDay: { dayName: string; amount: number; dateStr: string } | null;
  lowestDay: { dayName: string; amount: number; dateStr: string } | null;
  dailyBreakdown: DailySpendItem[];
  categoryDistribution: CategorySpendItem[];
}

export interface MonthlyAnalyticsData {
  month: string; // YYYY-MM
  monthName: string; // 'October 2026'
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number; // percentage
  dailyExpenses: DailySpendItem[];
  categoryDistribution: CategorySpendItem[];
  previousMonthExpense: number;
  expenseChangePercentage: number; // vs last month (+12%, -5%)
}

export interface SmartInsight {
  id: string;
  type: 'positive' | 'warning' | 'info' | 'neutral';
  title: string;
  message: string;
  icon: string;
}

/**
 * Computes weekly analytics for a given reference date
 */
export function computeWeeklyAnalytics(
  transactions: Transaction[],
  referenceDate: Date = new Date()
): WeeklyAnalyticsData {
  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 }); // Start Monday
  const weekEnd = endOfWeek(referenceDate, { weekStartsOn: 1 });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Filter only expenses within the week
  const weekExpenses = transactions.filter((tx) => {
    if (tx.type !== 'expense') return false;
    try {
      const txDate = parseISO(tx.date);
      return isWithinInterval(txDate, { start: weekStart, end: weekEnd });
    } catch {
      return false;
    }
  });

  // Daily Breakdown
  const dailyBreakdown: DailySpendItem[] = daysInWeek.map((day) => {
    const dayDateStr = format(day, 'yyyy-MM-dd');
    const dayName = format(day, 'EEE'); // Mon, Tue, etc.
    const dayTotal = weekExpenses
      .filter((tx) => tx.date === dayDateStr)
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);

    return {
      dayName,
      dateStr: dayDateStr,
      totalAmount: dayTotal,
    };
  });

  const totalSpent = dailyBreakdown.reduce((sum, d) => sum + d.totalAmount, 0);
  const dailyAverage = totalSpent > 0 ? Math.round(totalSpent / 7) : 0;

  // Highest and Lowest Days with spend
  const daysWithSpend = dailyBreakdown.filter((d) => d.totalAmount > 0);
  let highestDay: WeeklyAnalyticsData['highestDay'] = null;
  let lowestDay: WeeklyAnalyticsData['lowestDay'] = null;

  if (daysWithSpend.length > 0) {
    const sorted = [...daysWithSpend].sort((a, b) => b.totalAmount - a.totalAmount);
    highestDay = {
      dayName: sorted[0].dayName,
      amount: sorted[0].totalAmount,
      dateStr: sorted[0].dateStr,
    };
    lowestDay = {
      dayName: sorted[sorted.length - 1].dayName,
      amount: sorted[sorted.length - 1].totalAmount,
      dateStr: sorted[sorted.length - 1].dateStr,
    };
  }

  // Category Distribution
  const catMap = new Map<string, { categoryName: string; amount: number; subMap: Map<string, number> }>();
  for (const tx of weekExpenses) {
    const catId = tx.categoryId || 'other';
    const catName = tx.categoryName || 'Other';
    const subName = tx.subcategory || 'General';

    if (!catMap.has(catId)) {
      catMap.set(catId, { categoryName: catName, amount: 0, subMap: new Map() });
    }
    const catObj = catMap.get(catId)!;
    catObj.amount += tx.amount;
    catObj.subMap.set(subName, (catObj.subMap.get(subName) || 0) + tx.amount);
  }

  const categoryDistribution: CategorySpendItem[] = [];
  const palette = ['#F97316', '#3B82F6', '#EC4899', '#EAB308', '#8B5CF6', '#10B981', '#14B8A6', '#64748B'];
  let colorIdx = 0;

  catMap.forEach((val, key) => {
    const percentage = totalSpent > 0 ? Math.round((val.amount / totalSpent) * 100) : 0;
    const subcategories = Array.from(val.subMap.entries()).map(([name, amount]) => ({
      name,
      amount,
      percentage: val.amount > 0 ? Math.round((amount / val.amount) * 100) : 0,
    }));
    subcategories.sort((a, b) => b.amount - a.amount);

    categoryDistribution.push({
      categoryId: key,
      categoryName: val.categoryName,
      amount: val.amount,
      percentage,
      color: palette[colorIdx % palette.length],
      icon: 'PieChart',
      subcategories,
    });
    colorIdx++;
  });

  categoryDistribution.sort((a, b) => b.amount - a.amount);

  return {
    totalSpent,
    dailyAverage,
    highestDay,
    lowestDay,
    dailyBreakdown,
    categoryDistribution,
  };
}

/**
 * Computes monthly analytics for a given month (YYYY-MM)
 */
export function computeMonthlyAnalytics(
  transactions: Transaction[],
  monthStr: string // 'YYYY-MM'
): MonthlyAnalyticsData {
  let targetDate = new Date();
  try {
    const [y, m] = monthStr.split('-').map(Number);
    targetDate = new Date(y, m - 1, 1);
  } catch {
    targetDate = new Date();
  }

  const mStart = startOfMonth(targetDate);
  const mEnd = endOfMonth(targetDate);
  const daysInMonth = eachDayOfInterval({ start: mStart, end: mEnd });

  const prevMonthDate = subMonths(targetDate, 1);
  const prevMonthStart = startOfMonth(prevMonthDate);
  const prevMonthEnd = endOfMonth(prevMonthDate);

  // Month transactions
  let totalIncome = 0;
  let totalExpense = 0;
  const monthExpenses: Transaction[] = [];

  for (const tx of transactions) {
    if (!tx.date) continue;
    try {
      const txDate = parseISO(tx.date);
      if (isWithinInterval(txDate, { start: mStart, end: mEnd })) {
        if (tx.type === 'expense') {
          totalExpense += tx.amount;
          monthExpenses.push(tx);
        } else if (tx.type === 'income') {
          totalIncome += tx.amount;
        }
      }
    } catch {}
  }

  // Previous month expense calculation
  let previousMonthExpense = 0;
  for (const tx of transactions) {
    if (tx.type === 'expense' && tx.date) {
      try {
        const txDate = parseISO(tx.date);
        if (isWithinInterval(txDate, { start: prevMonthStart, end: prevMonthEnd })) {
          previousMonthExpense += tx.amount;
        }
      } catch {}
    }
  }

  // Percentage change
  let expenseChangePercentage = 0;
  if (previousMonthExpense > 0) {
    expenseChangePercentage = Math.round(
      ((totalExpense - previousMonthExpense) / previousMonthExpense) * 100
    );
  }

  // Daily expenses
  const dailyExpenses: DailySpendItem[] = daysInMonth.map((day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayName = format(day, 'd');
    const amount = monthExpenses
      .filter((tx) => tx.date === dateStr)
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);

    return {
      dayName,
      dateStr,
      totalAmount: amount,
    };
  });

  // Category breakdown
  const catMap = new Map<string, { categoryName: string; amount: number; subMap: Map<string, number> }>();
  for (const tx of monthExpenses) {
    const catId = tx.categoryId || 'other';
    const catName = tx.categoryName || 'Other';
    const subName = tx.subcategory || 'General';

    if (!catMap.has(catId)) {
      catMap.set(catId, { categoryName: catName, amount: 0, subMap: new Map() });
    }
    const catObj = catMap.get(catId)!;
    catObj.amount += tx.amount;
    catObj.subMap.set(subName, (catObj.subMap.get(subName) || 0) + tx.amount);
  }

  const palette = ['#F97316', '#3B82F6', '#EC4899', '#EAB308', '#8B5CF6', '#10B981', '#14B8A6', '#64748B'];
  let colorIdx = 0;
  const categoryDistribution: CategorySpendItem[] = [];

  catMap.forEach((val, key) => {
    const percentage = totalExpense > 0 ? Math.round((val.amount / totalExpense) * 100) : 0;
    const subcategories = Array.from(val.subMap.entries()).map(([name, amount]) => ({
      name,
      amount,
      percentage: val.amount > 0 ? Math.round((amount / val.amount) * 100) : 0,
    }));
    subcategories.sort((a, b) => b.amount - a.amount);

    categoryDistribution.push({
      categoryId: key,
      categoryName: val.categoryName,
      amount: val.amount,
      percentage,
      color: palette[colorIdx % palette.length],
      icon: 'PieChart',
      subcategories,
    });
    colorIdx++;
  });

  categoryDistribution.sort((a, b) => b.amount - a.amount);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((Math.max(0, netSavings) / totalIncome) * 100) : 0;

  return {
    month: monthStr,
    monthName: format(targetDate, 'MMMM yyyy'),
    totalIncome,
    totalExpense,
    netSavings,
    savingsRate,
    dailyExpenses,
    categoryDistribution,
    previousMonthExpense,
    expenseChangePercentage,
  };
}

/**
 * Generates smart, factual, helpful insights based on actual user data
 */
export function generateDashboardInsights(
  transactions: Transaction[],
  totalReceivable: number,
  currencySymbol: string = '₹'
): SmartInsight[] {
  const insights: SmartInsight[] = [];
  const currentMonthStr = format(new Date(), 'yyyy-MM');
  const monthly = computeMonthlyAnalytics(transactions, currentMonthStr);

  // 1. Highest spending category insight
  if (monthly.categoryDistribution.length > 0) {
    const topCat = monthly.categoryDistribution[0];
    insights.push({
      id: 'top_cat',
      type: 'info',
      title: `${topCat.categoryName} is your top expense`,
      message: `You spent ${currencySymbol}${topCat.amount.toLocaleString()} (${topCat.percentage}%) on ${topCat.categoryName} this month.`,
      icon: 'PieChart',
    });
  }

  // 2. Spending comparison vs last month
  if (monthly.previousMonthExpense > 0 && monthly.totalExpense > 0) {
    const diff = monthly.totalExpense - monthly.previousMonthExpense;
    if (diff > 0) {
      insights.push({
        id: 'diff_higher',
        type: 'warning',
        title: 'Spending trend',
        message: `Your spending is ${currencySymbol}${Math.abs(diff).toLocaleString()} (+${monthly.expenseChangePercentage}%) higher than last month.`,
        icon: 'TrendingUp',
      });
    } else if (diff < 0) {
      insights.push({
        id: 'diff_lower',
        type: 'positive',
        title: 'Great savings pace!',
        message: `Your spending is ${currencySymbol}${Math.abs(diff).toLocaleString()} lower than last month.`,
        icon: 'TrendingDown',
      });
    }
  }

  // 3. Pending receivable insight
  if (totalReceivable > 0) {
    insights.push({
      id: 'receivable_reminder',
      type: 'neutral',
      title: 'Money to receive',
      message: `You have ${currencySymbol}${totalReceivable.toLocaleString()} in pending receivables from money given.`,
      icon: 'HandCoins',
    });
  }

  // 4. Daily average
  const weekly = computeWeeklyAnalytics(transactions, new Date());
  if (weekly.dailyAverage > 0) {
    insights.push({
      id: 'daily_avg',
      type: 'info',
      title: 'Daily average expense',
      message: `Your average spending this week is ${currencySymbol}${weekly.dailyAverage.toLocaleString()} per day.`,
      icon: 'Activity',
    });
  }

  return insights;
}
