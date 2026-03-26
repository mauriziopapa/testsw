import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppGuard } from 'src/app/helpers/app.guard';
import { AmministrazioneComponent } from './amministrazione.component';

const routes: Routes = [{ path: '', component: AmministrazioneComponent, canActivate: [AppGuard] }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AmministrazioneRoutingModule {}
