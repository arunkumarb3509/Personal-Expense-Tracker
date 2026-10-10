# PET Finance - Production-Grade Personal Expense & Wealth Tracker 💸

A modern, commercial-quality Personal Finance & Expense Tracking mobile application built from scratch with **React Native**, **TypeScript**, **Expo**, **Expo Router**, and **Firebase**.

Designed with fintech aesthetics, light and dark themes, strict data privacy, unified wallet balance management, lending/borrowing tracking, category budgets with 80%/100% threshold alerts, interactive SVG analytics, and CSV data export.

---

## 🌟 Key Features

### 1. 🔐 Enterprise Authentication & Email Verification
- **Email & Password Authentication** powered by Firebase Auth.
- **Strict Email Validation**: Rejects invalid email patterns (`arun123@gmail`, `arun@`, `@gmail.com`, `testgmail.com`); requires standard format (`name@domain.com`).
- **Private Data Gate**: Users cannot access financial screens without verifying their email.
- **Email Verification Screen**: Includes "Resend verification email" and "Refresh verification status" with automatic state updates.
- **Password Recovery**: Secure password reset email dispatch.

### 2. 🛡️ 100% Private Data Isolation & Security Rules
- Every financial document is strictly isolated under `users/{uid}/`.
- Production-ready [`firestore.rules`](file:///c:/Users/PN/Desktop/My%20Computer1/Personal%20Workout/PET/firestore.rules) ensure users can only read and write their own data.
- No hardcoded UIDs, no exposed financial records.

### 3. 💳 Multi-Wallet & Account Management
- Create multiple wallets: **UPI / GPay / PhonePe**, **Bank Accounts**, **Cash in Hand**, **Credit Cards**, **Savings Vaults**.
- Live balance tracking with opening balances and automatic updates.
- **Direct Wallet Transfers**: Transfer funds between accounts (e.g. Bank → GPay ₹500: Bank decreases, GPay increases; net worth is unaffected, not treated as an expense).

### 4. 📝 Unified Transactions & Expenses
- **Categories & Subcategories**:
  - **Food & Dining**: Tea/Coffee, Breakfast, Lunch, Dinner, Snacks, Restaurant, Groceries, Custom.
  - **Travel & Commute**: Bus, Auto/Taxi, Metro/Train, Flight, Fuel, Parking.
  - **Shopping**: Clothing, Electronics, Home & Kitchen, Personal Care.
  - **Bills & Utilities**: Electricity, Water, Mobile/Recharge, Internet, Gas, Rent.
  - **Entertainment, Health, Education, Work, Family, Subscriptions, Other**.
  - **Income Categories**: Salary, Freelance, Business, Investments, Gifts, Other.
- **Daily Expense View**: Day-by-day navigation (Previous Day, Today, Next Day, Date Picker) with grouped subcategories and daily totals.
- **Atomic Balance Recalculation**: Editing or deleting any transaction immediately reverses the previous effect and recalculates wallet balances and debt ledgers cleanly.

### 5. 🤝 Lending & Borrowing (Debt Tracking)
- **Money Given (Receivable)**: Track money lent to friends and family with due dates.
- **Money Borrowed (Payable)**: Track money you owe.
- **People Directory & Detail Screens**: Shows Total Lent, Total Repaid, and Remaining Receivable/Payable with statuses (**Unpaid**, **Partially Paid**, **Paid / Settled**).
- **Repayment Logging**:
  - Repayment Received increases wallet balance and decreases receivable.
  - Repayment Paid decreases wallet balance and decreases payable.

### 6. 🎯 Budget Management & Alerts
- Monthly category budgets (e.g. Food ₹5,000, Shopping ₹3,000).
- Automatic real-time spend tracking from current month's transactions.
- **Smart Threshold Warnings**: 80% used warning badges and 100% exceeded alert indicators.

### 7. 🔄 Recurring Transactions
- Manage subscriptions and fixed commitments (Rent, Netflix, Insurance, EMIs, Salaries).
- Frequencies: Daily, Weekly, Monthly, Yearly.
- "Log Payment Now" quick execution.

### 8. 📊 Interactive Analytics & Charts
- **Weekly Analytics**: Total spent this week, interactive SVG bar chart (Mon - Sun), daily average spend, highest & lowest spend days.
- **Monthly Analytics**: Total income, total expenses, net savings rate, month selector, month-over-month comparison (+12% vs last month).
- **Category Deep-Dive**: Subcategory breakdown with percentages.
- **Smart Dashboard Insights**: Fact-based financial insights.

### 9. 🎨 Design System & Theme Engine
- Full **Light Theme**, **Dark Theme**, and **System Default** modes.
- Curated fintech color tokens (Emerald, Indigo, Slate, Rose, Amber).
- Consistent button heights, input focus rings, soft cards, badges, and haptic feedback.

### 10. 📤 Data Export & Notifications
- Export Transactions to CSV (formatted for Excel / Google Sheets).
- Export Lending & Borrowing reports to CSV.
- Direct OS share sheet integration using `expo-sharing`.
- In-App Notification Center for budget warnings and debt reminders.

---

## 🏗️ Architecture & Project Structure

```
src/
├── app/                      # Expo Router File-Based Routing
│   ├── _layout.tsx           # Root Theme, Auth, and Data Provider Layout
│   ├── index.tsx             # Gateway routing (Auth / Verified / Dashboard)
│   ├── (auth)/               # Welcome, Login, Register, Verify Email, Forgot Password
│   ├── (tabs)/               # Dashboard, Transactions, Add, Analytics, Profile
│   ├── add-transaction.tsx   # Add Expense / Income Modal
│   ├── edit-transaction.tsx  # Edit & Delete Transaction Modal
│   ├── daily-view.tsx        # Day-by-day Expense Screen
│   ├── wallets/              # Wallet management & Transfer screens
│   ├── lending/              # Lending/Borrowing & Person Detail screens
│   ├── budgets/              # Budget management screens
│   ├── recurring/            # Recurring payments screens
│   ├── notifications/        # In-app notification center
│   └── settings/             # Data Export to CSV
├── components/               # Centralized Reusable Design System Components
│   ├── common/               # Button, Input, Card, Header, Badge, Avatar, Modals, EmptyState
│   ├── dashboard/            # BalanceCard, WalletCarousel, QuickActions, InsightCard
│   ├── transactions/         # TransactionItem, CategoryPicker, WalletPicker, FilterModal
│   ├── analytics/            # BarChart, CategoryPieChart, StatCard
│   ├── budgets/              # BudgetProgressCard
│   └── lending/              # PersonCard
├── constants/                # Categories, Currencies, Wallets default definitions
├── context/                  # AuthContext, DataContext, ThemeContext
├── hooks/                    # useTheme, useAuth, useData, useCurrency
├── services/                 # Firebase, Firestore, Balance Calculator, Analytics, CSV Exporter
├── theme/                    # Color palettes, typography, spacing, radius, shadows
└── types/                    # TypeScript data models and interfaces
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Configure Firebase
Copy `.env.example` to `.env` and fill in your Firebase credentials:
```bash
cp .env.example .env
```
Refer to [`FIREBASE_SETUP.md`](file:///c:/Users/PN/Desktop/My%20Computer1/Personal%20Workout/PET/FIREBASE_SETUP.md) for full Firebase configuration instructions.

### 3. Run the App
```bash
# Start Android Development build
npm run android

# Start Web Preview
npm run web

# Start Expo Server
npm run start
```

---

## 🧪 Acceptance Test Scenario Walkthrough

1. **User Registration & Strict Validation**:
   - Register with `arun123@gmail.com` and password.
   - Verification email is sent; unverified user is routed to the Email Verification screen.
2. **Email Verification**:
   - User verifies email and clicks "I've Verified My Email" → private Dashboard unlocks.
3. **Wallet Creation**:
   - Default wallets (**GPay**, **Bank**, **Cash**) are initialized.
   - Create custom wallet or transfer funds.
4. **Expense Logging**:
   - Add Tea expense ₹20 from GPay → GPay balance decreases by ₹20.
   - Add Lunch expense ₹50 from GPay → GPay balance decreases by ₹50.
   - Total Today Expense shows ₹70; Weekly/Monthly Analytics & Food category update to ₹70.
5. **Wallet Transfer**:
   - Transfer ₹500 from Bank to GPay → GPay increases by ₹500, Bank decreases by ₹500. Not counted as expense.
6. **Lending & Partial Repayment**:
   - Lend ₹200 to Rahul → Wallet decreases by ₹200, Receivable increases by ₹200.
   - Rahul repays ₹100 → Wallet increases by ₹100, Receivable becomes ₹100.
7. **Budget Tracking & Alert**:
   - Set Food budget of ₹5,000 → Track progress bar with 80% & 100% threshold indicators.
8. **Export**:
   - Export transactions and lending records to CSV.
