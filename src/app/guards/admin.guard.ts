import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const userType = localStorage.getItem('userType');

    if (userType === 'admin') {
      return true;
    }

    console.log('❌ Admin access denied - user type:', userType);
    this.router.navigate(['/']);
    return false;
  }
}
