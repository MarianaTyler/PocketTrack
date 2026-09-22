import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { ProfileService, ProfileUpdate } from '../services/profile.service';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit {

  form = {
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    email: '',
    password: '',
  };

  saving = false;
  message = '';
  messageType: 'success' | 'error' | '' = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private profile: ProfileService,
    private storage: StorageService,
    private alertCtrl: AlertController,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    void this.loadProfile();
  }

  ionViewWillEnter(): void {
    void this.loadProfile();
  }

  // Prellena el formulario con lo ÚLTIMO guardado.
  // Intenta leer el perfil completo desde la API (trae todos los
  // campos); si no hay conexión, usa la sesión local como respaldo.
  private async loadProfile(): Promise<void> {
    const id = this.auth.getUser()?.id;

    if (id) {
      try {
        const user = await this.profile.getProfile(id);
        if (user) {
          // Refresca la sesión local con los datos completos y actuales
          const current = this.auth.getUser() ?? {};
          this.auth.setUser({ ...current, ...user });
          this.fillFrom(user);
          this.clearMessage();
          return;
        }
      } catch {
        // sin conexión: se usa el respaldo local
      }
    }

    this.fillFrom(this.auth.getUser());
    this.clearMessage();
  }

  // Copia los campos al formulario (la contraseña SIEMPRE queda vacía)
  private fillFrom(u: any): void {
    this.form.first_name = u?.first_name ?? '';
    this.form.last_name = u?.last_name ?? '';
    this.form.phone = u?.phone ?? '';
    this.form.address = u?.address ?? '';
    this.form.email = u?.email ?? '';
    this.form.password = '';
  }

  private clearMessage(): void {
    this.message = '';
    this.messageType = '';
    this.cdr.detectChanges();
  }

  async save(): Promise<void> {
    this.message = '';
    this.messageType = '';

    const id = this.auth.getUser()?.id;
    if (!id) {
      this.message = 'Sesión no válida, vuelve a iniciar sesión';
      this.messageType = 'error';
      return;
    }
    if (!this.form.email.trim()) {
      this.message = 'El correo es obligatorio';
      this.messageType = 'error';
      return;
    }

    const data: ProfileUpdate = {
      first_name: this.form.first_name.trim(),
      last_name: this.form.last_name.trim(),
      phone: this.form.phone.trim(),
      address: this.form.address.trim(),
      email: this.form.email.trim(),
    };
    if (this.form.password.trim()) {
      data.password = this.form.password.trim();
    }

    this.saving = true;
    this.cdr.detectChanges();

    try {
      const updated = await this.profile.updateProfile(id, data);
      // Actualiza la sesión local para que el resto de la app lo refleje
      const current = this.auth.getUser() ?? {};
      this.auth.setUser({ ...current, ...updated });
      this.form.password = '';
      this.message = 'Perfil actualizado ✅';
      this.messageType = 'success';
    } catch (err: any) {
      this.message = err.response?.data?.error || 'No se pudo actualizar (¿sin conexión?)';
      this.messageType = 'error';
    } finally {
      this.saving = false;
      this.cdr.detectChanges();
    }
  }

  async confirmDelete(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar perfil',
      message: 'Esto borrará tu cuenta y todos tus gastos. Esta acción no se puede deshacer. ¿Continuar?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => { void this.doDelete(); } },
      ],
    });
    await alert.present();
  }

  private async doDelete(): Promise<void> {
    const id = this.auth.getUser()?.id;
    if (!id) return;
    try {
      await this.profile.deleteProfile(id);
      await this.storage.remove('expenses_cache');
      await this.storage.remove('expenses_outbox');
      this.auth.logout();
      this.router.navigateByUrl('/login');
    } catch (err: any) {
      this.message = 'No se pudo eliminar (¿sin conexión?)';
      this.messageType = 'error';
      this.cdr.detectChanges();
    }
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
