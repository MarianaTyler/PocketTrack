// ============================================================
//  Expense
//  Modela un registro de la tabla `expenses`.
// ============================================================
import { PaymentMethod } from './payment-method';

// Un gasto tal como lo DEVUELVE la API 
export interface Expense {
  id: number;
  user_id: number;
  category_id: number;
  description: string;
  amount: number;
  note: string | null;
  payment_method: PaymentMethod;
  date: string;       
  created_at: string;  
}

// Datos para CREAR un gasto (POST)
export interface NewExpense {
  user_id: number;
  category_id: number;
  description: string;
  amount: number;
  note?: string | null;
  payment_method: PaymentMethod;
  date: string;
}
