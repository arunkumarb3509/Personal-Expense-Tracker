import { WalletType } from '@/types/wallet';

export interface WalletTypeInfo {
  type: WalletType;
  label: string;
  icon: string;
  color: string;
  defaultName: string;
  description: string;
}

export const WALLET_TYPES: Record<WalletType, WalletTypeInfo> = {
  upi: {
    type: 'upi',
    label: 'UPI / GPay / PhonePe',
    icon: 'Smartphone',
    color: '#00BAF2', // Google Pay / UPI Blue
    defaultName: 'GPay',
    description: 'UPI apps, Google Pay, PhonePe, Paytm',
  },
  bank: {
    type: 'bank',
    label: 'Bank Account',
    icon: 'Building2',
    color: '#2563EB', // Navy Blue
    defaultName: 'Main Bank Account',
    description: 'Savings, Checking, Salary Account',
  },
  cash: {
    type: 'cash',
    label: 'Cash in Hand',
    icon: 'Banknote',
    color: '#10B981', // Emerald Green
    defaultName: 'Cash',
    description: 'Physical cash in wallet or drawer',
  },
  credit_card: {
    type: 'credit_card',
    label: 'Credit Card',
    icon: 'CreditCard',
    color: '#8B5CF6', // Purple
    defaultName: 'Credit Card',
    description: 'Visa, MasterCard, Amex',
  },
  savings: {
    type: 'savings',
    label: 'Savings / Deposit',
    icon: 'PiggyBank',
    color: '#F59E0B', // Amber
    defaultName: 'Emergency Fund',
    description: 'Fixed deposits, savings vault',
  },
  other: {
    type: 'other',
    label: 'Other Account',
    icon: 'Wallet',
    color: '#64748B', // Slate
    defaultName: 'Other Wallet',
    description: 'Custom account or digital wallet',
  },
};

export const DEFAULT_WALLETS = [
  {
    name: 'GPay',
    type: 'upi' as WalletType,
    openingBalance: 0,
    currentBalance: 0,
    color: '#00BAF2',
    icon: 'Smartphone',
    isDefault: true,
    isPrimaryGPay: true,
  },
  {
    name: 'Bank',
    type: 'bank' as WalletType,
    openingBalance: 0,
    currentBalance: 0,
    color: '#2563EB',
    icon: 'Building2',
    isDefault: false,
  },
  {
    name: 'Cash',
    type: 'cash' as WalletType,
    openingBalance: 0,
    currentBalance: 0,
    color: '#10B981',
    icon: 'Banknote',
    isDefault: false,
  },
  {
    name: 'Savings Vault',
    type: 'savings' as WalletType,
    openingBalance: 0,
    currentBalance: 0,
    color: '#F59E0B',
    icon: 'PiggyBank',
    isDefault: false,
  },
];
