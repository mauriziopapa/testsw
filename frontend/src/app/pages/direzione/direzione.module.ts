import { NgModule } from '@angular/core';
import { DirezioneComponent } from './direzione.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { DirezioneRoutingModule } from './direzione-routing.module';
import { WidgetDirective } from 'src/app/directives/widget.directive';

@NgModule({
  declarations: [DirezioneComponent],
  imports: [SharedModule, DirezioneRoutingModule, WidgetDirective]
})
export class DirezioneModule {}
