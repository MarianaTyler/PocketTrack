// ============================================================
//  ExpenseService
//  Acceso a datos de gastos: un método por cada verbo HTTP del
//  endpoint expenses.php (GET, POST, PUT, PATCH, DELETE, HEAD,
//  OPTIONS). Usa axios, igual que el resto del proyecto.
// ============================================================
import { Injectable } from '@angular/core';
import axios, { AxiosInstance } from 'axios';
import { environment } from '../../environments/environment';
import { ApiResponse, Expense, NewExpense } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {

  // Instancia de axios ya configurada con la URL base, para no
  // repetir el host en cada método.
  private api: AxiosInstance = axios.create({
    baseURL: environment.apiUrl,
    headers: { 'Content-Type': 'application/json' },
  });

  // GET -> lista de gastos de un usuario
  async getExpenses(userId: number): Promise<Expense[]> {
    const res = await this.api.get<ApiResponse<Expense[]>>('/expenses.php', {
      params: { user_id: userId },
    });
    // res.data es la envoltura { ok, data }; res.data.data es el arreglo real
    return res.data.data ?? [];
  }

  // GET -> un solo gasto por id (null si no existe)
  async getExpense(id: number): Promise<Expense | null> {
    try {
      const res = await this.api.get<ApiResponse<Expense>>('/expenses.php', {
        params: { id },
      });
      return res.data.data ?? null;
    } catch (err: any) {
      if (err.response?.status === 404) return null;
      throw err;
    }
  }

  // POST -> crear un gasto
  async createExpense(payload: NewExpense): Promise<Expense> {
    const res = await this.api.post<ApiResponse<Expense>>('/expenses.php', payload);
    return res.data.data as Expense;
  }

  // PUT -> reemplazar por completo (hay que mandar TODOS los campos)
  async replaceExpense(id: number, payload: NewExpense): Promise<Expense> {
    const res = await this.api.put<ApiResponse<Expense>>('/expenses.php', payload, {
      params: { id },
    });
    return res.data.data as Expense;
  }

  // PATCH -> actualizar SOLO algunos campos
  async updateExpense(id: number, changes: Partial<NewExpense>): Promise<Expense> {
    const res = await this.api.patch<ApiResponse<Expense>>('/expenses.php', changes, {
      params: { id },
    });
    return res.data.data as Expense;
  }

  // DELETE -> borrar un gasto
  async deleteExpense(id: number): Promise<void> {
    await this.api.delete<ApiResponse<{ id: number }>>('/expenses.php', {
      params: { id },
    });
  }

  // HEAD -> saber si un gasto existe sin traer sus datos
  async expenseExists(id: number): Promise<boolean> {
    try {
      await this.api.head('/expenses.php', { params: { id } });
      return true; // 200 => existe
    } catch (err: any) {
      if (err.response?.status === 404) return false;
      throw err;
    }
  }

  // OPTIONS -> normalmente el navegador lo manda solo (preflight)
  // antes de un PATCH/PUT/DELETE. Se incluye de forma explícita solo
  // para demostrar el verbo; devuelve true si el servidor responde.
  async preflightOk(): Promise<boolean> {
    const res = await this.api.options('/expenses.php');
    return res.status === 200;
  }
}
