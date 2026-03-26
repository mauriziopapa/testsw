import { NgModule } from '@angular/core';
import { WidgetDirective } from 'src/app/directives/widget.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { TabellaDatiCommercialiRoutingModule } from './tabella-dati-commerciali-routing.module';
import { TabellaDatiCommercialiComponent } from './tabella-dati-commerciali.component';

@NgModule({
  declarations: [TabellaDatiCommercialiComponent],
  imports: [SharedModule, TabellaDatiCommercialiRoutingModule, WidgetDirective],
  exports: [TabellaDatiCommercialiComponent]
})
export class TabellaDatiCommercialiModule {}
