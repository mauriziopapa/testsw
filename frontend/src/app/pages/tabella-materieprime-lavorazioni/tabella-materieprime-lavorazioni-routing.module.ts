import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { appGuard } from 'src/app/helpers/app.guard';
import { TabellaMPLavorazioniComponent } from './tabella-materieprime-lavorazioni.component';

const routes: Routes = [
  { path: '', component: TabellaMPLavorazioniComponent, canActivate: [appGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaMPLavorazioniRoutingModule {}
