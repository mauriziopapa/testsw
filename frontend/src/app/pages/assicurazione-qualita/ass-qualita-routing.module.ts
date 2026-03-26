import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { appGuard } from 'src/app/helpers/app.guard';
import { AssicurazioneQualitaComponent } from './ass-qualita.component';

const routes: Routes = [
  { path: '', component: AssicurazioneQualitaComponent, canActivate: [appGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssicurazioneQualitaRoutingModule {}
