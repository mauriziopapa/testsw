import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppGuard } from 'src/app/helpers/app.guard';
import { TabellaHrDipendentiTeamSystemComponent } from './tabella-hr-dipendenti-teamsystem.component';

const routes: Routes = [
  { path: '', component: TabellaHrDipendentiTeamSystemComponent, canActivate: [AppGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaHrDipendentiTeamSystemRoutingModule {}
