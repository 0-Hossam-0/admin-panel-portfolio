import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { APP_URL } from '../environment/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}
  login(username: string, password: string): Observable<Object> {
    return this.http.post(
      `${APP_URL}/user/login`,
      {
        username,
        password,
      },
      { withCredentials: true }
    );
  }
  logout(): Observable<boolean> {
    return this.http
      .get(`${APP_URL}/user/logout`, {
        withCredentials: true,
      })
      .pipe(
        map(() => true),
        catchError((err) => {
          console.log('Logout failed, status:', err.status);
          return of(false);
        })
      );
  }
  isAuthenticated(): Observable<boolean> {
    return this.http
      .get(`${APP_URL}/user/auth`, {
        observe: 'response',
        withCredentials: true,
      })
      .pipe(
        map(() => true),
        catchError((err) => {
          console.log('Auth check failed, status:', err.status);
          return of(false);
        })
      );
  }
}
