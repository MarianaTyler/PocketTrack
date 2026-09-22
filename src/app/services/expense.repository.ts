// ============================================================
//  ExpenseRepository (persistencia híbrida, "offline-first")
//
//  - "cache"  : lista de gastos guardada en el dispositivo (Ionic
//               Storage). Es lo que se MUESTRA; funciona sin conexión.
//  - "outbox" : cola de cambios pendientes de enviar a la API.
//
//  Cada operación (alta/edición/eliminación) se aplica primero a la
//  caché local (persistente) y se encola; cuando hay conexión se
//  envía a la API/MySQL. Así la información nunca se pierde al cerrar
//  la app y termina sincronizada con el servidor.
// ============================================================
import { Injectable } from '@angular/core';
import { ExpenseService } from './expense.service';
import { StorageService } from './storage.service';
import { Expense, NewExpense } from '../models';

type PendingOp =
  | { op: 'create'; tempId: number; data: NewExpense }
  | { op: 'update'; id: number; data: Partial<NewExpense> }
  | { op: 'delete'; id: number };

@Injectable({ providedIn: 'root' })
export class ExpenseRepository {
  private readonly CACHE = 'expenses_cache';
  private readonly OUTBOX = 'expenses_outbox';

  // Candado: evita que la sincronización corra dos veces a la vez
  // (p. ej. ngOnInit + ionViewWillEnter), lo que reenviaría el mismo
  // cambio y crearía gastos duplicados en la base.
  private syncing: Promise<void> | null = null;

  constructor(private api: ExpenseService, private storage: StorageService) {}

  // ---------- Lectura (consulta) ----------
  // Devuelve los gastos del usuario. Intenta sincronizar; si no se
  // puede (sin conexión), devuelve la copia local.
  async list(userId: number): Promise<Expense[]> {
    await this.flush(); // primero empuja lo pendiente

    const outbox = await this.getOutbox();
    if (navigator.onLine && outbox.length === 0) {
      try {
        const server = await this.api.getExpenses(userId); // fuente de verdad
        const cache = await this.getCache();
        const otherUsers = cache.filter((e) => e.user_id !== userId);
        await this.setCache([...otherUsers, ...server]);
      } catch {
        // sin conexión: se conserva la caché local
      }
    }

    const cache = await this.getCache();
    return cache
      .filter((e) => e.user_id === userId)
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.id - a.id));
  }

  // ---------- Alta ----------
  async add(data: NewExpense): Promise<void> {
    const tempId = -Date.now(); // id temporal (negativo) hasta que la API dé el real
    const temp: Expense = {
      id: tempId,
      user_id: data.user_id,
      category_id: data.category_id,
      description: data.description,
      amount: data.amount,
      note: data.note ?? null,
      payment_method: data.payment_method,
      date: data.date,
      created_at: new Date().toISOString(),
    };

    const cache = await this.getCache();
    await this.setCache([...cache, temp]);

    const outbox = await this.getOutbox();
    outbox.push({ op: 'create', tempId, data });
    await this.setOutbox(outbox);

    await this.flush();
  }

  // ---------- Modificación ----------
  async update(id: number, changes: Partial<NewExpense>): Promise<void> {
    const cache = await this.getCache();
    await this.setCache(cache.map((e) => (e.id === id ? { ...e, ...changes } : e)));

    const outbox = await this.getOutbox();
    if (id < 0) {
      // Aún no existe en el servidor: se edita el "create" pendiente
      for (const op of outbox) {
        if (op.op === 'create' && op.tempId === id) {
          op.data = { ...op.data, ...changes } as NewExpense;
        }
      }
    } else {
      outbox.push({ op: 'update', id, data: changes });
    }
    await this.setOutbox(outbox);

    await this.flush();
  }

  // ---------- Eliminación ----------
  async remove(id: number): Promise<void> {
    const cache = await this.getCache();
    await this.setCache(cache.filter((e) => e.id !== id));

    let outbox = await this.getOutbox();
    if (id < 0) {
      // Solo existía localmente: se descarta su "create" pendiente
      outbox = outbox.filter((op) => !(op.op === 'create' && op.tempId === id));
    } else {
      // Se quitan ediciones pendientes de ese id y se encola el borrado
      outbox = outbox.filter((op) => !(op.op === 'update' && op.id === id));
      outbox.push({ op: 'delete', id });
    }
    await this.setOutbox(outbox);

    await this.flush();
  }

  // ---------- Sincronización ----------
  // Envía a la API todos los cambios pendientes. Lo que falle
  // (por falta de conexión) se conserva para reintentar después.
  //
  // flush() usa el candado (this.syncing) para que dos llamadas casi
  // simultáneas NO reenvíen el mismo cambio: la segunda espera a la
  // primera en vez de volver a subirlo (evita gastos duplicados).
  async flush(): Promise<void> {
    if (this.syncing) {
      return this.syncing; // ya hay una sincronización en curso: reutilizarla
    }
    this.syncing = this.doFlush();
    try {
      await this.syncing;
    } finally {
      this.syncing = null;
    }
  }

  private async doFlush(): Promise<void> {
    if (!navigator.onLine) return;

    let outbox = await this.getOutbox();
    if (outbox.length === 0) return;

    let cache = await this.getCache();
    const remaining: PendingOp[] = [];

    for (const op of outbox) {
      try {
        if (op.op === 'create') {
          const created = await this.api.createExpense(op.data);
          cache = cache.map((e) => (e.id === op.tempId ? created : e)); // temp -> id real
        } else if (op.op === 'update') {
          await this.api.updateExpense(op.id, op.data);
        } else if (op.op === 'delete') {
          await this.api.deleteExpense(op.id);
        }
      } catch {
        remaining.push(op); // se reintentará en la próxima sincronización
      }
    }

    await this.setCache(cache);
    await this.setOutbox(remaining);
  }

  // Cantidad de cambios sin sincronizar (para mostrar en la UI)
  async pendingCount(): Promise<number> {
    return (await this.getOutbox()).length;
  }

  // ---------- Helpers de almacenamiento ----------
  private async getCache(): Promise<Expense[]> {
    return (await this.storage.get<Expense[]>(this.CACHE)) ?? [];
  }
  private async setCache(list: Expense[]): Promise<void> {
    await this.storage.set(this.CACHE, list);
  }
  private async getOutbox(): Promise<PendingOp[]> {
    return (await this.storage.get<PendingOp[]>(this.OUTBOX)) ?? [];
  }
  private async setOutbox(list: PendingOp[]): Promise<void> {
    await this.storage.set(this.OUTBOX, list);
  }
}
