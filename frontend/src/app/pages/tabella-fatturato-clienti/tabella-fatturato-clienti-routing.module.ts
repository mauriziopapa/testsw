import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { appGuard } from 'src/app/helpers/app.guard';
import { TabellaFatturatoClientiComponent } from './tabella-fatturato-clienti.component';

const routes: Routes = [
  { path: '', component: TabellaFatturatoClientiComponent, canActivate: [appGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaFatturatoClientiRoutingModule {}
