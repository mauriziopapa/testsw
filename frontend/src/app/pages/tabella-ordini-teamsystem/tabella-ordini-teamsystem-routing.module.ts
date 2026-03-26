import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppGuard } from 'src/app/helpers/app.guard';
import { TabellaOrdiniTeamSystemComponent } from './tabella-ordini-teamsystem.component';

const routes: Routes = [
  { path: '', component: TabellaOrdiniTeamSystemComponent, canActivate: [AppGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaOrdiniTeamSystemRoutingModule {}
