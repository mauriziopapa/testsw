import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppGuard } from 'src/app/helpers/app.guard';
import { SistemaGestioneQualitaComponent } from './sistema-gestione-qualita.component';

const routes: Routes = [
  { path: '', component: SistemaGestioneQualitaComponent, canActivate: [AppGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SistemaGestioneQualitaRoutingModule {}
