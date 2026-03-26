import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { appGuard } from 'src/app/helpers/app.guard';
import { ReportResaCaricaMediaComponent } from './report-resa-carica-media.component';

const routes: Routes = [
  { path: '', component: ReportResaCaricaMediaComponent, canActivate: [appGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportResaCaricaMediaRoutingModule {}
