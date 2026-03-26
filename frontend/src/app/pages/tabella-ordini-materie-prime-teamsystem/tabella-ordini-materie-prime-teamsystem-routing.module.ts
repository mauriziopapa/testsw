import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppGuard } from 'src/app/helpers/app.guard';
import { TabellaOrdiniMateriePrimeTeamSystemComponent } from './tabella-ordini-materie-prime-teamsystem.component';

const routes: Routes = [
  { path: '', component: TabellaOrdiniMateriePrimeTeamSystemComponent, canActivate: [AppGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaOrdiniMateriePrimeTeamSystemRoutingModule {}
