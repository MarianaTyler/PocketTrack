import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicSharedModule } from '../ionic.shared.module';
import { ProfilePage } from './profile.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicSharedModule,
    RouterModule.forChild([{ path: '', component: ProfilePage }]),
  ],
  declarations: [ProfilePage],
})
export class ProfilePageModule {}
