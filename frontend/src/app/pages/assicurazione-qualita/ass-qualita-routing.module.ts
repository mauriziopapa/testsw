import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppGuard } from 'src/app/helpers/app.guard';
import { AssicurazioneQualitaComponent } from './ass-qualita.component';

const routes: Routes = [
  { path: '', component: AssicurazioneQualitaComponent, canActivate: [AppGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssicurazioneQualitaRoutingModule {}
