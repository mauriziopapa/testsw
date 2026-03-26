import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppGuard } from 'src/app/helpers/app.guard';
import { IndustrializzazioneComponent } from './industrializzazione.component';

const routes: Routes = [
  { path: '', component: IndustrializzazioneComponent, canActivate: [AppGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IndustrializzazioneRoutingModule {}
