import { NgModule } from '@angular/core';
import { PianificazioneComponent } from './pianificazione.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { PianificazioneRoutingModule } from './pianificazione-routing.module';
import { WidgetDirective } from 'src/app/directives/widget.directive';

@NgModule({
  declarations: [PianificazioneComponent],
  imports: [SharedModule, PianificazioneRoutingModule, WidgetDirective]
})
export class PianificazioneModule {}
