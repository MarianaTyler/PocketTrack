import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { calendarOutline, receiptOutline, trashOutline, createOutline } from 'ionicons/icons';
import { AuthService } from '../services/auth.service';
import { ExpenseRepository } from '../services/expense.repository';
import { CategoryRepository } from '../services/category.repository';
import { Category, Expense, NewExpense, PaymentMethod } from '../models';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page implements OnInit {

  userName = '';
  expenses: Expense[] = [];
  categories: Category[] = [];
  totalExpenses = 0;
  monthExpenses = 0;
  pending = 0;

  private catMap = new Map<number, string>();

  // ----- Estado del modal de edición -----
  editOpen = false;
  editSaving = false;
  editMessage = '';
  editForm = {
    id: 0,
    description: '',
    amount: null as number | null,
    category_id: null as number | null,
    payment_method: 'efectivo' as PaymentMethod,
    date: '',
    note: '',
  };

  constructor(
    private auth: AuthService,
    private router: Router,
    private repo: ExpenseRepository,
    private categoryRepo: CategoryRepository,
    private alertCtrl: AlertController,
    private cdr: ChangeDetectorRef,
  ) {
    addIcons({ calendarOutline, receiptOutline, trashOutline, createOutline });
  }

  ngOnInit(): void {
    const user = this.auth.getUser();
    this.userName = user?.['first_name'] || user?.email || 'Usuario';
    // La carga de datos se hace en ionViewWillEnter (que también corre
    // en la primera entrada), para no lanzar dos cargas por entrada.
  }

  // Ionic llama esto cada vez que se entra a la pestaña -> se refresca
  ionViewWillEnter(): void {
    void this.load();
  }

  private async load(): Promise<void> {
    const userId = this.auth.getUser()?.id ?? 0;

    this.categories = await this.categoryRepo.list();
    this.catMap = new Map(this.categories.map((c) => [c.id, c.name]));

    this.expenses = await this.repo.list(userId);
    this.pending = await this.repo.pendingCount();
    this.recompute();
    this.cdr.detectChanges();
  }

  private recompute(): void {
    const ym = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
    this.totalExpenses = this.expenses.reduce((s, e) => s + Number(e.amount), 0);
    this.monthExpenses = this.expenses
      .filter((e) => (e.date || '').slice(0, 7) === ym)
      .reduce((s, e) => s + Number(e.amount), 0);
  }

  nameFor(id: number): string {
    return this.catMap.get(id) ?? 'Sin categoría';
  }

  emojiFor(id: number): string {
    const map: Record<string, string> = {
      Comida: '🍔', Transporte: '🚕', Entretenimiento: '🎮',
      Hogar: '🏠', Salud: '💊', Otros: '📦', Personalizada: '⭐',
    };
    return map[this.nameFor(id)] ?? '💸';
  }

  // ---------- Edición (modal) ----------
  openEdit(e: Expense): void {
    this.editForm = {
      id: e.id,
      description: e.description,
      amount: e.amount,
      category_id: e.category_id,
      payment_method: e.payment_method,
      date: e.date,
      note: e.note ?? '',
    };
    this.editMessage = '';
    this.editOpen = true;
    this.cdr.detectChanges();
  }

  closeEdit(): void {
    this.editOpen = false;
    this.cdr.detectChanges();
  }

  async saveEdit(): Promise<void> {
    this.editMessage = '';
    const amount = Number(this.editForm.amount);
    if (!this.editForm.description.trim() || !amount || amount <= 0 || !this.editForm.category_id) {
      this.editMessage = 'Completa descripción, monto y categoría';
      return;
    }

    const changes: Partial<NewExpense> = {
      description: this.editForm.description.trim(),
      amount,
      category_id: this.editForm.category_id,
      payment_method: this.editForm.payment_method,
      date: this.editForm.date,
      note: this.editForm.note.trim() || null,
    };

    this.editSaving = true;
    this.cdr.detectChanges();
    try {
      await this.repo.update(this.editForm.id, changes);
      this.editOpen = false;
      await this.load();
    } catch {
      this.editMessage = 'No se pudo guardar el cambio';
    } finally {
      this.editSaving = false;
      this.cdr.detectChanges();
    }
  }

  // ---------- Eliminación ----------
  async confirmDelete(e: Expense): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar gasto',
      message: `¿Eliminar "${e.description}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => { void this.doDelete(e.id); } },
      ],
    });
    await alert.present();
  }

  private async doDelete(id: number): Promise<void> {
    await this.repo.remove(id);
    await this.load();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
