/* eslint-disable @typescript-eslint/unbound-method */
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginRequest } from 'src/app/models/login.request';
import { LoginService } from 'src/app/services/login.service';

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: false
})
export class LoginComponent {
  form: FormGroup;
  public loginInvalid = false;
  private formSubmitAttempt = false;

  constructor(private fb: FormBuilder, private router: Router, private loginService: LoginService) {
    this.form = this.fb.nonNullable.group({
      username: '',
      password: ''
    });
  }

  resetPassword(): void {
    void this.router.navigate(['/recupera_password']);
  }

  onSubmit(): void {
    this.loginInvalid = false;
    this.formSubmitAttempt = false;
    if (this.form.valid) {
      try {
        const loginRequest: LoginRequest = {
          username: <string>this.form.get('username')?.value,
          password: <string>this.form.get('password')?.value
        };

        this.loginService.login(loginRequest).subscribe({
          next: (response) => void this.router.navigate([`/${response.dashboards[0].url}`]),
          error: () => (this.loginInvalid = true)
        });
      } catch (err) {
        this.loginInvalid = true;
      }
    } else {
      this.formSubmitAttempt = true;
    }
  }
}
