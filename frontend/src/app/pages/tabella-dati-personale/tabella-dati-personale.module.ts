import { NgModule } from '@angular/core';
import { WidgetDirective } from 'src/app/directives/widget.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { TabellaDatiPersonaleRoutingModule } from './tabella-dati-personale-routing.module';
import { TabellaDatiPersonaleComponent } from './tabella-dati-personale.component';

@NgModule({
  declarations: [TabellaDatiPersonaleComponent],
  imports: [SharedModule, TabellaDatiPersonaleRoutingModule, WidgetDirective]
})
export class TabellaDatiPersonaleModule {}
