import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { appGuard } from 'src/app/helpers/app.guard';
import { TabellaDatiMapMpTSComponent } from './tabella-dati-map-mp-ts.component';

const routes: Routes = [
  { path: '', component: TabellaDatiMapMpTSComponent, canActivate: [appGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaDatiMapMpTSRoutingModule {}
