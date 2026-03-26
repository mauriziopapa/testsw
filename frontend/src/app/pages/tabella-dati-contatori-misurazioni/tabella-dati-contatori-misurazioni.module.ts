import { NgModule } from '@angular/core';
import { WidgetDirective } from 'src/app/directives/widget.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { TabellaDatiContatoriMisurazioniRoutingModule } from './tabella-dati-contatori-misurazioni-routing.module';
import { TabellaDatiContatoriMisurazioniComponent } from './tabella-dati-contatori-misurazioni.component';

@NgModule({
  declarations: [TabellaDatiContatoriMisurazioniComponent],
  imports: [SharedModule, TabellaDatiContatoriMisurazioniRoutingModule, WidgetDirective]
})
export class TabellaDatiContatoriMisurazioniModule {}
