import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}
  login(username: string, password: string): Observable<Object> {
    return this.http.post(
      'http://localhost:3000/api/user/login',
      {
        username,
        password,
      },
      { withCredentials: true }
    );
  }
  logout(): Observable<boolean> {
    return this.http
      .get('http://localhost:3000/api/user/logout', {
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
      .get('http://localhost:3000/api/user/auth', {
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
