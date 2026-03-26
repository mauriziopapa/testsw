import { NgModule } from '@angular/core';
import { WidgetDirective } from 'src/app/directives/widget.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { TabellaDatiEmissioniRoutingModule } from './tabella-dati-emissioni-routing.module';
import { TabellaDatiEmissioniComponent } from './tabella-dati-emissioni.component';

@NgModule({
  declarations: [TabellaDatiEmissioniComponent],
  imports: [SharedModule, TabellaDatiEmissioniRoutingModule, WidgetDirective]
})
export class TabellaDatiEmissioniModule {}
