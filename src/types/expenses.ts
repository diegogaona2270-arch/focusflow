export const EXPENSE_CATEGORIES = [
  { id: "gym", name: "Gym", icon: "💪", color: "#f97316" },
  { id: "comida", name: "Comida", icon: "🍔", color: "#ef4444" },
  { id: "nafta", name: "Nafta", icon: "⛽", color: "#f59e0b" },
  { id: "seguro", name: "Seguro", icon: "🛡️", color: "#6366f1" },
  { id: "servicios", name: "Servicios", icon: "💡", color: "#0ea5e9" },
  { id: "salud", name: "Salud", icon: "❤️", color: "#ec4899" },
  { id: "transporte", name: "Transporte", icon: "🚗", color: "#8b5cf6" },
  { id: "entretenimiento", name: "Entretenimiento", icon: "🎬", color: "#10b981" },
  { id: "impuestos", name: "Impuestos", icon: "📋", color: "#6b7280" },
  { id: "compras", name: "Compras", icon: "🛒", color: "#14b8a6" },
  { id: "hogar", name: "Hogar", icon: "🏠", color: "#84cc16" },
  { id: "educacion", name: "Educación", icon: "📚", color: "#a855f7" },
  { id: "otros", name: "Otros", icon: "📦", color: "#9ca3af" },
] as const;

export type ExpenseCategoryId = typeof EXPENSE_CATEGORIES[number]["id"] | string;

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  categoryId: ExpenseCategoryId;
  description?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseCreateInput = Omit<Expense, "id" | "userId" | "createdAt" | "updatedAt">;
export type ExpenseUpdateInput = Partial<ExpenseCreateInput>;

export interface ExpenseStats {
  today: number;
  week: number;
  month: number;
  year: number;
  byCategory: { categoryId: string; total: number; pct: number }[];
  dailyAvgMonth: number;
  projectedMonth: number;
  topCategory: string | null;
  monthlyHistory: { month: string; total: number }[];
}
