import { NgModule } from '@angular/core';
import { WidgetDirective } from 'src/app/directives/widget.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { TabellaDatiBudgetRoutingModule } from './tabella-dati-budget-routing.module';
import { TabellaDatiBudgetComponent } from './tabella-dati-budget.component';
import { TabellaDatiCommercialiModule } from '../tabella-dati-commerciali/tabella-dati-commerciali.module';

@NgModule({
  declarations: [TabellaDatiBudgetComponent],
  imports: [
    SharedModule,
    TabellaDatiBudgetRoutingModule,
    WidgetDirective,
    TabellaDatiCommercialiModule
  ]
})
export class TabellaDatiBudgetModule {}
