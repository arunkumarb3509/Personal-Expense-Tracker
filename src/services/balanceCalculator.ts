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
 * Calculates net worth, receivables, payables, and total liquid wallet balance
 */
export function calculateFinancialSummary(
  wallets: Wallet[],
  people: Person[]
): {
  totalWalletBalance: number;
  totalReceivable: number;
  totalPayable: number;
  netWorth: number;
} {
  const totalWalletBalance = wallets.reduce((sum, w) => sum + (w.currentBalance || 0), 0);
  const totalReceivable = people.reduce((sum, p) => sum + Math.max(0, p.remainingReceivable || 0), 0);
  const totalPayable = people.reduce((sum, p) => sum + Math.max(0, p.remainingPayable || 0), 0);
  const netWorth = totalWalletBalance + totalReceivable - totalPayable;

  return {
    totalWalletBalance,
    totalReceivable,
    totalPayable,
    netWorth,
  };
}
