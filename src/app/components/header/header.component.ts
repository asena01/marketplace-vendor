import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.closeMenu();
  }
}
