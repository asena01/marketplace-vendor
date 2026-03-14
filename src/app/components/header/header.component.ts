import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuthModalService } from '../../services/auth-modal.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  isMenuOpen = signal(false);

  constructor(
    private authService: AuthService,
    private authModalService: AuthModalService,
    private router: Router
  ) {}

  toggleMenu() {
    this.isMenuOpen.update(value => !value);
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }

  isLoggedIn(): boolean {
    const user = this.authService.getCurrentUser();
    return !!user;
  }

  isCustomer(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.userType === 'customer';
  }

  navigateToDashboard(): void {
    this.router.navigate(['/customer-dashboard']);
    this.closeMenu();
  }

  openLogin(): void {
    console.log("LOGIN CLICKED");
    this.authModalService.openLogin();
    this.closeMenu();
  }

  openSignup(): void {
    this.authModalService.openSignup();
    this.closeMenu();
  }

  logout(): void {
    this.authService.logout();
    this.authModalService.closeModal();
    this.router.navigate(['/']);
    this.closeMenu();
  }
}
