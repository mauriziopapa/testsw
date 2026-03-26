import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppGuard } from 'src/app/helpers/app.guard';
import { PianificazioneComponent } from './pianificazione.component';

const routes: Routes = [{ path: '', component: PianificazioneComponent, canActivate: [AppGuard] }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PianificazioneRoutingModule {}
