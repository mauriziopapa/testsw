import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { appGuard } from 'src/app/helpers/app.guard';
import { InduzioneComponent } from './induzione.component';

const routes: Routes = [{ path: '', component: InduzioneComponent, canActivate: [appGuard] }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InduzioneRoutingModule {}
