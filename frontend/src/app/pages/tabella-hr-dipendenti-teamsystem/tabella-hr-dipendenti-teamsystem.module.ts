import { CurrencyPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { WidgetDirective } from 'src/app/directives/widget.directive';
import { SharedModule } from 'src/app/shared/shared.module';
import { TabellaHrDipendentiTeamSystemRoutingModule } from './tabella-hr-dipendenti-teamsystem-routing.module';
import { TabellaHrDipendentiTeamSystemComponent } from './tabella-hr-dipendenti-teamsystem.component';

@NgModule({
  declarations: [TabellaHrDipendentiTeamSystemComponent],
  imports: [SharedModule, TabellaHrDipendentiTeamSystemRoutingModule, WidgetDirective],
  providers: [CurrencyPipe]
})
export class TabellaHrDipendentiTeamSystem {}
