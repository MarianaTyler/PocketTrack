import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { calendarOutline, receiptOutline, trashOutline, createOutline } from 'ionicons/icons';
import { AuthService } from '../services/auth.service';
import { ExpenseRepository } from '../services/expense.repository';
import { CategoryRepository } from '../services/category.repository';
import { StorageService } from '../services/storage.service';
import { Category, Expense, NewExpense, PaymentMethod } from '../models';

type DateFilter = 'all' | 'week' | 'month' | '3months' | 'year';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page implements OnInit {

  userName = '';
  expenses: Expense[] = [];   // lista completa (para los totales)
  filtered: Expense[] = [];   // lista mostrada (con filtros aplicados)
  categories: Category[] = [];
  totalExpenses = 0;
  monthExpenses = 0;
  pending = 0;

  // ----- Filtros (persistentes) -----
  dateFilter: DateFilter = 'all';
  categoryFilter: number | 'all' = 'all';
  private readonly FILTER_KEY = 'home_filter';

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
    private storage: StorageService,
    private alertCtrl: AlertController,
    private cdr: ChangeDetectorRef,
  ) {
    addIcons({ calendarOutline, receiptOutline, trashOutline, createOutline });
  }

  ngOnInit(): void {
    // La carga (incluido el nombre del usuario) se hace en ionViewWillEnter,
    // que corre en la primera entrada y cada vez que se vuelve a la pestaña.
    // Así el saludo se actualiza si inicia sesión un usuario distinto.
  }

  ionViewWillEnter(): void {
    void this.load();
  }

  private async load(): Promise<void> {
    const user = this.auth.getUser();
    this.userName = user?.['first_name'] || user?.email || 'Usuario';
    const userId = user?.id ?? 0;

    this.categories = await this.categoryRepo.list();
    this.catMap = new Map(this.categories.map((c) => [c.id, c.name]));

    this.expenses = await this.repo.list(userId);
    this.pending = await this.repo.pendingCount();

    await this.loadFilter();  // restaura filtros guardados
    this.applyFilter();       // aplica filtros a la lista mostrada
    this.recompute();         // totales (sobre la lista completa)
    this.cdr.detectChanges();
  }

  // ---------- Filtros ----------
  async onFilterChange(): Promise<void> {
    await this.saveFilter();
    this.applyFilter();
    this.cdr.detectChanges();
  }

  async clearFilters(): Promise<void> {
    this.dateFilter = 'all';
    this.categoryFilter = 'all';
    await this.saveFilter();
    this.applyFilter();
    this.cdr.detectChanges();
  }

  get filtersActive(): boolean {
    return this.dateFilter !== 'all' || this.categoryFilter !== 'all';
  }

  private applyFilter(): void {
    const cutoff = this.cutoffDate(this.dateFilter);
    this.filtered = this.expenses.filter((e) => {
      const okDate = !cutoff || (e.date || '') >= cutoff;
      const okCat = this.categoryFilter === 'all' || e.category_id === this.categoryFilter;
      return okDate && okCat;
    });
  }

  // Devuelve la fecha límite 'YYYY-MM-DD' del periodo (o null = sin límite)
  private cutoffDate(range: DateFilter): string | null {
    if (range === 'all') return null;
    const d = new Date();
    if (range === 'week') d.setDate(d.getDate() - 7);
    else if (range === 'month') d.setMonth(d.getMonth() - 1);
    else if (range === '3months') d.setMonth(d.getMonth() - 3);
    else if (range === 'year') d.setFullYear(d.getFullYear() - 1);
    return d.toISOString().slice(0, 10);
  }

  private async saveFilter(): Promise<void> {
    await this.storage.set(this.FILTER_KEY, {
      dateFilter: this.dateFilter,
      categoryFilter: this.categoryFilter,
    });
  }

  private async loadFilter(): Promise<void> {
    const f = await this.storage.get<{ dateFilter: DateFilter; categoryFilter: number | 'all' }>(this.FILTER_KEY);
    if (f) {
      this.dateFilter = f.dateFilter ?? 'all';
      this.categoryFilter = f.categoryFilter ?? 'all';
    }
  }

  private recompute(): void {
    const now = new Date().toISOString();
    const year = now.slice(0, 4); // 'YYYY'
    const ym = now.slice(0, 7);   // 'YYYY-MM'
    // "Gastos totales de este año": suma solo los gastos del año en curso
    this.totalExpenses = this.expenses
      .filter((e) => (e.date || '').slice(0, 4) === year)
      .reduce((s, e) => s + Number(e.amount), 0);
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
