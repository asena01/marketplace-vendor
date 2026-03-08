import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../../../../services/hotel.service';

@Component({
  selector: 'app-hotel-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8 space-y-6">
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white shadow-lg">
        <h1 class="text-3xl font-bold mb-2">Hotel Profile Settings</h1>
        <p class="text-blue-100">Manage your complete hotel information and preferences</p>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="bg-blue-50 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">Loading profile...</p>
        </div>
      }

      <!-- Success State -->
      @if (successMessage()) {
        <div class="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">{{ successMessage() }}</p>
        </div>
      }

      <!-- Error State -->
      @if (errorMessage()) {
        <div class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">{{ errorMessage() }}</p>
        </div>
      }

      <!-- Form Sections -->
      <div class="space-y-6">
        <!-- 1. BASIC INFORMATION -->
        <div class="bg-white rounded-lg p-8 shadow-md">
          <h2 class="text-2xl font-bold text-slate-900 mb-6 border-b pb-4">Basic Information</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">Hotel Name *</label>
              <input
                type="text"
                [(ngModel)]="formData.name"
                placeholder="Enter hotel name"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">Hotel Type</label>
              <select
                [(ngModel)]="formData.type"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              >
                <option value="Hotel">Hotel</option>
                <option value="Resort">Resort</option>
                <option value="Boutique">Boutique Hotel</option>
                <option value="Hostel">Hostel</option>
                <option value="Apartment">Apartment</option>
              </select>
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-semibold text-slate-700 mb-2">Description</label>
              <textarea
                [(ngModel)]="formData.description"
                placeholder="Describe your hotel..."
                rows="4"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">Website</label>
              <input
                type="url"
                [(ngModel)]="formData.website"
                placeholder="https://example.com"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">Star Rating</label>
              <select
                [(ngModel)]="formData.starRating"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              >
                <option value="">Select rating</option>
                <option value="1">1 Star</option>
                <option value="2">2 Stars</option>
                <option value="3">3 Stars</option>
                <option value="4">4 Stars</option>
                <option value="5">5 Stars</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">Total Rooms</label>
              <input
                type="number"
                [(ngModel)]="formData.totalRooms"
                placeholder="Number of rooms"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        <!-- 2. ADDRESS & LOCATION -->
        <div class="bg-white rounded-lg p-8 shadow-md">
          <h2 class="text-2xl font-bold text-slate-900 mb-6 border-b pb-4">Address & Location</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="md:col-span-2">
              <label class="block text-sm font-semibold text-slate-700 mb-2">Street Address</label>
              <input
                type="text"
                [(ngModel)]="formData.address"
                placeholder="Enter street address"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">City</label>
              <input
                type="text"
                [(ngModel)]="formData.city"
                placeholder="City name"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">State/Province</label>
              <input
                type="text"
                [(ngModel)]="formData.state"
                placeholder="State"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">Country</label>
              <input
                type="text"
                [(ngModel)]="formData.country"
                placeholder="Country"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">Zip Code</label>
              <input
                type="text"
                [(ngModel)]="formData.zipCode"
                placeholder="Zip/Postal code"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">Distance to Center (km)</label>
              <input
                type="number"
                [(ngModel)]="formData.distanceToCenterKm"
                placeholder="Distance in km"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        <!-- 3. CONTACT INFORMATION -->
        <div class="bg-white rounded-lg p-8 shadow-md">
          <h2 class="text-2xl font-bold text-slate-900 mb-6 border-b pb-4">Contact Information</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
              <input
                type="tel"
                [(ngModel)]="formData.phone"
                placeholder="Hotel phone number"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <input
                type="email"
                [(ngModel)]="formData.email"
                placeholder="Hotel email"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        <!-- 4. CHECK-IN/CHECK-OUT & POLICIES -->
        <div class="bg-white rounded-lg p-8 shadow-md">
          <h2 class="text-2xl font-bold text-slate-900 mb-6 border-b pb-4">Check-in/Out & Policies</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">Check-in Time</label>
              <input
                type="time"
                [(ngModel)]="formData.checkInTime"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">Check-out Time</label>
              <input
                type="time"
                [(ngModel)]="formData.checkOutTime"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">Check-in Policy</label>
              <textarea
                [(ngModel)]="formData.policies.checkIn"
                placeholder="Check-in policy details"
                rows="2"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">Check-out Policy</label>
              <textarea
                [(ngModel)]="formData.policies.checkOut"
                placeholder="Check-out policy details"
                rows="2"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              ></textarea>
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-semibold text-slate-700 mb-2">Cancellation Policy</label>
              <textarea
                [(ngModel)]="formData.policies.cancellation"
                placeholder="Cancellation policy details"
                rows="2"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- 5. AMENITIES & FEATURES -->
        <div class="bg-white rounded-lg p-8 shadow-md">
          <h2 class="text-2xl font-bold text-slate-900 mb-6 border-b pb-4">Amenities & Features</h2>
          <div class="space-y-4">
            <div class="flex items-center gap-4">
              <input
                type="checkbox"
                [(ngModel)]="formData.freeCancellation"
                id="freeCancellation"
                class="w-5 h-5 border-gray-300 rounded focus:outline-none"
              />
              <label for="freeCancellation" class="text-slate-700 font-medium">Free Cancellation</label>
            </div>

            <div class="flex items-center gap-4">
              <input
                type="checkbox"
                [(ngModel)]="formData.breakfastIncluded"
                id="breakfastIncluded"
                class="w-5 h-5 border-gray-300 rounded focus:outline-none"
              />
              <label for="breakfastIncluded" class="text-slate-700 font-medium">Breakfast Included</label>
            </div>

            <div class="mt-4">
              <label class="block text-sm font-semibold text-slate-700 mb-2">Amenities (Comma separated)</label>
              <textarea
                [(ngModel)]="amenitiesText"
                placeholder="e.g., WiFi, Swimming Pool, Gym, Restaurant, Parking..."
                rows="3"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- 6. SUBSCRIPTION & BILLING -->
        <div class="bg-white rounded-lg p-8 shadow-md">
          <h2 class="text-2xl font-bold text-slate-900 mb-6 border-b pb-4">Subscription & Billing</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">Subscription Plan</label>
              <select
                [(ngModel)]="formData.subscriptionPlan"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              >
                <option value="basic">Basic Plan</option>
                <option value="professional">Professional Plan</option>
                <option value="enterprise">Enterprise Plan</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">Billing Duration</label>
              <select
                [(ngModel)]="formData.billingDuration"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">Payment Method</label>
              <select
                [(ngModel)]="formData.paymentMethod"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              >
                <option value="credit_card">Credit Card</option>
                <option value="paypal">PayPal</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">Payment Status</label>
              <select
                [(ngModel)]="formData.paymentStatus"
                disabled
                class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 7. STATUS & MEDIA -->
        <div class="bg-white rounded-lg p-8 shadow-md">
          <h2 class="text-2xl font-bold text-slate-900 mb-6 border-b pb-4">Status & Media</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">Logo URL</label>
              <input
                type="url"
                [(ngModel)]="formData.logo"
                placeholder="https://example.com/logo.png"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">Thumbnail URL</label>
              <input
                type="url"
                [(ngModel)]="formData.thumbnail"
                placeholder="https://example.com/thumbnail.jpg"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>

            <div class="flex items-center gap-4">
              <input
                type="checkbox"
                [(ngModel)]="formData.isActive"
                id="isActive"
                class="w-5 h-5 border-gray-300 rounded focus:outline-none"
              />
              <label for="isActive" class="text-slate-700 font-medium">Hotel is Active</label>
            </div>
          </div>
        </div>
      </div>

      <!-- Save Button -->
      <div class="bg-white rounded-lg p-8 shadow-md flex gap-4 justify-end">
        <button
          (click)="saveProfile()"
          [disabled]="isSaving()"
          class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-lg transition"
        >
          {{ isSaving() ? '💾 Saving...' : '💾 Save Changes' }}
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class HotelProfileComponent implements OnInit {
  isLoading = signal(false);
  isSaving = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  amenitiesText = '';

  formData: any = {
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    phone: '',
    email: '',
    website: '',
    totalRooms: 0,
    type: 'Hotel',
    starRating: '',
    distanceToCenterKm: 0,
    amenities: [],
    thumbnail: '',
    photos: [],
    freeCancellation: false,
    breakfastIncluded: false,
    checkInTime: '14:00',
    checkOutTime: '11:00',
    policies: {
      checkIn: '',
      checkOut: '',
      cancellation: ''
    },
    subscriptionPlan: 'basic',
    billingDuration: 'monthly',
    paymentStatus: 'pending',
    paymentMethod: 'credit_card',
    isActive: true,
    logo: ''
  };

  constructor(private hotelService: HotelService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading.set(true);
    this.hotelService.getHotelDetails().subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data) {
          this.formData = { ...response.data };
          this.amenitiesText = (this.formData.amenities || []).join(', ');
        }
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading profile:', error);
        this.errorMessage.set('Failed to load profile');
        this.isLoading.set(false);
      }
    });
  }

  saveProfile(): void {
    // Validate required fields
    if (!this.formData.name) {
      this.errorMessage.set('Hotel name is required');
      return;
    }

    // Convert amenities text to array
    this.formData.amenities = this.amenitiesText
      .split(',')
      .map((a: string) => a.trim())
      .filter((a: string) => a.length > 0);

    this.isSaving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.hotelService.updateHotel(this.formData._id, this.formData).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.successMessage.set('Profile updated successfully!');
          setTimeout(() => this.successMessage.set(''), 3000);
        }
        this.isSaving.set(false);
      },
      error: (error: any) => {
        console.error('Error saving profile:', error);
        this.errorMessage.set('Failed to save profile. Please try again.');
        this.isSaving.set(false);
      }
    });
  }
}
