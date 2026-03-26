import { NgModule } from '@angular/core';
import { WidgetDirective } from 'src/app/directives/widget.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { TabellaRifiutiLavorazioniRoutingModule } from './tabella-rifiuti-lavorazioni-routing.module';
import { TabellaRifiutiLavorazioniComponent } from './tabella-rifiuti-lavorazioni.component';

@NgModule({
  declarations: [TabellaRifiutiLavorazioniComponent],
  imports: [SharedModule, TabellaRifiutiLavorazioniRoutingModule, WidgetDirective]
})
export class TabellaRifiutiLavorazioniModule {}
