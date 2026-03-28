import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface IdentityVerification {
  idType: 'passport' | 'national_id' | 'drivers_license' | 'id_card';
  idNumber: string;
  idImage?: string;
  fullName: string;
  verified: boolean;
  verifiedAt?: Date;
}

@Component({
  selector: 'app-identity-verification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 space-y-6">
        <div class="text-center">
          <div class="inline-block p-3 bg-blue-100 rounded-full mb-3">
            <span class="text-3xl">🔐</span>
          </div>
          <h2 class="text-2xl font-bold text-slate-900">Identity Verification</h2>
          <p class="text-slate-600 mt-2">Verify your identity to complete your booking instantly</p>
        </div>

        <!-- Progress Indicator -->
        <div class="flex items-center gap-2">
          <div [class]="'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition ' +
            (currentStep() === 1 ? 'bg-blue-600 text-white' : step1Complete() ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-600')">
            {{ step1Complete() ? '✓' : '1' }}
          </div>
          <div [class]="'flex-1 h-1 ' + (step1Complete() ? 'bg-green-600' : 'bg-slate-200')"></div>
          <div [class]="'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ' +
            (currentStep() === 2 ? 'bg-blue-600 text-white' : step2Complete() ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-600')">
            {{ step2Complete() ? '✓' : '2' }}
          </div>
        </div>

        <!-- Step 1: ID Information -->
        @if (currentStep() === 1) {
          <form (ngSubmit)="submitStep1()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-900 mb-2">Full Name</label>
              <input
                [(ngModel)]="verification.fullName"
                name="fullName"
                type="text"
                placeholder="Enter your full name"
                required
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <p class="text-xs text-slate-500 mt-1">Must match your ID document</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-900 mb-2">ID Type</label>
              <select
                [(ngModel)]="verification.idType"
                name="idType"
                required
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Select ID type...</option>
                <option value="passport">🛂 Passport</option>
                <option value="national_id">🆔 National ID</option>
                <option value="drivers_license">🚗 Driver's License</option>
                <option value="id_card">💳 ID Card</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-900 mb-2">ID Number</label>
              <input
                [(ngModel)]="verification.idNumber"
                name="idNumber"
                type="text"
                placeholder="Enter ID number"
                required
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <p class="text-xs text-slate-500 mt-1">Your identification number from the ID document</p>
            </div>

            <div class="bg-blue-50 border border-blue-300 rounded-lg p-4">
              <p class="text-sm text-blue-900">
                <strong>💡 Privacy:</strong> Your identity information is encrypted and used only for this booking confirmation. We never store your ID number.
              </p>
            </div>

            <div class="flex gap-3">
              <button
                type="button"
                (click)="cancel()"
                class="flex-1 px-4 py-2 border border-slate-300 text-slate-900 rounded-lg font-medium hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="!isStep1Valid()"
                class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition"
              >
                Continue
              </button>
            </div>
          </form>
        }

        <!-- Step 2: Verification Complete -->
        @if (currentStep() === 2) {
          <div class="space-y-4">
            <div class="text-center">
              <div class="inline-block p-4 bg-green-100 rounded-full mb-3">
                <span class="text-4xl">✓</span>
              </div>
              <h3 class="text-xl font-bold text-slate-900">Identity Verified!</h3>
              <p class="text-slate-600 mt-2">Your identity has been confirmed</p>
            </div>

            <div class="bg-slate-50 rounded-lg p-4 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-slate-600">Name</span>
                <span class="font-medium text-slate-900">{{ verification.fullName }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-slate-600">ID Type</span>
                <span class="font-medium text-slate-900">{{ getIdTypeLabel() }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-slate-600">ID Number</span>
                <span class="font-medium text-slate-900 font-mono">{{ maskIdNumber() }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-slate-600">Verified</span>
                <span class="text-green-600 font-semibold">🟢 Confirmed</span>
              </div>
            </div>

            <p class="text-xs text-slate-500 text-center bg-blue-50 p-3 rounded-lg">
              Your smart lock access code will be sent immediately after you confirm
            </p>

            <button
              (click)="complete()"
              class="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition flex items-center justify-center gap-2"
            >
              <span>✓ Confirm & Get Access Code</span>
            </button>

            <button
              (click)="goBack()"
              class="w-full px-4 py-2 border border-slate-300 text-slate-900 rounded-lg font-medium hover:bg-slate-50 transition"
            >
              Back
            </button>
          </div>
        }

        <!-- Loading State -->
        @if (isVerifying()) {
          <div class="text-center py-4">
            <div class="inline-block animate-spin">
              <span class="text-3xl">⟳</span>
            </div>
            <p class="text-slate-600 mt-4">Verifying your identity...</p>
          </div>
        }

        <!-- Error State -->
        @if (error()) {
          <div class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
            <p class="font-semibold">⚠️ Verification Error</p>
            <p class="mt-1">{{ error() }}</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: []
})
export class IdentityVerificationComponent {
  @Output() verified = new EventEmitter<IdentityVerification>();
  @Output() cancelled = new EventEmitter<void>();

  verification: IdentityVerification = {
    idType: 'passport',
    idNumber: '',
    fullName: '',
    verified: false
  };

  currentStep = signal(1);
  isVerifying = signal(false);
  error = signal('');
  step1Complete = signal(false);
  step2Complete = signal(false);

  isStep1Valid(): boolean {
    return (
      this.verification.fullName.trim().length > 2 &&
      this.verification.idNumber.trim().length > 3
    );
  }

  submitStep1(): void {
    if (!this.isStep1Valid()) {
      this.error.set('Please fill in all fields correctly');
      return;
    }

    this.isVerifying.set(true);
    this.error.set('');

    // Simulate identity verification (in production, would call backend API)
    // Backend would do: validate format, check against government DB, etc.
    setTimeout(() => {
      // Basic validation
      if (this.verification.fullName.length < 3) {
        this.error.set('Name must be at least 3 characters');
        this.isVerifying.set(false);
        return;
      }

      if (this.verification.idNumber.length < 4) {
        this.error.set('Invalid ID number format');
        this.isVerifying.set(false);
        return;
      }

      // Mark as verified
      this.verification.verified = true;
      this.verification.verifiedAt = new Date();
      this.step1Complete.set(true);
      this.currentStep.set(2);
      this.isVerifying.set(false);
    }, 1500);
  }

  getIdTypeLabel(): string {
    const labels: { [key: string]: string } = {
      'passport': '🛂 Passport',
      'national_id': '🆔 National ID',
      'drivers_license': '🚗 Driver\'s License',
      'id_card': '💳 ID Card'
    };
    return labels[this.verification.idType] || 'Unknown';
  }

  maskIdNumber(): string {
    const id = this.verification.idNumber;
    if (id.length <= 4) return id;
    return '****' + id.slice(-4);
  }

  goBack(): void {
    this.currentStep.set(1);
  }

  complete(): void {
    this.step2Complete.set(true);
    this.verified.emit(this.verification);
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
