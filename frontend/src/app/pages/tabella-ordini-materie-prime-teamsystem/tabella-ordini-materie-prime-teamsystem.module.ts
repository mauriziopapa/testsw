import { CurrencyPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { WidgetDirective } from 'src/app/directives/widget.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { TabellaOrdiniMateriePrimeTeamSystemRoutingModule } from './tabella-ordini-materie-prime-teamsystem-routing.module';
import { TabellaOrdiniMateriePrimeTeamSystemComponent } from './tabella-ordini-materie-prime-teamsystem.component';

@NgModule({
  declarations: [TabellaOrdiniMateriePrimeTeamSystemComponent],
  imports: [SharedModule, TabellaOrdiniMateriePrimeTeamSystemRoutingModule, WidgetDirective],
  providers: [CurrencyPipe]
})
export class TabellaOrdiniMateriePrimeTeamSystemModule {}
