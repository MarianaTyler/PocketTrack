import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import axios from 'axios';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {

  email = '';
  password = '';
  error = '';
  loading = false;

  private apiUrl = 'http://localhost:8080/login-api';

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private auth: AuthService
  ) {}

  async login(): Promise<void> {
    this.error = '';

    if (!this.email || !this.password) {
      this.error = 'Completa email y contraseña';
      return;
    }

    this.loading = true;

    try {
      const res = await axios.post(`${this.apiUrl}/login.php`, {
        email: this.email,
        password: this.password,
      });

      const data = res.data;
      if (data.ok) {
        this.auth.setUser(data.user);
        this.router.navigateByUrl('/tabs/tab2');
      } else {
        this.error = data.error || 'No se pudo iniciar sesión';
      }
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 401 || status === 422) {
        this.error = err.response?.data?.error || 'Credenciales incorrectas';
      } else if (!err.response) {
        this.error = 'No se pudo conectar con el servidor';
      } else {
        this.error = err.response?.data?.error || 'Ocurrió un error inesperado';
      }
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  goToRegister(): void {
    this.router.navigateByUrl('/tabs/tab1');
  }
}
