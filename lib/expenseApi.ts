import apiClient from "./apiRequest";

export type ExpenseCategory =
  | "FOOD"
  | "TRANSPORT"
  | "ENTERTAINMENT"
  | "SHOPPING"
  | "HEALTH"
  | "UTILITIES"
  | "EDUCATION"
  | "RENT"
  | "SAVINGS"
  | "OTHER";

export type PaymentMethod =
  | "CASH"
  | "UPI"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "NET_BANKING"
  | "OTHER";

export interface Expense {
  id: number;
  amount: number;
  amountFormatted: string;
  title: string;
  description?: string;
  category: ExpenseCategory;
  paymentMethod: PaymentMethod;
  expenseDate: string;
  expenseMonth: number;
  expenseYear: number;
  isRecurring: boolean;
  createdAt: string;
}

export interface ExpenseRequest {
  amount: number;
  title: string;
  description?: string;
  category: ExpenseCategory;
  paymentMethod: PaymentMethod;
  expenseDate: string;
  isRecurring: boolean;
}

export interface ExpenseFilterRequest {
  month?: number;
  year?: number;
  category?: ExpenseCategory;
  paymentMethod?: PaymentMethod;
  minAmount?: number;
  maxAmount?: number;
  isRecurring?: boolean;
  search?: string;
}

export interface ExpenseSummaryResponse {
  totalAmount: number;
  totalFormatted: string;
  totalTransactions: number;
  categoryBreakdown: Record<ExpenseCategory, number>;
  categoryBreakdownFormatted: Record<ExpenseCategory, string>;
  highestExpense: Expense | null;
  month?: number;
  year?: number;
}

export const expenseApi = {
  create: (data: ExpenseRequest) =>
    apiClient.post<Expense>("/api/expenses", data).then((r) => r.data),

  getAll: () => apiClient.get<Expense[]>("/api/expenses").then((r) => r.data),

  getFiltered: (filter: ExpenseFilterRequest) =>
    apiClient
      .post<Expense[]>("/api/expenses/filter", filter)
      .then((r) => r.data),

  getByMonthYear: (month: number, year: number) =>
    apiClient
      .get<Expense[]>(`/api/expenses/month?month=${month}&year=${year}`)
      .then((r) => r.data),

  getMonthlySummary: (month: number, year: number) =>
    apiClient
      .get<ExpenseSummaryResponse>(
        `/api/expenses/summary/month?month=${month}&year=${year}`,
      )
      .then((r) => r.data),

  getYearlySummary: (year: number) =>
    apiClient
      .get<ExpenseSummaryResponse>(`/api/expenses/summary/year?year=${year}`)
      .then((r) => r.data),

  getAvailableYears: () =>
    apiClient.get<number[]>("/api/expenses/years").then((r) => r.data),

  getCurrentMonthStats: () =>
    apiClient
      .get<Record<string, unknown>>("/api/expenses/stats/current")
      .then((r) => r.data),

  update: (id: number, data: ExpenseRequest) =>
    apiClient.put<Expense>(`/api/expenses/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete(`/api/expenses/${id}`).then((r) => r.data),
};

// ─── Display helpers ──────────────────────────────────────────────────────────

export const CATEGORY_META: Record<
  ExpenseCategory,
  { label: string; emoji: string; color: string; bg: string; border: string }
> = {
  FOOD: {
    label: "Food",
    emoji: "🍽️",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
  },
  TRANSPORT: {
    label: "Transport",
    emoji: "🚗",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
  },
  ENTERTAINMENT: {
    label: "Entertainment",
    emoji: "🎬",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
  },
  SHOPPING: {
    label: "Shopping",
    emoji: "🛍️",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/30",
  },
  HEALTH: {
    label: "Health",
    emoji: "💊",
    color: "text-jade-400",
    bg: "bg-jade-500/10",
    border: "border-jade-500/30",
  },
  UTILITIES: {
    label: "Utilities",
    emoji: "⚡",
    color: "text-saffron-400",
    bg: "bg-saffron-500/10",
    border: "border-saffron-500/30",
  },
  EDUCATION: {
    label: "Education",
    emoji: "📚",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
  },
  RENT: {
    label: "Rent",
    emoji: "🏠",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
  },
  SAVINGS: {
    label: "Savings",
    emoji: "💰",
    color: "text-jade-400",
    bg: "bg-jade-500/10",
    border: "border-jade-500/30",
  },
  OTHER: {
    label: "Other",
    emoji: "📦",
    color: "text-[#8ba3c7]",
    bg: "bg-navy-700/40",
    border: "border-white/10",
  },
};

export const PAYMENT_META: Record<
  PaymentMethod,
  { label: string; emoji: string }
> = {
  CASH: { label: "Cash", emoji: "💵" },
  UPI: { label: "UPI", emoji: "📱" },
  CREDIT_CARD: { label: "Credit Card", emoji: "💳" },
  DEBIT_CARD: { label: "Debit Card", emoji: "💳" },
  NET_BANKING: { label: "Net Banking", emoji: "🏦" },
  OTHER: { label: "Other", emoji: "💸" },
};

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function formatRupees(amount: number): string {
  return (
    "₹" +
    amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}
