import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    // Si hay sesión, deja pasar
    if (this.auth.isLoggedIn()) {
      return true;
    }
    // Si no, rebota al login
    return this.router.createUrlTree(['/login']);
  }
}
