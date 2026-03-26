import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppGuard } from 'src/app/helpers/app.guard';
import { ManutenzioneComponent } from './manutenzione.component';

const routes: Routes = [{ path: '', component: ManutenzioneComponent, canActivate: [AppGuard] }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManutenzioneRoutingModule {}
