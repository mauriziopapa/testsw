import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { appGuard } from 'src/app/helpers/app.guard';
import { TabellaDatiRifiutiComponent } from './tabella-dati-rifiuti.component';

const routes: Routes = [
  { path: '', component: TabellaDatiRifiutiComponent, canActivate: [appGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaDatiRifiutiRoutingModule {}
