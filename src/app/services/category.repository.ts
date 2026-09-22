// ============================================================
//  CategoryRepository
//  Lee las categorías de la API y las guarda en el dispositivo.
//  Si no hay conexión, devuelve la última copia local.
// ============================================================
import { Injectable } from '@angular/core';
import { CategoryService } from './category.service';
import { StorageService } from './storage.service';
import { Category } from '../models';

@Injectable({ providedIn: 'root' })
export class CategoryRepository {
  private readonly KEY = 'categories';

  constructor(private api: CategoryService, private storage: StorageService) {}

  async list(): Promise<Category[]> {
    try {
      const cats = await this.api.getCategories();  // desde la API
      await this.storage.set(this.KEY, cats);       // se cachea local
      return cats;
    } catch {
      // Sin conexión: usar lo último guardado
      return (await this.storage.get<Category[]>(this.KEY)) ?? [];
    }
  }
}
