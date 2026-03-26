import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppGuard } from 'src/app/helpers/app.guard';
import { TabellaCostoFornitoriComponent } from './tabella-costo-fornitori.component';

const routes: Routes = [
  { path: '', component: TabellaCostoFornitoriComponent, canActivate: [AppGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaCostoFornitoriRoutingModule {}
