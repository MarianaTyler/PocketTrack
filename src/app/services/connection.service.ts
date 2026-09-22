// ============================================================
//  ConnectionService
//  Detecta el estado de conexión escuchando los eventos
//  'online' / 'offline' del navegador y lo expone como signal.
//
//  Estados:
//    'online'  -> conectado (no se muestra nada)
//    'offline' -> sin conexión (aviso rojo, persiste)
//    'back'    -> acaba de reconectar (aviso verde, ~3s y se va)
// ============================================================
import { Injectable, signal } from '@angular/core';

export type ConnStatus = 'online' | 'offline' | 'back';

@Injectable({ providedIn: 'root' })
export class ConnectionService {
  // signal: en modo zoneless, la vista se actualiza sola al cambiarlo
  readonly status = signal<ConnStatus>(navigator.onLine ? 'online' : 'offline');

  private backTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    window.addEventListener('offline', () => this.goOffline());
    window.addEventListener('online', () => this.goBackOnline());
  }

  private goOffline(): void {
    if (this.backTimer) {
      clearTimeout(this.backTimer);
      this.backTimer = null;
    }
    this.status.set('offline');
  }

  private goBackOnline(): void {
    this.status.set('back'); // muestra el verde "De vuelta en línea"
    if (this.backTimer) clearTimeout(this.backTimer);
    this.backTimer = setTimeout(() => this.status.set('online'), 3000); // luego se oculta
  }
}
