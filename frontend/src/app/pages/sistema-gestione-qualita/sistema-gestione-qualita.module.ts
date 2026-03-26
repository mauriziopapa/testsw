import { NgModule } from '@angular/core';
import { WidgetDirective } from 'src/app/directives/widget.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { SistemaGestioneQualitaRoutingModule } from './sistema-gestione-qualita-routing.module';
import { SistemaGestioneQualitaComponent } from './sistema-gestione-qualita.component';

@NgModule({
  declarations: [SistemaGestioneQualitaComponent],
  imports: [SharedModule, SistemaGestioneQualitaRoutingModule, WidgetDirective]
})
export class SistemaGestioneQualitaModule {}
