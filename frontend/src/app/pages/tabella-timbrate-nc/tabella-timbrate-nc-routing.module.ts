import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppGuard } from 'src/app/helpers/app.guard';
import { TabellaTimbrateNcComponent } from './tabella-timbrate-nc.component';

const routes: Routes = [
  { path: '', component: TabellaTimbrateNcComponent, canActivate: [AppGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaTimbrateNcRoutingModule {}
