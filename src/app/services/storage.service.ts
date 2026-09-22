// ============================================================
//  StorageService
//  Envoltorio de Ionic Storage (persistencia en el dispositivo).
//  Inicializa el almacén una sola vez y ofrece get/set/remove.
// ============================================================
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private _storage: Storage | null = null;
  private ready: Promise<void>;

  constructor(private storage: Storage) {
    // Se crea el almacén una sola vez; el resto de métodos esperan a que esté listo
    this.ready = this.init();
  }

  private async init(): Promise<void> {
    this._storage = await this.storage.create();
  }

  async get<T>(key: string): Promise<T | null> {
    await this.ready;
    const value = await this._storage!.get(key);
    return (value ?? null) as T | null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.ready;
    await this._storage!.set(key, value);
  }

  async remove(key: string): Promise<void> {
    await this.ready;
    await this._storage!.remove(key);
  }
}
