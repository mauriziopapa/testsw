import { NgModule } from '@angular/core';
import { WidgetDirective } from 'src/app/directives/widget.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { TabellaDatiImpiantiIndRoutingModule } from './tabella-dati-impianti-ind-routing.module';
import { TabellaDatiImpiantiIndComponent } from './tabella-dati-impianti-ind.component';

@NgModule({
  declarations: [TabellaDatiImpiantiIndComponent],
  imports: [SharedModule, TabellaDatiImpiantiIndRoutingModule, WidgetDirective]
})
export class TabellaDatiImpiantiIndModule {}
