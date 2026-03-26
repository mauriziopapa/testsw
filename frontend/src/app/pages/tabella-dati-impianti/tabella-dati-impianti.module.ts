import { NgModule } from '@angular/core';
import { WidgetDirective } from 'src/app/directives/widget.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { TabellaDatiImpiantiRoutingModule } from './tabella-dati-impianti-routing.module';
import { TabellaDatiImpiantiComponent } from './tabella-dati-impianti.component';

@NgModule({
  declarations: [TabellaDatiImpiantiComponent],
  imports: [SharedModule, TabellaDatiImpiantiRoutingModule, WidgetDirective]
})
export class TabellaDatiImpiantiModule {}
