import { NgModule } from '@angular/core';
import { WidgetDirective } from 'src/app/directives/widget.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { AssicurazioneQualitaRoutingModule } from './ass-qualita-routing.module';
import { AssicurazioneQualitaComponent } from './ass-qualita.component';

@NgModule({
  declarations: [AssicurazioneQualitaComponent],
  imports: [SharedModule, AssicurazioneQualitaRoutingModule, WidgetDirective]
})
export class AssicurazioneQualitaModule {}
