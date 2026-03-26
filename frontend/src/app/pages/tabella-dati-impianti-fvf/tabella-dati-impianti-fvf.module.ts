import { NgModule } from '@angular/core';
import { WidgetDirective } from 'src/app/directives/widget.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { TabellaDatiImpiantiFVFRoutingModule } from './tabella-dati-impianti-fvf-routing.module';
import { TabellaDatiImpiantiFVFComponent } from './tabella-dati-impianti-fvf.component';

@NgModule({
  declarations: [TabellaDatiImpiantiFVFComponent],
  imports: [SharedModule, TabellaDatiImpiantiFVFRoutingModule, WidgetDirective]
})
export class TabellaDatiImpiantiFVFModule {}
