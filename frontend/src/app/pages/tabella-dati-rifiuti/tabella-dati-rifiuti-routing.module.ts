import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppGuard } from 'src/app/helpers/app.guard';
import { TabellaDatiRifiutiComponent } from './tabella-dati-rifiuti.component';

const routes: Routes = [
  { path: '', component: TabellaDatiRifiutiComponent, canActivate: [AppGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaDatiRifiutiRoutingModule {}
