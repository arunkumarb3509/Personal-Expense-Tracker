export type WalletType = 'bank' | 'upi' | 'cash' | 'credit_card' | 'savings' | 'other';

export interface Wallet {
  id: string;
  userId: string;
  name: string;
  type: WalletType;
  openingBalance: number;
  currentBalance: number;
  currency: string;
  color?: string;
  icon?: string;
  accountNumberLast4?: string;
  isDefault?: boolean;
  createdAt: number;
  updatedAt: number;
}
