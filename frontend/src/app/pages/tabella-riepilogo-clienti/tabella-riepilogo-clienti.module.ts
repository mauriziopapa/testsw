import { CurrencyPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { WidgetDirective } from 'src/app/directives/widget.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { TabellaRiepilogoClientiRoutingModule } from './tabella-riepilogo-clienti-routing.module';
import { TabellaRiepilogoClientiComponent } from './tabella-riepilogo-clienti.component';

@NgModule({
  declarations: [TabellaRiepilogoClientiComponent],
  imports: [SharedModule, TabellaRiepilogoClientiRoutingModule, WidgetDirective],
  providers: [CurrencyPipe]
})
export class TabellaRiepilogoClientiModule {}
