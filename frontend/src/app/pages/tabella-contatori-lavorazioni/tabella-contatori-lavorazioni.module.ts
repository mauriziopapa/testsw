import { NgModule } from '@angular/core';
import { WidgetDirective } from 'src/app/directives/widget.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { TabellaContatoriLavorazioniRoutingModule } from './tabella-contatori-lavorazioni-routing.module';
import { TabellaContatoriLavorazioniComponent } from './tabella-contatori-lavorazioni.component';

@NgModule({
  declarations: [TabellaContatoriLavorazioniComponent],
  imports: [SharedModule, TabellaContatoriLavorazioniRoutingModule, WidgetDirective]
})
export class TabellaContatoriLavorazioniModule {}
