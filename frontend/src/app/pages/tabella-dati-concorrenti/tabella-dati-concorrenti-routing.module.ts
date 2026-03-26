import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { appGuard } from 'src/app/helpers/app.guard';
import { TabellaDatiConcorrentiComponent } from './tabella-dati-concorrenti.component';

const routes: Routes = [
  { path: '', component: TabellaDatiConcorrentiComponent, canActivate: [appGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaDatiConcorrentiRoutingModule {}
