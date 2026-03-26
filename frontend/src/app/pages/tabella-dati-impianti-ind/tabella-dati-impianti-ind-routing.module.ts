import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppGuard } from 'src/app/helpers/app.guard';
import { TabellaDatiImpiantiIndComponent } from './tabella-dati-impianti-ind.component';

const routes: Routes = [
  { path: '', component: TabellaDatiImpiantiIndComponent, canActivate: [AppGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaDatiImpiantiIndRoutingModule {}
