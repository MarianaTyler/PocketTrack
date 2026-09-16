// ============================================================
//  CategoryService
//  Lectura de las categorías (solo GET). Sirve para llenar el
//  selector de categorías del formulario de gastos.
// ============================================================
import { Injectable } from '@angular/core';
import axios, { AxiosInstance } from 'axios';
import { environment } from '../../environments/environment';
import { ApiResponse, Category } from '../models';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {

  private api: AxiosInstance = axios.create({
    baseURL: environment.apiUrl,
    headers: { 'Content-Type': 'application/json' },
  });

  // GET -> todas las categorías (globales, incluida "Personalizada")
  async getCategories(): Promise<Category[]> {
    const res = await this.api.get<ApiResponse<Category[]>>('/categories.php');
    return res.data.data ?? [];
  }
}
