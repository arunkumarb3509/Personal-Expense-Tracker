export type DebtStatus = 'unpaid' | 'partially_paid' | 'paid';
export type DebtType = 'given' | 'borrowed'; // given = user lent money to person (receivable); borrowed = user borrowed from person (payable)

export interface Person {
  id: string;
  userId: string;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
  totalGiven: number;      // Total lent to person
  totalReceived: number;   // Total repaid by person
  remainingReceivable: number; // Given - Received
  totalBorrowed: number;   // Total borrowed from person
  totalRepaid: number;     // Total repaid to person
  remainingPayable: number;    // Borrowed - Repaid
  status: DebtStatus;
  createdAt: number;
  updatedAt: number;
}

export interface DebtRecord {
  id: string;
  userId: string;
  personId: string;
  personName: string;
  type: DebtType; // 'given' (lend) or 'borrowed' (borrow)
  amount: number;
  remainingAmount: number;
  walletId: string;
  walletName?: string;
  date: string;
  dueDate?: string;
  description: string;
  notes?: string;
  status: DebtStatus;
  createdAt: number;
  updatedAt: number;
}
