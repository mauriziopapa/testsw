import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class ResetPasswordService {
  constructor(private http: HttpClient) {}

  sendEmail$(username: string): Observable<boolean> {
    return this.http
      .post<User>(`${environment.apiUrl}/recover_password`, { username: username })
      .pipe(
        map((data) => {
          return true;
        }),
        catchError(() => of(false))
      );
  }
}
