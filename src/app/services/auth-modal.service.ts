import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthModalService {
  isLoginOpen = signal(false);
  isSignupOpen = signal(false);

  constructor(private router: Router) {}

  openLogin(): void {
    this.isLoginOpen.set(true);
    this.isSignupOpen.set(false);
  }

  openSignup(): void {
    this.isSignupOpen.set(true);
    this.isLoginOpen.set(false);
  }

  closeModal(): void {
    this.isLoginOpen.set(false);
    this.isSignupOpen.set(false);
  }

  switchToSignup(): void {
    this.isLoginOpen.set(false);
    this.isSignupOpen.set(true);
  }

  switchToLogin(): void {
    this.isSignupOpen.set(false);
    this.isLoginOpen.set(true);
  }
}
