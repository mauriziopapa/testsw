import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { appGuard } from 'src/app/helpers/app.guard';
import { TabellaOrdiniTeamSystemComponent } from './tabella-ordini-teamsystem.component';

const routes: Routes = [
  { path: '', component: TabellaOrdiniTeamSystemComponent, canActivate: [appGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaOrdiniTeamSystemRoutingModule {}
