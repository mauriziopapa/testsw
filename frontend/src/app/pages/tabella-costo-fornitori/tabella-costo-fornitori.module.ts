import { CurrencyPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { WidgetDirective } from 'src/app/directives/widget.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { TabellaCostoFornitoriRoutingModule } from './tabella-costo-fornitori-routing.module';
import { TabellaCostoFornitoriComponent } from './tabella-costo-fornitori.component';

@NgModule({
  declarations: [TabellaCostoFornitoriComponent],
  imports: [SharedModule, TabellaCostoFornitoriRoutingModule, WidgetDirective],
  providers: [CurrencyPipe]
})
export class TabellaCostoFornitoriModule {}
