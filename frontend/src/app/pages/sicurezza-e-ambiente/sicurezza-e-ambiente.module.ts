import { NgModule } from '@angular/core';
import { WidgetDirective } from 'src/app/directives/widget.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { SicurezzaEAmbienteRoutingModule } from './sicurezza-e-ambiente-routing.module';
import { SicurezzaEAmbienteComponent } from './sicurezza-e-ambiente.component';

@NgModule({
  declarations: [SicurezzaEAmbienteComponent],
  imports: [SharedModule, SicurezzaEAmbienteRoutingModule, WidgetDirective]
})
export class SicurezzaEAmbienteModule {}
