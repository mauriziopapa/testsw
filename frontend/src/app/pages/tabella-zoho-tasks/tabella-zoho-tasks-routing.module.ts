import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppGuard } from 'src/app/helpers/app.guard';
import { TabellaZohoTasksComponent } from './tabella-zoho-tasks.component';

const routes: Routes = [
  { path: '', component: TabellaZohoTasksComponent, canActivate: [AppGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaZohoTasksRoutingModule {}
