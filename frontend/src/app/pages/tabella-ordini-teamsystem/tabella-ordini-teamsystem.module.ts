import { CurrencyPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { WidgetDirective } from 'src/app/directives/widget.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { TabellaOrdiniTeamSystemRoutingModule } from './tabella-ordini-teamsystem-routing.module';
import { TabellaOrdiniTeamSystemComponent } from './tabella-ordini-teamsystem.component';

@NgModule({
  declarations: [TabellaOrdiniTeamSystemComponent],
  imports: [SharedModule, TabellaOrdiniTeamSystemRoutingModule, WidgetDirective],
  providers: [CurrencyPipe]
})
export class TabellaOrdiniTeamSystemModule {}
