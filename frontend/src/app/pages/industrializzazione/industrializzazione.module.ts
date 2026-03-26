import { NgModule } from '@angular/core';
import { WidgetDirective } from 'src/app/directives/widget.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { IndustrializzazioneRoutingModule } from './industrializzazione-routing.module';
import { IndustrializzazioneComponent } from './industrializzazione.component';

@NgModule({
  declarations: [IndustrializzazioneComponent],
  imports: [SharedModule, IndustrializzazioneRoutingModule, WidgetDirective]
})
export class IndustrializzazioneeModule {}
