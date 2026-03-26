import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { appGuard } from 'src/app/helpers/app.guard';
import { TabellaDatiImpiantiComponent } from './tabella-dati-impianti.component';

const routes: Routes = [
  { path: '', component: TabellaDatiImpiantiComponent, canActivate: [appGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaDatiImpiantiRoutingModule {}
