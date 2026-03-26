import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { appGuard } from 'src/app/helpers/app.guard';
import { PianificazioneComponent } from './pianificazione.component';

const routes: Routes = [{ path: '', component: PianificazioneComponent, canActivate: [appGuard] }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PianificazioneRoutingModule {}
