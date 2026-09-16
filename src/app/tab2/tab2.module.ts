import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicSharedModule } from '../ionic.shared.module';

import { Tab2Page } from './tab2.page';

const routes: Routes = [
  {
    path: '',
    component: Tab2Page,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicSharedModule,
    RouterModule.forChild(routes),
  ],
  declarations: [Tab2Page],
})
export class Tab2PageModule {}
