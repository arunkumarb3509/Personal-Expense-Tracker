import { Transaction, TransactionType } from '@/types/transaction';
import { Wallet } from '@/types/wallet';
import { Person } from '@/types/lending';

export interface BalanceDeltas {
  walletDeltas: { [walletId: string]: number };
  personDeltas?: {
    personId: string;
    givenDelta?: number;
    receivedDelta?: number;
    borrowedDelta?: number;
    repaidDelta?: number;
  };
}

/**
 * Computes the effect a transaction has on wallet balances and person debts.
 */
export function calculateTransactionEffects(
  transaction: Pick<
    Transaction,
    'amount' | 'type' | 'walletId' | 'targetWalletId' | 'personId'
  >,
  isReverse: boolean = false
): BalanceDeltas {
  const multiplier = isReverse ? -1 : 1;
  const amount = transaction.amount * multiplier;
  const walletDeltas: { [walletId: string]: number } = {};

  const deltas: BalanceDeltas = {
    walletDeltas,
  };

  switch (transaction.type) {
    case 'expense':
      // Deducts from wallet
      walletDeltas[transaction.walletId] = -amount;
      break;

    case 'income':
      // Adds to wallet
      walletDeltas[transaction.walletId] = amount;
      break;

    case 'transfer':
      // Deducts from source, adds to target
      walletDeltas[transaction.walletId] = -amount;
      if (transaction.targetWalletId) {
        walletDeltas[transaction.targetWalletId] = amount;
      }
      break;

    case 'lend':
      // Money given out: wallet decreases, receivable increases
      walletDeltas[transaction.walletId] = -amount;
      if (transaction.personId) {
        deltas.personDeltas = {
          personId: transaction.personId,
          givenDelta: amount,
        };
      }
      break;

    case 'repayment_received':
      // Person repays money lent: wallet increases, receivable decreases (received increases)
      walletDeltas[transaction.walletId] = amount;
      if (transaction.personId) {
        deltas.personDeltas = {
          personId: transaction.personId,
          receivedDelta: amount,
        };
      }
      break;

    case 'borrow':
      // Money received from lender: wallet increases, payable increases
      walletDeltas[transaction.walletId] = amount;
      if (transaction.personId) {
        deltas.personDeltas = {
          personId: transaction.personId,
          borrowedDelta: amount,
        };
      }
      break;

    case 'repayment_given':
      // User repays money borrowed: wallet decreases, payable decreases (repaid increases)
      walletDeltas[transaction.walletId] = -amount;
      if (transaction.personId) {
        deltas.personDeltas = {
          personId: transaction.personId,
          repaidDelta: amount,
        };
      }
      break;
  }

  return deltas;
}

/**
 * Financial Summary Breakdown Structure
 *
 * DEFINITION OF FINANCIAL METRICS:
 * 1. GPay Balance: Balance held strictly in the primary Google Pay (UPI) wallet.
 * 2. Cash Balance: Physical cash in hand. Cash settlements never affect GPay!
 * 3. Savings Balance: Dedicated savings deposits/vaults. Moving money between GPay
 *    and Savings is recorded as a transfer (no double counting).
 * 4. Total Liquid Balance: Sum of GPay, Cash, and Bank accounts readily available for spending.
 * 5. Total Wallet Balance: Sum of all user wallets (Liquid + Savings).
 * 6. Total Receivable (Lent): Money given out to friends/colleagues that is owed back.
 *    Tracked as an asset. Repayments reduce this without counting as new income.
 * 7. Total Payable (Borrowed): Money borrowed that the user must repay.
 *    Tracked as a liability. Repayments reduce this without counting as new expense.
 * 8. Net Worth = Total Wallet Balance + Total Receivable - Total Payable.
 */
export interface FinancialSummary {
  gpayWallet: Wallet | null;
  gpayBalance: number;
  cashWallet: Wallet | null;
  cashBalance: number;
  savingsBalance: number;
  totalLiquidBalance: number;
  totalWalletBalance: number;
  totalReceivable: number;
  totalPayable: number;
  netWorth: number;
}

export function calculateFinancialSummary(
  wallets: Wallet[],
  people: Person[]
): FinancialSummary {
  // Identify Primary GPay wallet
  const gpayWallet =
    wallets.find((w) => w.isPrimaryGPay) ||
    wallets.find((w) => w.type === 'upi' && (w.name.toLowerCase().includes('gpay') || w.name.toLowerCase().includes('google'))) ||
    wallets.find((w) => w.type === 'upi') ||
    wallets.find((w) => w.isDefault) ||
    wallets[0] ||
    null;

  const cashWallet = wallets.find((w) => w.type === 'cash') || null;

  const gpayBalance = gpayWallet ? (gpayWallet.currentBalance || 0) : 0;
  const cashBalance = cashWallet ? (cashWallet.currentBalance || 0) : 0;

  const savingsBalance = wallets
    .filter((w) => w.type === 'savings')
    .reduce((sum, w) => sum + (w.currentBalance || 0), 0);

  const totalWalletBalance = wallets.reduce(
    (sum, w) => sum + (w.currentBalance || 0),
    0
  );

  const totalLiquidBalance = wallets
    .filter((w) => w.type !== 'savings')
    .reduce((sum, w) => sum + (w.currentBalance || 0), 0);

  const totalReceivable = people.reduce(
    (sum, p) => sum + Math.max(0, p.remainingReceivable || 0),
    0
  );

  const totalPayable = people.reduce(
    (sum, p) => sum + Math.max(0, p.remainingPayable || 0),
    0
  );

  const netWorth = totalWalletBalance + totalReceivable - totalPayable;

  return {
    gpayWallet,
    gpayBalance,
    cashWallet,
    cashBalance,
    savingsBalance,
    totalLiquidBalance,
    totalWalletBalance,
    totalReceivable,
    totalPayable,
    netWorth,
  };
}

/**
 * Calculates GPay-specific spending metrics for dashboard.
 */
export function calculateGPayMetrics(
  transactions: Transaction[],
  gpayWalletId: string | null,
  todayStr: string, // YYYY-MM-DD
  monthPrefix: string // YYYY-MM
): {
  todaySpending: number;
  monthlySpending: number;
  recentGPayTransactions: Transaction[];
} {
  if (!gpayWalletId) {
    return { todaySpending: 0, monthlySpending: 0, recentGPayTransactions: [] };
  }

  const gpayTransactions = transactions.filter(
    (tx) => tx.walletId === gpayWalletId || tx.targetWalletId === gpayWalletId
  );

  // Today's GPay expense spending
  const todaySpending = gpayTransactions
    .filter((tx) => tx.date === todayStr && tx.walletId === gpayWalletId && tx.type === 'expense')
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);

  // Current Month's GPay expense spending
  const monthlySpending = gpayTransactions
    .filter(
      (tx) =>
        tx.date.startsWith(monthPrefix) &&
        tx.walletId === gpayWalletId &&
        tx.type === 'expense'
    )
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);

  return {
    todaySpending,
    monthlySpending,
    recentGPayTransactions: gpayTransactions.slice(0, 10),
  };
}

