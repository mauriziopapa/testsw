import { NgModule } from '@angular/core';
import { WidgetDirective } from 'src/app/directives/widget.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { ProduzioneRoutingModule } from './produzione-routing.module';
import { ProduzioneComponent } from './produzione.component';

@NgModule({
  declarations: [ProduzioneComponent],
  imports: [SharedModule, ProduzioneRoutingModule, WidgetDirective]
})
export class ProduzioneModule {}
