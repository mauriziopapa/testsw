import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { appGuard } from 'src/app/helpers/app.guard';
import { TabellaOreFormazioneComponent } from './tabella-ore-formazione.component';

const routes: Routes = [
  { path: '', component: TabellaOreFormazioneComponent, canActivate: [appGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaOreFormazioneRoutingModule {}
