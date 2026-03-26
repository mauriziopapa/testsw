import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { appGuard } from 'src/app/helpers/app.guard';
import { TabellaDatiDirezioneComponent } from './tabella-dati-direzione.component';

const routes: Routes = [
  { path: '', component: TabellaDatiDirezioneComponent, canActivate: [appGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaDatiDirezioneRoutingModule {}
