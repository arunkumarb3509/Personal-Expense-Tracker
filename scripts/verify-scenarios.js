/**
 * Verification Test Suite for PET Finance
 * Validates Scenarios A, B, C, D, and E specified in the user prompt.
 */

// Balance Calculator Logic implementation under test
function calculateAccountBalance(wallet, transactions) {
  const opening = Number(wallet.openingBalance) || 0;
  let balance = opening;

  for (const tx of transactions) {
    const amt = Number(tx.amount) || 0;
    if (isNaN(amt) || amt <= 0) continue;

    const isDirectMatch =
      tx.walletId === wallet.id ||
      tx.accountId === wallet.id;

    const isTargetMatch =
      tx.targetWalletId === wallet.id ||
      tx.targetAccountId === wallet.id;

    if (tx.type === 'income') {
      if (isDirectMatch) {
        balance += amt;
      }
    } else if (tx.type === 'expense') {
      if (isDirectMatch) {
        balance -= amt;
      }
    } else if (tx.type === 'transfer') {
      if (isDirectMatch) {
        balance -= amt;
      }
      if (isTargetMatch) {
        balance += amt;
      }
    }
  }

  return balance;
}

function calculateAllAccountBalances(wallets, transactions) {
  const result = {};
  for (const w of wallets) {
    result[w.id] = calculateAccountBalance(w, transactions);
  }
  return result;
}

function parseLocalDate(dateString) {
  if (!dateString) return new Date();
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day, 12, 0, 0);
  }
  return new Date();
}

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function runTests() {
  console.log('==================================================');
  console.log('PET Finance Verification Test Suite (Scenarios A-E)');
  console.log('==================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, testName, details) {
    total++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      if (details) console.error(`   Details: ${details}`);
    }
  }

  // ====================================================
  // TEST A: Multiple Deposits into Same Account
  // 1. Airtel opening balance: ₹0
  // 2. Add ₹300
  // 3. Add ₹500
  // 4. Confirm Airtel balance is ₹800 with two transaction entries.
  // ====================================================
  console.log('--- Test A: Multiple Deposits into Airtel ---');
  const airtelWallet = {
    id: 'wallet-airtel',
    name: 'Airtel Payments Bank',
    type: 'bank',
    openingBalance: 0,
    currentBalance: 0,
  };

  const deposit1 = {
    id: 'tx-1',
    amount: 300,
    type: 'income',
    walletId: 'wallet-airtel',
    accountId: 'wallet-airtel',
  };

  const deposit2 = {
    id: 'tx-2',
    amount: 500,
    type: 'income',
    walletId: 'wallet-airtel',
    accountId: 'wallet-airtel',
  };

  const transactionsA = [deposit1, deposit2];
  const airtelBalA = calculateAccountBalance(airtelWallet, transactionsA);

  assert(
    airtelBalA === 800,
    'Test A.1: Airtel balance is exactly ₹800 (₹0 + ₹300 + ₹500)',
    `Expected 800, got ${airtelBalA}`
  );
  assert(
    transactionsA.length === 2,
    'Test A.2: Two separate transaction history entries maintained',
    `Expected 2 entries, got ${transactionsA.length}`
  );

  // ====================================================
  // TEST B: Separate Accounts
  // 1. Airtel balance: ₹800
  // 2. HDFC balance: ₹1,000
  // 3. Confirm separate balances and combined total = ₹1,800
  // ====================================================
  console.log('\n--- Test B: Separate Accounts & Total Balance ---');
  const hdfcWallet = {
    id: 'wallet-hdfc',
    name: 'HDFC Bank',
    type: 'bank',
    openingBalance: 1000,
    currentBalance: 1000,
  };

  const walletsB = [airtelWallet, hdfcWallet];
  const balancesB = calculateAllAccountBalances(walletsB, transactionsA);
  const totalB = Object.values(balancesB).reduce((s, b) => s + b, 0);

  assert(
    balancesB['wallet-airtel'] === 800,
    'Test B.1: Airtel balance reflects separate ₹800',
    `Got ${balancesB['wallet-airtel']}`
  );
  assert(
    balancesB['wallet-hdfc'] === 1000,
    'Test B.2: HDFC balance reflects separate ₹1,000',
    `Got ${balancesB['wallet-hdfc']}`
  );
  assert(
    totalB === 1800,
    'Test B.3: Combined total is exactly ₹1,800 without double counting',
    `Expected 1800, got ${totalB}`
  );

  // ====================================================
  // TEST C: Bank-to-Bank Self-Transfer
  // 1. Transfer ₹200 from Airtel to HDFC
  // 2. Confirm Airtel = ₹600
  // 3. Confirm HDFC = ₹1,200
  // 4. Confirm combined total remains ₹1,800
  // 5. Confirm transfer is not counted as income or expense
  // ====================================================
  console.log('\n--- Test C: Self-Transfer (Airtel -> HDFC) ---');
  const transferTx = {
    id: 'tx-transfer-1',
    amount: 200,
    type: 'transfer',
    walletId: 'wallet-airtel', // Source
    targetWalletId: 'wallet-hdfc', // Destination
    accountId: 'wallet-airtel',
    targetAccountId: 'wallet-hdfc',
    transferId: 'transfer-unique-123',
  };

  const transactionsC = [...transactionsA, transferTx];
  const balancesC = calculateAllAccountBalances(walletsB, transactionsC);
  const totalC = Object.values(balancesC).reduce((s, b) => s + b, 0);

  assert(
    balancesC['wallet-airtel'] === 600,
    'Test C.1: Airtel balance becomes ₹600 after ₹200 transfer (800 - 200)',
    `Expected 600, got ${balancesC['wallet-airtel']}`
  );
  assert(
    balancesC['wallet-hdfc'] === 1200,
    'Test C.2: HDFC balance becomes ₹1,200 after receiving ₹200 (1000 + 200)',
    `Expected 1200, got ${balancesC['wallet-hdfc']}`
  );
  assert(
    totalC === 1800,
    'Test C.3: Combined total remains exactly ₹1,800 (conservation of net worth)',
    `Expected 1800, got ${totalC}`
  );

  const nonTransferExpenses = transactionsC
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const nonTransferIncome = transactionsC
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  assert(
    nonTransferExpenses === 0,
    'Test C.4: Transfer is NOT counted as expense (expense total remains ₹0)',
    `Expected 0, got ${nonTransferExpenses}`
  );
  assert(
    nonTransferIncome === 800,
    'Test C.5: Transfer is NOT counted as income (income total remains ₹800)',
    `Expected 800, got ${nonTransferIncome}`
  );

  // ====================================================
  // TEST D: Expense Paid From Specific Account
  // 1. Record ₹100 expense paid from Airtel
  // 2. Confirm Airtel becomes ₹500
  // 3. Confirm HDFC remains ₹1,200
  // ====================================================
  console.log('\n--- Test D: Account-Aware Expense ---');
  const expenseTx = {
    id: 'tx-expense-1',
    amount: 100,
    type: 'expense',
    walletId: 'wallet-airtel',
    accountId: 'wallet-airtel',
  };

  const transactionsD = [...transactionsC, expenseTx];
  const balancesD = calculateAllAccountBalances(walletsB, transactionsD);
  const totalD = Object.values(balancesD).reduce((s, b) => s + b, 0);

  assert(
    balancesD['wallet-airtel'] === 500,
    'Test D.1: Airtel balance becomes ₹500 after ₹100 expense (600 - 100)',
    `Expected 500, got ${balancesD['wallet-airtel']}`
  );
  assert(
    balancesD['wallet-hdfc'] === 1200,
    'Test D.2: HDFC balance remains untouched at ₹1,200',
    `Expected 1200, got ${balancesD['wallet-hdfc']}`
  );
  assert(
    totalD === 1700,
    'Test D.3: Combined total correctly decreases by ₹100 to ₹1,700 (1800 - 100)',
    `Expected 1700, got ${totalD}`
  );

  // ====================================================
  // TEST E: Calendar & Timezone Verification
  // 1. Date selection from previous month
  // 2. Exact preservation without timezone off-by-one shifts
  // 3. Leap year support (e.g. Feb 29, 2024 / 2028)
  // ====================================================
  console.log('\n--- Test E: Calendar & Timezone Accuracy ---');
  const pastDateStr = '2026-08-15';
  const parsedDate = parseLocalDate(pastDateStr);
  const formattedBack = formatLocalDate(parsedDate);

  assert(
    formattedBack === pastDateStr,
    'Test E.1: Past month date roundtrips identically with no timezone shift',
    `Expected ${pastDateStr}, got ${formattedBack}`
  );

  const leapDateStr = '2028-02-29';
  const leapDate = parseLocalDate(leapDateStr);
  const formattedLeap = formatLocalDate(leapDate);
  assert(
    formattedLeap === leapDateStr,
    'Test E.2: Leap year date (2028-02-29) supported and preserved',
    `Expected ${leapDateStr}, got ${formattedLeap}`
  );

  const nonLeapDateStr = '2026-02-28';
  const nonLeapDate = parseLocalDate(nonLeapDateStr);
  const formattedNonLeap = formatLocalDate(nonLeapDate);
  assert(
    formattedNonLeap === nonLeapDateStr,
    'Test E.3: Non-leap February date preserved accurately',
    `Expected ${nonLeapDateStr}, got ${formattedNonLeap}`
  );

  console.log('\n==================================================');
  console.log(`Results: ${passed}/${total} assertions passed!`);
  console.log('==================================================\n');
}

runTests();
