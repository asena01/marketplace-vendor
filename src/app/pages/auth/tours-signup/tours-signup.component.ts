import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-tours-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="text-5xl mb-4">✈️</div>
          <h1 class="text-3xl font-bold text-gray-900">Launch Your Travel Agency</h1>
          <p class="text-gray-600 mt-2">Create tour packages and manage bookings with MarketHub</p>
        </div>

        <!-- Success Message -->
        @if (successMessage()) {
          <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-green-800">
            <p class="font-medium">{{ successMessage() }}</p>
            <p class="text-sm mt-1">Redirecting to your dashboard...</p>
          </div>
        }

        <!-- Error Message -->
        @if (errorMessage()) {
          <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800">
            {{ errorMessage() }}
          </div>
        }

        <!-- Registration Form -->
        <form [formGroup]="signupForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Personal Information Section -->
          <div class="border-b border-gray-200 pb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">Full Name</label>
                <input
                  formControlName="name"
                  type="text"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your name"
                  [disabled]="isLoading()"
                />
                @if (signupForm.get('name')?.touched && signupForm.get('name')?.invalid) {
                  <p class="text-red-500 text-xs mt-1">Please enter your full name</p>
                }
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">Phone Number</label>
                <input
                  formControlName="phone"
                  type="tel"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+1 (555) 000-0000"
                  [disabled]="isLoading()"
                />
                @if (signupForm.get('phone')?.touched && signupForm.get('phone')?.invalid) {
                  <p class="text-red-500 text-xs mt-1">Please enter your phone number</p>
                }
              </div>
            </div>

            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-900 mb-2">Email Address</label>
              <input
                formControlName="email"
                type="email"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your@email.com"
                [disabled]="isLoading()"
              />
              @if (signupForm.get('email')?.touched && signupForm.get('email')?.invalid) {
                <p class="text-red-500 text-xs mt-1">Please enter a valid email address</p>
              }
            </div>
          </div>

          <!-- Travel Agency Information Section -->
          <div class="border-b border-gray-200 pb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Travel Agency Details</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">Agency Name</label>
                <input
                  formControlName="businessName"
                  type="text"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your agency name"
                  [disabled]="isLoading()"
                />
                @if (signupForm.get('businessName')?.touched && signupForm.get('businessName')?.invalid) {
                  <p class="text-red-500 text-xs mt-1">Please enter your agency name</p>
                }
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">Specialization</label>
                <select
                  formControlName="specialization"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  [disabled]="isLoading()"
                >
                  <option value="">Select specialization</option>
                  <option value="adventure">Adventure Tours</option>
                  <option value="luxury">Luxury Travel</option>
                  <option value="cultural">Cultural Tours</option>
                  <option value="cruises">Cruise Packages</option>
                  <option value="beach">Beach Resorts</option>
                  <option value="group">Group Tours</option>
                  <option value="honeymoon">Honeymoon Packages</option>
                  <option value="general">General Travel</option>
                </select>
              </div>
            </div>

            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-900 mb-2">About Your Agency</label>
              <textarea
                formControlName="businessDescription"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell us about your travel agency..."
                rows="3"
                [disabled]="isLoading()"
              ></textarea>
            </div>
          </div>

          <!-- Security Section -->
          <div class="border-b border-gray-200 pb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Security</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">Password</label>
                <input
                  formControlName="password"
                  type="password"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="At least 6 characters"
                  [disabled]="isLoading()"
                />
                @if (signupForm.get('password')?.touched && signupForm.get('password')?.invalid) {
                  <p class="text-red-500 text-xs mt-1">Password must be at least 6 characters</p>
                }
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-900 mb-2">Confirm Password</label>
                <input
                  formControlName="confirmPassword"
                  type="password"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm your password"
                  [disabled]="isLoading()"
                />
                @if (signupForm.hasError('passwordMismatch') && signupForm.get('confirmPassword')?.touched) {
                  <p class="text-red-500 text-xs mt-1">Passwords do not match</p>
                }
              </div>
            </div>
          </div>

          <!-- Terms & Conditions -->
          <div class="flex items-start gap-3">
            <input
              formControlName="agreeToTerms"
              type="checkbox"
              class="w-4 h-4 mt-1 rounded border-gray-300 focus:ring-blue-500"
              [disabled]="isLoading()"
            />
            <label class="text-sm text-gray-600">
              I agree to the <a href="#" class="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" class="text-blue-600 hover:underline">Privacy Policy</a>
            </label>
          </div>
          @if (signupForm.get('agreeToTerms')?.touched && signupForm.get('agreeToTerms')?.invalid) {
            <p class="text-red-500 text-xs">You must agree to the terms</p>
          }

          <!-- Submit Button -->
          <button
            type="submit"
            [disabled]="!signupForm.valid || isLoading()"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition"
          >
            {{ isLoading() ? 'Creating Agency...' : 'Create Travel Agency' }}
          </button>
        </form>

        <!-- Login Link -->
        <div class="text-center mt-6">
          <p class="text-gray-600">
            Already have an account?
            <a routerLink="/login" class="text-blue-600 hover:underline font-medium">Login here</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    input:disabled, textarea:disabled, select:disabled {
      background-color: #f3f4f6;
      cursor: not-allowed;
    }
  `]
})
export class ToursSignupComponent {
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  signupForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      phone: ['', Validators.required],
      businessName: ['', [Validators.required, Validators.minLength(3)]],
      specialization: [''],
      businessDescription: [''],
      agreeToTerms: [false, Validators.requiredTrue],
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  async onSubmit() {
    if (!this.signupForm.valid) {
      this.errorMessage.set('Please fill in all required fields correctly');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const signupData = {
      ...this.signupForm.value,
      userType: 'vendor',
      vendorType: 'tour-operator',
    };

    this.authService.signup(signupData).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage.set('Welcome to MarketHub! Setting up your dashboard...');
          setTimeout(() => {
            this.router.navigate(['/vendor-dashboard/tours']);
          }, 2000);
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.error?.message || 'Registration failed. Please try again.');
        console.error('Registration error:', error);
      }
    });
  }
}
