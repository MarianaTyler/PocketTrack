import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ExpenseRepository } from '../services/expense.repository';
import { CategoryRepository } from '../services/category.repository';
import { Category, NewExpense, PaymentMethod } from '../models';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page implements OnInit {

  categories: Category[] = [];

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
    private expenseRepo: ExpenseRepository,
    private categoryRepo: CategoryRepository,
    private cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      this.categories = await this.categoryRepo.list();
    } catch {
      this.message = 'No se pudieron cargar las categorías';
      this.messageType = 'error';
    } finally {
      this.cdr.detectChanges();
    }
  }

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
      await this.expenseRepo.add(payload); // guarda local + encola sincronización
      this.message = 'Gasto guardado ✅';
      this.messageType = 'success';
      this.resetForm();
    } catch (err: any) {
      this.message = 'No se pudo guardar el gasto';
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
