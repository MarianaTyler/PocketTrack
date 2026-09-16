// ============================================================
//  Expense
//  Modela un registro de la tabla `expenses`.
// ============================================================
import { PaymentMethod } from './payment-method';

// Un gasto tal como lo DEVUELVE la API (coincide 1:1 con las
// columnas de la tabla `expenses`).
export interface Expense {
  id: number;
  user_id: number;
  category_id: number;
  description: string;
  amount: number;
  note: string | null;
  payment_method: PaymentMethod;
  date: string;        // formato 'YYYY-MM-DD'
  created_at: string;  // momento en que se guardó el registro
}

// Datos para CREAR un gasto (POST): todavía no existen `id` ni
// `created_at`, esos los genera la base de datos.
export interface NewExpense {
  user_id: number;
  category_id: number;
  description: string;
  amount: number;
  note?: string | null;
  payment_method: PaymentMethod;
  date: string;
}
