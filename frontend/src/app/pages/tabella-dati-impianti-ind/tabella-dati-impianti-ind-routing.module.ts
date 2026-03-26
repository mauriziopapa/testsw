import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { appGuard } from 'src/app/helpers/app.guard';
import { TabellaDatiImpiantiIndComponent } from './tabella-dati-impianti-ind.component';

const routes: Routes = [
  { path: '', component: TabellaDatiImpiantiIndComponent, canActivate: [appGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaDatiImpiantiIndRoutingModule {}
