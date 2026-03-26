import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { appGuard } from 'src/app/helpers/app.guard';
import { TabellaHrDipendentiTeamSystemComponent } from './tabella-hr-dipendenti-teamsystem.component';

const routes: Routes = [
  { path: '', component: TabellaHrDipendentiTeamSystemComponent, canActivate: [appGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaHrDipendentiTeamSystemRoutingModule {}
