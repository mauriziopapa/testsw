import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { appGuard } from 'src/app/helpers/app.guard';
import { TabellaDatiManutenzioneComponent } from './tabella-dati-manutenzione.component';

const routes: Routes = [
  { path: '', component: TabellaDatiManutenzioneComponent, canActivate: [appGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaDatiManutenzioneRoutingModule {}
