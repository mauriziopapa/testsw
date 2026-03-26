import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { appGuard } from 'src/app/helpers/app.guard';
import { TabellaCommesseNcComponent } from './tabella-commesse-nc.component';

const routes: Routes = [
  { path: '', component: TabellaCommesseNcComponent, canActivate: [appGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaCommesseNcRoutingModule {}
