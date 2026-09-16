import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicSharedModule } from '../ionic.shared.module';

import { ExploreContainerComponent } from './explore-container.component';

@NgModule({
  imports: [CommonModule, IonicSharedModule],
  declarations: [ExploreContainerComponent],
  exports: [ExploreContainerComponent],
})
export class ExploreContainerComponentModule {}
