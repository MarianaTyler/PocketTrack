import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicSharedModule } from '../ionic.shared.module';

import { Tab1Page } from './tab1.page';

const routes: Routes = [
  {
    path: '',
    component: Tab1Page,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicSharedModule,
    RouterModule.forChild(routes),
  ],
  declarations: [Tab1Page],
})
export class Tab1PageModule {}
