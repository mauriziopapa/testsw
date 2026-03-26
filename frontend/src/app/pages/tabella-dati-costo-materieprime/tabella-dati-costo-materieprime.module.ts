import { NgModule } from '@angular/core';
import { WidgetDirective } from 'src/app/directives/widget.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { TabellaDatiCostoMateriePrimeRoutingModule } from './tabella-dati-costo-materieprime-routing.module';
import { TabellaDatiCostoMateriePrimeComponent } from './tabella-dati-costo-materieprime.component';

@NgModule({
  declarations: [TabellaDatiCostoMateriePrimeComponent],
  imports: [SharedModule, TabellaDatiCostoMateriePrimeRoutingModule, WidgetDirective]
})
export class TabellaDatiCostoMateriePrimeModule {}
