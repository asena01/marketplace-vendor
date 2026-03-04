import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <!-- Card Container -->
        <div class="bg-white rounded-2xl shadow-2xl overflow-hidden border border-blue-100 animate-slide-up">
          <!-- Header -->
          <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-8 text-center">
            <div class="text-5xl mb-4">🔐</div>
            <h1 class="text-3xl font-bold text-white">Reset Password</h1>
            <p class="text-blue-100 text-sm mt-2">Enter your email to receive reset instructions</p>
          </div>

          <!-- Form Container -->
          <div class="p-8">
            <!-- Success Message -->
            @if (successMessage()) {
              <div class="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg mb-6 animate-slide-up">
                <p class="font-semibold">Check Your Email</p>
                <p class="text-sm mt-1">{{ successMessage() }}</p>
              </div>
            }

            <!-- Error Message -->
            @if (errorMessage()) {
              <div class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6 animate-slide-up flex items-start gap-3">
                <span class="text-xl">❌</span>
                <div>
                  <p class="font-semibold">Error</p>
                  <p class="text-sm mt-1">{{ errorMessage() }}</p>
                </div>
              </div>
            }

            @if (!successMessage()) {
              <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="space-y-5">
                <!-- Email Field -->
                <div>
                  <label class="block text-gray-700 font-semibold mb-2">Email Address</label>
                  <input
                    type="email"
                    formControlName="email"
                    placeholder="your@email.com"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  @if (resetForm.get('email')?.hasError('required') && resetForm.get('email')?.touched) {
                    <p class="text-red-600 text-sm mt-2">Email is required</p>
                  }
                  @if (resetForm.get('email')?.hasError('email') && resetForm.get('email')?.touched) {
                    <p class="text-red-600 text-sm mt-2">Please enter a valid email</p>
                  }
                </div>

                <!-- Info Message -->
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                  <p class="font-semibold mb-1">📧 What happens next?</p>
                  <p>We'll send a password reset link to your email. Click the link to set a new password.</p>
                </div>

                <!-- Submit Button -->
                <button
                  type="submit"
                  [disabled]="isLoading()"
                  class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  @if (isLoading()) {
                    <div class="animate-spin">⏳</div>
                    <span>Sending...</span>
                  } @else {
                    <span>📧 Send Reset Link</span>
                  }
                </button>
              </form>
            }

            <!-- Back to Login Link -->
            <div class="text-center border-t border-gray-200 pt-6 mt-6">
              <p class="text-gray-700 text-sm">
                Remember your password?
                <a href="/login" class="text-blue-600 font-bold hover:text-blue-700">Back to Sign In</a>
              </p>
            </div>
          </div>
        </div>

        <!-- Footer Info -->
        <div class="text-center mt-8 text-gray-600 text-sm">
          <p>🔒 Your data is secure and encrypted</p>
          <p class="mt-2">⏱️ Reset links expire in 24 hours</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
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

    .animate-slide-up {
      animation: slideUp 0.5s ease-out;
    }

    button:disabled {
      cursor: not-allowed;
    }
  `]
})
export class ForgotPasswordComponent {
  resetForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.resetForm.invalid) {
      this.errorMessage.set('Please enter a valid email');
      return;
    }

    this.isLoading.set(true);

    const { email } = this.resetForm.value;

    // For now, we'll show a success message without backend integration
    // In a real app, this would call a backend endpoint
    setTimeout(() => {
      this.isLoading.set(false);
      this.successMessage.set(`Password reset link sent to ${email}. Check your inbox and follow the instructions.`);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 3000);
    }, 1500);
  }
}
