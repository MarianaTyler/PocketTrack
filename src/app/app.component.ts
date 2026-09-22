import { Component } from '@angular/core';
import { addIcons } from 'ionicons';
import { closeCircle, checkmarkCircle } from 'ionicons/icons';
import { ConnectionService } from './services/connection.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  // public para poder leer conn.status() en la plantilla
  constructor(public conn: ConnectionService) {
    addIcons({ closeCircle, checkmarkCircle });
  }
}
