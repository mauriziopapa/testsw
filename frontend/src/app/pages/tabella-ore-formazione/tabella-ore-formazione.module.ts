import { NgModule } from '@angular/core';
import { WidgetDirective } from 'src/app/directives/widget.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { TabellaOreFormazioneRoutingModule } from './tabella-ore-formazione-routing.module';
import { TabellaOreFormazioneComponent } from './tabella-ore-formazione.component';

@NgModule({
  declarations: [TabellaOreFormazioneComponent],
  imports: [SharedModule, TabellaOreFormazioneRoutingModule, WidgetDirective]
})
export class TabellaOreFormazioneModule {}
