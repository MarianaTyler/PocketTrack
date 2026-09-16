import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import axios from 'axios';
import { AuthService } from '../services/auth.service';

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

  private apiUrl = 'http://localhost:8080/login-api';

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private auth: AuthService
  ) {}

  next(): void {
    if (this.currentStep < this.totalSteps - 1) { this.currentStep++; }
  }

  previous(): void {
    if (this.currentStep > 0) { this.currentStep--; }
  }

  getStepClass(index: number): 'done' | 'active' | 'upcoming' {
    if (index === this.currentStep) return 'active';
    return index < this.currentStep ? 'done' : 'upcoming';
  }

  async onSubmit(): Promise<void> {
    this.error = '';

    if (!this.email || !this.password) {
      this.error = 'El email y la contraseña son obligatorios';
      this.currentStep = 0;
      this.cdr.detectChanges();
      return;
    }

    if (this.password !== this.cpass) {
      this.error = 'Las contraseñas no coinciden';
      this.currentStep = 0;
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;

    try {
      const res = await axios.post(`${this.apiUrl}/register.php`, {
        email: this.email,
        password: this.password,
        first_name: this.fname,
        last_name: this.lname,
        phone: this.phone,
        address: this.address,
        twitter: this.twitter,
        facebook: this.facebook,
        gplus: this.gplus,
      });

      const data = res.data;
      if (data.ok) {
        this.auth.setUser({ id: data.id, email: this.email });
        this.router.navigateByUrl('/tabs/tab2');
      } else {
        this.error = data.error || 'No se pudo registrar';
      }
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 409) {
        this.error = 'Ese email ya está registrado';
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
