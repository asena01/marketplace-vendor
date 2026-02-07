import { Injectable } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const isLoggedIn = !!this.authService.getToken();
    if (!isLoggedIn) {
      this.router.navigate(['/auth/login']);
      return false;
    }
    return true;
  }
}

export const AuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isLoggedIn = !!authService.getToken();
  if (!isLoggedIn) {
    router.navigate(['/auth/login']);
    return false;
  }
  return true;
};