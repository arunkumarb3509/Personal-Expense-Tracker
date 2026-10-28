export type TransactionType =
  | 'expense'
  | 'income'
  | 'transfer'
  | 'lend'
  | 'borrow'
  | 'repayment_received'
  | 'repayment_given';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income';
  subcategories?: string[];
  isCustom?: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  categoryName: string;
  subcategory?: string;
  walletId: string;
  accountId?: string;
  walletName?: string;
  accountName?: string;
  targetWalletId?: string; // For transfers
  targetAccountId?: string;
  targetWalletName?: string;
  targetAccountName?: string;
  transferId?: string;
  personId?: string; // For lending/borrowing
  personName?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  timestamp: number; // Unix epoch ms
  description: string;
  notes?: string;
  receiptUrl?: string;
  paymentStatus?: 'completed' | 'pending' | 'failed';
  recurringId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface TransactionFilter {
  searchQuery?: string;
  types?: TransactionType[];
  categoryIds?: string[];
  walletIds?: string[];
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  personId?: string;
}
