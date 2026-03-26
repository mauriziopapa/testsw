import { NgModule } from '@angular/core';
import { WidgetDirective } from 'src/app/directives/widget.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { TabellaDatiLaboratorioRoutingModule } from './tabella-dati-laboratorio-routing.module';
import { TabellaDatiLaboratorioComponent } from './tabella-dati-laboratorio.component';

@NgModule({
  declarations: [TabellaDatiLaboratorioComponent],
  imports: [SharedModule, TabellaDatiLaboratorioRoutingModule, WidgetDirective]
})
export class TabellaDatiLaboratorioModule {}
