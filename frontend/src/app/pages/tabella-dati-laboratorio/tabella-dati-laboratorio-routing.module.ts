import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { appGuard } from 'src/app/helpers/app.guard';
import { TabellaDatiLaboratorioComponent } from './tabella-dati-laboratorio.component';

const routes: Routes = [
  { path: '', component: TabellaDatiLaboratorioComponent, canActivate: [appGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaDatiLaboratorioRoutingModule {}
