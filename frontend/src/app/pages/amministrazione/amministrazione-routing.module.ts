import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { appGuard } from 'src/app/helpers/app.guard';
import { AmministrazioneComponent } from './amministrazione.component';

const routes: Routes = [{ path: '', component: AmministrazioneComponent, canActivate: [appGuard] }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AmministrazioneRoutingModule {}
