import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppGuard } from 'src/app/helpers/app.guard';
import { TabellaDatiMapMpTSComponent } from './tabella-dati-map-mp-ts.component';

const routes: Routes = [
  { path: '', component: TabellaDatiMapMpTSComponent, canActivate: [AppGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaDatiMapMpTSRoutingModule {}
