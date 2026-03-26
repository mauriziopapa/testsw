import { NgModule } from '@angular/core';
import { WidgetDirective } from 'src/app/directives/widget.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { TabellaDatiManutenzioneRoutingModule } from './tabella-dati-manutenzione-routing.module';
import { TabellaDatiManutenzioneComponent } from './tabella-dati-manutenzione.component';

@NgModule({
  declarations: [TabellaDatiManutenzioneComponent],
  imports: [SharedModule, TabellaDatiManutenzioneRoutingModule, WidgetDirective]
})
export class TabellaDatiManutenzioneModule {}
