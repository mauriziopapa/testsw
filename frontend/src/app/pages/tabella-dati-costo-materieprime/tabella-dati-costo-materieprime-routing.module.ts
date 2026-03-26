import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppGuard } from 'src/app/helpers/app.guard';
import { TabellaDatiCostoMateriePrimeComponent } from './tabella-dati-costo-materieprime.component';

const routes: Routes = [
  { path: '', component: TabellaDatiCostoMateriePrimeComponent, canActivate: [AppGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaDatiCostoMateriePrimeRoutingModule {}
