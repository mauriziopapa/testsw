import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppGuard } from 'src/app/helpers/app.guard';
import { TabellaDatiPersonaleComponent } from './tabella-dati-personale.component';

const routes: Routes = [
  { path: '', component: TabellaDatiPersonaleComponent, canActivate: [AppGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaDatiPersonaleRoutingModule {}
