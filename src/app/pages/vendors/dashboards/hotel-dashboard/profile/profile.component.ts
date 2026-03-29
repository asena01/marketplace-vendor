import { Component, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../../../../services/hotel.service';
import { AngularFireUploadService } from '../../../../../services/angular-fire-upload.service';

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

          <!-- Image Upload Section -->
          <div class="mb-8">
            <label class="block text-sm font-medium text-slate-700 mb-3 font-semibold">Hotel Images</label>

            @if (isUploadingImages()) {
              <div class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div class="flex items-center gap-2 mb-3">
                  <div class="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  <span class="font-medium text-blue-900">Uploading images...</span>
                  <button
                    type="button"
                    (click)="stopUpload()"
                    class="ml-auto text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Force Stop
                  </button>
                </div>

                @if (uploadSteps().length > 0) {
                  <div class="bg-white border border-blue-200 rounded-lg p-3 max-h-48 overflow-y-auto">
                    <p class="text-xs font-semibold text-blue-700 mb-2">📋 Upload Progress:</p>
                    @for (step of uploadSteps(); track step) {
                      <div class="text-xs text-slate-700 py-1 border-b border-blue-100 last:border-b-0">
                        {{ step }}
                      </div>
                    }
                  </div>
                }
              </div>
            }

            <!-- Drag and Drop Zone -->
            <div
              class="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition"
              (dragover)="$event.preventDefault(); $event.stopPropagation()"
              (dragleave)="$event.preventDefault(); $event.stopPropagation()"
              (drop)="onDropImages($event)"
              [class.border-blue-500]="isDraggingImages()"
              [class.bg-blue-50]="isDraggingImages()"
              [class.opacity-50]="isUploadingImages()"
              [class.pointer-events-none]="isUploadingImages()"
              (mouseenter)="isDraggingImages.set(true)"
              (mouseleave)="isDraggingImages.set(false)"
            >
              <input
                #imageInput
                type="file"
                multiple
                accept="image/*"
                (change)="onImageSelected($event)"
                [disabled]="isUploadingImages()"
                style="display: none"
                class="hidden"
              />
              <div (click)="triggerFileInput()" [class.cursor-not-allowed]="isUploadingImages()">
                <p class="text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
                <p class="text-xs text-slate-500 mt-1">PNG, JPG, GIF up to 10MB each</p>
              </div>
            </div>

            <!-- Uploaded Images Grid -->
            @if (formData.photos && formData.photos.length > 0) {
              <div class="mt-4">
                <label class="block text-sm font-medium text-slate-700 mb-3">
                  Uploaded Images ({{ formData.photos.length }})
                </label>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  @for (image of formData.photos; track image) {
                    <div class="relative group">
                      <img
                        [src]="image"
                        alt="Hotel image"
                        class="w-full h-24 object-cover rounded-lg border-2 border-slate-300 group-hover:opacity-75 transition"
                      />
                      <button
                        type="button"
                        (click)="removeImage(image)"
                        [disabled]="isUploadingImages()"
                        class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition rounded-lg disabled:opacity-50"
                      >
                        <span class="text-2xl">×</span>
                      </button>
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Logo Upload -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-slate-200">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-3">Hotel Logo</label>

              <!-- Logo Upload Zone -->
              <div
                class="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition"
                (dragover)="$event.preventDefault(); $event.stopPropagation()"
                (dragleave)="$event.preventDefault(); $event.stopPropagation()"
                (drop)="onDropLogo($event)"
                [class.border-blue-500]="isDraggingLogo()"
                [class.bg-blue-50]="isDraggingLogo()"
                [class.opacity-50]="isUploadingLogo()"
                [class.pointer-events-none]="isUploadingLogo()"
                (mouseenter)="isDraggingLogo.set(true)"
                (mouseleave)="isDraggingLogo.set(false)"
              >
                <input
                  #logoInput
                  type="file"
                  accept="image/*"
                  (change)="onLogoSelected($event)"
                  [disabled]="isUploadingLogo()"
                  style="display: none"
                />
                <div (click)="triggerLogoInput()" [class.cursor-not-allowed]="isUploadingLogo()">
                  @if (isUploadingLogo()) {
                    <div class="flex items-center justify-center gap-2">
                      <div class="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      <span class="text-sm font-medium text-blue-900">Uploading...</span>
                    </div>
                  } @else {
                    <p class="text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
                    <p class="text-xs text-slate-500 mt-1">PNG, JPG (max 10MB)</p>
                  }
                </div>
              </div>

              <!-- Logo Preview -->
              @if (formData.logo && !formData.logo.startsWith('data:')) {
                <div class="mt-3">
                  <img
                    [src]="formData.logo"
                    alt="Hotel logo"
                    class="w-24 h-24 object-cover rounded-lg border-2 border-slate-300"
                  />
                  <button
                    type="button"
                    (click)="formData.logo = ''"
                    class="mt-2 text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Remove
                  </button>
                </div>
              }
            </div>

            <!-- Thumbnail Upload -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-3">Hotel Thumbnail</label>

              <!-- Thumbnail Upload Zone -->
              <div
                class="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition"
                (dragover)="$event.preventDefault(); $event.stopPropagation()"
                (dragleave)="$event.preventDefault(); $event.stopPropagation()"
                (drop)="onDropThumbnail($event)"
                [class.border-blue-500]="isDraggingThumbnail()"
                [class.bg-blue-50]="isDraggingThumbnail()"
                [class.opacity-50]="isUploadingThumbnail()"
                [class.pointer-events-none]="isUploadingThumbnail()"
                (mouseenter)="isDraggingThumbnail.set(true)"
                (mouseleave)="isDraggingThumbnail.set(false)"
              >
                <input
                  #thumbnailInput
                  type="file"
                  accept="image/*"
                  (change)="onThumbnailSelected($event)"
                  [disabled]="isUploadingThumbnail()"
                  style="display: none"
                />
                <div (click)="triggerThumbnailInput()" [class.cursor-not-allowed]="isUploadingThumbnail()">
                  @if (isUploadingThumbnail()) {
                    <div class="flex items-center justify-center gap-2">
                      <div class="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      <span class="text-sm font-medium text-blue-900">Uploading...</span>
                    </div>
                  } @else {
                    <p class="text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
                    <p class="text-xs text-slate-500 mt-1">PNG, JPG (max 10MB)</p>
                  }
                </div>
              </div>

              <!-- Thumbnail Preview -->
              @if (formData.thumbnail && !formData.thumbnail.startsWith('data:')) {
                <div class="mt-3">
                  <img
                    [src]="formData.thumbnail"
                    alt="Hotel thumbnail"
                    class="w-24 h-24 object-cover rounded-lg border-2 border-slate-300"
                  />
                  <button
                    type="button"
                    (click)="formData.thumbnail = ''"
                    class="mt-2 text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Remove
                  </button>
                </div>
              }
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

        <!-- 8. SMART LOCK & CONTACTLESS CHECK-IN SETTINGS -->
        <div class="bg-white rounded-lg p-8 shadow-md">
          <h2 class="text-2xl font-bold text-slate-900 mb-6 border-b pb-4">🔐 Smart Lock & Contactless Check-In</h2>

          <!-- Contactless Check-In Toggle -->
          <div class="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200 mb-6">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="text-lg font-bold text-slate-900 mb-2">🚪 Enable Contactless Check-In</h3>
                <p class="text-slate-600 mb-4">
                  Allow guests to skip reception and access their rooms directly using smart locks. Guests verify their identity once and receive instant access codes via email. Perfect for health-conscious and tech-savvy travelers.
                </p>

                <div class="space-y-3 bg-white rounded-lg p-4">
                  <div class="flex items-start gap-3">
                    <span class="text-lg">🚪</span>
                    <div>
                      <p class="font-medium text-slate-900">Direct Room Access</p>
                      <p class="text-sm text-slate-600">Guests bypass reception and access rooms immediately</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <span class="text-lg">🆔</span>
                    <div>
                      <p class="font-medium text-slate-900">Identity Verification</p>
                      <p class="text-sm text-slate-600">Customers verify ID to ensure only registered guests check in</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <span class="text-lg">📧</span>
                    <div>
                      <p class="font-medium text-slate-900">Instant Access Code</p>
                      <p class="text-sm text-slate-600">QR code and PIN sent immediately after identity verification</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <span class="text-lg">⏱️</span>
                    <div>
                      <p class="font-medium text-slate-900">Time-Limited Access</p>
                      <p class="text-sm text-slate-600">Access codes expire at checkout time automatically</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Toggle Switch -->
              <div class="ml-4">
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    [(ngModel)]="formData.contactlessCheckInEnabled"
                    class="sr-only peer"
                  />
                  <div class="w-14 h-8 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
                <p class="text-center mt-3 font-bold" [class]="formData.contactlessCheckInEnabled ? 'text-purple-600' : 'text-slate-600'">
                  {{ formData.contactlessCheckInEnabled ? 'ENABLED' : 'DISABLED' }}
                </p>
              </div>
            </div>

            @if (formData.contactlessCheckInEnabled) {
              <div class="mt-6 p-4 bg-green-50 border border-green-300 rounded-lg">
                <p class="text-sm text-green-900">
                  <strong>✓ Active:</strong> Contactless check-in is enabled. Guests will see the identity verification option during booking on your hotel's page.
                </p>
              </div>
            } @else {
              <div class="mt-6 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                <p class="text-sm text-yellow-900">
                  <strong>ℹ️ Disabled:</strong> Guests will use traditional check-in at reception. Enable this to offer contactless access.
                </p>
              </div>
            }
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
  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;
  @ViewChild('logoInput') logoInput!: ElementRef<HTMLInputElement>;
  @ViewChild('thumbnailInput') thumbnailInput!: ElementRef<HTMLInputElement>;

  isLoading = signal(false);
  isSaving = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  isUploadingImages = signal(false);
  isDraggingImages = signal(false);
  uploadSteps = signal<string[]>([]);

  // Logo upload signals
  isUploadingLogo = signal(false);
  isDraggingLogo = signal(false);

  // Thumbnail upload signals
  isUploadingThumbnail = signal(false);
  isDraggingThumbnail = signal(false);

  amenitiesText = '';
  previewImageCount = 0;
  private uploadAbortController: AbortController | null = null;

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
    // Smart Lock & Contactless Check-In
    contactlessCheckInEnabled: false,
    subscriptionPlan: 'basic',
    billingDuration: 'monthly',
    paymentStatus: 'pending',
    paymentMethod: 'credit_card',
    isActive: true,
    logo: ''
  };

  constructor(
    private hotelService: HotelService,
    private imageUploadService: AngularFireUploadService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading.set(true);
    const hotelId = localStorage.getItem('hotelId');
    const userId = localStorage.getItem('userId');

    console.log('🏨 Loading hotel profile...');
    console.log('  hotelId from localStorage:', hotelId);
    console.log('  userId from localStorage:', userId);
    console.log('  Hotel Service hotelId before update:', this.hotelService['hotelId']);

    if (!hotelId) {
      this.errorMessage.set('❌ No hotel ID found. Please sign up again as a hotel vendor.');
      this.isLoading.set(false);
      console.error('❌ hotelId is null/undefined in localStorage');
      return;
    }

    // Ensure HotelService has the correct hotelId from localStorage
    this.hotelService.setHotelId(hotelId);
    console.log('✅ Hotel Service hotelId updated to:', hotelId);

    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (this.isLoading()) {
        this.errorMessage.set('⏱️ Request timed out. The backend might not be responding.');
        this.isLoading.set(false);
        console.error('❌ Hotel fetch request timed out after 10 seconds');
      }
    }, 10000);

    this.hotelService.getHotelDetails().subscribe({
      next: (response: any) => {
        clearTimeout(timeout);
        console.log('✅ Hotel details response:', response);
        if (response.status === 'success' && response.data) {
          this.formData = { ...response.data };
          this.amenitiesText = (this.formData.amenities || []).join(', ');
          console.log('✅ Profile loaded successfully');
          this.errorMessage.set('');
        } else {
          console.warn('⚠️ Response not successful or no data:', response);
          this.errorMessage.set(`No hotel profile found. Response: ${JSON.stringify(response)}`);
        }
        this.isLoading.set(false);
      },
      error: (error: any) => {
        clearTimeout(timeout);
        console.error('❌ Error loading profile:', error);
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url,
          error: error.error
        });
        const errorMsg = error.error?.message || error.message || `HTTP ${error.status}`;
        this.errorMessage.set(`❌ Failed to load profile: ${errorMsg}`);
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

    // Check if any images are still uploading
    const hasPreviewImages = this.formData.photos?.some((url: string) => url.startsWith('data:')) || false;
    const hasPreviewLogo = this.formData.logo?.startsWith('data:') || false;
    const hasPreviewThumbnail = this.formData.thumbnail?.startsWith('data:') || false;

    if (hasPreviewImages || hasPreviewLogo || hasPreviewThumbnail) {
      this.errorMessage.set('⏳ Images are still uploading. Please wait for the upload to complete before saving.');
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

  // ==================== IMAGE UPLOAD METHODS ====================
  triggerFileInput(): void {
    if (!this.isUploadingImages()) {
      this.imageInput?.nativeElement?.click();
    }
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files: File[] = Array.from(input.files || []);

    this.addUploadStep(`📸 Image selected - ${files.length} file(s)`);

    if (!files.length) {
      this.addUploadStep('⚠️ No files selected');
      return;
    }

    // Initialize photos array if not present
    if (!this.formData.photos) {
      this.formData.photos = [];
    }

    // Clear previous preview images and reinitialize
    this.previewImageCount = files.length;
    this.formData.photos = [];
    const previewImages: string[] = [];

    // Display image previews to the user
    this.addUploadStep('🖼️ Loading preview images...');
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const dataUrl = e.target?.result as string;
        previewImages.push(dataUrl);

        // Update the formData images
        this.formData.photos?.push(dataUrl);

        // Set as thumbnail if not set
        if (!this.formData.thumbnail) {
          this.formData.thumbnail = dataUrl;
        }
      };
      reader.readAsDataURL(file);
    });

    this.addUploadStep('🚀 Starting upload...');
    this.isUploadingImages.set(true);

    // Get hotelId for the upload path
    const hotelId = this.formData._id || localStorage.getItem('hotelId') || 'new';
    const uploadPath = `hotels/${hotelId}`;
    this.addUploadStep('📤 Upload path: ' + uploadPath);
    this.addUploadStep('📋 Files to upload: ' + files.length);

    // Implement timeout for upload safety (45 seconds)
    const timeoutHandle = setTimeout(() => {
      if (this.isUploadingImages()) {
        this.addUploadStep('⏱️ Upload timeout - auto-stopping spinner');
        this.addUploadStep('💡 File may still be uploading in background');
        this.isUploadingImages.set(false);
        console.error('❌ Upload timeout after 45 seconds');
      }
    }, 45000);

    this.uploadAbortController = new AbortController();

    this.imageUploadService.uploadMultipleImages(files, uploadPath).subscribe({
      next: (imageUrls: string[]) => {
        clearTimeout(timeoutHandle);

        this.addUploadStep(`🎉 Upload complete! Received ${imageUrls.length} URLs`);
        if (!imageUrls.length) {
          this.addUploadStep('❌ ERROR: Firebase did not return any URLs!');
          console.error('❌ Firebase returned empty URL array!');
          this.isUploadingImages.set(false);
          this.errorMessage.set('Upload failed: Firebase returned no image URLs');
          return;
        }

        console.log('🎉 Upload successful. Image URLs:', imageUrls);

        // Replace preview URLs with actual uploaded URLs
        this.formData.photos = imageUrls;
        this.addUploadStep(`✅ Images updated with uploaded URLs: ${imageUrls.length} total`);

        // Set the first image as thumbnail if not already set or is a data URL
        if (!this.formData.thumbnail || this.formData.thumbnail.startsWith('data:')) {
          this.formData.thumbnail = imageUrls[0];
          this.addUploadStep('📌 Thumbnail set to first image');
        }

        // Reset the upload state and show success message
        this.isUploadingImages.set(false);
        this.successMessage.set(`✅ ${imageUrls.length} image(s) uploaded successfully!`);
        this.uploadSteps.set([]);
        input.value = '';
        this.uploadAbortController = null;

        // Clear success messages after 3 seconds
        setTimeout(() => {
          this.successMessage.set('');
        }, 3000);
      },
      error: (error: any) => {
        clearTimeout(timeoutHandle);
        const errorMsg = error?.message || 'Unknown error occurred';
        console.error('❌ Upload failed:', errorMsg);

        // Display error and provide suggestions
        this.addUploadStep('❌ Upload failed. Error: ' + errorMsg);
        if (errorMsg.includes('Security Rules')) {
          this.addUploadStep('💡 Fix: Check Firebase Storage Security Rules');
        } else if (errorMsg.includes('bucket-not-found')) {
          this.addUploadStep('💡 Fix: Verify that your storageBucket is correct');
        } else if (errorMsg.includes('timeout')) {
          this.addUploadStep('💡 Fix: Check your internet connection');
        } else if (errorMsg.includes('Cannot connect')) {
          this.addUploadStep('💡 Fix: Backend server may not be running');
        }

        this.isUploadingImages.set(false);
        this.errorMessage.set(`❌ Upload failed: ${errorMsg}`);
        input.value = '';
        this.uploadAbortController = null;
      }
    });
  }

  onDropImages(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingImages.set(false);

    const files: File[] = Array.from(event.dataTransfer?.files || []).filter((file) =>
      file.type.startsWith('image/')
    );

    if (files.length) {
      // Create a mock event for the file input handler
      const mockEvent = {
        target: {
          files: files
        }
      } as unknown as Event;

      this.onImageSelected(mockEvent);
    }
  }

  removeImage(image: string): void {
    this.formData.photos = this.formData.photos.filter((url: string) => url !== image);

    if (this.formData.thumbnail === image) {
      this.formData.thumbnail = this.formData.photos[0] || '';
    }
  }

  stopUpload(): void {
    if (this.uploadAbortController) {
      this.uploadAbortController.abort();
      this.isUploadingImages.set(false);
      this.errorMessage.set('Upload cancelled');
    }
  }

  // ==================== LOGO UPLOAD METHODS ====================
  triggerLogoInput(): void {
    if (!this.isUploadingLogo()) {
      this.logoInput?.nativeElement?.click();
    }
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      this.errorMessage.set('⚠️ No file selected');
      return;
    }

    console.log('📝 Logo upload started:', file.name);
    this.isUploadingLogo.set(true);

    // Get hotelId for the upload path
    const hotelId = this.formData._id || localStorage.getItem('hotelId') || 'new';
    const uploadPath = `hotels/${hotelId}/logo`;

    console.log('📤 Logo upload path:', uploadPath);

    // Implement timeout for upload safety
    const timeoutHandle = setTimeout(() => {
      if (this.isUploadingLogo()) {
        this.isUploadingLogo.set(false);
        console.error('❌ Logo upload timeout');
      }
    }, 45000);

    this.imageUploadService.uploadImage(file, uploadPath).subscribe({
      next: (logoUrl: string) => {
        clearTimeout(timeoutHandle);
        console.log('✅ Logo uploaded successfully:', logoUrl);
        this.formData.logo = logoUrl;
        this.isUploadingLogo.set(false);
        this.successMessage.set('✅ Logo uploaded successfully!');
        input.value = '';

        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage.set('');
        }, 3000);
      },
      error: (error: any) => {
        clearTimeout(timeoutHandle);
        const errorMsg = error?.message || 'Failed to upload logo';
        console.error('❌ Logo upload failed:', errorMsg);
        this.isUploadingLogo.set(false);
        this.errorMessage.set(`❌ Logo upload failed: ${errorMsg}`);
        input.value = '';
      }
    });
  }

  onDropLogo(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingLogo.set(false);

    const file = event.dataTransfer?.files?.[0];

    if (file && file.type.startsWith('image/')) {
      // Create a mock event for the file input handler
      const mockEvent = {
        target: {
          files: [file]
        }
      } as unknown as Event;

      this.onLogoSelected(mockEvent);
    }
  }

  // ==================== THUMBNAIL UPLOAD METHODS ====================
  triggerThumbnailInput(): void {
    if (!this.isUploadingThumbnail()) {
      this.thumbnailInput?.nativeElement?.click();
    }
  }

  onThumbnailSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      this.errorMessage.set('⚠️ No file selected');
      return;
    }

    console.log('📝 Thumbnail upload started:', file.name);
    this.isUploadingThumbnail.set(true);

    // Get hotelId for the upload path
    const hotelId = this.formData._id || localStorage.getItem('hotelId') || 'new';
    const uploadPath = `hotels/${hotelId}/thumbnail`;

    console.log('📤 Thumbnail upload path:', uploadPath);

    // Implement timeout for upload safety
    const timeoutHandle = setTimeout(() => {
      if (this.isUploadingThumbnail()) {
        this.isUploadingThumbnail.set(false);
        console.error('❌ Thumbnail upload timeout');
      }
    }, 45000);

    this.imageUploadService.uploadImage(file, uploadPath).subscribe({
      next: (thumbnailUrl: string) => {
        clearTimeout(timeoutHandle);
        console.log('✅ Thumbnail uploaded successfully:', thumbnailUrl);
        this.formData.thumbnail = thumbnailUrl;
        this.isUploadingThumbnail.set(false);
        this.successMessage.set('✅ Thumbnail uploaded successfully!');
        input.value = '';

        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage.set('');
        }, 3000);
      },
      error: (error: any) => {
        clearTimeout(timeoutHandle);
        const errorMsg = error?.message || 'Failed to upload thumbnail';
        console.error('❌ Thumbnail upload failed:', errorMsg);
        this.isUploadingThumbnail.set(false);
        this.errorMessage.set(`❌ Thumbnail upload failed: ${errorMsg}`);
        input.value = '';
      }
    });
  }

  onDropThumbnail(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingThumbnail.set(false);

    const file = event.dataTransfer?.files?.[0];

    if (file && file.type.startsWith('image/')) {
      // Create a mock event for the file input handler
      const mockEvent = {
        target: {
          files: [file]
        }
      } as unknown as Event;

      this.onThumbnailSelected(mockEvent);
    }
  }

  private addUploadStep(step: string): void {
    const steps = [...this.uploadSteps()];
    steps.push(step);
    this.uploadSteps.set(steps);
  }
}
