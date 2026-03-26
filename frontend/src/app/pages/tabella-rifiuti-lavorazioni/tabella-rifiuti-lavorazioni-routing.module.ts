import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { appGuard } from 'src/app/helpers/app.guard';
import { TabellaRifiutiLavorazioniComponent } from './tabella-rifiuti-lavorazioni.component';

const routes: Routes = [
  { path: '', component: TabellaRifiutiLavorazioniComponent, canActivate: [appGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaRifiutiLavorazioniRoutingModule {}
