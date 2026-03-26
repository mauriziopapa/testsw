import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppGuard } from 'src/app/helpers/app.guard';
import { TabellaDatiCartellinoComponent } from './tabella-dati-cartellino.component';

const routes: Routes = [
  { path: '', component: TabellaDatiCartellinoComponent, canActivate: [AppGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaDatiCartellinoRoutingModule {}
