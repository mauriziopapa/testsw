import { NgModule } from '@angular/core';
import { WidgetDirective } from 'src/app/directives/widget.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { TabellaDatiMisurazioneMetanoRoutingModule } from './tabella-dati-misurazione-metano-routing.module';
import { TabellaDatiMisurazioneMetanoComponent } from './tabella-dati-misurazione-metano.component';

@NgModule({
  declarations: [TabellaDatiMisurazioneMetanoComponent],
  imports: [SharedModule, TabellaDatiMisurazioneMetanoRoutingModule, WidgetDirective]
})
export class TabellaDatiMisurazioneMetanoModule {}
