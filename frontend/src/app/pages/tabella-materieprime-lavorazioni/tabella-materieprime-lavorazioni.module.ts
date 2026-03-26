import { NgModule } from '@angular/core';
import { WidgetDirective } from 'src/app/directives/widget.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { TabellaMPLavorazioniRoutingModule } from './tabella-materieprime-lavorazioni-routing.module';
import { TabellaMPLavorazioniComponent } from './tabella-materieprime-lavorazioni.component';

@NgModule({
  declarations: [TabellaMPLavorazioniComponent],
  imports: [SharedModule, TabellaMPLavorazioniRoutingModule, WidgetDirective]
})
export class TabellaMPLavorazioniModule {}
