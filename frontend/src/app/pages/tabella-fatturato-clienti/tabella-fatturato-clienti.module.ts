import { CurrencyPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { WidgetDirective } from 'src/app/directives/widget.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { TabellaFatturatoClientiRoutingModule } from './tabella-fatturato-clienti-routing.module';
import { TabellaFatturatoClientiComponent } from './tabella-fatturato-clienti.component';

@NgModule({
  declarations: [TabellaFatturatoClientiComponent],
  imports: [SharedModule, TabellaFatturatoClientiRoutingModule, WidgetDirective],
  providers: [CurrencyPipe]
})
export class TabellaFatturatoClientiModule {}
