import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { appGuard } from 'src/app/helpers/app.guard';
import { TabellaDatiCostoMateriePrimeComponent } from './tabella-dati-costo-materieprime.component';

const routes: Routes = [
  { path: '', component: TabellaDatiCostoMateriePrimeComponent, canActivate: [appGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaDatiCostoMateriePrimeRoutingModule {}
