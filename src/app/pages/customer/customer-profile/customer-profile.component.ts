import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../../services/customer.service';
import { AuthService } from '../../../services/auth.service';
import { ReturnService, ProductReturn } from '../../../services/return.service';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">My Profile</h2>
        <p class="text-gray-600">Manage your account and preferences</p>
      </div>

      @if (isLoading()) {
        <div class="text-center py-12">
          <div class="inline-block animate-spin text-4xl mb-4">⏳</div>
          <p class="text-gray-600">Loading profile...</p>
        </div>
      } @else if (profile()) {
        <!-- Section Navigation -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div class="flex gap-2 p-4 border-b overflow-x-auto">
            <button
              (click)="activeSection.set('profile')"
              [class]="'px-4 py-2 font-semibold rounded-lg transition whitespace-nowrap ' +
                (activeSection() === 'profile'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200')"
            >
              👤 Profile
            </button>
            <button
              (click)="viewWishlist()"
              [class]="'px-4 py-2 font-semibold rounded-lg transition whitespace-nowrap ' +
                (activeSection() === 'wishlist'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200')"
            >
              ❤️ Wishlist ({{ wishlistCount() }})
            </button>
            <button
              (click)="viewReviews()"
              [class]="'px-4 py-2 font-semibold rounded-lg transition whitespace-nowrap ' +
                (activeSection() === 'reviews'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200')"
            >
              ⭐ Reviews ({{ reviewsCount() }})
            </button>
            <button
              (click)="editPreferences()"
              [class]="'px-4 py-2 font-semibold rounded-lg transition whitespace-nowrap ' +
                (activeSection() === 'preferences'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200')"
            >
              ⚙️ Preferences
            </button>
            <button
              (click)="activeSection.set('password')"
              [class]="'px-4 py-2 font-semibold rounded-lg transition whitespace-nowrap ' +
                (activeSection() === 'password'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200')"
            >
              🔒 Password
            </button>
            <button
              (click)="viewReturns()"
              [class]="'px-4 py-2 font-semibold rounded-lg transition whitespace-nowrap ' +
                (activeSection() === 'returns'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200')"
            >
              📦 Returns ({{ returnsCount() }})
            </button>
          </div>
        </div>

        <!-- PROFILE SECTION -->
        @if (activeSection() === 'profile') {
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Profile Avatar & Info -->
            <div class="lg:col-span-1">
              <div class="bg-white rounded-lg shadow-md p-6 text-center">
                <div class="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-4xl">
                  👤
                </div>
                <h3 class="text-xl font-bold text-gray-800">{{ profile().name }}</h3>
                <p class="text-sm text-gray-600 mt-1">{{ profile().email }}</p>
                <p class="text-sm text-gray-500 mt-2">Member since {{ profile().createdAt | date: 'MMM yyyy' }}</p>
              </div>
            </div>

            <!-- Profile Form -->
            <div class="lg:col-span-2">
              <div class="bg-white rounded-lg shadow-md p-6 space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      [(ngModel)]="profile().name"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      [(ngModel)]="profile().email"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      [(ngModel)]="profile().phone"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">User Type</label>
                    <input
                      type="text"
                      [value]="profile().userType"
                      disabled
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                  </div>
                </div>

                <!-- Address -->
                @if (profile().address) {
                  <div class="border-t border-gray-200 pt-4">
                    <h4 class="font-semibold text-gray-800 mb-3">Address</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Street</label>
                        <input
                          type="text"
                          [(ngModel)]="profile().address.street"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input
                          type="text"
                          [(ngModel)]="profile().address.city"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <input
                          type="text"
                          [(ngModel)]="profile().address.state"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                        <input
                          type="text"
                          [(ngModel)]="profile().address.zipCode"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                }

                <!-- Save Button -->
                <div class="flex gap-4 pt-4">
                  <button
                    (click)="saveProfile()"
                    [disabled]="isSaving()"
                    class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition disabled:opacity-50"
                  >
                    {{ isSaving() ? '💾 Saving...' : '💾 Save Changes' }}
                  </button>
                </div>

                @if (successMessage()) {
                  <div class="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg text-sm">
                    ✅ {{ successMessage() }}
                  </div>
                }

                @if (error()) {
                  <div class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
                    ❌ {{ error() }}
                  </div>
                }
              </div>
            </div>
          </div>
        }

        <!-- WISHLIST SECTION -->
        @if (activeSection() === 'wishlist') {
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-2xl font-bold text-gray-800 mb-6">❤️ My Wishlist</h3>
            @if (wishlist().length > 0) {
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                @for (item of wishlist(); track item._id) {
                  <div class="border rounded-lg p-4 hover:shadow-lg transition">
                    <div class="flex justify-between items-start mb-3">
                      <h4 class="font-bold text-gray-800 flex-1">{{ item.name || item.itemName }}</h4>
                      <button
                        (click)="removeFromWishlist(item._id)"
                        class="text-red-600 hover:text-red-800 font-bold text-lg"
                        title="Remove from wishlist">
                        ✕
                      </button>
                    </div>
                    <p class="text-sm text-gray-600 mb-3">{{ item.description }}</p>
                    <p class="text-lg font-bold text-green-600">₦{{ (item.price || 0).toLocaleString() }}</p>
                  </div>
                }
              </div>
            } @else {
              <p class="text-gray-500 text-center py-12">❤️ No items in your wishlist yet</p>
            }
          </div>
        }

        <!-- REVIEWS SECTION -->
        @if (activeSection() === 'reviews') {
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-2xl font-bold text-gray-800 mb-6">⭐ My Reviews</h3>
            @if (reviews().length > 0) {
              <div class="space-y-4">
                @for (review of reviews(); track review._id) {
                  <div class="border rounded-lg p-4 hover:shadow-md transition">
                    <div class="flex justify-between items-start mb-2">
                      <h4 class="font-bold text-gray-800">{{ review.entityName || 'Product/Service' }}</h4>
                      <div class="text-yellow-400 text-lg">
                        @for (star of [1,2,3,4,5]; track star) {
                          {{ star <= review.rating ? '⭐' : '☆' }}
                        }
                      </div>
                    </div>
                    <p class="text-gray-700 text-sm mb-2">{{ review.comment || review.review }}</p>
                    <p class="text-xs text-gray-500">{{ review.createdAt | date: 'MMM dd, yyyy' }}</p>
                  </div>
                }
              </div>
            } @else {
              <p class="text-gray-500 text-center py-12">⭐ No reviews yet</p>
            }
          </div>
        }

        <!-- PREFERENCES SECTION -->
        @if (activeSection() === 'preferences') {
          <div class="bg-white rounded-lg shadow-md p-6 max-w-2xl">
            <h3 class="text-2xl font-bold text-gray-800 mb-6">⚙️ Preferences</h3>
            <div class="space-y-6">
              <!-- Notifications -->
              <div class="border-b pb-6">
                <h4 class="font-bold text-gray-800 mb-4">Notifications</h4>
                <div class="space-y-3">
                  <label class="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      [(ngModel)]="preferences().emailNotifications"
                      class="w-5 h-5 rounded"
                    />
                    <span class="text-gray-700">Email Notifications</span>
                  </label>
                  <label class="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      [(ngModel)]="preferences().pushNotifications"
                      class="w-5 h-5 rounded"
                    />
                    <span class="text-gray-700">Push Notifications</span>
                  </label>
                  <label class="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      [(ngModel)]="preferences().smsNotifications"
                      class="w-5 h-5 rounded"
                    />
                    <span class="text-gray-700">SMS Notifications</span>
                  </label>
                </div>
              </div>

              <!-- Privacy -->
              <div class="pb-6">
                <h4 class="font-bold text-gray-800 mb-4">Privacy</h4>
                <div class="space-y-3">
                  <label class="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      [(ngModel)]="preferences().privateProfile"
                      class="w-5 h-5 rounded"
                    />
                    <span class="text-gray-700">Private Profile</span>
                  </label>
                  <label class="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      [(ngModel)]="preferences().showActivity"
                      class="w-5 h-5 rounded"
                    />
                    <span class="text-gray-700">Show My Activity</span>
                  </label>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex gap-4">
                <button
                  (click)="savePreferences()"
                  [disabled]="isSaving()"
                  class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {{ isSaving() ? '💾 Saving...' : '💾 Save Preferences' }}
                </button>
                <button
                  (click)="activeSection.set('profile')"
                  class="px-6 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>

              @if (successMessage()) {
                <div class="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg text-sm">
                  ✅ {{ successMessage() }}
                </div>
              }
            </div>
          </div>
        }

        <!-- PASSWORD CHANGE SECTION -->
        @if (activeSection() === 'password') {
          <div class="bg-white rounded-lg shadow-md p-6 max-w-2xl">
            <h3 class="text-2xl font-bold text-gray-800 mb-6">🔒 Change Password</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  [(ngModel)]="currentPassword"
                  placeholder="Enter your current password"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  [(ngModel)]="newPassword"
                  placeholder="Enter new password (min. 6 characters)"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  [(ngModel)]="confirmPassword"
                  placeholder="Confirm new password"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <!-- Actions -->
              <div class="flex gap-4 pt-4">
                <button
                  (click)="changePassword()"
                  [disabled]="isSaving()"
                  class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {{ isSaving() ? '⏳ Changing...' : '✓ Change Password' }}
                </button>
                <button
                  (click)="activeSection.set('profile')"
                  class="px-6 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>

              @if (passwordSuccess()) {
                <div class="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg text-sm">
                  ✅ {{ passwordSuccess() }}
                </div>
              }

              @if (passwordError()) {
                <div class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
                  ❌ {{ passwordError() }}
                </div>
              }
            </div>
          </div>
        }

        <!-- RETURNS SECTION -->
        @if (activeSection() === 'returns') {
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-2xl font-bold text-gray-800">📦 Product Returns</h3>
              <button
                (click)="openReturnForm()"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
              >
                + Request Return
              </button>
            </div>

            <!-- Return Request Form -->
            @if (showReturnForm()) {
              <div class="bg-blue-50 border border-blue-300 rounded-lg p-6 mb-6">
                <h4 class="text-lg font-bold text-gray-900 mb-4">Request a Return</h4>

                @if (myOrders().length > 0) {
                  <div class="space-y-4">
                    <!-- Order Selection -->
                    <div>
                      <label class="block font-semibold text-gray-700 mb-2">Select Order *</label>
                      <select
                        [(ngModel)]="selectedOrderId"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-- Choose an order --</option>
                        @for (order of myOrders(); track order._id) {
                          <option [value]="order._id">
                            Order #{{ order._id?.substring(0, 8) }} - ₦{{ order.totalAmount?.toLocaleString() || 0 }} ({{ order.status || 'Pending' }})
                          </option>
                        }
                      </select>
                    </div>

                    <!-- Return Reason -->
                    <div>
                      <label class="block font-semibold text-gray-700 mb-2">Return Reason *</label>
                      <select
                        [(ngModel)]="returnReason"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-- Select reason --</option>
                        <option value="defective">Defective/Broken</option>
                        <option value="not_as_described">Not as Described</option>
                        <option value="damaged_in_transit">Damaged in Transit</option>
                        <option value="changed_mind">Changed Mind</option>
                        <option value="duplicate_order">Duplicate Order</option>
                        <option value="wrong_item">Wrong Item Received</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <!-- Return Description -->
                    <div>
                      <label class="block font-semibold text-gray-700 mb-2">Description</label>
                      <textarea
                        [(ngModel)]="returnDescription"
                        placeholder="Please provide details about why you want to return this item..."
                        rows="3"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      ></textarea>
                    </div>

                    <!-- Refund Amount -->
                    <div>
                      <label class="block font-semibold text-gray-700 mb-2">Refund Amount (₦) *</label>
                      <input
                        type="number"
                        [(ngModel)]="refundAmount"
                        min="0"
                        placeholder="Enter refund amount"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <!-- Error/Success Messages -->
                    @if (returnSubmitError()) {
                      <div class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
                        ❌ {{ returnSubmitError() }}
                      </div>
                    }

                    @if (returnSubmitSuccess()) {
                      <div class="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg text-sm">
                        ✅ {{ returnSubmitSuccess() }}
                      </div>
                    }

                    <!-- Buttons -->
                    <div class="flex gap-3 pt-2">
                      <button
                        (click)="submitReturnRequest()"
                        [disabled]="isSubmittingReturn()"
                        class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50"
                      >
                        {{ isSubmittingReturn() ? '⏳ Submitting...' : '✓ Submit Return Request' }}
                      </button>
                      <button
                        (click)="closeReturnForm()"
                        [disabled]="isSubmittingReturn()"
                        class="px-6 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                } @else {
                  <div class="text-center py-6 text-gray-600">
                    <p class="mb-3">📦 You have no orders available for return</p>
                    <button
                      (click)="closeReturnForm()"
                      class="text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Close
                    </button>
                  </div>
                }
              </div>
            }

            <!-- Existing Returns List -->
            @if (myReturns().length > 0) {
              <div class="space-y-4">
                @for (return of myReturns(); track return._id) {
                  <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div class="flex items-start justify-between mb-3">
                      <div>
                        <h4 class="font-bold text-gray-900">{{ return.productId }}</h4>
                        <p class="text-sm text-gray-600">Order: {{ return.orderId }}</p>
                      </div>
                      <span [class]="'text-xs font-semibold px-3 py-1 rounded-full ' +
                        (return.returnStatus === 'completed' ? 'bg-green-100 text-green-700' :
                         return.returnStatus === 'approved' ? 'bg-blue-100 text-blue-700' :
                         return.returnStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                         'bg-yellow-100 text-yellow-700')">
                        {{ return.returnStatus | titlecase }}
                      </span>
                    </div>

                    <div class="mb-3 pb-3 border-b border-gray-200">
                      <p class="text-sm text-gray-700 mb-2"><strong>Reason:</strong> {{ return.reason }}</p>
                      <p class="text-sm text-gray-600">{{ return.description }}</p>
                    </div>

                    <div class="flex items-center justify-between text-sm">
                      <div>
                        <span class="text-gray-600">Refund Amount: </span>
                        <span class="font-bold text-green-600">¥{{ return.refundAmount.toFixed(2) }}</span>
                      </div>
                      <div class="text-gray-500">
                        {{ return.createdAt | date: 'short' }}
                      </div>
                    </div>

                    @if (return.returnStatus === 'approved' || return.returnStatus === 'shipped') {
                      <div class="mt-3 p-3 bg-blue-50 rounded text-sm">
                        @if (return.trackingNumber) {
                          <p class="text-blue-700"><strong>Tracking:</strong> {{ return.trackingNumber }}</p>
                        }
                        @if (return.shippingLabel) {
                          <a [href]="return.shippingLabel" target="_blank" class="text-blue-600 hover:text-blue-700 font-semibold">
                            📄 Download Shipping Label
                          </a>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            } @else if (!showReturnForm()) {
              <div class="text-center py-12 text-gray-500">
                <div class="text-5xl mb-3">📦</div>
                <p>No returns yet</p>
                <p class="text-sm">You can request a return by clicking the "Request Return" button above</p>
              </div>
            }
          </div>
        }
      }
    </div>
  `,
  styles: []
})
export class CustomerProfileComponent implements OnInit {
  profile = signal<any>(null);
  isLoading = signal(true);
  isSaving = signal(false);
  error = signal('');
  successMessage = signal('');
  wishlistCount = signal(0);
  reviewsCount = signal(0);
  
  // Section management
  activeSection = signal<'profile' | 'wishlist' | 'reviews' | 'preferences' | 'password' | 'returns'>('profile');
  wishlist = signal<any[]>([]);
  reviews = signal<any[]>([]);
  preferences = signal<any>({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    privateProfile: false,
    showActivity: true
  });
  
  // Password change
  currentPassword = signal('');
  newPassword = signal('');
  confirmPassword = signal('');
  passwordError = signal('');
  passwordSuccess = signal('');

  // Returns
  myReturns = signal<ProductReturn[]>([]);
  returnsCount = signal(0);

  // Orders
  myOrders = signal<any[]>([]);
  ordersCount = signal(0);

  // Return Request Form
  showReturnForm = signal(false);
  selectedOrderId = signal('');
  returnReason = signal('');
  returnDescription = signal('');
  refundAmount = signal(0);
  isSubmittingReturn = signal(false);
  returnSubmitError = signal('');
  returnSubmitSuccess = signal('');

  constructor(
    private customerService: CustomerService,
    private authService: AuthService,
    private returnService: ReturnService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading.set(true);
    this.error.set('');

    // Load current user from auth service
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.profile.set(currentUser);
    }

    // Also fetch fresh profile data
    this.customerService.getProfile().subscribe({
      next: (response) => {
        if (response.success) {
          this.profile.set(response.data);
          console.log('✅ Profile loaded');
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Error loading profile:', error);
        this.isLoading.set(false);
      }
    });
  }

  saveProfile(): void {
    if (!this.profile()) return;

    this.isSaving.set(true);
    this.error.set('');
    this.successMessage.set('');

    this.customerService.updateProfile(this.profile()).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage.set('Profile updated successfully!');
          console.log('✅ Profile updated');
          setTimeout(() => this.successMessage.set(''), 3000);
        }
        this.isSaving.set(false);
      },
      error: (error) => {
        console.error('❌ Error updating profile:', error);
        this.error.set(error.error?.message || 'Failed to update profile');
        this.isSaving.set(false);
      }
    });
  }

  loadWishlist(): void {
    this.customerService.getWishlist().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.wishlist.set(response.data);
          this.wishlistCount.set(response.data.length);
          console.log('✅ Wishlist loaded');
        }
      },
      error: (error) => {
        console.error('❌ Error loading wishlist:', error);
      }
    });
  }

  loadReviews(): void {
    this.customerService.getMyReviews().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.reviews.set(response.data);
          this.reviewsCount.set(response.data.length);
          console.log('✅ Reviews loaded');
        }
      },
      error: (error) => {
        console.error('❌ Error loading reviews:', error);
      }
    });
  }

  loadReturns(): void {
    this.returnService.getMyReturns().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.myReturns.set(response.data);
          this.returnsCount.set(response.data.length);
          console.log('✅ Returns loaded');
        }
      },
      error: (error) => {
        console.error('❌ Error loading returns:', error);
      }
    });
  }

  loadOrders(): void {
    this.customerService.getCustomerOrders(1, 50).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.myOrders.set(response.data);
          this.ordersCount.set(response.data.length);
          console.log('✅ Orders loaded');
        }
      },
      error: (error) => {
        console.error('❌ Error loading orders:', error);
        this.myOrders.set([]);
      }
    });
  }

  viewReturns(): void {
    this.loadReturns();
    this.loadOrders();
    this.activeSection.set('returns');
  }

  openReturnForm(): void {
    this.showReturnForm.set(true);
    this.returnSubmitError.set('');
    this.returnSubmitSuccess.set('');
  }

  closeReturnForm(): void {
    this.showReturnForm.set(false);
    this.selectedOrderId.set('');
    this.returnReason.set('');
    this.returnDescription.set('');
    this.refundAmount.set(0);
    this.returnSubmitError.set('');
    this.returnSubmitSuccess.set('');
  }

  submitReturnRequest(): void {
    // Validate form
    if (!this.selectedOrderId() || !this.returnReason() || !this.refundAmount()) {
      this.returnSubmitError.set('Please fill in all required fields');
      return;
    }

    this.isSubmittingReturn.set(true);
    this.returnSubmitError.set('');
    this.returnSubmitSuccess.set('');

    // Get selected order details
    const selectedOrder = this.myOrders().find(o => o._id === this.selectedOrderId());
    if (!selectedOrder) {
      this.returnSubmitError.set('Invalid order selected');
      this.isSubmittingReturn.set(false);
      return;
    }

    const returnRequest = {
      orderId: this.selectedOrderId(),
      productId: selectedOrder.productId || selectedOrder._id,
      reason: this.returnReason(),
      description: this.returnDescription(),
      refundAmount: this.refundAmount()
    };

    this.returnService.createReturn(returnRequest).subscribe({
      next: (response) => {
        if (response.success) {
          this.returnSubmitSuccess.set('Return request submitted successfully!');
          setTimeout(() => {
            this.closeReturnForm();
            this.loadReturns();
            this.returnSubmitSuccess.set('');
          }, 2000);
        }
        this.isSubmittingReturn.set(false);
      },
      error: (error) => {
        console.error('❌ Error submitting return:', error);
        this.returnSubmitError.set(error.error?.message || 'Failed to submit return request');
        this.isSubmittingReturn.set(false);
      }
    });
  }

  viewWishlist(): void {
    this.loadWishlist();
    this.activeSection.set('wishlist');
  }

  viewReviews(): void {
    this.loadReviews();
    this.activeSection.set('reviews');
  }

  editPreferences(): void {
    this.activeSection.set('preferences');
  }

  savePreferences(): void {
    this.isSaving.set(true);
    this.successMessage.set('');
    this.error.set('');

    this.customerService.updateProfile({ preferences: this.preferences() }).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage.set('Preferences updated successfully!');
          setTimeout(() => {
            this.successMessage.set('');
            this.activeSection.set('profile');
          }, 2000);
        }
        this.isSaving.set(false);
      },
      error: (error) => {
        console.error('❌ Error updating preferences:', error);
        this.error.set('Failed to update preferences');
        this.isSaving.set(false);
      }
    });
  }

  changePassword(): void {
    this.passwordError.set('');
    this.passwordSuccess.set('');

    if (!this.currentPassword() || !this.newPassword() || !this.confirmPassword()) {
      this.passwordError.set('All fields are required');
      return;
    }

    if (this.newPassword() !== this.confirmPassword()) {
      this.passwordError.set('New passwords do not match');
      return;
    }

    if (this.newPassword().length < 6) {
      this.passwordError.set('Password must be at least 6 characters');
      return;
    }

    this.isSaving.set(true);

    this.customerService.changePassword(
      this.currentPassword(),
      this.newPassword()
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.passwordSuccess.set('Password changed successfully!');
          this.currentPassword.set('');
          this.newPassword.set('');
          this.confirmPassword.set('');
          
          setTimeout(() => {
            this.passwordSuccess.set('');
            this.activeSection.set('profile');
          }, 2000);
        }
        this.isSaving.set(false);
      },
      error: (error) => {
        console.error('❌ Error changing password:', error);
        this.passwordError.set(error.error?.message || 'Failed to change password');
        this.isSaving.set(false);
      }
    });
  }

  removeFromWishlist(itemId: string): void {
    this.customerService.removeFromWishlist(itemId).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadWishlist();
          this.successMessage.set('Item removed from wishlist');
          setTimeout(() => this.successMessage.set(''), 2000);
        }
      },
      error: (error) => {
        console.error('❌ Error removing from wishlist:', error);
        this.error.set('Failed to remove item');
      }
    });
  }
}
