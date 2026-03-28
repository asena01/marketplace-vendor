import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HotelService } from '../../services/hotel.service';

@Component({
  selector: 'app-smart-lock-unlock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-8">
      <div class="max-w-2xl mx-auto">
        <!-- Header -->
        <div class="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-8 text-white shadow-lg mb-8">
          <div class="flex items-center gap-4 mb-4">
            <div class="bg-white bg-opacity-20 rounded-full p-4">
              <span class="text-3xl">🔑</span>
            </div>
            <div>
              <h1 class="text-3xl font-bold">Room Unlock</h1>
              <p class="text-purple-100">Use your booking code to unlock your room</p>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        @if (isLoading()) {
          <div class="bg-white rounded-lg shadow-lg p-8 text-center">
            <div class="animate-spin mb-4">
              <span class="text-4xl">⏳</span>
            </div>
            <p class="text-slate-600 font-semibold">Processing unlock request...</p>
          </div>
        } @else if (unlockSuccess()) {
          <!-- Success State -->
          <div class="bg-white rounded-lg shadow-lg p-8">
            <div class="text-center mb-8">
              <div class="inline-block bg-green-100 rounded-full p-6 mb-4">
                <span class="text-5xl">✓</span>
              </div>
              <h2 class="text-3xl font-bold text-green-600 mb-2">Room Unlocked!</h2>
              <p class="text-slate-600">Your room door is now unlocked</p>
            </div>

            <div class="bg-green-50 border border-green-200 rounded-lg p-6 space-y-4 mb-8">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-slate-600 font-medium mb-1">Room Number</p>
                  <p class="text-2xl font-bold text-slate-900">{{ unlockData()?.roomNumber }}</p>
                </div>
                <div>
                  <p class="text-sm text-slate-600 font-medium mb-1">Unlocked at</p>
                  <p class="text-lg text-slate-900">{{ unlockData()?.unlockedAt | date: 'short' }}</p>
                </div>
              </div>
            </div>

            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <p class="text-sm text-blue-900">
                <strong>💡 Tip:</strong> The door will automatically lock again for your security. Keep this confirmation for your records.
              </p>
            </div>

            <button
              (click)="resetForm()"
              class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              Unlock Another Time
            </button>
          </div>
        } @else if (errorMessage()) {
          <!-- Error State -->
          <div class="bg-white rounded-lg shadow-lg p-8">
            <div class="text-center mb-8">
              <div class="inline-block bg-red-100 rounded-full p-6 mb-4">
                <span class="text-5xl">✕</span>
              </div>
              <h2 class="text-3xl font-bold text-red-600 mb-2">Unlock Failed</h2>
              <p class="text-slate-600">{{ errorMessage() }}</p>
            </div>

            <!-- Fallback Option -->
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <h3 class="font-bold text-yellow-900 mb-4">🔒 Use Backup PIN Code</h3>
              <p class="text-sm text-yellow-800 mb-4">
                If the digital unlock isn't working, you can use the PIN code to unlock your room manually.
              </p>
              <form (ngSubmit)="unlockWithPin()" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Booking Number</label>
                  <input
                    [(ngModel)]="bookingNumber"
                    name="bookingNumber"
                    placeholder="e.g., BK001234"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">PIN Code</label>
                  <input
                    [(ngModel)]="pinCode"
                    name="pinCode"
                    type="password"
                    placeholder="Enter 4-digit PIN"
                    maxlength="4"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-600 text-center text-2xl tracking-widest"
                  />
                </div>
                <button
                  type="submit"
                  [disabled]="isLoading() || !pinCode || !bookingNumber"
                  class="w-full bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg transition"
                >
                  {{ isLoading() ? '⏳ Unlocking...' : 'Unlock with PIN' }}
                </button>
              </form>
            </div>

            <button
              (click)="resetForm()"
              class="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              Try Again
            </button>
          </div>
        } @else {
          <!-- Initial State -->
          <div class="bg-white rounded-lg shadow-lg p-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <!-- Tab 1: QR Code Unlock -->
              <div class="space-y-6">
                <div class="border-b-2 border-purple-600 pb-4">
                  <h2 class="text-2xl font-bold text-slate-900">📱 QR Code Unlock</h2>
                  <p class="text-sm text-slate-600 mt-1">Scan your booking confirmation QR code</p>
                </div>

                <div class="bg-slate-50 rounded-lg p-6 text-center">
                  @if (qrCode()) {
                    <img [src]="qrCode()" [alt]="'QR Code'" class="w-full max-w-xs mx-auto rounded-lg mb-4 shadow-md" />
                    <p class="text-sm text-slate-600">Your QR code containing the access token</p>
                  } @else {
                    <div class="bg-slate-200 rounded-lg h-64 flex items-center justify-center mb-4">
                      <span class="text-slate-500">QR Code will appear here</span>
                    </div>
                  }
                </div>

                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Or enter your access code:</label>
                  <input
                    [(ngModel)]="accessToken"
                    name="accessToken"
                    placeholder="Paste your access token here"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-600 font-mono text-sm"
                  />
                </div>

                <button
                  (click)="unlockWithToken()"
                  [disabled]="isLoading() || !accessToken"
                  class="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <span>{{ isLoading() ? '⏳ Unlocking...' : '🔓 Unlock Room' }}</span>
                </button>
              </div>

              <!-- Tab 2: PIN Code -->
              <div class="space-y-6">
                <div class="border-b-2 border-yellow-600 pb-4">
                  <h2 class="text-2xl font-bold text-slate-900">🔐 PIN Code</h2>
                  <p class="text-sm text-slate-600 mt-1">Use your backup 4-digit PIN code</p>
                </div>

                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <p class="text-sm text-yellow-900 font-medium mb-4">
                    Your PIN code was sent to you via email when you confirmed your booking.
                  </p>
                </div>

                <form (ngSubmit)="unlockWithPin()" class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">Booking Number</label>
                    <input
                      [(ngModel)]="bookingNumber"
                      name="bookingNumber"
                      placeholder="e.g., BK001234"
                      class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">PIN Code</label>
                    <input
                      [(ngModel)]="pinCode"
                      name="pinCode"
                      type="password"
                      placeholder="0000"
                      maxlength="4"
                      class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-600 text-center text-3xl tracking-widest font-bold"
                    />
                    <p class="text-xs text-slate-500 mt-1">4 digits</p>
                  </div>

                  <button
                    type="submit"
                    [disabled]="isLoading() || !pinCode || !bookingNumber"
                    class="w-full bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <span>{{ isLoading() ? '⏳ Unlocking...' : '🔓 Unlock Room' }}</span>
                  </button>
                </form>

                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p class="text-xs text-blue-900">
                    <strong>ℹ️</strong> If you don't have your PIN code, please contact the front desk.
                  </p>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: []
})
export class SmartLockUnlockComponent implements OnInit {
  isLoading = signal(false);
  unlockSuccess = signal(false);
  errorMessage = signal('');
  unlockData = signal<any>(null);
  qrCode = signal<string | null>(null);

  accessToken = '';
  pinCode = '';
  bookingNumber = '';

  constructor(
    private hotelService: HotelService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Check if access token is in URL
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.accessToken = params['token'];
        // Auto-unlock with the token
        setTimeout(() => {
          this.unlockWithToken();
        }, 500);
      }
    });
  }

  unlockWithToken(): void {
    if (!this.accessToken.trim()) {
      this.errorMessage.set('Please enter an access token');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.hotelService.unlockRoom(this.accessToken).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.unlockSuccess.set(true);
          this.unlockData.set(response.data);
          console.log('✅ Room unlocked:', response.data);
        } else {
          this.errorMessage.set(response.message || 'Unlock failed');
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Unlock error:', error);
        this.errorMessage.set(error.error?.message || 'Failed to unlock room. Please try again or use PIN code.');
        this.isLoading.set(false);
      }
    });
  }

  unlockWithPin(): void {
    if (!this.pinCode.trim() || !this.bookingNumber.trim()) {
      this.errorMessage.set('Please enter both booking number and PIN code');
      return;
    }

    if (this.pinCode.length !== 4) {
      this.errorMessage.set('PIN code must be 4 digits');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.hotelService.unlockWithPin(this.pinCode, this.bookingNumber).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.unlockSuccess.set(true);
          this.unlockData.set(response.data);
          console.log('✅ Room unlocked with PIN:', response.data);
        } else {
          this.errorMessage.set(response.message || 'Unlock failed');
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ PIN unlock error:', error);
        this.errorMessage.set(error.error?.message || 'Invalid PIN code or booking number. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  resetForm(): void {
    this.accessToken = '';
    this.pinCode = '';
    this.bookingNumber = '';
    this.unlockSuccess.set(false);
    this.errorMessage.set('');
    this.unlockData.set(null);
  }
}
