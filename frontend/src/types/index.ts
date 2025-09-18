export type User = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  currency?: string;
};

export type Category = {
  id: number;
  name: string;
  type: 'income' | 'expense';
  color: string;
  userId: number;
  createdAt: string;
};

export type Transaction = {
  id: number;
  amount: number;
  description?: string;
  type: 'income' | 'expense';
  categoryId?: number;
  userId: number;
  date: string;
  bitcoinPrice?: number;
  satoshiAmount?: number;
  createdAt: string;
  updatedAt: string;
  categoryName?: string;
  categoryColor?: string;
};

export type TransactionSummary = {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
};

export type CategorySummary = {
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  total: number;
  count: number;
  percentage: number;
};

export type MonthlyTrend = {
  month: string;
  income: number;
  expenses: number;
};

export type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  updateCurrency: (currency: string) => Promise<void>;
  checkSetup: () => Promise<boolean>;
  setupPassword: (password: string, currency?: string) => Promise<void>;
  loginWithPassword: (password: string) => Promise<void>;
};

export type ApiResponse<T> = {
  message?: string;
  error?: string;
  data?: T;
};

export type CurrencyInfo = {
  code: string;
  name: string;
  symbol: string;
};