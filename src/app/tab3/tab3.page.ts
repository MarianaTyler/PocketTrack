import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ExpenseService } from '../services/expense.service';
import { CategoryService } from '../services/category.service';
import { Category, NewExpense, PaymentMethod } from '../models';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page implements OnInit {

  categories: Category[] = [];

  // Modelo del formulario (enlazado con [(ngModel)])
  form = {
    description: '',
    amount: null as number | null,
    category_id: null as number | null,
    payment_method: 'efectivo' as PaymentMethod,
    date: this.today(),
    note: '',
  };

  saving = false;
  message = '';
  messageType: 'success' | 'error' | '' = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private expenseApi: ExpenseService,
    private categoryApi: CategoryService,
    private cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    // Cargar las categorías para el selector
    try {
      this.categories = await this.categoryApi.getCategories();
    } catch {
      this.message = 'No se pudieron cargar las categorías';
      this.messageType = 'error';
    } finally {
      this.cdr.detectChanges();
    }
  }

  // Fecha de hoy en formato 'YYYY-MM-DD'
  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  async save(): Promise<void> {
    this.message = '';
    this.messageType = '';

    const userId = this.auth.getUser()?.id;
    if (!userId) {
      this.message = 'Sesión no válida, vuelve a iniciar sesión';
      this.messageType = 'error';
      return;
    }

    const amount = Number(this.form.amount);

    // Validación mínima en el cliente
    if (!this.form.description.trim() || !amount || amount <= 0 || !this.form.category_id) {
      this.message = 'Completa descripción, monto y categoría';
      this.messageType = 'error';
      return;
    }

    const payload: NewExpense = {
      user_id: userId,
      category_id: this.form.category_id,
      description: this.form.description.trim(),
      amount,
      payment_method: this.form.payment_method,
      date: this.form.date,
      note: this.form.note.trim() || null,
    };

    this.saving = true;
    this.cdr.detectChanges();

    try {
      await this.expenseApi.createExpense(payload);
      this.message = 'Gasto guardado ✅';
      this.messageType = 'success';
      this.resetForm();
    } catch (err: any) {
      this.message = err.response?.data?.error || 'No se pudo guardar el gasto';
      this.messageType = 'error';
    } finally {
      this.saving = false;
      this.cdr.detectChanges();
    }
  }

  private resetForm(): void {
    this.form = {
      description: '',
      amount: null,
      category_id: null,
      payment_method: 'efectivo',
      date: this.today(),
      note: '',
    };
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
