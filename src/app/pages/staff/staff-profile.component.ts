import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-staff-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8 space-y-6">
      <div>
        <h1 class="text-3xl font-bold text-slate-900">My Profile</h1>
        <p class="mt-1 text-slate-600">Review your role and change your password.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="rounded-2xl bg-white p-6 shadow-sm">
          <h2 class="text-lg font-bold text-slate-900">Profile Details</h2>
          <div class="mt-5 space-y-3 text-sm text-slate-700">
            <p><span class="font-semibold">Name:</span> {{ user()?.name }}</p>
            <p><span class="font-semibold">Email:</span> {{ user()?.email }}</p>
            <p><span class="font-semibold">Position:</span> {{ formatLabel(user()?.staffPosition || '') }}</p>
            <p><span class="font-semibold">Access Role:</span> {{ formatLabel(user()?.accessRole || '') }}</p>
            <p><span class="font-semibold">Hotel:</span> {{ user()?.hotelName }}</p>
          </div>
        </div>

        <div class="rounded-2xl bg-white p-6 shadow-sm">
          <h2 class="text-lg font-bold text-slate-900">Change Password</h2>
          @if (user()?.mustChangePassword) {
            <div class="mt-4 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
              You must change your temporary password before continuing normal work.
            </div>
          }
          <form class="mt-5 space-y-4" (ngSubmit)="changePassword()">
            <input [(ngModel)]="currentPassword" name="currentPassword" type="password" placeholder="Current password" required class="w-full rounded-xl border border-slate-300 px-4 py-3" />
            <input [(ngModel)]="newPassword" name="newPassword" type="password" placeholder="New password" required class="w-full rounded-xl border border-slate-300 px-4 py-3" />
            <input [(ngModel)]="confirmPassword" name="confirmPassword" type="password" placeholder="Confirm new password" required class="w-full rounded-xl border border-slate-300 px-4 py-3" />

            @if (message()) {
              <div class="rounded-xl px-4 py-3 text-sm" [class.bg-emerald-50]="messageType() === 'success'" [class.text-emerald-700]="messageType() === 'success'" [class.bg-red-50]="messageType() === 'error'" [class.text-red-700]="messageType() === 'error'">
                {{ message() }}
              </div>
            }

            <button type="submit" class="rounded-xl bg-sky-600 px-5 py-3 font-semibold text-white hover:bg-sky-700">Update Password</button>
          </form>
        </div>
      </div>
    </div>
  `
})
export class StaffProfileComponent {
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  message = signal('');
  messageType = signal<'success' | 'error'>('success');

  constructor(private authService: AuthService, private router: Router) {
    if (!this.authService.isStaff()) {
      this.router.navigateByUrl('/staff-login');
    }
  }

  user() {
    return this.authService.currentUser();
  }

  changePassword(): void {
    const user = this.authService.getCurrentUser();
    if (!user?._id) return;
    if (this.newPassword !== this.confirmPassword) {
      this.messageType.set('error');
      this.message.set('New passwords do not match.');
      return;
    }

    this.authService.changeStaffPassword(user._id, this.currentPassword, this.newPassword).subscribe({
      next: (response: any) => {
        this.messageType.set(response.success ? 'success' : 'error');
        this.message.set(response.message || 'Password updated');
        if (response.success) {
          this.authService.updateStoredUser({ mustChangePassword: false });
          this.currentPassword = '';
          this.newPassword = '';
          this.confirmPassword = '';
        }
      },
      error: (error: any) => {
        this.messageType.set('error');
        this.message.set(error.error?.message || 'Failed to update password');
      }
    });
  }

  formatLabel(value: string): string {
    return value.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  }
}
