import { NgModule } from '@angular/core';
import { WidgetDirective } from 'src/app/directives/widget.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { TabellaDatiDirezioneRoutingModule } from './tabella-dati-direzione-routing.module';
import { TabellaDatiDirezioneComponent } from './tabella-dati-direzione.component';

@NgModule({
  declarations: [TabellaDatiDirezioneComponent],
  imports: [SharedModule, TabellaDatiDirezioneRoutingModule, WidgetDirective]
})
export class TabellaDatiDirezioneModule {}
