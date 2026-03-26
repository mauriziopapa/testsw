import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { appGuard } from 'src/app/helpers/app.guard';
import { TabellaDatiCommercialiComponent } from './tabella-dati-commerciali.component';

const routes: Routes = [
  { path: '', component: TabellaDatiCommercialiComponent, canActivate: [appGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaDatiCommercialiRoutingModule {}
