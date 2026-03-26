import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { appGuard } from 'src/app/helpers/app.guard';
import { TabellaDatiMisurazioneMetanoComponent } from './tabella-dati-misurazione-metano.component';

const routes: Routes = [
  { path: '', component: TabellaDatiMisurazioneMetanoComponent, canActivate: [appGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaDatiMisurazioneMetanoRoutingModule {}
