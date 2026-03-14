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
  title: string;
  description?: string;
  category: ExpenseCategory;
  paymentMethod: PaymentMethod;
  expenseDate: string; // "YYYY-MM-DD"
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
  isRecurring?: boolean;
}

export interface ExpenseFilterRequest {
  month?: number;
  year?: number;
  category?: ExpenseCategory;
  paymentMethod?: PaymentMethod;
}

export interface ExpenseSummaryResponse {
  totalAmount: number;
  totalCount: number;
  highestExpense?: Expense;
  categoryBreakdown: Record<ExpenseCategory, number>;
  month?: number;
  year?: number;
}
