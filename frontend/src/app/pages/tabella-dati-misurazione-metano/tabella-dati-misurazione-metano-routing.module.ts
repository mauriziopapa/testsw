import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppGuard } from 'src/app/helpers/app.guard';
import { TabellaDatiMisurazioneMetanoComponent } from './tabella-dati-misurazione-metano.component';

const routes: Routes = [
  { path: '', component: TabellaDatiMisurazioneMetanoComponent, canActivate: [AppGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaDatiMisurazioneMetanoRoutingModule {}
