import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuthModalService } from '../../services/auth-modal.service';

@Component({
  selector: 'app-login-overlay',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <!-- Modal Card -->
      <div class="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full max-h-[90vh] overflow-y-auto animate-slide-up relative">
        <!-- Close Button (X) -->
        <button
          (click)="closeModal()"
          class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10 p-2 hover:bg-gray-100 rounded-full transition"
          title="Close"
        >
          <span class="text-2xl">✕</span>
        </button>

        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-8 text-center">
          <div class="text-5xl mb-4">🏪</div>
          <h1 class="text-3xl font-bold text-white">MarketHub</h1>
          <p class="text-blue-100 text-sm mt-2">Sign in to your account</p>
        </div>

        <!-- Form Container -->
        <div class="p-8">
          <!-- Error Message -->
          @if (errorMessage()) {
            <div class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6 animate-slide-up flex items-start gap-3">
              <span class="text-xl">❌</span>
              <div>
                <p class="font-semibold">Login Failed</p>
                <p class="text-sm mt-1">{{ errorMessage() }}</p>
              </div>
            </div>
          }

          <!-- Success Message -->
          @if (successMessage()) {
            <div class="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg mb-6 animate-slide-up flex items-start gap-3">
              <span class="text-xl">✅</span>
              <div>
                <p class="font-semibold">Login Successful</p>
                <p class="text-sm mt-1">{{ successMessage() }}</p>
              </div>
            </div>
          }

          <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="space-y-5">
            <!-- Email Field -->
            <div>
              <label class="block text-gray-700 font-semibold mb-2">Email Address</label>
              <input
                type="email"
                formControlName="email"
                placeholder="your@email.com"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              @if (loginForm.get('email')?.hasError('required') && loginForm.get('email')?.touched) {
                <p class="text-red-600 text-sm mt-2">Email is required</p>
              }
              @if (loginForm.get('email')?.hasError('email') && loginForm.get('email')?.touched) {
                <p class="text-red-600 text-sm mt-2">Please enter a valid email</p>
              }
            </div>

            <!-- Password Field -->
            <div>
              <label class="block text-gray-700 font-semibold mb-2">Password</label>
              <input
                [type]="showPassword() ? 'text' : 'password'"
                formControlName="password"
                placeholder="••••••••"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <button
                type="button"
                (click)="togglePasswordVisibility()"
                class="text-blue-600 text-sm mt-2 hover:text-blue-700 font-medium"
              >
                {{ showPassword() ? 'Hide' : 'Show' }} Password
              </button>
              @if (loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched) {
                <p class="text-red-600 text-sm mt-2">Password is required</p>
              }
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="isLoading()"
              class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              @if (isLoading()) {
                <div class="animate-spin">⏳</div>
                <span>Signing in...</span>
              } @else {
                <span>🔓 Sign In</span>
              }
            </button>
          </form>

          <!-- Demo Accounts Quick Access -->
          <div class="flex items-center gap-4 my-6">
            <div class="flex-1 border-t border-gray-300"></div>
            <span class="text-gray-600 text-sm">Quick Demo Login</span>
            <div class="flex-1 border-t border-gray-300"></div>
          </div>

          <div class="grid grid-cols-2 gap-2 mb-6 max-h-48 overflow-y-auto">
            <!-- Admin Accounts -->
            <button
              type="button"
              (click)="loginAsDemo('admin')"
              [disabled]="isLoading()"
              class="border border-slate-700 text-slate-700 font-semibold py-2 rounded-lg hover:bg-slate-50 transition disabled:opacity-50 text-xs"
            >
              ⚙️ Super Admin
            </button>
            <button
              type="button"
              (click)="loginAsDemo('finance')"
              [disabled]="isLoading()"
              class="border border-green-600 text-green-700 font-semibold py-2 rounded-lg hover:bg-green-50 transition disabled:opacity-50 text-xs"
            >
              💰 Finance Mgr
            </button>

            <!-- Customers -->
            <button
              type="button"
              (click)="loginAsDemo('customer')"
              [disabled]="isLoading()"
              class="border border-blue-500 text-blue-700 font-semibold py-2 rounded-lg hover:bg-blue-50 transition disabled:opacity-50 text-xs"
            >
              👤 Customer
            </button>
            <button
              type="button"
              (click)="loginAsDemo('customer2')"
              [disabled]="isLoading()"
              class="border border-blue-500 text-blue-700 font-semibold py-2 rounded-lg hover:bg-blue-50 transition disabled:opacity-50 text-xs"
            >
              👨 Customer 2
            </button>

            <!-- Vendors -->
            <button
              type="button"
              (click)="loginAsDemo('hotel')"
              [disabled]="isLoading()"
              class="border border-purple-500 text-purple-700 font-semibold py-2 rounded-lg hover:bg-purple-50 transition disabled:opacity-50 text-xs"
            >
              🏨 Hotel
            </button>
            <button
              type="button"
              (click)="loginAsDemo('restaurant')"
              [disabled]="isLoading()"
              class="border border-orange-500 text-orange-700 font-semibold py-2 rounded-lg hover:bg-orange-50 transition disabled:opacity-50 text-xs"
            >
              🍽️ Restaurant
            </button>
            <button
              type="button"
              (click)="loginAsDemo('retail')"
              [disabled]="isLoading()"
              class="border border-red-500 text-red-700 font-semibold py-2 rounded-lg hover:bg-red-50 transition disabled:opacity-50 text-xs"
            >
              🛍️ Retail
            </button>
            <button
              type="button"
              (click)="loginAsDemo('delivery')"
              [disabled]="isLoading()"
              class="border border-pink-500 text-pink-700 font-semibold py-2 rounded-lg hover:bg-pink-50 transition disabled:opacity-50 text-xs"
            >
              🚚 Delivery
            </button>
            <button
              type="button"
              (click)="loginAsDemo('hair')"
              [disabled]="isLoading()"
              class="border border-indigo-500 text-indigo-700 font-semibold py-2 rounded-lg hover:bg-indigo-50 transition disabled:opacity-50 text-xs"
            >
              💇 Hair Salon
            </button>
            <button
              type="button"
              (click)="loginAsDemo('gym')"
              [disabled]="isLoading()"
              class="border border-yellow-600 text-yellow-700 font-semibold py-2 rounded-lg hover:bg-yellow-50 transition disabled:opacity-50 text-xs"
            >
              🏋️ Gym
            </button>
            <button
              type="button"
              (click)="loginAsDemo('tours')"
              [disabled]="isLoading()"
              class="border border-teal-500 text-teal-700 font-semibold py-2 rounded-lg hover:bg-teal-50 transition disabled:opacity-50 text-xs"
            >
              ✈️ Tours
            </button>
            <button
              type="button"
              (click)="loginAsDemo('pets')"
              [disabled]="isLoading()"
              class="border border-amber-600 text-amber-700 font-semibold py-2 rounded-lg hover:bg-amber-50 transition disabled:opacity-50 text-xs"
            >
              🐾 Pet Store
            </button>
          </div>

          <!-- Sign Up Link -->
          <div class="text-center border-t border-gray-200 pt-6">
            <p class="text-gray-700 text-sm">
              Don't have an account?
              <button
                type="button"
                (click)="switchToSignup()"
                class="text-blue-600 font-bold hover:text-blue-700 cursor-pointer"
              >
                Create one
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes slideUp {
      from {
        transform: translateY(30px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .animate-fade-in {
      animation: fadeIn 0.3s ease-out;
    }

    .animate-slide-up {
      animation: slideUp 0.3s ease-out;
    }

    button:disabled {
      cursor: not-allowed;
    }
  `]
})
export class LoginOverlayComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  showPassword = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private authModalService: AuthModalService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Focus on email input for better UX
    setTimeout(() => {
      const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
      emailInput?.focus();
    }, 300);
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(value => !value);
  }

  closeModal(): void {
    this.authModalService.closeModal();
  }

  switchToSignup(): void {
    this.authModalService.switchToSignup();
  }

  onLogin(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.loginForm.invalid) {
      this.errorMessage.set('Please fill in all fields correctly');
      return;
    }

    this.isLoading.set(true);

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);

        if (response.success) {
          this.successMessage.set('Welcome back! Redirecting...');

          setTimeout(() => {
            this.authModalService.closeModal();
            const userType = this.authService.getUserType();
            if (userType === 'admin') {
              this.router.navigate(['/admin-dashboard']);
            } else if (userType === 'vendor') {
              const vendorType = this.authService.getVendorType();
              this.redirectVendorToDashboard(vendorType);
            } else if (userType === 'customer') {
              this.router.navigate(['/customer-dashboard']);
            } else {
              this.router.navigate(['/']);
            }
          }, 1500);
        } else {
          this.errorMessage.set(response.message || 'Login failed');
        }
      },
      error: (error: any) => {
        this.isLoading.set(false);
        console.error('Login error:', error);

        if (error.status === 401) {
          this.errorMessage.set('Invalid email or password');
        } else if (error.status === 0) {
          this.errorMessage.set('Cannot connect to server. Please try again later.');
        } else if (error.status === 400) {
          this.errorMessage.set(error.error?.message || 'Invalid credentials');
        } else {
          this.errorMessage.set('An error occurred. Please try again.');
        }
      }
    });
  }

  loginAsDemo(type: string): void {
    const demoCredentials: Record<string, { email: string; password: string }> = {
      // Admin Accounts
      admin: { email: 'admin@demo.com', password: 'admin123456' },
      finance: { email: 'finance@demo.com', password: 'demo123456' },
      compliance: { email: 'compliance@demo.com', password: 'demo123456' },
      support: { email: 'support@demo.com', password: 'demo123456' },
      // Customer Accounts
      customer: { email: 'customer@demo.com', password: 'demo123456' },
      customer2: { email: 'sarah@demo.com', password: 'demo123456' },
      customer3: { email: 'mike@demo.com', password: 'demo123456' },
      // Vendor Accounts
      hotel: { email: 'hotel@demo.com', password: 'demo123456' },
      restaurant: { email: 'restaurant@demo.com', password: 'demo123456' },
      retail: { email: 'retail@demo.com', password: 'demo123456' },
      delivery: { email: 'delivery@demo.com', password: 'demo123456' },
      hair: { email: 'hair@demo.com', password: 'demo123456' },
      gym: { email: 'gym@demo.com', password: 'demo123456' },
      pets: { email: 'pets@demo.com', password: 'demo123456' },
      tours: { email: 'tours@demo.com', password: 'demo123456' },
      service: { email: 'service@demo.com', password: 'demo123456' },
      clothing: { email: 'clothing@demo.com', password: 'demo123456' },
      jewelry: { email: 'jewelry@demo.com', password: 'demo123456' },
      furniture: { email: 'furniture@demo.com', password: 'demo123456' },
      spa: { email: 'spa@demo.com', password: 'demo123456' }
    };

    const credentials = demoCredentials[type];
    if (credentials) {
      this.loginForm.patchValue(credentials);
      setTimeout(() => {
        this.onLogin();
      }, 300);
    } else {
      this.errorMessage.set('Invalid demo account type');
    }
  }

  private redirectVendorToDashboard(vendorType: string | null): void {
    if (!vendorType) {
      this.router.navigate(['/']);
      return;
    }

    const dashboardRoutes: Record<string, string[]> = {
      'delivery': ['/delivery-dashboard'],
      'hotel': ['/hotel-dashboard'],
      'restaurant': ['/restaurant-dashboard'],
      'retail': ['/retail-dashboard'],
      'service': ['/service-dashboard'],
      'tours': ['/tours-dashboard'],
      'tour-operator': ['/tours-dashboard'],
      // All other vendor types route to generic vendor dashboard
      'clothing-store': ['/retail-dashboard'],
      'jewelry': ['/retail-dashboard'],
      'supermarket': ['/retail-dashboard'],
      'furniture': ['/retail-dashboard'],
      'hair-salon': ['/service-dashboard'],
      'pet-store': ['/retail-dashboard'],
      'gym': ['/service-dashboard'],
      'car-rental': ['/service-dashboard'],
      'event-center': ['/service-dashboard'],
      'salon-spa': ['/service-dashboard']
    };

    const route = dashboardRoutes[vendorType] || ['/vendor-dashboard', vendorType];
    this.router.navigate(route);
  }
}