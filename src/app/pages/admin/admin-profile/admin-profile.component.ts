import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div>
        <h2 class="text-3xl font-bold text-gray-800 mb-2">Profile Settings</h2>
        <p class="text-gray-600">Manage your personal information and security</p>
      </div>

      <!-- Personal Information Section -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-xl font-bold text-gray-800 mb-6">👤 Personal Information</h3>
        
        <div class="space-y-4">
          <!-- Name -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Full Name</label>
            <input
              type="text"
              [(ngModel)]="profileForm.name"
              placeholder="Enter your full name"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Email Address</label>
            <input
              type="email"
              [(ngModel)]="profileForm.email"
              placeholder="Enter your email"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Phone -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Phone Number</label>
            <input
              type="tel"
              [(ngModel)]="profileForm.phone"
              placeholder="Enter your phone number"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Save Button -->
          <div class="pt-4 flex gap-4">
            <button
              (click)="resetProfileForm()"
              class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition"
            >
              Cancel
            </button>
            <button
              (click)="updateProfile()"
              [disabled]="isUpdatingProfile()"
              class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
            >
              {{ isUpdatingProfile() ? '💾 Saving...' : '💾 Save Changes' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Change Password Section -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-xl font-bold text-gray-800 mb-6">🔐 Change Password</h3>
        
        <div class="space-y-4 max-w-md">
          <!-- Current Password -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Current Password</label>
            <input
              type="password"
              [(ngModel)]="passwordForm.currentPassword"
              placeholder="Enter your current password"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- New Password -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">New Password</label>
            <input
              type="password"
              [(ngModel)]="passwordForm.newPassword"
              placeholder="Enter your new password"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p class="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
          </div>

          <!-- Confirm Password -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Confirm Password</label>
            <input
              type="password"
              [(ngModel)]="passwordForm.confirmPassword"
              placeholder="Confirm your new password"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Change Button -->
          <div class="pt-4 flex gap-4">
            <button
              (click)="resetPasswordForm()"
              class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition"
            >
              Cancel
            </button>
            <button
              (click)="changePassword()"
              [disabled]="isChangingPassword()"
              class="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
            >
              {{ isChangingPassword() ? '🔄 Changing...' : '🔑 Change Password' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Profile Picture Section (Optional) -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-xl font-bold text-gray-800 mb-6">🖼️ Profile Picture</h3>
        
        <div class="flex items-center gap-6">
          <div class="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl">
            👤
          </div>
          <div class="space-y-3">
            <p class="text-gray-600">Upload a profile picture (optional)</p>
            <button
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition"
            >
              Choose File
            </button>
          </div>
        </div>
      </div>

      <!-- Success Message -->
      @if (successMessage()) {
        <div class="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">✅ {{ successMessage() }}</p>
        </div>
      }

      <!-- Error Message -->
      @if (error()) {
        <div class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">❌ Error</p>
          <p class="text-sm mt-1">{{ error() }}</p>
        </div>
      }
    </div>
  `,
  styles: []
})
export class AdminProfileComponent implements OnInit {
  profileForm = {
    name: '',
    email: '',
    phone: ''
  };

  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  isUpdatingProfile = signal(false);
  isChangingPassword = signal(false);
  error = signal('');
  successMessage = signal('');

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadProfileData();
  }

  loadProfileData(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.profileForm = {
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      };
    }
  }

  updateProfile(): void {
    if (!this.profileForm.name.trim()) {
      this.error.set('Name is required');
      return;
    }
    if (!this.profileForm.email.trim()) {
      this.error.set('Email is required');
      return;
    }

    this.isUpdatingProfile.set(true);
    this.error.set('');

    const userId = this.authService.getCurrentUser()?._id;
    if (!userId) {
      this.error.set('User ID not found');
      this.isUpdatingProfile.set(false);
      return;
    }

    this.http.put(`/api/admin/users/${userId}`, {
      name: this.profileForm.name,
      email: this.profileForm.email,
      phone: this.profileForm.phone
    }).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.successMessage.set('Profile updated successfully!');
          console.log('✅ Profile updated');
          
          // Update local auth state
          const currentUser = this.authService.getCurrentUser();
          if (currentUser) {
            currentUser.name = this.profileForm.name;
            currentUser.email = this.profileForm.email;
            currentUser.phone = this.profileForm.phone;
            this.authService['currentUser'].set(currentUser);
          }
          
          setTimeout(() => this.successMessage.set(''), 5000);
        }
        this.isUpdatingProfile.set(false);
      },
      error: (error: any) => {
        console.error('❌ Error updating profile:', error);
        this.error.set(error.error?.message || 'Failed to update profile');
        this.isUpdatingProfile.set(false);
      }
    });
  }

  changePassword(): void {
    // Validation
    if (!this.passwordForm.currentPassword) {
      this.error.set('Current password is required');
      return;
    }
    if (!this.passwordForm.newPassword) {
      this.error.set('New password is required');
      return;
    }
    if (this.passwordForm.newPassword.length < 6) {
      this.error.set('New password must be at least 6 characters');
      return;
    }
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.error.set('Passwords do not match');
      return;
    }
    if (this.passwordForm.currentPassword === this.passwordForm.newPassword) {
      this.error.set('New password must be different from current password');
      return;
    }

    this.isChangingPassword.set(true);
    this.error.set('');

    const userId = this.authService.getCurrentUser()?._id;
    if (!userId) {
      this.error.set('User ID not found');
      this.isChangingPassword.set(false);
      return;
    }

    this.http.post(`/api/auth/change-password`, {
      userId,
      currentPassword: this.passwordForm.currentPassword,
      newPassword: this.passwordForm.newPassword
    }).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.successMessage.set('Password changed successfully!');
          console.log('✅ Password changed');
          this.resetPasswordForm();
          setTimeout(() => this.successMessage.set(''), 5000);
        }
        this.isChangingPassword.set(false);
      },
      error: (error: any) => {
        console.error('❌ Error changing password:', error);
        this.error.set(error.error?.message || 'Failed to change password');
        this.isChangingPassword.set(false);
      }
    });
  }

  resetProfileForm(): void {
    this.loadProfileData();
    this.error.set('');
  }

  resetPasswordForm(): void {
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.error.set('');
  }
}
