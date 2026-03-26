import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppGuard } from 'src/app/helpers/app.guard';
import { SicurezzaEAmbienteComponent } from './sicurezza-e-ambiente.component';

const routes: Routes = [
  { path: '', component: SicurezzaEAmbienteComponent, canActivate: [AppGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SicurezzaEAmbienteRoutingModule {}
