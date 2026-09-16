import { Injectable } from '@angular/core';

export interface AuthUser {
  id?: number;
  email?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private STORAGE_KEY = 'user';

  // Guarda la sesión del usuario tras un login/registro correcto
  setUser(user: AuthUser): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
  }

  // Devuelve el usuario guardado, o null si no hay sesión
  getUser(): AuthUser | null {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  // ¿Hay una sesión activa?
  isLoggedIn(): boolean {
    return this.getUser() !== null;
  }

  // Cierra la sesión
  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
