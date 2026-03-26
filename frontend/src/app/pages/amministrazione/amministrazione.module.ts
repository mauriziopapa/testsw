import { NgModule } from '@angular/core';
import { AmministrazioneComponent } from './amministrazione.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { AmministrazioneRoutingModule } from './amministrazione-routing.module';
import { WidgetDirective } from 'src/app/directives/widget.directive';

@NgModule({
  declarations: [AmministrazioneComponent],
  imports: [SharedModule, AmministrazioneRoutingModule, WidgetDirective]
})
export class AmministrazioneModule {}
