import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { Transaction } from '@/types/transaction';
import { Person } from '@/types/lending';
import { Wallet } from '@/types/wallet';

export async function exportTransactionsToCSV(
  transactions: Transaction[],
  wallets: Wallet[],
  currencyCode: string = 'INR'
): Promise<void> {
  const headers = [
    'Date',
    'Time',
    'Type',
    'Category',
    'Subcategory',
    'Amount',
    'Currency',
    'Wallet',
    'Target Wallet',
    'Person',
    'Description',
    'Notes',
    'Status',
  ];

  const walletMap = new Map(wallets.map((w) => [w.id, w.name]));

  const rows = transactions.map((tx) => [
    `"${tx.date || ''}"`,
    `"${tx.time || ''}"`,
    `"${tx.type || ''}"`,
    `"${tx.categoryName || ''}"`,
    `"${tx.subcategory || ''}"`,
    tx.amount,
    `"${currencyCode}"`,
    `"${walletMap.get(tx.walletId) || tx.walletName || tx.walletId}"`,
    `"${tx.targetWalletId ? walletMap.get(tx.targetWalletId) || tx.targetWalletName || '' : ''}"`,
    `"${tx.personName || ''}"`,
    `"${(tx.description || '').replace(/"/g, '""')}"`,
    `"${(tx.notes || '').replace(/"/g, '""')}"`,
    `"${tx.paymentStatus || 'completed'}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  const fileName = `ExpenseTracker_Transactions_${new Date().toISOString().split('T')[0]}.csv`;

  if (Platform.OS === 'web') {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  const filePath = `${FileSystem.documentDirectory}${fileName}`;
  await FileSystem.writeAsStringAsync(filePath, csvContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(filePath, {
      mimeType: 'text/csv',
      dialogTitle: 'Export Transactions CSV',
      UTI: 'public.comma-separated-values-text',
    });
  }
}

export async function exportLendingBorrowingToCSV(
  people: Person[],
  currencyCode: string = 'INR'
): Promise<void> {
  const headers = [
    'Person Name',
    'Phone',
    'Total Given (Lent)',
    'Total Received (Repaid)',
    'Remaining Receivable',
    'Total Borrowed',
    'Total Repaid',
    'Remaining Payable',
    'Status',
    'Notes',
  ];

  const rows = people.map((p) => [
    `"${p.name.replace(/"/g, '""')}"`,
    `"${p.phone || ''}"`,
    p.totalGiven || 0,
    p.totalReceived || 0,
    p.remainingReceivable || 0,
    p.totalBorrowed || 0,
    p.totalRepaid || 0,
    p.remainingPayable || 0,
    `"${p.status}"`,
    `"${(p.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const fileName = `ExpenseTracker_LendingBorrowing_${new Date().toISOString().split('T')[0]}.csv`;

  if (Platform.OS === 'web') {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  const filePath = `${FileSystem.documentDirectory}${fileName}`;
  await FileSystem.writeAsStringAsync(filePath, csvContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(filePath, {
      mimeType: 'text/csv',
      dialogTitle: 'Export Lending & Borrowing CSV',
      UTI: 'public.comma-separated-values-text',
    });
  }
}
