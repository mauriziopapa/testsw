import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { appGuard } from 'src/app/helpers/app.guard';
import { AcquistiComponent } from './acquisti.component';

const routes: Routes = [{ path: '', component: AcquistiComponent, canActivate: [appGuard] }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AcquistiRoutingModule {}
