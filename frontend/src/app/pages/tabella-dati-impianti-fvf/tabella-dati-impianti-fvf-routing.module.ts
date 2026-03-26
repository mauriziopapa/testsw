import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppGuard } from 'src/app/helpers/app.guard';
import { TabellaDatiImpiantiFVFComponent } from './tabella-dati-impianti-fvf.component';

const routes: Routes = [
  { path: '', component: TabellaDatiImpiantiFVFComponent, canActivate: [AppGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaDatiImpiantiFVFRoutingModule {}
