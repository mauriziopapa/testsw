import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { appGuard } from 'src/app/helpers/app.guard';
import { TabellaDatiPersonaleComponent } from './tabella-dati-personale.component';

const routes: Routes = [
  { path: '', component: TabellaDatiPersonaleComponent, canActivate: [appGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaDatiPersonaleRoutingModule {}
