import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8 space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold text-slate-900">Profile Settings</h1>
        <p class="text-slate-600 mt-1">Manage your account information and security</p>
      </div>

      <!-- Profile Information Section -->
      <div class="bg-white rounded-lg p-6 shadow-md">
        <h2 class="text-xl font-bold text-slate-900 mb-6">Profile Information</h2>

        <!-- Success Message -->
        @if (successMessage()) {
          <div class="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
            <span class="text-xl">✅</span>
            <div>
              <p class="font-semibold">Success</p>
              <p class="text-sm mt-1">{{ successMessage() }}</p>
            </div>
          </div>
        }

        <!-- Error Message -->
        @if (errorMessage()) {
          <div class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
            <span class="text-xl">❌</span>
            <div>
              <p class="font-semibold">Error</p>
              <p class="text-sm mt-1">{{ errorMessage() }}</p>
            </div>
          </div>
        }

        <form (ngSubmit)="saveProfile()" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Name -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <input
                type="text"
                [(ngModel)]="profileForm.name"
                name="name"
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <input
                type="email"
                [(ngModel)]="profileForm.email"
                name="email"
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <!-- Phone -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Phone</label>
              <input
                type="tel"
                [(ngModel)]="profileForm.phone"
                name="phone"
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <!-- Business Name (for vendors) -->
            @if (currentUser()?.businessName) {
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Business Name</label>
                <input
                  type="text"
                  [(ngModel)]="profileForm.businessName"
                  name="businessName"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            }
          </div>

          <!-- Address -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Address</label>
            <input
              type="text"
              [(ngModel)]="profileForm.address"
              name="address"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- City & Country -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">City</label>
              <input
                type="text"
                [(ngModel)]="profileForm.city"
                name="city"
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Country</label>
              <input
                type="text"
                [(ngModel)]="profileForm.country"
                name="country"
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <!-- Business Description (for vendors) -->
          @if (currentUser()?.businessDescription) {
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Business Description</label>
              <textarea
                [(ngModel)]="profileForm.businessDescription"
                name="businessDescription"
                rows="4"
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
          }

          <!-- Save Button -->
          <div class="flex gap-2">
            <button
              type="submit"
              [disabled]="isSavingProfile()"
              class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition disabled:opacity-50"
            >
              @if (isSavingProfile()) {
                <span>💾 Saving...</span>
              } @else {
                <span>💾 Save Changes</span>
              }
            </button>
            <button
              type="button"
              (click)="resetProfile()"
              class="bg-slate-200 hover:bg-slate-300 text-slate-900 px-6 py-2 rounded-lg font-medium transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <!-- Change Password Section -->
      <div class="bg-white rounded-lg p-6 shadow-md">
        <h2 class="text-xl font-bold text-slate-900 mb-6">Change Password</h2>

        <!-- Password Success Message -->
        @if (passwordSuccessMessage()) {
          <div class="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
            <span class="text-xl">✅</span>
            <div>
              <p class="font-semibold">Success</p>
              <p class="text-sm mt-1">{{ passwordSuccessMessage() }}</p>
            </div>
          </div>
        }

        <!-- Password Error Message -->
        @if (passwordErrorMessage()) {
          <div class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
            <span class="text-xl">❌</span>
            <div>
              <p class="font-semibold">Error</p>
              <p class="text-sm mt-1">{{ passwordErrorMessage() }}</p>
            </div>
          </div>
        }

        <form (ngSubmit)="changePassword()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
            <input
              [type]="showCurrentPassword() ? 'text' : 'password'"
              [(ngModel)]="passwordForm.oldPassword"
              name="oldPassword"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              (click)="toggleShowCurrentPassword()"
              class="text-blue-600 text-sm mt-2 hover:text-blue-700 font-medium"
            >
              {{ showCurrentPassword() ? 'Hide' : 'Show' }} Password
            </button>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">New Password</label>
            <input
              [type]="showNewPassword() ? 'text' : 'password'"
              [(ngModel)]="passwordForm.newPassword"
              name="newPassword"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              (click)="toggleShowNewPassword()"
              class="text-blue-600 text-sm mt-2 hover:text-blue-700 font-medium"
            >
              {{ showNewPassword() ? 'Hide' : 'Show' }} Password
            </button>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
            <input
              [type]="showConfirmPassword() ? 'text' : 'password'"
              [(ngModel)]="passwordForm.confirmPassword"
              name="confirmPassword"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              (click)="toggleShowConfirmPassword()"
              class="text-blue-600 text-sm mt-2 hover:text-blue-700 font-medium"
            >
              {{ showConfirmPassword() ? 'Hide' : 'Show' }} Password
            </button>
          </div>

          <!-- Password Requirements -->
          <div class="bg-slate-50 border border-slate-200 p-4 rounded-lg text-sm text-slate-600">
            <p class="font-medium mb-2">Password Requirements:</p>
            <ul class="list-disc list-inside space-y-1">
              <li>At least 6 characters</li>
              <li>Must include uppercase and lowercase letters</li>
              <li>Must include at least one number</li>
            </ul>
          </div>

          <!-- Change Password Button -->
          <div class="flex gap-2">
            <button
              type="submit"
              [disabled]="isChangingPassword()"
              class="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition disabled:opacity-50"
            >
              @if (isChangingPassword()) {
                <span>🔄 Updating...</span>
              } @else {
                <span>🔐 Change Password</span>
              }
            </button>
            <button
              type="button"
              (click)="resetPassword()"
              class="bg-slate-200 hover:bg-slate-300 text-slate-900 px-6 py-2 rounded-lg font-medium transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <!-- Account Information -->
      <div class="bg-slate-50 rounded-lg p-6 border border-slate-200">
        <h2 class="text-xl font-bold text-slate-900 mb-4">Account Information</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-slate-600 font-medium">Account Type</p>
            <p class="text-slate-900 mt-1">{{ currentUser()?.userType | uppercase }}</p>
          </div>
          @if (currentUser()?.vendorType) {
            <div>
              <p class="text-slate-600 font-medium">Vendor Type</p>
              <p class="text-slate-900 mt-1">{{ currentUser()?.vendorType | uppercase }}</p>
            </div>
          }
          <div>
            <p class="text-slate-600 font-medium">Account Created</p>
            <p class="text-slate-900 mt-1">{{ currentUser()?.createdAt | date: 'MMM d, yyyy' }}</p>
          </div>
          <div>
            <p class="text-slate-600 font-medium">Verification Status</p>
            <p class="text-slate-900 mt-1">{{ currentUser()?.isVerified ? '✅ Verified' : '⏳ Pending' }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProfileSettingsComponent implements OnInit {
  currentUser = signal<User | null>(null);
  
  profileForm = {
    name: '',
    email: '',
    phone: '',
    businessName: '',
    address: '',
    city: '',
    country: '',
    businessDescription: ''
  };

  passwordForm = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  isSavingProfile = signal(false);
  isChangingPassword = signal(false);
  
  successMessage = signal('');
  errorMessage = signal('');
  passwordSuccessMessage = signal('');
  passwordErrorMessage = signal('');

  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.currentUser.set(user);

    if (user) {
      this.profileForm = {
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        businessName: user.businessName || '',
        address: user.address || '',
        city: user.city || '',
        country: user.country || '',
        businessDescription: user.businessDescription || ''
      };
    }
  }

  saveProfile(): void {
    this.successMessage.set('');
    this.errorMessage.set('');

    const user = this.currentUser();
    if (!user) return;

    // Validate required fields
    if (!this.profileForm.name || !this.profileForm.email || !this.profileForm.phone) {
      this.errorMessage.set('Please fill in all required fields');
      return;
    }

    this.isSavingProfile.set(true);

    this.authService.updateProfile(user._id, {
      name: this.profileForm.name,
      email: this.profileForm.email,
      phone: this.profileForm.phone,
      businessName: this.profileForm.businessName || undefined,
      address: this.profileForm.address || undefined,
      city: this.profileForm.city || undefined,
      country: this.profileForm.country || undefined,
      businessDescription: this.profileForm.businessDescription || undefined
    }).subscribe({
      next: (response: any) => {
        this.isSavingProfile.set(false);
        if (response.success) {
          this.successMessage.set('Profile updated successfully');
          this.currentUser.set(response.data);
          setTimeout(() => {
            this.successMessage.set('');
          }, 3000);
        } else {
          this.errorMessage.set(response.message || 'Failed to update profile');
        }
      },
      error: (error: any) => {
        this.isSavingProfile.set(false);
        this.errorMessage.set(error.error?.message || 'An error occurred while updating profile');
        console.error('Error updating profile:', error);
      }
    });
  }

  resetProfile(): void {
    const user = this.currentUser();
    if (user) {
      this.profileForm = {
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        businessName: user.businessName || '',
        address: user.address || '',
        city: user.city || '',
        country: user.country || '',
        businessDescription: user.businessDescription || ''
      };
      this.successMessage.set('');
      this.errorMessage.set('');
    }
  }

  changePassword(): void {
    this.passwordSuccessMessage.set('');
    this.passwordErrorMessage.set('');

    // Validation
    if (!this.passwordForm.oldPassword) {
      this.passwordErrorMessage.set('Please enter your current password');
      return;
    }

    if (!this.passwordForm.newPassword) {
      this.passwordErrorMessage.set('Please enter a new password');
      return;
    }

    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.passwordErrorMessage.set('New passwords do not match');
      return;
    }

    if (this.passwordForm.newPassword.length < 6) {
      this.passwordErrorMessage.set('Password must be at least 6 characters');
      return;
    }

    // Check for password requirements
    const hasUpperCase = /[A-Z]/.test(this.passwordForm.newPassword);
    const hasLowerCase = /[a-z]/.test(this.passwordForm.newPassword);
    const hasNumber = /[0-9]/.test(this.passwordForm.newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      this.passwordErrorMessage.set('Password must include uppercase, lowercase, and numbers');
      return;
    }

    const user = this.currentUser();
    if (!user) return;

    this.isChangingPassword.set(true);

    this.authService.changePassword(user._id, this.passwordForm.oldPassword, this.passwordForm.newPassword).subscribe({
      next: (response: any) => {
        this.isChangingPassword.set(false);
        if (response.success) {
          this.passwordSuccessMessage.set('Password changed successfully');
          this.resetPassword();
          setTimeout(() => {
            this.passwordSuccessMessage.set('');
          }, 3000);
        } else {
          this.passwordErrorMessage.set(response.message || 'Failed to change password');
        }
      },
      error: (error: any) => {
        this.isChangingPassword.set(false);
        this.passwordErrorMessage.set(error.error?.message || 'An error occurred while changing password');
        console.error('Error changing password:', error);
      }
    });
  }

  resetPassword(): void {
    this.passwordForm = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.showCurrentPassword.set(false);
    this.showNewPassword.set(false);
    this.showConfirmPassword.set(false);
  }

  toggleShowCurrentPassword(): void {
    this.showCurrentPassword.update(value => !value);
  }

  toggleShowNewPassword(): void {
    this.showNewPassword.update(value => !value);
  }

  toggleShowConfirmPassword(): void {
    this.showConfirmPassword.update(value => !value);
  }
}
