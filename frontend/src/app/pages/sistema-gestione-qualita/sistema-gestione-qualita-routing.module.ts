import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { appGuard } from 'src/app/helpers/app.guard';
import { SistemaGestioneQualitaComponent } from './sistema-gestione-qualita.component';

const routes: Routes = [
  { path: '', component: SistemaGestioneQualitaComponent, canActivate: [appGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SistemaGestioneQualitaRoutingModule {}
