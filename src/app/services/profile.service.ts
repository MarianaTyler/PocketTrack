// ============================================================
//  ProfileService
//  Lee, actualiza y elimina el perfil del usuario vía la API.
// ============================================================
import { Injectable } from '@angular/core';
import axios, { AxiosInstance } from 'axios';
import { environment } from '../../environments/environment';
import { ApiResponse, User } from '../models';

// Datos editables del perfil (password es opcional: solo si se cambia)
export interface ProfileUpdate {
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  email: string;
  password?: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private api: AxiosInstance = axios.create({
    baseURL: environment.apiUrl,
    headers: { 'Content-Type': 'application/json' },
  });

  async getProfile(id: number): Promise<User | null> {
    const res = await this.api.get<ApiResponse<User>>('/profile.php', { params: { id } });
    return res.data.data ?? null;
  }

  async updateProfile(id: number, data: ProfileUpdate): Promise<User> {
    const res = await this.api.put<ApiResponse<User>>('/profile.php', data, { params: { id } });
    return res.data.data as User;
  }

  async deleteProfile(id: number): Promise<void> {
    await this.api.delete<ApiResponse<{ id: number }>>('/profile.php', { params: { id } });
  }
}
