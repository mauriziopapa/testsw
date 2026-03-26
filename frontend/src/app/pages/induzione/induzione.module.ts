import { NgModule } from '@angular/core';
import { WidgetDirective } from 'src/app/directives/widget.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { InduzioneRoutingModule } from './induzione-routing.module';
import { InduzioneComponent } from './induzione.component';

@NgModule({
  declarations: [InduzioneComponent],
  imports: [SharedModule, InduzioneRoutingModule, WidgetDirective]
})
export class InduzioneModule {}
