// ============================================================
//  IonicSharedModule
//  Reúne los componentes standalone de Ionic que usa la app y
//  los reexporta, para importarlos de un solo lugar en cada
//  módulo de página. Sustituye al IonicModule (deprecado) sin
//  cambiar la arquitectura de NgModules del proyecto.
// ============================================================
import { NgModule } from '@angular/core';
import {
  IonApp,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonLabel,
  IonModal,
  IonRouterOutlet,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';

const IONIC_COMPONENTS = [
  IonApp,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonLabel,
  IonModal,
  IonRouterOutlet,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonTextarea,
  IonTitle,
  IonToolbar,
];

@NgModule({
  imports: IONIC_COMPONENTS,
  exports: IONIC_COMPONENTS,
})
export class IonicSharedModule {}
