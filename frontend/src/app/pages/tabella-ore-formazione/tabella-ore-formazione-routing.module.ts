import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppGuard } from 'src/app/helpers/app.guard';
import { TabellaOreFormazioneComponent } from './tabella-ore-formazione.component';

const routes: Routes = [
  { path: '', component: TabellaOreFormazioneComponent, canActivate: [AppGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaOreFormazioneRoutingModule {}
