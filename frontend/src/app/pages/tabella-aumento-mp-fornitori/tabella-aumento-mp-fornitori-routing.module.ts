import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppGuard } from 'src/app/helpers/app.guard';
import { TabellaAumentoMpFornitoriComponent } from './tabella-aumento-mp-fornitori.component';

const routes: Routes = [
  { path: '', component: TabellaAumentoMpFornitoriComponent, canActivate: [AppGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaAumentoMpFornitoriRoutingModule {}
