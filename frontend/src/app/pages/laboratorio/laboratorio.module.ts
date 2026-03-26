import { NgModule } from '@angular/core';
import { LaboratorioComponent } from './laboratorio.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { LaboratorioRoutingModule } from './laboratorio-routing.module';
import { WidgetDirective } from 'src/app/directives/widget.directive';

@NgModule({
  declarations: [LaboratorioComponent],
  imports: [SharedModule, LaboratorioRoutingModule, WidgetDirective]
})
export class LaboratorioModule {}
