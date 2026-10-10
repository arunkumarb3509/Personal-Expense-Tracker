export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  categoryName: string;
  amount: number; // Monthly budget limit
  spent: number;  // Current month spent
  month: string;  // YYYY-MM
  alert80Sent?: boolean;
  alert100Sent?: boolean;
  createdAt: number;
  updatedAt: number;
}

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringTransaction {
  id: string;
  userId: string;
  name: string;
  amount: number;
  type: 'expense' | 'income';
  categoryId: string;
  categoryName: string;
  walletId: string;
  walletName?: string;
  frequency: RecurringFrequency;
  startDate: string;
  endDate?: string;
  lastProcessedDate?: string;
  nextDueDate: string;
  reminderEnabled: boolean;
  isActive: boolean;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export type NotificationType = 'budget_warning' | 'budget_exceeded' | 'debt_reminder' | 'recurring_due' | 'spending_insight' | 'system';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  relatedEntityId?: string;
  timestamp: number;
  createdAt: number;
}

export interface UserSettings {
  currency: string;
  themeMode: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  budgetAlerts: boolean;
  debtReminders: boolean;
  recurringReminders: boolean;
  biometricLock?: boolean;
}
