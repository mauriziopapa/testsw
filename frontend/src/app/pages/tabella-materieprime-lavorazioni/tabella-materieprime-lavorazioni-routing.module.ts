import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppGuard } from 'src/app/helpers/app.guard';
import { TabellaMPLavorazioniComponent } from './tabella-materieprime-lavorazioni.component';

const routes: Routes = [
  { path: '', component: TabellaMPLavorazioniComponent, canActivate: [AppGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaMPLavorazioniRoutingModule {}
