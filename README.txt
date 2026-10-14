================================================================================
PERSONAL EXPENSE TRACKER (PET) - APP ARCHITECTURE & FLOW DOCUMENTATION
================================================================================

1. OVERVIEW & PURPOSE
--------------------------------------------------------------------------------
Personal Expense Tracker (PET) is an Expo / React Native mobile application 
built with TypeScript and Firebase (Auth & Firestore). It helps users track 
their personal finances across multiple liquid accounts/wallets (Cash, Bank, 
UPI/GPay, Credit Cards, Savings Vaults), record day-to-day income and expenses, 
track transfers between accounts, and manage lending/borrowing debts with 
contacts.


2. COMPLETE APPLICATION FLOW
--------------------------------------------------------------------------------

2.1. SIGNUP & EMAIL VERIFICATION
- The user begins at the Welcome screen (/(auth)/welcome) and navigates to Register (/(auth)/register).
- The user provides Full Name, Email Address, Password, and Confirm Password.
- Strict email validation regex ensures valid formatting (e.g. name@example.com).
- Firebase Authentication creates the account using createUserWithEmailAndPassword.
- Auth display name is updated with the user's Full Name.
- A verification email is automatically triggered via sendEmailVerification.
- A user profile document is initialized in Firestore at `users/{userId}` with default settings (INR currency, system theme).
- Three default wallets are automatically seeded in Firestore under `users/{userId}/wallets`:
    1. GPay (UPI)
    2. Bank (Main Bank Account)
    3. Cash (Cash in Hand)
- The user is immediately routed to the Verify Email screen (/(auth)/verify-email).
- On the Verify Email screen, the user can:
    - Tap "I've Verified My Email" to reload Firebase Auth credentials and check if `emailVerified === true`. Once verified, the user is navigated to the dashboard.
    - Tap "Resend Verification Email" to receive a new link.
    - Sign out or switch accounts.

2.2. LOGIN & AUTHENTICATION STATE
- Registered users log in at /(auth)/login using their Email and Password.
- Firebase Auth verifies credentials via signInWithEmailAndPassword.
- The user's Firestore profile is fetched (or fallback profile created if not yet populated).
- If the email is unverified, the app navigates to /(auth)/verify-email.
- If verified, the app navigates directly to the main tab dashboard /(tabs).
- Login state persists locally across app restarts using AsyncStorage with Firebase Auth persistence.

2.3. PRIVATE ROUTE PROTECTION & NAVIGATION GUARD
- Route protection is managed at the root layout (_layout.tsx) and index gateway (index.tsx).
- When unauthenticated: Any attempt to access private tabs, transaction screens, wallets, lending, budgets, or settings redirects to /(auth)/welcome.
- When authenticated but unverified: The user is redirected to /(auth)/verify-email.
- When authenticated & verified: The user is granted full access to /(tabs) and modal screens.
- Logout resets all local state, unsubscribes all Firestore snapshot listeners, and redirects to /(auth)/welcome.

2.4. DASHBOARD & NAVIGATION
- The main app contains 5 bottom tabs:
    1. Dashboard (/(tabs)/index) - Net worth summary card, quick action shortcuts, wallet carousel, smart insights, and recent transactions.
    2. Transactions (/(tabs)/transactions) - Full transaction history with search, date grouping, category/wallet/type filters, and income/expense totals.
    3. Quick Add Button (center tab) - Modal launcher for adding income or expense.
    4. Analytics (/(tabs)/analytics) - Weekly bar charts, monthly income vs. expense graphs, savings rate, and category distribution breakdown.
    5. Profile (/(tabs)/profile) - User profile info, Light/Dark/System theme toggle, default currency selector, navigation links to wallets, budgets, lending, recurring payments, CSV export, and Sign Out.

2.5. CREATING & SELECTING WALLETS / ACCOUNT TYPES
- Users can create custom wallets/accounts from /(app)/wallets/add-wallet.
- Supported account types:
    - Bank Account (Savings, Current, Salary)
    - UPI / GPay / PhonePe / Paytm
    - Cash in Hand (Physical cash)
    - Credit Card
    - Savings / Deposit Vault
    - Other Custom Wallets
- Each wallet stores opening balance, current balance, color, icon, and currency.
- Wallets are subscribed in real-time from `users/{userId}/wallets`.

2.6. TRANSACTIONS & BALANCE CALCULATIONS
- Supported Transaction Types:
    1. Expense: Deducts amount from the selected wallet's currentBalance.
    2. Income: Adds amount to the selected wallet's currentBalance.
    3. Transfer: Deducts amount from the source wallet and adds amount to the destination wallet. Does not alter total net worth.
    4. Lending (Money Given): Deducts amount from the payer wallet, adds to the person's totalGiven and remainingReceivable balances.
    5. Borrowing (Money Borrowed): Adds amount to the receiver wallet, adds to the person's totalBorrowed and remainingPayable balances.
    6. Repayment Received: Adds amount to the wallet, increases person's totalReceived, and decreases remainingReceivable.
    7. Repayment Given (Paid): Deducts amount from the wallet, increases person's totalRepaid, and decreases remainingPayable.
- Financial Metrics formulas:
    - Total Wallet Balance = Sum of all wallets' currentBalance.
    - Total Receivable = Sum of all people's remainingReceivable.
    - Total Payable = Sum of all people's remainingPayable.
    - Net Worth = Total Wallet Balance + Total Receivable - Total Payable.
- When editing or deleting a transaction:
    - Firestore batch operations atomically reverse the original balance impacts and apply the new impacts to keep all balances 100% accurate and consistent.

2.7. FIRESTORE STRUCTURE & SECURITY RULES
- Data hierarchy:
    `users/{userId}` -> UserProfile document
    `users/{userId}/wallets/{walletId}` -> Wallet documents
    `users/{userId}/transactions/{transactionId}` -> Transaction documents
    `users/{userId}/people/{personId}` -> Person debt documents
    `users/{userId}/budgets/{budgetId}` -> Budget limit documents
    `users/{userId}/recurring/{recurringId}` -> Recurring transaction rules
    `users/{userId}/notifications/{notificationId}` -> Notification items
    `users/{userId}/settings/{settingsId}` -> User custom settings
- Security Rules (firestore.rules):
    - Strictly checks `request.auth != null && request.auth.uid == userId`.
    - Every user can only read, write, create, update, and delete their own subcollections.
    - All other arbitrary root document paths are denied (`allow read, write: if false`).

2.8. DATA PERSISTENCE & LOGOUT
- All user-specific data is synchronized using Firestore `onSnapshot` real-time listeners.
- Theme mode preference is persisted in `@pet_theme_mode` via AsyncStorage.
- On logout, listeners are unsubscribed, in-memory states are reset to empty, Firebase auth session is cleared, and navigation transitions cleanly to Welcome.


3. BUGS & BROKEN IMPLEMENTATIONS IDENTIFIED (PRIOR TO FIXES)
--------------------------------------------------------------------------------
1. Login Navigation Missing:
   - In `login.tsx`, after `await login(email, password)`, no navigation redirect occurred.
   - Global layout lacked an active segment-aware authentication guard.

2. Firestore "Unsupported field value: undefined" Errors:
   - `addWallet`, `updateWallet`, `addTransaction`, `addPerson`, `addRecurringTransaction`, and `setBudget` passed objects containing optional properties that evaluated to `undefined` (such as `accountNumberLast4`, `subcategory`, `receiptUrl`, `notes`, `endDate`, `phone`).
   - Firestore SDK v12 strictly rejects `undefined` values inside `setDoc` and `updateDoc`.

3. Wallet Creation Failure:
   - Adding wallets (including Cash in Hand, Bank, GPay) failed with Firestore error because `accountNumberLast4` was `undefined`.

4. Profile Currency Picker Modal:
   - In `profile.tsx`, opening the currency modal rendered a generic ConfirmationModal without selectable currency choices.

5. TypeScript & Import Compatibility in `firebase.ts`:
   - `firebase.ts` had untyped `let auth;` and direct `getReactNativePersistence` from `firebase/auth` which failed strict TypeScript compilation checks.

6. App Data Consistency & Validation:
   - Needed a robust sanitization utility to purge any `undefined` values before sending objects to Firestore `setDoc`, `updateDoc`, and `writeBatch`.
   - Needed comprehensive error handling and user feedback across all forms and quick actions.

================================================================================
Build the Android App:
 1.npm install -g eas-cli
 2.eas login
 3.eas build:configure
 4.eas build --platform android --profile preview
