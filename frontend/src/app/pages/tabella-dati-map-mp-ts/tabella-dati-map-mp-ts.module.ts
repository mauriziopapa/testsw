import { NgModule } from '@angular/core';
import { WidgetDirective } from 'src/app/directives/widget.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { TabellaDatiMapMpTSRoutingModule } from './tabella-dati-map-mp-ts-routing.module';
import { TabellaDatiMapMpTSComponent } from './tabella-dati-map-mp-ts.component';

@NgModule({
  declarations: [TabellaDatiMapMpTSComponent],
  imports: [SharedModule, TabellaDatiMapMpTSRoutingModule, WidgetDirective]
})
export class TabellaDatiMapMpTSModule {}
