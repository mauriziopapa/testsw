import { NgModule } from '@angular/core';
import { WidgetDirective } from 'src/app/directives/widget.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { TabellaDatiRifiutiRoutingModule } from './tabella-dati-rifiuti-routing.module';
import { TabellaDatiRifiutiComponent } from './tabella-dati-rifiuti.component';

@NgModule({
  declarations: [TabellaDatiRifiutiComponent],
  imports: [SharedModule, TabellaDatiRifiutiRoutingModule, WidgetDirective]
})
export class TabellaDatiRifiutiModule {}
