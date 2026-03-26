import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { appGuard } from 'src/app/helpers/app.guard';
import { TabellaOrdiniMateriePrimeTeamSystemComponent } from './tabella-ordini-materie-prime-teamsystem.component';

const routes: Routes = [
  { path: '', component: TabellaOrdiniMateriePrimeTeamSystemComponent, canActivate: [appGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaOrdiniMateriePrimeTeamSystemRoutingModule {}
