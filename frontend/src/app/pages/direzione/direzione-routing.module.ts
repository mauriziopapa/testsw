import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { appGuard } from 'src/app/helpers/app.guard';
import { DirezioneComponent } from './direzione.component';

const routes: Routes = [{ path: '', component: DirezioneComponent, canActivate: [appGuard] }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DirezioneRoutingModule {}
