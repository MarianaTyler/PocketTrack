import { Component } from '@angular/core';
import { addIcons } from 'ionicons';
import { homeOutline, addCircleOutline, personCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: false,
})
export class TabsPage {
  constructor() {
    // Hay que registrar cada icono que se usa en la plantilla
    addIcons({ homeOutline, addCircleOutline, personCircleOutline });
  }
}
