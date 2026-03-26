import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from 'src/app/helpers/auth.guard';
import { ResetPasswordComponent } from './reset-password.component';

const routes: Routes = [{ path: '', component: ResetPasswordComponent, canActivate: [authGuard] }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResetPasswordRoutingModule {}
