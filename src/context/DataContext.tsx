import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { Wallet, WalletType } from '@/types/wallet';
import { Transaction, TransactionType } from '@/types/transaction';
import { Person, DebtStatus } from '@/types/lending';
import { Budget, RecurringTransaction, AppNotification } from '@/types/app';
import {
  subscribeWallets,
  subscribeTransactions,
  subscribePeople,
  subscribeBudgets,
  subscribeRecurring,
  subscribeNotifications,
  addWallet as addWalletService,
  updateWallet as updateWalletService,
  deleteWallet as deleteWalletService,
  addTransaction as addTransactionService,
  updateTransaction as updateTransactionService,
  deleteTransaction as deleteTransactionService,
  addPerson as addPersonService,
  deletePerson as deletePersonService,
  setBudget as setBudgetService,
  deleteBudget as deleteBudgetService,
  addRecurringTransaction as addRecurringService,
  deleteRecurringTransaction as deleteRecurringService,
  markNotificationAsRead as markNotificationReadService,
  addAppNotification,
} from '@/services/firestoreService';
import { calculateFinancialSummary } from '@/services/balanceCalculator';
import { format } from 'date-fns';

interface DataContextType {
  wallets: Wallet[];
  transactions: Transaction[];
  people: Person[];
  budgets: Budget[];
  recurring: RecurringTransaction[];
  notifications: AppNotification[];
  unreadNotificationCount: number;
  isLoadingData: boolean;

  // Computed Financial Metrics
  totalWalletBalance: number;
  totalReceivable: number;
  totalPayable: number;
  netWorth: number;

  // Actions
  createTransaction: (data: {
    amount: number;
    type: TransactionType;
    categoryId: string;
    categoryName: string;
    subcategory?: string;
    walletId: string;
    walletName?: string;
    targetWalletId?: string;
    targetWalletName?: string;
    personId?: string;
    personName?: string;
    date: string;
    time?: string;
    description: string;
    notes?: string;
    receiptUrl?: string;
    recurringId?: string;
  }) => Promise<Transaction>;
  editTransaction: (oldTx: Transaction, updatedData: Partial<Transaction>) => Promise<Transaction>;
  removeTransaction: (tx: Transaction) => Promise<void>;

  createWallet: (data: {
    name: string;
    type: WalletType;
    openingBalance: number;
    currency: string;
    color?: string;
    icon?: string;
    accountNumberLast4?: string;
    isDefault?: boolean;
  }) => Promise<Wallet>;
  editWallet: (walletId: string, updates: Partial<Wallet>) => Promise<void>;
  removeWallet: (walletId: string) => Promise<void>;
  transfer: (
    fromWalletId: string,
    toWalletId: string,
    amount: number,
    date: string,
    description?: string,
    notes?: string
  ) => Promise<Transaction>;

  createPerson: (data: { name: string; phone?: string; email?: string; notes?: string }) => Promise<Person>;
  removePerson: (personId: string) => Promise<void>;
  recordLending: (
    personId: string,
    personName: string,
    walletId: string,
    amount: number,
    date: string,
    description?: string,
    notes?: string
  ) => Promise<Transaction>;
  recordBorrowing: (
    personId: string,
    personName: string,
    walletId: string,
    amount: number,
    date: string,
    description?: string,
    notes?: string
  ) => Promise<Transaction>;
  recordRepayment: (
    personId: string,
    personName: string,
    type: 'received' | 'given',
    walletId: string,
    amount: number,
    date: string,
    notes?: string
  ) => Promise<Transaction>;

  saveBudget: (categoryId: string, categoryName: string, amount: number, month?: string) => Promise<Budget>;
  removeBudget: (budgetId: string) => Promise<void>;

  createRecurringPayment: (
    data: Omit<RecurringTransaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => Promise<RecurringTransaction>;
  removeRecurringPayment: (id: string) => Promise<void>;

  markNotificationRead: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isEmailVerified } = useAuth();
  const uid = user?.uid;

  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  const currentMonthStr = format(new Date(), 'yyyy-MM');

  useEffect(() => {
    if (!isAuthenticated || !uid) {
      setWallets([]);
      setTransactions([]);
      setPeople([]);
      setBudgets([]);
      setRecurring([]);
      setNotifications([]);
      setIsLoadingData(false);
      return;
    }

    setIsLoadingData(true);

    const unsubWallets = subscribeWallets(
      uid,
      (w) => setWallets(w),
      (err) => console.warn('Wallets sub error:', err)
    );

    const unsubTransactions = subscribeTransactions(
      uid,
      (t) => {
        setTransactions(t);
        setIsLoadingData(false);
      },
      (err) => {
        console.warn('Transactions sub error:', err);
        setIsLoadingData(false);
      }
    );

    const unsubPeople = subscribePeople(
      uid,
      (p) => setPeople(p),
      (err) => console.warn('People sub error:', err)
    );

    const unsubBudgets = subscribeBudgets(
      uid,
      currentMonthStr,
      (b) => setBudgets(b),
      (err) => console.warn('Budgets sub error:', err)
    );

    const unsubRecurring = subscribeRecurring(
      uid,
      (r) => setRecurring(r),
      (err) => console.warn('Recurring sub error:', err)
    );

    const unsubNotifications = subscribeNotifications(
      uid,
      (n) => setNotifications(n),
      (err) => console.warn('Notifications sub error:', err)
    );

    return () => {
      unsubWallets();
      unsubTransactions();
      unsubPeople();
      unsubBudgets();
      unsubRecurring();
      unsubNotifications();
    };
  }, [isAuthenticated, uid, currentMonthStr]);

  // Compute Financial Summary
  const { totalWalletBalance, totalReceivable, totalPayable, netWorth } = useMemo(() => {
    return calculateFinancialSummary(wallets, people);
  }, [wallets, people]);

  const unreadNotificationCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  // Actions
  const createTransaction = async (data: any) => {
    if (!uid) throw new Error('User not authenticated');
    return await addTransactionService(uid, data);
  };

  const editTransaction = async (oldTx: Transaction, updatedData: Partial<Transaction>) => {
    if (!uid) throw new Error('User not authenticated');
    return await updateTransactionService(uid, oldTx, updatedData);
  };

  const removeTransaction = async (tx: Transaction) => {
    if (!uid) throw new Error('User not authenticated');
    await deleteTransactionService(uid, tx);
  };

  const createWallet = async (data: any) => {
    if (!uid) throw new Error('User not authenticated');
    return await addWalletService(uid, data);
  };

  const editWallet = async (walletId: string, updates: Partial<Wallet>) => {
    if (!uid) throw new Error('User not authenticated');
    await updateWalletService(uid, walletId, updates);
  };

  const removeWallet = async (walletId: string) => {
    if (!uid) throw new Error('User not authenticated');
    await deleteWalletService(uid, walletId);
  };

  const transfer = async (
    fromWalletId: string,
    toWalletId: string,
    amount: number,
    date: string,
    description?: string,
    notes?: string
  ) => {
    if (!uid) throw new Error('User not authenticated');
    const fromW = wallets.find((w) => w.id === fromWalletId);
    const toW = wallets.find((w) => w.id === toWalletId);

    return await addTransactionService(uid, {
      amount,
      type: 'transfer',
      categoryId: 'transfer',
      categoryName: 'Wallet Transfer',
      walletId: fromWalletId,
      walletName: fromW?.name || 'Wallet',
      targetWalletId: toWalletId,
      targetWalletName: toW?.name || 'Target Wallet',
      date,
      description: description || `Transfer to ${toW?.name || 'Wallet'}`,
      notes: notes || '',
    });
  };

  const createPerson = async (data: any) => {
    if (!uid) throw new Error('User not authenticated');
    return await addPersonService(uid, data);
  };

  const removePerson = async (personId: string) => {
    if (!uid) throw new Error('User not authenticated');
    await deletePersonService(uid, personId);
  };

  const recordLending = async (
    personId: string,
    personName: string,
    walletId: string,
    amount: number,
    date: string,
    description?: string,
    notes?: string
  ) => {
    if (!uid) throw new Error('User not authenticated');
    const w = wallets.find((item) => item.id === walletId);
    return await addTransactionService(uid, {
      amount,
      type: 'lend',
      categoryId: 'lending',
      categoryName: 'Money Given (Lending)',
      walletId,
      walletName: w?.name || 'Wallet',
      personId,
      personName,
      date,
      description: description || `Money given to ${personName}`,
      notes: notes || '',
    });
  };

  const recordBorrowing = async (
    personId: string,
    personName: string,
    walletId: string,
    amount: number,
    date: string,
    description?: string,
    notes?: string
  ) => {
    if (!uid) throw new Error('User not authenticated');
    const w = wallets.find((item) => item.id === walletId);
    return await addTransactionService(uid, {
      amount,
      type: 'borrow',
      categoryId: 'borrowing',
      categoryName: 'Money Borrowed',
      walletId,
      walletName: w?.name || 'Wallet',
      personId,
      personName,
      date,
      description: description || `Money borrowed from ${personName}`,
      notes: notes || '',
    });
  };

  const recordRepayment = async (
    personId: string,
    personName: string,
    type: 'received' | 'given',
    walletId: string,
    amount: number,
    date: string,
    notes?: string
  ) => {
    if (!uid) throw new Error('User not authenticated');
    const w = wallets.find((item) => item.id === walletId);
    const txType: TransactionType = type === 'received' ? 'repayment_received' : 'repayment_given';

    return await addTransactionService(uid, {
      amount,
      type: txType,
      categoryId: 'repayment',
      categoryName: type === 'received' ? 'Repayment Received' : 'Repayment Given',
      walletId,
      walletName: w?.name || 'Wallet',
      personId,
      personName,
      date,
      description:
        type === 'received'
          ? `Repayment received from ${personName}`
          : `Repayment paid to ${personName}`,
      notes: notes || '',
    });
  };

  const saveBudget = async (categoryId: string, categoryName: string, amount: number, month?: string) => {
    if (!uid) throw new Error('User not authenticated');
    return await setBudgetService(uid, {
      categoryId,
      categoryName,
      amount,
      month: month || currentMonthStr,
    });
  };

  const removeBudget = async (budgetId: string) => {
    if (!uid) throw new Error('User not authenticated');
    await deleteBudgetService(uid, budgetId);
  };

  const createRecurringPayment = async (data: any) => {
    if (!uid) throw new Error('User not authenticated');
    return await addRecurringService(uid, data);
  };

  const removeRecurringPayment = async (id: string) => {
    if (!uid) throw new Error('User not authenticated');
    await deleteRecurringService(uid, id);
  };

  const markNotificationRead = async (id: string) => {
    if (!uid) throw new Error('User not authenticated');
    await markNotificationReadService(uid, id);
  };

  return (
    <DataContext.Provider
      value={{
        wallets,
        transactions,
        people,
        budgets,
        recurring,
        notifications,
        unreadNotificationCount,
        isLoadingData,
        totalWalletBalance,
        totalReceivable,
        totalPayable,
        netWorth,
        createTransaction,
        editTransaction,
        removeTransaction,
        createWallet,
        editWallet,
        removeWallet,
        transfer,
        createPerson,
        removePerson,
        recordLending,
        recordBorrowing,
        recordRepayment,
        saveBudget,
        removeBudget,
        createRecurringPayment,
        removeRecurringPayment,
        markNotificationRead,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
