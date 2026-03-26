import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, map, catchError } from 'rxjs/operators';
import { CacheService } from '../core/cache.service';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LoginRequest } from '../models/login.request';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private loggedUser: User | undefined;

  constructor(private http: HttpClient, private cacheService: CacheService) {}

  login(loginRequest: LoginRequest): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/users/login`, loginRequest).pipe(
      tap((data) => {
        this.loggedUser = data;
        return of(this.loggedUser);
      })
    );
  }

  isLoggedIn$(): Observable<boolean> {
    if (!this.loggedUser) {
      return this.http.get<User>(`${environment.apiUrl}/users/account`).pipe(
        map((data) => {
          this.loggedUser = data;
          return true;
        }),
        catchError(() => of(false))
      );
    }
    return of(true);
  }

  logout(): Observable<void> {
    return this.http
      .get<void>(`${environment.apiUrl}/users/logout`)
      .pipe(tap(() => this.doLogoutUser()));
  }

  getCurrentUser(): User | undefined {
    return this.loggedUser;
  }

  private doLogoutUser() {
    this.cacheService.pruneAll();
    this.loggedUser = undefined;
  }
}
