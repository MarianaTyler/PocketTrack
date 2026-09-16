import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { calendarOutline, receiptOutline } from 'ionicons/icons';
import { AuthService } from '../services/auth.service';

// Elemento provisional para mostrar en "Últimos gastos".
// (Cuando conectemos el Home a la API, se reemplaza por Expense[].)
interface RecentItem {
  icon: string;
  category: string;
  amount: number;
  date: string;
}

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page implements OnInit {

  userName = '';
  totalExpenses = 3250.0;
  monthExpenses = 1850.0;

  recentExpenses: RecentItem[] = [
    { icon: '🍔', category: 'Comida',          amount: 250, date: '10 sep 2026' },
    { icon: '🚕', category: 'Transporte',      amount: 120, date: '11 sep 2026' },
    { icon: '🎮', category: 'Entretenimiento', amount: 500, date: '12 sep 2026' },
  ];

  constructor(private auth: AuthService, private router: Router) {
    addIcons({ calendarOutline, receiptOutline });
  }

  ngOnInit(): void {
    const user = this.auth.getUser();
    this.userName = user?.['first_name'] || user?.email || 'Usuario';
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
