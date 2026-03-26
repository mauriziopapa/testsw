import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppGuard } from 'src/app/helpers/app.guard';
import { TabellaDatiConcorrentiComponent } from './tabella-dati-concorrenti.component';

const routes: Routes = [
  { path: '', component: TabellaDatiConcorrentiComponent, canActivate: [AppGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaDatiConcorrentiRoutingModule {}
