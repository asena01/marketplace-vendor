import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<AuthUser | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor() {
    this.checkAuth();
  }

  private checkAuth(): void {
    const token = localStorage.getItem('auth_token');
    if (token) {
      const user: AuthUser = {
        id: 'vendor001',
        email: 'john@marketplace.com',
        name: 'John Doe',
        token
      };
      this.userSubject.next(user);
    }
  }

  login(email: string, password: string): Observable<AuthUser> {
    return of({
      id: 'vendor001',
      email,
      name: 'John Doe',
      token: `token_${Date.now()}`
    }).pipe(
      map(user => {
        localStorage.setItem('auth_token', user.token);
        this.userSubject.next(user);
        return user;
      }),
      delay(1000)
    );
  }

  register(email: string, password: string, name: string): Observable<AuthUser> {
    return of({
      id: `vendor${Date.now()}`,
      email,
      name,
      token: `token_${Date.now()}`
    }).pipe(
      map(user => {
        localStorage.setItem('auth_token', user.token);
        this.userSubject.next(user);
        return user;
      }),
      delay(1200)
    );
  }

  logout(): Observable<void> {
    return of(undefined).pipe(
      map(() => {
        localStorage.removeItem('auth_token');
        this.userSubject.next(null);
      }),
      delay(500)
    );
  }

  getCurrentUser(): Observable<AuthUser | null> {
    return this.user$;
  }

  isLoggedIn(): Observable<boolean> {
    return this.user$.pipe(map(user => !!user));
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}