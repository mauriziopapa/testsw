import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { appGuard } from 'src/app/helpers/app.guard';
import { SicurezzaEAmbienteComponent } from './sicurezza-e-ambiente.component';

const routes: Routes = [
  { path: '', component: SicurezzaEAmbienteComponent, canActivate: [appGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SicurezzaEAmbienteRoutingModule {}
