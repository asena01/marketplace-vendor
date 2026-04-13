import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-staff-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-[radial-gradient(circle_at_top_left,_#e0f2fe,_transparent_35%),linear-gradient(135deg,#f8fafc,#e2e8f0)] flex items-center justify-center p-6">
      <div class="w-full max-w-md rounded-3xl bg-white/95 p-8 shadow-2xl">
        <p class="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">Hotel Staff</p>
        <h1 class="mt-3 text-3xl font-bold text-slate-900">Staff Sign In</h1>
        <p class="mt-2 text-sm text-slate-600">Use the temporary password from hotel admin, then change it in your profile.</p>

        <form class="mt-8 space-y-4" (ngSubmit)="login()">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <input [(ngModel)]="email" name="email" type="email" required class="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Password</label>
            <input [(ngModel)]="password" name="password" type="password" required class="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>

          @if (errorMessage()) {
            <div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {{ errorMessage() }}
            </div>
          }

          <button type="submit" [disabled]="isLoading()" class="w-full rounded-xl bg-sky-600 px-4 py-3 font-semibold text-white hover:bg-sky-700 disabled:opacity-60">
            {{ isLoading() ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
      </div>
    </div>
  `
})
export class StaffLoginComponent {
  email = '';
  password = '';
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(private authService: AuthService, private router: Router) {}

  login(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.loginStaff(this.email, this.password).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        if (!response.success) {
          this.errorMessage.set(response.message || 'Unable to sign in');
          return;
        }
        this.router.navigateByUrl('/staff-dashboard/my-schedule');
      },
      error: (error: any) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.error?.message || 'Unable to sign in');
      }
    });
  }
}
