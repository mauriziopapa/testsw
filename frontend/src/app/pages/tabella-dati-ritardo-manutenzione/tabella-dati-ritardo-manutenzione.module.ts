import { NgModule } from '@angular/core';
import { WidgetDirective } from 'src/app/directives/widget.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { TabellaDatiRitardoManutenzioneRoutingModule } from './tabella-dati-ritardo-manutenzione-routing.module';
import { TabellaDatiRitardoManutenzioneComponent } from './tabella-dati-ritardo-manutenzione.component';

@NgModule({
  declarations: [TabellaDatiRitardoManutenzioneComponent],
  imports: [SharedModule, TabellaDatiRitardoManutenzioneRoutingModule, WidgetDirective]
})
export class TabellaDatiRitardoManutenzioneModule {}
