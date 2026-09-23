import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import axios from 'axios';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';
import { NewUser } from '../models';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page {

  currentStep = 0;
  readonly totalSteps = 3;

  email = '';
  password = '';
  cpass = '';
  twitter = '';
  facebook = '';
  gplus = '';
  fname = '';
  lname = '';
  phone = '';
  address = '';

  error = '';
  loading = false;

  private apiUrl = environment.apiUrl;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private auth: AuthService,
  ) {}

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  // Valida el paso actual antes de avanzar. En el paso 1 exige
  // correo válido, contraseña de 6+ y que coincidan.
  next(): void {
    this.error = '';

    if (this.currentStep === 0) {
      if (!this.email.trim()) {
        this.error = 'El correo es obligatorio';
        this.cdr.detectChanges();
        return;
      }
      if (!this.isValidEmail(this.email)) {
        this.error = 'El correo no es válido';
        this.cdr.detectChanges();
        return;
      }
      if (this.password.length < 6) {
        this.error = 'La contraseña debe tener al menos 6 caracteres';
        this.cdr.detectChanges();
        return;
      }
      if (this.password !== this.cpass) {
        this.error = 'Las contraseñas no coinciden';
        this.cdr.detectChanges();
        return;
      }
    }

    if (this.currentStep < this.totalSteps - 1) {
      this.currentStep++;
      this.cdr.detectChanges();
    }
  }

  previous(): void {
    this.error = '';
    if (this.currentStep > 0) {
      this.currentStep--;
      this.cdr.detectChanges();
    }
  }

  goToLogin(): void {
    this.router.navigateByUrl('/login');
  }

  async onSubmit(): Promise<void> {
    this.error = '';

    // Revalida por si acaso (mismo criterio del paso 1)
    if (!this.isValidEmail(this.email) || this.password.length < 6 || this.password !== this.cpass) {
      this.error = 'Revisa el correo y la contraseña';
      this.currentStep = 0;
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    try {
      // Datos para CREAR el usuario, tipados con la interface NewUser
      // (lleva password; no lleva id ni created_at, esos los genera la BD)
      const payload: NewUser = {
        email: this.email,
        password: this.password,
        first_name: this.fname,
        last_name: this.lname,
        phone: this.phone,
        address: this.address,
        twitter: this.twitter,
        facebook: this.facebook,
        gplus: this.gplus,
      };

      const res = await axios.post(`${this.apiUrl}/register.php`, payload);

      const data = res.data;
      if (data.ok) {
        // Guarda la sesión con el nombre para que el saludo del inicio sea correcto
        this.auth.setUser({
          id: data.id,
          email: this.email,
          first_name: this.fname,
          last_name: this.lname,
          phone: this.phone,
          address: this.address,
        });
        this.router.navigateByUrl('/tabs/tab2');
      } else {
        this.error = data.error || 'No se pudo registrar';
      }
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 409) {
        this.error = 'Ese correo ya está registrado';
        this.currentStep = 0; // regresa al paso del correo para corregirlo
      } else if (status === 422) {
        this.error = err.response?.data?.error || 'Datos inválidos';
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
}
