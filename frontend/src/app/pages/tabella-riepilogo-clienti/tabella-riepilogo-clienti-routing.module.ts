import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppGuard } from 'src/app/helpers/app.guard';
import { TabellaRiepilogoClientiComponent } from './tabella-riepilogo-clienti.component';

const routes: Routes = [
  { path: '', component: TabellaRiepilogoClientiComponent, canActivate: [AppGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaRiepilogoClientiRoutingModule {}
