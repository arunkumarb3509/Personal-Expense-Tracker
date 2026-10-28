import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  writeBatch,
  increment,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { Wallet, WalletType } from '@/types/wallet';
import { Transaction, TransactionType } from '@/types/transaction';
import { Person, DebtRecord, DebtStatus } from '@/types/lending';
import { Budget, RecurringTransaction, AppNotification } from '@/types/app';
import { WALLET_TYPES } from '@/constants/wallets';
import { calculateTransactionEffects } from './balanceCalculator';

/**
 * Sanitizes an object by removing any undefined properties recursively
 * to prevent Firestore "Unsupported field value: undefined" errors.
 */
export function sanitizeFirestoreData<T extends Record<string, any>>(obj: T): T {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (
        value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        !(value instanceof Date)
      ) {
        result[key] = sanitizeFirestoreData(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

// ----------------------------------------------------
// WALLET SERVICES
// ----------------------------------------------------

export function subscribeWallets(
  uid: string,
  onUpdate: (wallets: Wallet[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const walletsRef = collection(db, 'users', uid, 'wallets');
  return onSnapshot(
    walletsRef,
    (snapshot) => {
      const wallets: Wallet[] = [];
      snapshot.forEach((docSnap) => {
        wallets.push({ id: docSnap.id, ...docSnap.data() } as Wallet);
      });
      // Sort: default first, then by name
      wallets.sort((a, b) => {
        if (a.isDefault) return -1;
        if (b.isDefault) return 1;
        return a.name.localeCompare(b.name);
      });
      onUpdate(wallets);
    },
    onError
  );
}

export async function addWallet(
  uid: string,
  walletData: {
    name: string;
    type: WalletType;
    openingBalance: number;
    currency?: string;
    color?: string;
    icon?: string;
    accountNumberLast4?: string;
    isDefault?: boolean;
    status?: 'active' | 'archived';
    linkedBankId?: string;
  }
): Promise<Wallet> {
  const walletId = `wallet_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const walletRef = doc(db, 'users', uid, 'wallets', walletId);
  const now = Date.now();

  const typeConfig = WALLET_TYPES[walletData.type] || WALLET_TYPES.bank;

  const wallet: Wallet = {
    id: walletId,
    userId: uid,
    name: walletData.name.trim(),
    type: walletData.type,
    openingBalance: Number(walletData.openingBalance) || 0,
    currentBalance: Number(walletData.openingBalance) || 0,
    currency: walletData.currency || 'INR',
    color: walletData.color || typeConfig.color || '#2563EB',
    icon: walletData.icon || typeConfig.icon || 'Building2',
    accountNumberLast4: walletData.accountNumberLast4 ? walletData.accountNumberLast4.trim() : '',
    isDefault: walletData.isDefault || false,
    status: walletData.status || 'active',
    linkedBankId: walletData.linkedBankId || '',
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(walletRef, sanitizeFirestoreData(wallet));
  return wallet;
}

export async function updateWallet(
  uid: string,
  walletId: string,
  updates: Partial<Wallet>
): Promise<void> {
  const walletRef = doc(db, 'users', uid, 'wallets', walletId);
  const cleanUpdates = sanitizeFirestoreData({
    ...updates,
    updatedAt: Date.now(),
  });
  await updateDoc(walletRef, cleanUpdates);
}

export async function setDefaultWallet(uid: string, walletId: string): Promise<void> {
  const walletsRef = collection(db, 'users', uid, 'wallets');
  const snapshot = await getDocs(walletsRef);
  const batch = writeBatch(db);
  const now = Date.now();
  snapshot.forEach((d) => {
    batch.update(d.ref, {
      isDefault: d.id === walletId,
      updatedAt: now,
    });
  });
  await batch.commit();
}

export async function deleteWallet(uid: string, walletId: string): Promise<void> {
  const walletRef = doc(db, 'users', uid, 'wallets', walletId);
  await deleteDoc(walletRef);
}

// ----------------------------------------------------
// TRANSACTION SERVICES
// ----------------------------------------------------

export function subscribeTransactions(
  uid: string,
  onUpdate: (transactions: Transaction[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const transactionsRef = collection(db, 'users', uid, 'transactions');
  return onSnapshot(
    transactionsRef,
    (snapshot) => {
      const transactions: Transaction[] = [];
      snapshot.forEach((docSnap) => {
        transactions.push({ id: docSnap.id, ...docSnap.data() } as Transaction);
      });
      // Sort descending by date and time/timestamp
      transactions.sort((a, b) => (b.timestamp || b.createdAt) - (a.timestamp || a.createdAt));
      onUpdate(transactions);
    },
    onError
  );
}

export async function addTransaction(
  uid: string,
  data: {
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
  }
): Promise<Transaction> {
  const batch = writeBatch(db);
  const now = Date.now();
  const txId = `tx_${now}_${Math.random().toString(36).substring(2, 7)}`;
  const txRef = doc(db, 'users', uid, 'transactions', txId);

  // Parse timestamp from date (YYYY-MM-DD) and time (HH:mm)
  let timestamp = now;
  try {
    const [y, m, d] = data.date.split('-').map(Number);
    const [hh, mm] = (data.time || '12:00').split(':').map(Number);
    timestamp = new Date(y, m - 1, d, hh, mm).getTime();
  } catch (e) {
    timestamp = now;
  }

  const isTransfer = data.type === 'transfer';
  const transferId = isTransfer ? `tr_${now}_${Math.random().toString(36).substring(2, 7)}` : '';

  const newTx: Transaction = {
    id: txId,
    userId: uid,
    amount: Number(data.amount) || 0,
    type: data.type,
    categoryId: data.categoryId || (isTransfer ? 'transfer' : 'other'),
    categoryName: data.categoryName || (isTransfer ? 'Transfer' : 'Other'),
    subcategory: data.subcategory || '',
    walletId: data.walletId,
    accountId: data.walletId,
    walletName: data.walletName || '',
    accountName: data.walletName || '',
    targetWalletId: data.targetWalletId || '',
    targetAccountId: data.targetWalletId || '',
    targetWalletName: data.targetWalletName || '',
    targetAccountName: data.targetWalletName || '',
    transferId,
    personId: data.personId || '',
    personName: data.personName || '',
    date: data.date,
    time: data.time || '',
    timestamp,
    description: (data.description || data.categoryName || (isTransfer ? 'Transfer' : 'Transaction')).trim(),
    notes: data.notes || '',
    receiptUrl: data.receiptUrl || '',
    paymentStatus: 'completed',
    recurringId: data.recurringId || '',
    createdAt: now,
    updatedAt: now,
  };

  // 1. Add Transaction doc
  batch.set(txRef, sanitizeFirestoreData(newTx));

  // 2. Calculate balance effects
  const effects = calculateTransactionEffects(newTx, false);

  // Update Wallets in batch
  for (const [wId, delta] of Object.entries(effects.walletDeltas)) {
    if (wId && delta !== 0) {
      const wRef = doc(db, 'users', uid, 'wallets', wId);
      batch.update(wRef, {
        currentBalance: increment(delta),
        updatedAt: now,
      });
    }
  }

  // Update Person if lending/borrowing/repayment in batch
  if (effects.personDeltas && effects.personDeltas.personId) {
    const pRef = doc(db, 'users', uid, 'people', effects.personDeltas.personId);
    const updates: any = { updatedAt: now };

    if (effects.personDeltas.givenDelta) {
      updates.totalGiven = increment(effects.personDeltas.givenDelta);
      updates.remainingReceivable = increment(effects.personDeltas.givenDelta);
    }
    if (effects.personDeltas.receivedDelta) {
      updates.totalReceived = increment(effects.personDeltas.receivedDelta);
      updates.remainingReceivable = increment(-effects.personDeltas.receivedDelta);
    }
    if (effects.personDeltas.borrowedDelta) {
      updates.totalBorrowed = increment(effects.personDeltas.borrowedDelta);
      updates.remainingPayable = increment(effects.personDeltas.borrowedDelta);
    }
    if (effects.personDeltas.repaidDelta) {
      updates.totalRepaid = increment(effects.personDeltas.repaidDelta);
      updates.remainingPayable = increment(-effects.personDeltas.repaidDelta);
    }

    batch.update(pRef, updates);
  }

  await batch.commit();
  return newTx;
}

export async function deleteTransaction(uid: string, tx: Transaction): Promise<void> {
  const batch = writeBatch(db);
  const now = Date.now();
  const txRef = doc(db, 'users', uid, 'transactions', tx.id);

  // 1. Delete transaction doc
  batch.delete(txRef);

  // 2. Reverse balance effects
  const reverseEffects = calculateTransactionEffects(tx, true);

  // Reverse Wallets
  for (const [wId, delta] of Object.entries(reverseEffects.walletDeltas)) {
    if (wId && delta !== 0) {
      const wRef = doc(db, 'users', uid, 'wallets', wId);
      batch.update(wRef, {
        currentBalance: increment(delta),
        updatedAt: now,
      });
    }
  }

  // Reverse Person record if applicable
  if (reverseEffects.personDeltas && reverseEffects.personDeltas.personId) {
    const pRef = doc(db, 'users', uid, 'people', reverseEffects.personDeltas.personId);
    const updates: any = { updatedAt: now };

    if (reverseEffects.personDeltas.givenDelta) {
      updates.totalGiven = increment(reverseEffects.personDeltas.givenDelta);
      updates.remainingReceivable = increment(reverseEffects.personDeltas.givenDelta);
    }
    if (reverseEffects.personDeltas.receivedDelta) {
      updates.totalReceived = increment(reverseEffects.personDeltas.receivedDelta);
      updates.remainingReceivable = increment(-reverseEffects.personDeltas.receivedDelta);
    }
    if (reverseEffects.personDeltas.borrowedDelta) {
      updates.totalBorrowed = increment(reverseEffects.personDeltas.borrowedDelta);
      updates.remainingPayable = increment(reverseEffects.personDeltas.borrowedDelta);
    }
    if (reverseEffects.personDeltas.repaidDelta) {
      updates.totalRepaid = increment(reverseEffects.personDeltas.repaidDelta);
      updates.remainingPayable = increment(-reverseEffects.personDeltas.repaidDelta);
    }

    batch.update(pRef, updates);
  }

  await batch.commit();
}

export async function updateTransaction(
  uid: string,
  oldTx: Transaction,
  updatedData: Partial<Transaction>
): Promise<Transaction> {
  const batch = writeBatch(db);
  const now = Date.now();
  const txRef = doc(db, 'users', uid, 'transactions', oldTx.id);

  const newTx: Transaction = {
    ...oldTx,
    ...updatedData,
    amount: Number(updatedData.amount !== undefined ? updatedData.amount : oldTx.amount) || 0,
    subcategory: updatedData.subcategory !== undefined ? updatedData.subcategory : (oldTx.subcategory || ''),
    notes: updatedData.notes !== undefined ? updatedData.notes : (oldTx.notes || ''),
    receiptUrl: updatedData.receiptUrl !== undefined ? updatedData.receiptUrl : (oldTx.receiptUrl || ''),
    targetWalletId: updatedData.targetWalletId !== undefined ? updatedData.targetWalletId : (oldTx.targetWalletId || ''),
    targetWalletName: updatedData.targetWalletName !== undefined ? updatedData.targetWalletName : (oldTx.targetWalletName || ''),
    personId: updatedData.personId !== undefined ? updatedData.personId : (oldTx.personId || ''),
    personName: updatedData.personName !== undefined ? updatedData.personName : (oldTx.personName || ''),
    recurringId: updatedData.recurringId !== undefined ? updatedData.recurringId : (oldTx.recurringId || ''),
    updatedAt: now,
  };

  // Re-calculate timestamp if date/time changed
  if (updatedData.date || updatedData.time) {
    try {
      const [y, m, d] = (newTx.date || oldTx.date).split('-').map(Number);
      const [hh, mm] = (newTx.time || oldTx.time || '12:00').split(':').map(Number);
      newTx.timestamp = new Date(y, m - 1, d, hh, mm).getTime();
    } catch (e) {
      newTx.timestamp = now;
    }
  }

  // 1. Update Tx Doc
  batch.update(txRef, sanitizeFirestoreData(newTx) as any);

  // 2. Reverse OLD effects
  const oldEffects = calculateTransactionEffects(oldTx, true);
  // 3. Apply NEW effects
  const newEffects = calculateTransactionEffects(newTx, false);

  // Merge wallet deltas
  const combinedWalletDeltas: { [walletId: string]: number } = {};
  for (const [wId, delta] of Object.entries(oldEffects.walletDeltas)) {
    combinedWalletDeltas[wId] = (combinedWalletDeltas[wId] || 0) + delta;
  }
  for (const [wId, delta] of Object.entries(newEffects.walletDeltas)) {
    combinedWalletDeltas[wId] = (combinedWalletDeltas[wId] || 0) + delta;
  }

  for (const [wId, delta] of Object.entries(combinedWalletDeltas)) {
    if (wId && delta !== 0) {
      const wRef = doc(db, 'users', uid, 'wallets', wId);
      batch.update(wRef, {
        currentBalance: increment(delta),
        updatedAt: now,
      });
    }
  }

  // Apply Person updates if applicable
  if (oldTx.personId) {
    const pOldRef = doc(db, 'users', uid, 'people', oldTx.personId);
    if (oldEffects.personDeltas) {
      const updates: any = { updatedAt: now };
      if (oldEffects.personDeltas.givenDelta) updates.totalGiven = increment(oldEffects.personDeltas.givenDelta);
      if (oldEffects.personDeltas.receivedDelta) updates.totalReceived = increment(oldEffects.personDeltas.receivedDelta);
      if (oldEffects.personDeltas.borrowedDelta) updates.totalBorrowed = increment(oldEffects.personDeltas.borrowedDelta);
      if (oldEffects.personDeltas.repaidDelta) updates.totalRepaid = increment(oldEffects.personDeltas.repaidDelta);
      batch.update(pOldRef, updates);
    }
  }
  if (newTx.personId) {
    const pNewRef = doc(db, 'users', uid, 'people', newTx.personId);
    if (newEffects.personDeltas) {
      const updates: any = { updatedAt: now };
      if (newEffects.personDeltas.givenDelta) updates.totalGiven = increment(newEffects.personDeltas.givenDelta);
      if (newEffects.personDeltas.receivedDelta) updates.totalReceived = increment(newEffects.personDeltas.receivedDelta);
      if (newEffects.personDeltas.borrowedDelta) updates.totalBorrowed = increment(newEffects.personDeltas.borrowedDelta);
      if (newEffects.personDeltas.repaidDelta) updates.totalRepaid = increment(newEffects.personDeltas.repaidDelta);
      batch.update(pNewRef, updates);
    }
  }

  await batch.commit();
  return newTx;
}

// ----------------------------------------------------
// PEOPLE & LENDING / BORROWING SERVICES
// ----------------------------------------------------

export function subscribePeople(
  uid: string,
  onUpdate: (people: Person[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const peopleRef = collection(db, 'users', uid, 'people');
  return onSnapshot(
    peopleRef,
    (snapshot) => {
      const people: Person[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Person;
        const remainingRec = Math.max(0, (data.totalGiven || 0) - (data.totalReceived || 0));
        const remainingPay = Math.max(0, (data.totalBorrowed || 0) - (data.totalRepaid || 0));

        let status: DebtStatus = 'unpaid';
        if (remainingRec === 0 && remainingPay === 0) {
          status = 'paid';
        } else if (
          (data.totalReceived > 0 && remainingRec > 0) ||
          (data.totalRepaid > 0 && remainingPay > 0)
        ) {
          status = 'partially_paid';
        }

        people.push({
          ...data,
          id: docSnap.id,
          remainingReceivable: remainingRec,
          remainingPayable: remainingPay,
          status,
        });
      });
      people.sort((a, b) => a.name.localeCompare(b.name));
      onUpdate(people);
    },
    onError
  );
}

export async function addPerson(
  uid: string,
  personData: { name: string; phone?: string; email?: string; notes?: string }
): Promise<Person> {
  const personId = `person_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const personRef = doc(db, 'users', uid, 'people', personId);
  const now = Date.now();

  const person: Person = {
    id: personId,
    userId: uid,
    name: personData.name.trim(),
    phone: personData.phone ? personData.phone.trim() : '',
    email: personData.email ? personData.email.trim() : '',
    notes: personData.notes ? personData.notes.trim() : '',
    totalGiven: 0,
    totalReceived: 0,
    remainingReceivable: 0,
    totalBorrowed: 0,
    totalRepaid: 0,
    remainingPayable: 0,
    status: 'paid',
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(personRef, sanitizeFirestoreData(person));
  return person;
}

export async function deletePerson(uid: string, personId: string): Promise<void> {
  const personRef = doc(db, 'users', uid, 'people', personId);
  await deleteDoc(personRef);
}

// ----------------------------------------------------
// BUDGET SERVICES
// ----------------------------------------------------

export function subscribeBudgets(
  uid: string,
  month: string, // YYYY-MM
  onUpdate: (budgets: Budget[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const budgetsRef = collection(db, 'users', uid, 'budgets');
  return onSnapshot(
    budgetsRef,
    (snapshot) => {
      const budgets: Budget[] = [];
      snapshot.forEach((docSnap) => {
        const b = { id: docSnap.id, ...docSnap.data() } as Budget;
        if (!b.month || b.month === month) {
          budgets.push(b);
        }
      });
      onUpdate(budgets);
    },
    onError
  );
}

export async function setBudget(
  uid: string,
  data: {
    categoryId: string;
    categoryName: string;
    amount: number;
    month: string; // YYYY-MM
  }
): Promise<Budget> {
  const budgetId = `budget_${data.categoryId}_${data.month}`;
  const budgetRef = doc(db, 'users', uid, 'budgets', budgetId);
  const now = Date.now();

  const budget: Budget = {
    id: budgetId,
    userId: uid,
    categoryId: data.categoryId,
    categoryName: data.categoryName,
    amount: Number(data.amount) || 0,
    spent: 0,
    month: data.month,
    alert80Sent: false,
    alert100Sent: false,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(budgetRef, sanitizeFirestoreData(budget), { merge: true });
  return budget;
}

export async function deleteBudget(uid: string, budgetId: string): Promise<void> {
  const budgetRef = doc(db, 'users', uid, 'budgets', budgetId);
  await deleteDoc(budgetRef);
}

// ----------------------------------------------------
// RECURRING TRANSACTIONS SERVICES
// ----------------------------------------------------

export function subscribeRecurring(
  uid: string,
  onUpdate: (recurring: RecurringTransaction[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const ref = collection(db, 'users', uid, 'recurring');
  return onSnapshot(
    ref,
    (snapshot) => {
      const items: RecurringTransaction[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as RecurringTransaction);
      });
      onUpdate(items);
    },
    onError
  );
}

export async function addRecurringTransaction(
  uid: string,
  data: Omit<RecurringTransaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<RecurringTransaction> {
  const id = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const ref = doc(db, 'users', uid, 'recurring', id);
  const now = Date.now();

  const item: RecurringTransaction = {
    id,
    userId: uid,
    name: data.name.trim(),
    amount: Number(data.amount) || 0,
    type: data.type || 'expense',
    categoryId: data.categoryId || 'other',
    categoryName: data.categoryName || 'Other',
    walletId: data.walletId,
    walletName: data.walletName || '',
    frequency: data.frequency || 'monthly',
    startDate: data.startDate,
    endDate: data.endDate || '',
    lastProcessedDate: data.lastProcessedDate || '',
    nextDueDate: data.nextDueDate || data.startDate,
    reminderEnabled: data.reminderEnabled !== undefined ? data.reminderEnabled : true,
    isActive: data.isActive !== undefined ? data.isActive : true,
    notes: data.notes || '',
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(ref, sanitizeFirestoreData(item));
  return item;
}

export async function deleteRecurringTransaction(uid: string, id: string): Promise<void> {
  const ref = doc(db, 'users', uid, 'recurring', id);
  await deleteDoc(ref);
}

// ----------------------------------------------------
// NOTIFICATIONS SERVICES
// ----------------------------------------------------

export function subscribeNotifications(
  uid: string,
  onUpdate: (notifications: AppNotification[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const ref = collection(db, 'users', uid, 'notifications');
  return onSnapshot(
    ref,
    (snapshot) => {
      const notifications: AppNotification[] = [];
      snapshot.forEach((docSnap) => {
        notifications.push({ id: docSnap.id, ...docSnap.data() } as AppNotification);
      });
      notifications.sort((a, b) => b.timestamp - a.timestamp);
      onUpdate(notifications);
    },
    onError
  );
}

export async function markNotificationAsRead(uid: string, notificationId: string): Promise<void> {
  const ref = doc(db, 'users', uid, 'notifications', notificationId);
  await updateDoc(ref, { isRead: true });
}

export async function addAppNotification(
  uid: string,
  title: string,
  message: string,
  type: AppNotification['type'],
  relatedEntityId?: string
): Promise<void> {
  const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const ref = doc(db, 'users', uid, 'notifications', id);
  const now = Date.now();

  const notif: AppNotification = {
    id,
    userId: uid,
    title: title.trim(),
    message: message.trim(),
    type,
    isRead: false,
    relatedEntityId: relatedEntityId || '',
    timestamp: now,
    createdAt: now,
  };

  await setDoc(ref, sanitizeFirestoreData(notif));
}
