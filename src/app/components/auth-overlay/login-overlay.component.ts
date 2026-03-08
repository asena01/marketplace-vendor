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
            <span class="text-gray-600 text-sm">Quick Login</span>
            <div class="flex-1 border-t border-gray-300"></div>
          </div>

          <div class="space-y-2 mb-6">
            <button
              type="button"
              (click)="loginAsDemo('admin')"
              [disabled]="isLoading()"
              class="w-full border border-slate-700 text-slate-700 font-semibold py-2 rounded-lg hover:bg-slate-50 transition disabled:opacity-50 text-sm"
            >
              ⚙️ Demo Admin
            </button>
            <button
              type="button"
              (click)="loginAsDemo('customer')"
              [disabled]="isLoading()"
              class="w-full border border-green-500 text-green-700 font-semibold py-2 rounded-lg hover:bg-green-50 transition disabled:opacity-50 text-sm"
            >
              👤 Demo Customer
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

  loginAsDemo(type: 'admin' | 'customer'): void {
    const demoCredentials = {
      admin: {
        email: 'admin@demo.com',
        password: 'admin123456'
      },
      customer: {
        email: 'customer@demo.com',
        password: 'demo123456'
      }
    };

    const credentials = demoCredentials[type];
    this.loginForm.patchValue(credentials);

    setTimeout(() => {
      this.onLogin();
    }, 300);
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
      'service': ['/service-dashboard'],
      'tours': ['/tours-dashboard'],
      'retail': ['/retail-dashboard'],
      'tour-operator': ['/tours-dashboard']
    };

    const route = dashboardRoutes[vendorType] || ['/vendor-dashboard', vendorType];
    this.router.navigate(route);
  }
}
