import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuthModalService } from '../../services/auth-modal.service';

interface VendorType {
  id: string;
  name: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-signup-overlay',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
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
          <p class="text-blue-100 text-sm mt-2">Create a new account</p>
        </div>

        <!-- Form Container -->
        <div class="p-8">
          <!-- Step 1: Select Role -->
          @if (step() === 'role') {
            <div class="space-y-4">
              <h2 class="text-xl font-bold text-gray-800 mb-6">What are you?</h2>
              <button
                type="button"
                (click)="selectRole('customer')"
                class="w-full border-2 border-blue-500 bg-blue-50 text-blue-700 font-semibold py-4 rounded-lg hover:bg-blue-100 transition flex items-center gap-3"
              >
                <span class="text-3xl">👤</span>
                <div class="text-left">
                  <div>Customer</div>
                  <div class="text-sm font-normal text-blue-600">Browse & purchase</div>
                </div>
              </button>
              <button
                type="button"
                (click)="selectRole('vendor')"
                class="w-full border-2 border-orange-500 bg-orange-50 text-orange-700 font-semibold py-4 rounded-lg hover:bg-orange-100 transition flex items-center gap-3"
              >
                <span class="text-3xl">🏪</span>
                <div class="text-left">
                  <div>Vendor</div>
                  <div class="text-sm font-normal text-orange-600">Sell products/services</div>
                </div>
              </button>
            </div>
          }

          <!-- Step 2: Select Vendor Type -->
          @if (step() === 'vendor-type') {
            <div class="space-y-4">
              <button
                type="button"
                (click)="step.set('role')"
                class="text-blue-600 hover:text-blue-700 font-medium text-sm mb-4 flex items-center gap-2"
              >
                ← Back
              </button>
              <h2 class="text-xl font-bold text-gray-800 mb-4">What's your business type?</h2>
              <div class="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                @for (vendor of vendorTypes; track vendor.id) {
                  <button
                    type="button"
                    (click)="selectVendorType(vendor.id)"
                    class="border border-gray-300 p-3 rounded-lg hover:bg-gray-50 hover:border-blue-500 transition text-center"
                  >
                    <div class="text-2xl mb-1">{{ vendor.icon }}</div>
                    <div class="text-sm font-semibold text-gray-800">{{ vendor.name }}</div>
                  </button>
                }
              </div>
            </div>
          }

          <!-- Step 3: Signup Form -->
          @if (step() === 'form') {
            <div class="space-y-4">
              <button
                type="button"
                (click)="step.set('role')"
                class="text-blue-600 hover:text-blue-700 font-medium text-sm mb-4 flex items-center gap-2"
              >
                ← Back
              </button>

              @if (errorMessage()) {
                <div class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
                  <span class="text-xl">❌</span>
                  <div>
                    <p class="font-semibold">Signup Failed</p>
                    <p class="text-sm mt-1">{{ errorMessage() }}</p>
                  </div>
                </div>
              }

              <form [formGroup]="signupForm" (ngSubmit)="onSignup()" class="space-y-3">
                <!-- Name Field -->
                <div>
                  <label class="block text-gray-700 font-semibold mb-1 text-sm">Name</label>
                  <input
                    type="text"
                    formControlName="name"
                    placeholder="Your full name"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  @if (signupForm.get('name')?.hasError('required') && signupForm.get('name')?.touched) {
                    <p class="text-red-600 text-xs mt-1">Name is required</p>
                  }
                </div>

                <!-- Email Field -->
                <div>
                  <label class="block text-gray-700 font-semibold mb-1 text-sm">Email</label>
                  <input
                    type="email"
                    formControlName="email"
                    placeholder="your@email.com"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  @if (signupForm.get('email')?.hasError('required') && signupForm.get('email')?.touched) {
                    <p class="text-red-600 text-xs mt-1">Email is required</p>
                  }
                </div>

                <!-- Phone Field -->
                <div>
                  <label class="block text-gray-700 font-semibold mb-1 text-sm">Phone</label>
                  <input
                    type="tel"
                    formControlName="phone"
                    placeholder="+1 (555) 000-0000"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  @if (signupForm.get('phone')?.hasError('required') && signupForm.get('phone')?.touched) {
                    <p class="text-red-600 text-xs mt-1">Phone is required</p>
                  }
                </div>

                <!-- Business Name (Vendor Only) -->
                @if (userType() === 'vendor') {
                  <div>
                    <label class="block text-gray-700 font-semibold mb-1 text-sm">Business Name</label>
                    <input
                      type="text"
                      formControlName="businessName"
                      placeholder="Your business name"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                }

                <!-- Password Field -->
                <div>
                  <label class="block text-gray-700 font-semibold mb-1 text-sm">Password</label>
                  <input
                    [type]="showPassword() ? 'text' : 'password'"
                    formControlName="password"
                    placeholder="••••••••"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  @if (signupForm.get('password')?.hasError('required') && signupForm.get('password')?.touched) {
                    <p class="text-red-600 text-xs mt-1">Password is required</p>
                  }
                </div>

                <!-- Confirm Password Field -->
                <div>
                  <label class="block text-gray-700 font-semibold mb-1 text-sm">Confirm Password</label>
                  <input
                    [type]="showPassword() ? 'text' : 'password'"
                    formControlName="confirmPassword"
                    placeholder="••••••••"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  @if (signupForm.get('confirmPassword')?.hasError('required') && signupForm.get('confirmPassword')?.touched) {
                    <p class="text-red-600 text-xs mt-1">Please confirm password</p>
                  }
                  @if (signupForm.hasError('passwordMismatch') && signupForm.get('confirmPassword')?.touched) {
                    <p class="text-red-600 text-xs mt-1">Passwords do not match</p>
                  }
                </div>

                <!-- Terms Checkbox -->
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    formControlName="agreeToTerms"
                    class="w-4 h-4 text-blue-600 rounded"
                  />
                  <span class="text-gray-700 text-sm">I agree to Terms & Conditions</span>
                </label>
                @if (signupForm.get('agreeToTerms')?.hasError('required') && signupForm.get('agreeToTerms')?.touched) {
                  <p class="text-red-600 text-xs">You must agree to continue</p>
                }

                <!-- Submit Button -->
                <button
                  type="submit"
                  [disabled]="isLoading()"
                  class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                >
                  @if (isLoading()) {
                    <div class="animate-spin">⏳</div>
                    <span>Creating account...</span>
                  } @else {
                    <span>✨ Create Account</span>
                  }
                </button>
              </form>
            </div>
          }

          <!-- Sign In Link -->
          @if (step() === 'role') {
            <div class="text-center border-t border-gray-200 mt-6 pt-6">
              <p class="text-gray-700 text-sm">
                Already have an account?
                <button
                  type="button"
                  (click)="switchToLogin()"
                  class="text-blue-600 font-bold hover:text-blue-700 cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            </div>
          }
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
  `]
})
export class SignupOverlayComponent implements OnInit {
  step = signal<'role' | 'vendor-type' | 'form'>('role');
  userType = signal<'customer' | 'vendor' | ''>('');
  vendorType = signal<string>('');
  isLoading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);
  signupForm: FormGroup;

  vendorTypes: VendorType[] = [
    { id: 'restaurant', name: 'Restaurant', icon: '🍽️', description: 'Food & Beverage' },
    { id: 'hotel', name: 'Hotel', icon: '🏨', description: 'Hotel/BnB' },
    { id: 'clothing-store', name: 'Clothing', icon: '👕', description: 'Apparel' },
    { id: 'jewelry', name: 'Jewelry', icon: '💍', description: 'Jewelry' },
    { id: 'supermarket', name: 'Supermarket', icon: '🛒', description: 'Grocery' },
    { id: 'furniture', name: 'Furniture', icon: '🛋️', description: 'Furniture' },
    { id: 'hair-salon', name: 'Hair Salon', icon: '💇', description: 'Hair' },
    { id: 'pet-store', name: 'Pet Store', icon: '🐾', description: 'Pets' },
    { id: 'gym', name: 'Gym', icon: '🏋️', description: 'Fitness' },
    { id: 'tour-operator', name: 'Tours', icon: '✈️', description: 'Travel' },
    { id: 'salon-spa', name: 'Salon & Spa', icon: '💅', description: 'Beauty' },
    { id: 'general', name: 'General', icon: '🏪', description: 'Other' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private authModalService: AuthModalService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      businessName: [''],
      phone: ['', Validators.required],
      agreeToTerms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Focus on role selection for better UX
    setTimeout(() => {
      const button = document.querySelector('button[type="button"]') as HTMLButtonElement;
      button?.focus();
    }, 300);
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  selectRole(role: 'customer' | 'vendor') {
    this.userType.set(role);
    if (role === 'customer') {
      this.step.set('form');
    } else {
      this.step.set('vendor-type');
    }
    this.errorMessage.set('');
  }

  selectVendorType(type: string) {
    this.vendorType.set(type);
    this.step.set('form');
  }

  closeModal(): void {
    this.authModalService.closeModal();
  }

  switchToLogin(): void {
    this.authModalService.switchToLogin();
  }

  onSignup(): void {
    this.errorMessage.set('');

    if (this.signupForm.invalid) {
      this.errorMessage.set('Please fill in all fields correctly');
      return;
    }

    this.isLoading.set(true);

    const formData = {
      ...this.signupForm.value,
      userType: this.userType(),
      vendorType: this.vendorType()
    };

    this.authService.signup(formData).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);

        if (response.success) {
          this.authModalService.closeModal();
          setTimeout(() => {
            const userType = this.authService.getUserType();
            if (userType === 'vendor') {
              this.router.navigate(['/vendor-dashboard', this.vendorType()]);
            } else if (userType === 'customer') {
              this.router.navigate(['/customer-dashboard']);
            } else {
              this.router.navigate(['/']);
            }
          }, 1000);
        } else {
          this.errorMessage.set(response.message || 'Signup failed');
        }
      },
      error: (error: any) => {
        this.isLoading.set(false);
        console.error('Signup error:', error);

        if (error.status === 400) {
          this.errorMessage.set(error.error?.message || 'Email already exists');
        } else {
          this.errorMessage.set('An error occurred. Please try again.');
        }
      }
    });
  }
}
