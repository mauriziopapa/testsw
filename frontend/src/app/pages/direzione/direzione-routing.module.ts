import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppGuard } from 'src/app/helpers/app.guard';
import { DirezioneComponent } from './direzione.component';

const routes: Routes = [{ path: '', component: DirezioneComponent, canActivate: [AppGuard] }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DirezioneRoutingModule {}
