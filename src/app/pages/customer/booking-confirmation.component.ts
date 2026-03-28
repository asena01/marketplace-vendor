import { Component, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HotelService } from '../../services/hotel.service';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-8">
      <div class="max-w-4xl mx-auto">
        <!-- Success Banner -->
        <div class="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white shadow-lg mb-8">
          <div class="flex items-center gap-4">
            <div class="text-5xl">✓</div>
            <div>
              <h1 class="text-4xl font-bold">Booking Confirmed!</h1>
              <p class="text-green-100 mt-2">Your reservation is confirmed. Proceed to unlock your room</p>
            </div>
          </div>
        </div>

        @if (isLoading()) {
          <div class="bg-white rounded-lg shadow-lg p-8 text-center">
            <div class="animate-spin mb-4"><span class="text-4xl">⏳</span></div>
            <p class="text-slate-600 font-semibold">Generating access codes...</p>
          </div>
        } @else if (errorMessage()) {
          <div class="bg-red-50 border border-red-300 rounded-lg p-6 mb-8">
            <p class="text-red-900 font-semibold">❌ {{ errorMessage() }}</p>
          </div>
        } @else if (smartLockAccess()) {
          <!-- Booking Details Card -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-purple-500">
              <p class="text-slate-600 text-sm font-medium mb-2">Booking Number</p>
              <p class="text-2xl font-bold text-slate-900">{{ bookingNumber }}</p>
            </div>
            <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500">
              <p class="text-slate-600 text-sm font-medium mb-2">Room Number</p>
              <p class="text-2xl font-bold text-slate-900">{{ smartLockAccess()?.roomNumber }}</p>
            </div>
            <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-green-500">
              <p class="text-slate-600 text-sm font-medium mb-2">Check-in</p>
              <p class="text-xl font-bold text-slate-900">{{ smartLockAccess()?.checkInDate | date: 'MMM dd, yyyy' }}</p>
            </div>
          </div>

          <!-- Smart Lock Access Section -->
          <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div class="mb-8 pb-6 border-b border-slate-200">
              <h2 class="text-3xl font-bold text-slate-900 flex items-center gap-2">
                <span>🔑</span> Smart Lock Room Access
              </h2>
              <p class="text-slate-600 mt-2">Use any of the methods below to unlock your room</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <!-- Method 1: QR Code -->
              <div class="space-y-4">
                <div class="flex items-center gap-2 mb-4">
                  <div class="bg-purple-100 rounded-full w-8 h-8 flex items-center justify-center">
                    <span class="text-purple-600 font-bold">1</span>
                  </div>
                  <h3 class="text-xl font-bold text-slate-900">QR Code Scan</h3>
                </div>

                <div class="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-8 border-2 border-purple-200">
                  @if (smartLockAccess()?.qrCode) {
                    <img
                      [src]="smartLockAccess()?.qrCode"
                      [alt]="'Room unlock QR code'"
                      class="w-full max-w-sm mx-auto rounded-lg shadow-lg"
                    />
                  } @else {
                    <div class="bg-slate-300 rounded-lg h-64 flex items-center justify-center">
                      <span class="text-slate-600">QR code not available</span>
                    </div>
                  }
                </div>

                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p class="text-sm text-blue-900">
                    <strong>📱 How to use:</strong> Open the unlock page on your phone and scan this QR code to automatically unlock your room.
                  </p>
                </div>

                <a
                  [href]="'https://example.com/unlock?token=' + smartLockAccess()?.accessToken"
                  target="_blank"
                  class="block bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg text-center transition"
                >
                  🔗 Open Unlock Page
                </a>
              </div>

              <!-- Method 2: Access Token -->
              <div class="space-y-4">
                <div class="flex items-center gap-2 mb-4">
                  <div class="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center">
                    <span class="text-blue-600 font-bold">2</span>
                  </div>
                  <h3 class="text-xl font-bold text-slate-900">Access Token</h3>
                </div>

                <div class="bg-slate-50 rounded-lg p-6 border-2 border-blue-200 space-y-3">
                  <p class="text-sm text-slate-600 font-medium">Your Access Token</p>
                  <div class="bg-white border border-slate-300 rounded-lg p-4">
                    <p class="font-mono text-sm text-slate-900 break-all">{{ smartLockAccess()?.accessToken }}</p>
                  </div>
                  <button
                    (click)="copyToClipboard(smartLockAccess()?.accessToken)"
                    class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
                  >
                    {{ copiedAccessToken ? '✓ Copied!' : '📋 Copy Token' }}
                  </button>
                </div>

                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p class="text-sm text-blue-900">
                    <strong>🔐 How to use:</strong> Visit the unlock page and paste this token to unlock your room digitally.
                  </p>
                </div>
              </div>
            </div>

            <!-- Divider -->
            <div class="my-8 border-t-2 border-slate-200"></div>

            <!-- Method 3: Backup PIN -->
            <div class="space-y-4">
              <div class="flex items-center gap-2 mb-4">
                <div class="bg-yellow-100 rounded-full w-8 h-8 flex items-center justify-center">
                  <span class="text-yellow-600 font-bold">3</span>
                </div>
                <h3 class="text-xl font-bold text-slate-900">Backup PIN Code (Emergency)</h3>
              </div>

              <div class="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 space-y-4">
                <p class="text-sm text-yellow-900">
                  <strong>⚠️ Important:</strong> This PIN code is your backup access method. Keep it safe and secure. Do not share with anyone except authorized guests.
                </p>

                <div class="bg-white border border-yellow-200 rounded-lg p-6">
                  <p class="text-sm text-slate-600 font-medium mb-2">Your PIN Code</p>
                  <p class="text-5xl font-bold text-center text-yellow-600 tracking-widest">{{ smartLockAccess()?.backupPin }}</p>
                </div>

                <button
                  (click)="copyToClipboard(smartLockAccess()?.backupPin)"
                  class="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition"
                >
                  {{ copiedPin ? '✓ Copied!' : '📋 Copy PIN' }}
                </button>

                <div class="bg-slate-50 rounded-lg p-4">
                  <p class="text-sm text-slate-700">
                    <strong>🗝️ How to use:</strong> If digital unlock fails, use this 4-digit PIN code on the smart lock keypad to unlock your room manually.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Important Information -->
          <div class="bg-white rounded-lg shadow-lg p-8">
            <h3 class="text-2xl font-bold text-slate-900 mb-6">⏱️ Valid Until Check-Out</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-green-50 border border-green-200 rounded-lg p-6">
                <p class="text-sm text-slate-600 font-medium mb-2">Access Valid From</p>
                <p class="text-2xl font-bold text-green-600">{{ smartLockAccess()?.checkInDate | date: 'MMM dd, yyyy HH:mm' }}</p>
              </div>
              <div class="bg-red-50 border border-red-200 rounded-lg p-6">
                <p class="text-sm text-slate-600 font-medium mb-2">Access Expires At</p>
                <p class="text-2xl font-bold text-red-600">{{ smartLockAccess()?.expiresAt | date: 'MMM dd, yyyy HH:mm' }}</p>
              </div>
            </div>

            <div class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <p class="font-semibold text-blue-900">✓ Security Features:</p>
              <ul class="text-sm text-blue-800 space-y-2">
                <li>✓ Unique access token valid only for this booking</li>
                <li>✓ Backup PIN code for emergency situations</li>
                <li>✓ Access automatically expires at check-out time</li>
                <li>✓ All unlock attempts are logged for security</li>
                <li>✓ Hotel staff can revoke access at any time if needed</li>
              </ul>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="mt-8 space-y-3 md:space-y-0 md:space-x-3 flex flex-col md:flex-row">
            <a
              href="/customer/hotel-bookings"
              class="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-lg text-center transition"
            >
              ← Back to Bookings
            </a>
            <a
              [href]="'https://example.com/unlock?token=' + smartLockAccess()?.accessToken"
              target="_blank"
              class="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg text-center transition flex items-center justify-center gap-2"
            >
              <span>🔓 Go to Unlock Page</span>
            </a>
          </div>
        }
      </div>
    </div>
  `,
  styles: []
})
export class BookingConfirmationComponent implements OnInit, OnDestroy {
  isLoading = signal(false);
  errorMessage = signal('');
  smartLockAccess = signal<any>(null);
  bookingNumber = '';
  copiedAccessToken = false;
  copiedPin = false;

  private copyTimeout: any;

  constructor(
    private hotelService: HotelService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get booking ID from route params
    this.route.params.subscribe(params => {
      const bookingId = params['bookingId'];
      if (bookingId) {
        this.generateSmartLockAccess(bookingId);
      } else {
        this.errorMessage.set('No booking ID provided');
      }
    });
  }

  ngOnDestroy(): void {
    if (this.copyTimeout) {
      clearTimeout(this.copyTimeout);
    }
  }

  generateSmartLockAccess(bookingId: string): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.hotelService.createSmartLockAccess(bookingId).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.smartLockAccess.set(response.data);
          this.bookingNumber = response.data.bookingNumber;
          console.log('✅ Smart lock access created:', response.data);
        } else {
          this.errorMessage.set(response.message || 'Failed to create unlock access');
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Error creating smart lock access:', error);
        this.errorMessage.set(
          error.error?.message || 'Failed to generate access codes. Please ensure your booking is confirmed.'
        );
        this.isLoading.set(false);
      }
    });
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      // Flash the button to indicate copy
      if (text === this.smartLockAccess()?.accessToken) {
        this.copiedAccessToken = true;
        if (this.copyTimeout) clearTimeout(this.copyTimeout);
        this.copyTimeout = setTimeout(() => {
          this.copiedAccessToken = false;
        }, 2000);
      } else if (text === this.smartLockAccess()?.backupPin) {
        this.copiedPin = true;
        if (this.copyTimeout) clearTimeout(this.copyTimeout);
        this.copyTimeout = setTimeout(() => {
          this.copiedPin = false;
        }, 2000);
      }
    });
  }
}
