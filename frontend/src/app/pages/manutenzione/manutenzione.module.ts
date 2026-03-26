import { NgModule } from '@angular/core';
import { WidgetDirective } from 'src/app/directives/widget.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { ManutenzioneRoutingModule } from './manutenzione-routing.module';
import { ManutenzioneComponent } from './manutenzione.component';

@NgModule({
  declarations: [ManutenzioneComponent],
  imports: [SharedModule, ManutenzioneRoutingModule, WidgetDirective]
})
export class ManutenzioneModule {}
