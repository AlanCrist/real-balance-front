export default {
  // Common
  common: {
    appName: 'Real Balance',
    appTagline: 'Your finances, simplified',
    back: 'Back',
    cancel: 'Cancel',
    add: 'Add',
    delete: 'Delete',
    save: 'Save',
    continue: 'Continue',
    skip: 'Skip setup',
    getStarted: 'Get Started',
    all: 'All',
    clearFilters: 'Clear filters',
    viewAll: 'View all',
    of: 'of',
    month: 'month',
    monthsLeft: '~{count} months left',
    noData: 'No data',
    language: 'Language',
  },

  // Navigation
  nav: {
    dashboard: 'Dashboard',
    transactions: 'Transactions',
    creditCard: 'Credit Card',
    accounts: 'Accounts',
    goals: 'Goals',
    home: 'Home',
    history: 'History',
    card: 'Card',
    quickAdd: 'Quick Add',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
  },

  // Dashboard
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Your financial overview',
    addExpense: 'Add Expense',
    realBalance: 'Real Balance',
    afterCreditDebt: 'After credit card debt',
    accountBalance: 'Account Balance',
    allAccountsCombined: 'All accounts combined',
    creditUsed: 'Credit Used',
    outstandingBalance: 'Outstanding balance',
    monthlySpending: 'Monthly Spending',
    thisMonthSoFar: 'This month so far',
    monthlySpendingChart: 'Monthly Spending',
    byCategory: 'By Category',
    recentExpenses: 'Recent Expenses',
  },

  // Quick Add
  quickAdd: {
    title: 'Add Expense',
    subtitle: 'Type amount + description + payment method',
    badge: 'Quick Add',
    placeholder: 'Type "35 lunch" or "120 groceries credit"',
    formatHint: 'Format: amount + description + payment method (optional)',
    confirmHint: 'Press Enter to confirm or Esc to cancel',
    example1Title: '35 lunch',
    example1Desc: '$35 food expense',
    example2Title: '120 groceries',
    example2Desc: '$120 groceries',
    example3Title: '25 uber credit',
    example3Desc: '$25 on credit card',
  },

  // Transactions
  transactions: {
    title: 'Transactions',
    subtitle: 'All your financial movements',
    search: 'Search transactions...',
    category: 'Category',
    paymentMethod: 'Payment Method',
    transactionsCount: '{count} transactions',
    noTransactions: 'No transactions yet',
    noExpensesThisMonth: 'No expenses this month',
  },

  // Credit Card
  creditCards: {
    title: 'Credit Cards',
    subtitle: 'Manage your credit card spending',
    limit: 'limit',
    closesOn: 'Closes on {day}th',
    dueOn: 'Due on {day}th',
    used: 'Used',
    available: 'Available',
    thisMonth: 'This Month',
    creditUsage: 'Credit Usage',
    currentInvoice: 'Current Invoice',
    closesOnThe: 'Closes on the {day}th',
    upcomingInvoice: 'Upcoming Invoice',
    dueOnThe: 'Due on the {day}th',
    creditCardTransactions: 'Credit Card Transactions',
  },

  // Accounts
  accounts: {
    title: 'Accounts',
    subtitle: 'Manage your accounts and balances',
    addAccount: 'Add Account',
    newAccount: 'New Account',
    totalBalance: 'Total Balance',
    acrossAccounts: 'Across {count} accounts',
    name: 'Name',
    type: 'Type',
    balance: 'Balance',
    namePlaceholder: 'e.g. Savings Account',
    bankAccount: 'Bank Account',
    cash: 'Cash',
    wallet: 'Wallet',
    digitalBank: 'Digital Bank',
  },

  // Goals
  goals: {
    title: 'Savings Goals',
    subtitle: 'Track your financial goals',
    newGoal: 'New Goal',
    createGoal: 'Create Goal',
    goalName: 'Goal Name',
    goalNamePlaceholder: 'e.g. Emergency Fund',
    targetAmount: 'Target Amount',
    monthlyContribution: 'Monthly Contribution',
    totalSaved: 'Total Saved',
    ofTotalGoal: '{percent}% of {total} total goal',
    perMonth: '/month',
    addContribution: 'Add Contribution',
    amount: 'Amount',
    noGoals: 'No goals yet',
    noGoalsDesc: 'Create your first saving goal to get started',
  },

  // Onboarding
  onboarding: {
    setupTitle: "Let's set up your finances",
    monthlyIncome: 'Monthly Income',
    monthlyIncomeDesc: "What's your monthly income?",
    creditCard: 'Credit Card',
    creditCardDesc: "What's your credit card limit?",
    bankAccount: 'Bank Account',
    bankAccountDesc: 'Add your main bank account',
    accountName: 'Account name',
    currentBalance: 'Current balance',
  },

  // Categories
  categories: {
    food: 'Food',
    groceries: 'Groceries',
    transport: 'Transport',
    health: 'Health',
    entertainment: 'Entertainment',
    housing: 'Housing',
    shopping: 'Shopping',
    education: 'Education',
    other: 'Other',
  },

  // Payment methods
  paymentMethods: {
    debit: 'Debit',
    credit: 'Credit',
    cash: 'Cash',
    pix: 'Pix',
  },
} as const
