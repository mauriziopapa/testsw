import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppGuard } from 'src/app/helpers/app.guard';
import { TabellaDatiContatoriMisurazioniComponent } from './tabella-dati-contatori-misurazioni.component';

const routes: Routes = [
  { path: '', component: TabellaDatiContatoriMisurazioniComponent, canActivate: [AppGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaDatiContatoriMisurazioniRoutingModule {}
