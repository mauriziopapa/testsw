import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { appGuard } from 'src/app/helpers/app.guard';
import { TabellaContatoriLavorazioniComponent } from './tabella-contatori-lavorazioni.component';

const routes: Routes = [
  { path: '', component: TabellaContatoriLavorazioniComponent, canActivate: [appGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaContatoriLavorazioniRoutingModule {}
