import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppGuard } from 'src/app/helpers/app.guard';
import { TabellaDatiEmissioniComponent } from './tabella-dati-emissioni.component';

const routes: Routes = [
  { path: '', component: TabellaDatiEmissioniComponent, canActivate: [AppGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabellaDatiEmissioniRoutingModule {}
