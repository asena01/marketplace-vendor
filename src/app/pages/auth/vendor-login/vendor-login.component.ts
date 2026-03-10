import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-vendor-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vendor-login.component.html',
  styleUrl: './vendor-login.component.css'
})
export class VendorLoginComponent {
  email = signal<string>('');
  password = signal<string>('');
  isLoading = signal(false);
  error = signal<string>('');
  selectedDemo = signal<string>('');

  demoCredentials = [
    {
      name: '🛋️ Furniture Vendor',
      email: 'furniture@demo.com',
      password: 'furniture123456',
      id: 'furniture'
    },
   
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  selectDemoAccount(credential: any): void {
    this.selectedDemo.set(credential.id);
    this.email.set(credential.email);
    this.password.set(credential.password);
  }

  login(): void {
    if (!this.email() || !this.password()) {
      this.error.set('Please enter email and password');
      return;
    }

    this.isLoading.set(true);
    this.error.set('');

    this.authService.login(this.email(), this.password()).subscribe({
      next: (response: any) => {
        if (response.success) {
          // AuthService.login() already stores user and updates state via tap()

          // Navigate to appropriate dashboard based on vendor type
          const vendorType = response.user.vendorType;
          this.redirectVendorToDashboard(vendorType);
        } else {
          this.error.set(response.message || 'Login failed');
          this.isLoading.set(false);
        }
      },
      error: (error: any) => {
        this.error.set(error.error?.message || 'Login error occurred');
        this.isLoading.set(false);
      }
    });
  }

  showPassword = signal(false);

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  private redirectVendorToDashboard(vendorType: string | null): void {
    if (!vendorType) {
      this.router.navigate(['/']);
      return;
    }

    // Map vendor types to their specific dashboards
    const dashboardRoutes: Record<string, string[]> = {
      'delivery': ['/delivery-dashboard'],
      'hotel': ['/hotel-dashboard'],
      'restaurant': ['/restaurant-dashboard'],
      'service': ['/service-dashboard'],
      'tours': ['/tours-dashboard'],
      'retail': ['/retail-dashboard'],
      'tour-operator': ['/tours-dashboard'],
      // Fallback for any other vendor type
    };

    const route = dashboardRoutes[vendorType] || ['/vendor-dashboard', vendorType];
    this.router.navigate(route);
  }
}
