import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { appGuard } from 'src/app/helpers/app.guard';
import { TabellaDatiRitardoManutenzioneComponent } from './tabella-dati-ritardo-manutenzione.component';

const routes: Routes = [
  { path: '', component: TabellaDatiRitardoManutenzioneComponent, canActivate: [appGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaDatiRitardoManutenzioneRoutingModule {}
