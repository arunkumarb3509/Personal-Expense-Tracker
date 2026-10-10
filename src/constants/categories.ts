import { Category } from '@/types/transaction';

export const EXPENSE_CATEGORIES: Category[] = [
  {
    id: 'food',
    name: 'Food & Dining',
    icon: 'Utensils',
    color: '#F97316', // Orange
    type: 'expense',
    subcategories: [
      'Tea/Coffee',
      'Breakfast',
      'Lunch',
      'Dinner',
      'Snacks',
      'Restaurant',
      'Groceries',
      'Other Food',
    ],
  },
  {
    id: 'travel',
    name: 'Travel & Commute',
    icon: 'Car',
    color: '#3B82F6', // Blue
    type: 'expense',
    subcategories: [
      'Bus',
      'Auto/Taxi',
      'Metro/Train',
      'Flight',
      'Fuel',
      'Parking',
      'Maintenance',
      'Other Travel',
    ],
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icon: 'ShoppingBag',
    color: '#EC4899', // Pink
    type: 'expense',
    subcategories: [
      'Clothing',
      'Electronics',
      'Home & Kitchen',
      'Personal Care',
      'Footwear',
      'Accessories',
      'Other Shopping',
    ],
  },
  {
    id: 'bills',
    name: 'Bills & Utilities',
    icon: 'Zap',
    color: '#EAB308', // Yellow
    type: 'expense',
    subcategories: [
      'Electricity',
      'Water',
      'Mobile/Recharge',
      'Internet/Wi-Fi',
      'Gas',
      'House Rent',
      'Maintenance',
      'Other Bills',
    ],
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: 'Film',
    color: '#8B5CF6', // Purple
    type: 'expense',
    subcategories: [
      'Movies',
      'Games',
      'Concerts/Events',
      'Outing',
      'Hobbies',
      'Other Entertainment',
    ],
  },
  {
    id: 'health',
    name: 'Health & Medical',
    icon: 'HeartPulse',
    color: '#EF4444', // Red
    type: 'expense',
    subcategories: [
      'Doctor Consultation',
      'Medicine',
      'Hospital',
      'Diagnostics/Tests',
      'Gym & Fitness',
      'Other Health',
    ],
  },
  {
    id: 'education',
    name: 'Education',
    icon: 'GraduationCap',
    color: '#10B981', // Emerald
    type: 'expense',
    subcategories: [
      'Books',
      'Courses',
      'Tuition/Fees',
      'Stationery',
      'Workshops',
      'Other Education',
    ],
  },
  {
    id: 'work',
    name: 'Work & Office',
    icon: 'Briefcase',
    color: '#6366F1', // Indigo
    type: 'expense',
    subcategories: [
      'Office Supplies',
      'Client Meetings',
      'Travel for Work',
      'Hardware/Tools',
      'Other Work',
    ],
  },
  {
    id: 'family',
    name: 'Family & Personal',
    icon: 'Users',
    color: '#14B8A6', // Teal
    type: 'expense',
    subcategories: [
      'Kids Expenses',
      'Parents Support',
      'Gifts',
      'Celebrations',
      'Home Care',
      'Other Family',
    ],
  },
  {
    id: 'subscriptions',
    name: 'Subscriptions',
    icon: 'Calendar',
    color: '#06B6D4', // Cyan
    type: 'expense',
    subcategories: [
      'Netflix / Prime / OTT',
      'Spotify / Music',
      'Cloud Storage',
      'Software & Apps',
      'Gym Membership',
      'News / Mag',
      'Other Subscriptions',
    ],
  },
  {
    id: 'other_expense',
    name: 'Other Expense',
    icon: 'MoreHorizontal',
    color: '#64748B', // Slate
    type: 'expense',
    subcategories: [
      'Charity/Donation',
      'Taxes & Fees',
      'Fines/Penalties',
      'Miscellaneous',
    ],
  },
];

export const INCOME_CATEGORIES: Category[] = [
  {
    id: 'salary',
    name: 'Salary',
    icon: 'Wallet',
    color: '#10B981', // Emerald
    type: 'income',
    subcategories: ['Monthly Salary', 'Advance Salary', 'Bonus', 'Overtime'],
  },
  {
    id: 'freelance',
    name: 'Freelance & Contract',
    icon: 'Laptop',
    color: '#3B82F6', // Blue
    type: 'income',
    subcategories: ['Project Payment', 'Consulting', 'Hourly Work'],
  },
  {
    id: 'business',
    name: 'Business',
    icon: 'TrendingUp',
    color: '#8B5CF6', // Purple
    type: 'income',
    subcategories: ['Sales Revenue', 'Client Invoice', 'Profits'],
  },
  {
    id: 'investment',
    name: 'Investments',
    icon: 'LineChart',
    color: '#F59E0B', // Amber
    type: 'income',
    subcategories: ['Dividends', 'Stock Returns', 'Mutual Funds', 'Interest'],
  },
  {
    id: 'gift',
    name: 'Gifts & Grants',
    icon: 'Gift',
    color: '#EC4899', // Pink
    type: 'income',
    subcategories: ['Cash Gift', 'Prize Money', 'Cashback', 'Rewards'],
  },
  {
    id: 'other_income',
    name: 'Other Income',
    icon: 'ArrowDownLeft',
    color: '#14B8A6', // Teal
    type: 'income',
    subcategories: ['Rental Income', 'Asset Sale', 'Refund', 'Miscellaneous'],
  },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export function getCategoryById(id: string): Category {
  return (
    ALL_CATEGORIES.find((c) => c.id === id) || {
      id: 'other',
      name: 'Other',
      icon: 'CircleDollarSign',
      color: '#64748B',
      type: 'expense',
    }
  );
}
