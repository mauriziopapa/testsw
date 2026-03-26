import { NgModule } from '@angular/core';
import { CommercialeComponent } from './commerciale.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { CommercialeRoutingModule } from './commerciale-routing.module';
import { WidgetDirective } from 'src/app/directives/widget.directive';

@NgModule({
  declarations: [CommercialeComponent],
  imports: [SharedModule, CommercialeRoutingModule, WidgetDirective]
})
export class CommercialeModule {}
