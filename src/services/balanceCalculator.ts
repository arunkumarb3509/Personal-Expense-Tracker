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
 * Computes the exact balance of an account from its opening balance + all linked transactions.
 * Prevents desyncs and double-counting:
 * opening balance + (income + repayments received + incoming transfers) - (expenses + lending + repayments given + outgoing transfers)
 */
export function calculateAccountBalance(
  wallet: Wallet,
  transactions: Transaction[]
): number {
  let balance = Number(wallet.openingBalance) || 0;
  const wId = wallet.id;

  for (const tx of transactions) {
    const isSource = tx.walletId === wId || tx.accountId === wId;
    const isTarget = (tx.targetWalletId === wId || tx.targetAccountId === wId) && tx.type === 'transfer';

    if (isSource) {
      const amt = Number(tx.amount) || 0;
      switch (tx.type) {
        case 'expense':
        case 'lend':
        case 'repayment_given':
        case 'transfer':
          balance -= amt;
          break;
        case 'income':
        case 'borrow':
        case 'repayment_received':
          balance += amt;
          break;
      }
    } else if (isTarget) {
      // Incoming transfer from another account
      balance += Number(tx.amount) || 0;
    }
  }

  return Number(balance.toFixed(2));
}

/**
 * Computes exact balances for all wallets based on transactions history.
 */
export function calculateAllAccountBalances(
  wallets: Wallet[],
  transactions: Transaction[]
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const w of wallets) {
    result[w.id] = calculateAccountBalance(w, transactions);
  }
  return result;
}

/**
 * Financial Summary Breakdown Structure
 */
export interface FinancialSummary {
  activeWallet: Wallet | null;
  activeBalance: number;
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
  people: Person[],
  transactions?: Transaction[],
  activeWalletId?: string | null
): FinancialSummary {
  // If transactions are provided, compute live exact balance per wallet; otherwise use currentBalance
  const balancesMap = transactions
    ? calculateAllAccountBalances(wallets, transactions)
    : wallets.reduce((acc, w) => {
        acc[w.id] = w.currentBalance || 0;
        return acc;
      }, {} as Record<string, number>);

  // Identify Primary GPay wallet
  const gpayWallet =
    wallets.find((w) => w.isPrimaryGPay) ||
    wallets.find((w) => w.type === 'upi' && (w.name.toLowerCase().includes('gpay') || w.name.toLowerCase().includes('google'))) ||
    wallets.find((w) => w.type === 'upi') ||
    wallets.find((w) => w.isDefault) ||
    wallets[0] ||
    null;

  const cashWallet = wallets.find((w) => w.type === 'cash') || null;

  // Identify active wallet for dashboard display
  let activeWallet: Wallet | null = null;
  if (activeWalletId && activeWalletId !== 'all') {
    activeWallet = wallets.find((w) => w.id === activeWalletId) || null;
  }
  if (!activeWallet) {
    // Default to user's default wallet, or GPay, or first wallet
    activeWallet = wallets.find((w) => w.isDefault) || gpayWallet || wallets[0] || null;
  }

  const gpayBalance = gpayWallet ? (balancesMap[gpayWallet.id] ?? gpayWallet.currentBalance ?? 0) : 0;
  const cashBalance = cashWallet ? (balancesMap[cashWallet.id] ?? cashWallet.currentBalance ?? 0) : 0;

  const savingsBalance = wallets
    .filter((w) => w.type === 'savings')
    .reduce((sum, w) => sum + (balancesMap[w.id] ?? w.currentBalance ?? 0), 0);

  const totalWalletBalance = wallets.reduce(
    (sum, w) => sum + (balancesMap[w.id] ?? w.currentBalance ?? 0),
    0
  );

  const totalLiquidBalance = wallets
    .filter((w) => w.type !== 'savings')
    .reduce((sum, w) => sum + (balancesMap[w.id] ?? w.currentBalance ?? 0), 0);

  const activeBalance = activeWalletId === 'all'
    ? totalLiquidBalance
    : activeWallet
    ? (balancesMap[activeWallet.id] ?? activeWallet.currentBalance ?? 0)
    : totalLiquidBalance;

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
    activeWallet,
    activeBalance,
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

