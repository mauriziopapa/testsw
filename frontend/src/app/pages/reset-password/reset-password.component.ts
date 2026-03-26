import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ResetPasswordService } from 'src/app/services/reset-password.service';
import { KpiDialogComponent } from 'src/app/shared/kpi-dialog/kpi-dialog.component';

@Component({
    selector: 'reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.scss'],
    standalone: false
})
export class ResetPasswordComponent {
  form: FormGroup;
  constructor(
    private router: Router,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private resetPasswordService: ResetPasswordService
  ) {
    this.form = this.fb.nonNullable.group({
      username: ''
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.resetPasswordService.sendEmail$(this.form.controls['username'].value).subscribe({
        next: () => {
          this.dialog.open(KpiDialogComponent, {
            width: '30%',
            enterAnimationDuration: 0,
            exitAnimationDuration: 0,
            data: {
              confirm: false,
              title: 'Invio Email',
              confirmMessage:
                "Sarà inviata una mail all'indirizzo di posta associato all'username inserito per il recupero della password"
            }
          });
          void this.router.navigate(['/login']);
        },
        error: () => {}
      });
    }
  }
}
