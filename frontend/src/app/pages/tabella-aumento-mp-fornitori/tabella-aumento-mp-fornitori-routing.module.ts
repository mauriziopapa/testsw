import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { appGuard } from 'src/app/helpers/app.guard';
import { TabellaAumentoMpFornitoriComponent } from './tabella-aumento-mp-fornitori.component';

const routes: Routes = [
  { path: '', component: TabellaAumentoMpFornitoriComponent, canActivate: [appGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaAumentoMpFornitoriRoutingModule {}
