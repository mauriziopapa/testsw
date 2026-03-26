import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppGuard } from 'src/app/helpers/app.guard';
import { CommercialeComponent } from './commerciale.component';

const routes: Routes = [{ path: '', component: CommercialeComponent, canActivate: [AppGuard] }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommercialeRoutingModule {}
