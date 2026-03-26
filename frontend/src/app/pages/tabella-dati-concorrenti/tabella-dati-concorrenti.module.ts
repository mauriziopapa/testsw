import { NgModule } from '@angular/core';
import { WidgetDirective } from 'src/app/directives/widget.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { TabellaDatiConcorrentiRoutingModule } from './tabella-dati-concorrenti-routing.module';
import { TabellaDatiConcorrentiComponent } from './tabella-dati-concorrenti.component';

@NgModule({
  declarations: [TabellaDatiConcorrentiComponent],
  imports: [SharedModule, TabellaDatiConcorrentiRoutingModule, WidgetDirective]
})
export class TabellaDatiConcorrentiModule {}
