import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { appGuard } from 'src/app/helpers/app.guard';
import { TabellaDatiCartellinoComponent } from './tabella-dati-cartellino.component';

const routes: Routes = [
  { path: '', component: TabellaDatiCartellinoComponent, canActivate: [appGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaDatiCartellinoRoutingModule {}
