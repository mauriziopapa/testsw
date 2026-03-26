import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppGuard } from 'src/app/helpers/app.guard';
import { TabellaDatiManutenzioneComponent } from './tabella-dati-manutenzione.component';

const routes: Routes = [
  { path: '', component: TabellaDatiManutenzioneComponent, canActivate: [AppGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaDatiManutenzioneRoutingModule {}
