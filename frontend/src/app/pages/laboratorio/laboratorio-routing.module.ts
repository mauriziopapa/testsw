import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppGuard } from 'src/app/helpers/app.guard';
import { LaboratorioComponent } from './laboratorio.component';

const routes: Routes = [{ path: '', component: LaboratorioComponent, canActivate: [AppGuard] }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LaboratorioRoutingModule {}
