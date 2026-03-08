import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../../../../services/hotel.service';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8 space-y-6">
      <!-- Header -->
      <div class="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-8 text-white shadow-lg">
        <div>
          <h1 class="text-3xl font-bold mb-2">Pricing Management</h1>
          <p class="text-emerald-100">Manage rates, discounts, and pricing strategies</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 bg-white rounded-lg shadow-md p-2">
        <button
          (click)="activeTab = 'base-rates'"
          [class.bg-emerald-600]="activeTab === 'base-rates'"
          [class.text-white]="activeTab === 'base-rates'"
          [class.text-slate-700]="activeTab !== 'base-rates'"
          class="px-6 py-3 font-semibold rounded-lg transition"
        >
          Base Rates
        </button>
        <button
          (click)="activeTab = 'seasonal'"
          [class.bg-emerald-600]="activeTab === 'seasonal'"
          [class.text-white]="activeTab === 'seasonal'"
          [class.text-slate-700]="activeTab !== 'seasonal'"
          class="px-6 py-3 font-semibold rounded-lg transition"
        >
          Seasonal Rates
        </button>
        <button
          (click)="activeTab = 'discounts'"
          [class.bg-emerald-600]="activeTab === 'discounts'"
          [class.text-white]="activeTab === 'discounts'"
          [class.text-slate-700]="activeTab !== 'discounts'"
          class="px-6 py-3 font-semibold rounded-lg transition"
        >
          Discounts
        </button>
        <button
          (click)="activeTab = 'specials'"
          [class.bg-emerald-600]="activeTab === 'specials'"
          [class.text-white]="activeTab === 'specials'"
          [class.text-slate-700]="activeTab !== 'specials'"
          class="px-6 py-3 font-semibold rounded-lg transition"
        >
          Special Offers
        </button>
      </div>

      <!-- Base Rates Tab -->
      @if (activeTab === 'base-rates') {
        <div class="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-slate-900">Base Rates by Room Type</h2>
            <button
              (click)="openBaseRateModal()"
              class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-lg transition"
            >
              ➕ Add Base Rate
            </button>
          </div>

          @if (baseRates().length === 0) {
            <div class="text-center py-8 text-slate-500">
              <p class="text-lg font-semibold">No base rates configured</p>
              <p class="text-sm mt-1">Add base rates for your room types</p>
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-slate-100 border-b">
                  <tr>
                    <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Room Type</th>
                    <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Base Price</th>
                    <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Min Stay</th>
                    <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Capacity</th>
                    <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y">
                  @for (rate of baseRates(); track rate._id) {
                    <tr class="hover:bg-slate-50">
                      <td class="px-6 py-4 text-sm font-medium text-slate-900">{{ rate.roomType }}</td>
                      <td class="px-6 py-4 text-sm text-slate-600">₦{{ rate.basePrice?.toLocaleString() }}</td>
                      <td class="px-6 py-4 text-sm text-slate-600">{{ rate.minStay || 1 }} night(s)</td>
                      <td class="px-6 py-4 text-sm text-slate-600">{{ rate.capacity || 2 }} guests</td>
                      <td class="px-6 py-4 text-sm">
                        <div class="flex gap-2">
                          <button
                            (click)="editBaseRate(rate)"
                            class="text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            (click)="deleteBaseRate(rate._id)"
                            class="text-red-600 hover:text-red-700 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      }

      <!-- Seasonal Rates Tab -->
      @if (activeTab === 'seasonal') {
        <div class="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-slate-900">Seasonal Pricing</h2>
            <button
              (click)="openSeasonalModal()"
              class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-lg transition"
            >
              ➕ Add Seasonal Rate
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            @for (season of seasonalRates(); track season._id) {
              <div class="border border-slate-300 rounded-lg p-4 hover:shadow-md transition">
                <div class="flex items-start justify-between mb-4">
                  <div>
                    <h3 class="font-semibold text-slate-900 text-lg">{{ season.seasonName }}</h3>
                    <p class="text-sm text-slate-600">
                      {{ formatDate(season.startDate) }} - {{ formatDate(season.endDate) }}
                    </p>
                  </div>
                  <div class="flex gap-2">
                    <button
                      (click)="editSeason(season)"
                      class="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      Edit
                    </button>
                    <button
                      (click)="deleteSeason(season._id)"
                      class="text-red-600 hover:text-red-700 font-medium text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-sm text-slate-600">Price Multiplier:</span>
                    <span class="font-semibold">{{ season.priceMultiplier }}x</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-slate-600">Status:</span>
                    <span class="px-3 py-1 rounded-full text-xs font-medium"
                      [ngClass]="season.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'"
                    >
                      {{ season.active ? 'Active' : 'Inactive' }}
                    </span>
                  </div>
                </div>
              </div>
            }
          </div>

          @if (seasonalRates().length === 0) {
            <div class="text-center py-8 text-slate-500">
              <p class="text-lg font-semibold">No seasonal rates configured</p>
            </div>
          }
        </div>
      }

      <!-- Discounts Tab -->
      @if (activeTab === 'discounts') {
        <div class="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-slate-900">Length of Stay Discounts</h2>
            <button
              (click)="openDiscountModal()"
              class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-lg transition"
            >
              ➕ Add Discount
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-slate-100 border-b">
                <tr>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Min Nights</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Discount %</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Description</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Active</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                @for (discount of discounts(); track discount._id) {
                  <tr class="hover:bg-slate-50">
                    <td class="px-6 py-4 text-sm font-medium text-slate-900">{{ discount.minNights }} nights</td>
                    <td class="px-6 py-4 text-sm font-semibold text-emerald-600">{{ discount.discountPercent }}%</td>
                    <td class="px-6 py-4 text-sm text-slate-600">{{ discount.description }}</td>
                    <td class="px-6 py-4">
                      <span
                        class="px-3 py-1 rounded-full text-xs font-medium"
                        [ngClass]="discount.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'"
                      >
                        {{ discount.active ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm">
                      <div class="flex gap-2">
                        <button
                          (click)="editDiscount(discount)"
                          class="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          (click)="deleteDiscount(discount._id)"
                          class="text-red-600 hover:text-red-700 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          @if (discounts().length === 0) {
            <div class="text-center py-8 text-slate-500">
              <p class="text-lg font-semibold">No discounts configured</p>
            </div>
          }
        </div>
      }

      <!-- Special Offers Tab -->
      @if (activeTab === 'specials') {
        <div class="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-slate-900">Special Offers</h2>
            <button
              (click)="openSpecialModal()"
              class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-lg transition"
            >
              ➕ Add Special Offer
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            @for (special of specialOffers(); track special._id) {
              <div class="border border-slate-300 rounded-lg p-4 hover:shadow-md transition">
                <div class="flex items-start justify-between mb-4">
                  <div>
                    <h3 class="font-semibold text-slate-900 text-lg">🎉 {{ special.offerName }}</h3>
                    <p class="text-sm text-slate-600">{{ special.description }}</p>
                  </div>
                  <div class="flex gap-2">
                    <button
                      (click)="editSpecial(special)"
                      class="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      Edit
                    </button>
                    <button
                      (click)="deleteSpecial(special._id)"
                      class="text-red-600 hover:text-red-700 font-medium text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-sm text-slate-600">Discount:</span>
                    <span class="font-semibold text-emerald-600">{{ special.discountValue }}{{ special.discountType === 'percentage' ? '%' : '₦' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-slate-600">Valid:</span>
                    <span class="text-sm">{{ formatDate(special.validFrom) }} - {{ formatDate(special.validUntil) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-slate-600">Status:</span>
                    <span class="px-3 py-1 rounded-full text-xs font-medium"
                      [ngClass]="special.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'"
                    >
                      {{ special.active ? 'Active' : 'Inactive' }}
                    </span>
                  </div>
                </div>
              </div>
            }
          </div>

          @if (specialOffers().length === 0) {
            <div class="text-center py-8 text-slate-500">
              <p class="text-lg font-semibold">No special offers configured</p>
            </div>
          }
        </div>
      }

      <!-- Status Messages -->
      @if (successMessage()) {
        <div class="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">✓ {{ successMessage() }}</p>
        </div>
      }
      @if (errorMessage()) {
        <div class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">✗ {{ errorMessage() }}</p>
        </div>
      }

      <!-- Base Rate Modal -->
      @if (showBaseRateModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
            <h2 class="text-2xl font-bold text-slate-900 mb-6">
              {{ editingRateId ? '✏️ Edit Base Rate' : '➕ Add Base Rate' }}
            </h2>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Room Type (required)</label>
                <input
                  type="text"
                  [(ngModel)]="baseRateForm.roomType"
                  placeholder="e.g., Single, Double, Suite"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Base Price (₦) (required)</label>
                <input
                  type="number"
                  [(ngModel)]="baseRateForm.basePrice"
                  placeholder="e.g., 50000"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Minimum Stay (nights)</label>
                <input
                  type="number"
                  [(ngModel)]="baseRateForm.minStay"
                  placeholder="1"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Capacity (guests)</label>
                <input
                  type="number"
                  [(ngModel)]="baseRateForm.capacity"
                  placeholder="2"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div class="flex gap-4 mt-6">
              <button
                (click)="saveBaseRate()"
                class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                {{ editingRateId ? 'Update' : 'Create' }}
              </button>
              <button
                (click)="closeBaseRateModal()"
                class="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold py-2 px-4 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Seasonal Rate Modal -->
      @if (showSeasonalModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl shadow-lg p-8 w-full max-w-md max-h-96 overflow-y-auto">
            <h2 class="text-2xl font-bold text-slate-900 mb-6">
              {{ editingSeasonId ? '✏️ Edit Seasonal Rate' : '➕ Add Seasonal Rate' }}
            </h2>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Season Name (required)</label>
                <input
                  type="text"
                  [(ngModel)]="seasonalForm.seasonName"
                  placeholder="e.g., Peak Season, Holiday"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Start Date (required)</label>
                <input
                  type="date"
                  [(ngModel)]="seasonalForm.startDate"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">End Date (required)</label>
                <input
                  type="date"
                  [(ngModel)]="seasonalForm.endDate"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Price Multiplier (required)</label>
                <input
                  type="number"
                  [(ngModel)]="seasonalForm.priceMultiplier"
                  step="0.1"
                  placeholder="1.5"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div class="flex items-center">
                <input
                  type="checkbox"
                  [(ngModel)]="seasonalForm.active"
                  id="seasonal-active"
                  class="w-4 h-4 text-emerald-600"
                />
                <label for="seasonal-active" class="ml-2 text-sm font-medium text-slate-700">Active</label>
              </div>
            </div>

            <div class="flex gap-4 mt-6">
              <button
                (click)="saveSeason()"
                class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                {{ editingSeasonId ? 'Update' : 'Create' }}
              </button>
              <button
                (click)="closeSeasonalModal()"
                class="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold py-2 px-4 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Discount Modal -->
      @if (showDiscountModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
            <h2 class="text-2xl font-bold text-slate-900 mb-6">
              {{ editingDiscountId ? '✏️ Edit Discount' : '➕ Add Discount' }}
            </h2>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Minimum Nights (required)</label>
                <input
                  type="number"
                  [(ngModel)]="discountForm.minNights"
                  placeholder="7"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Discount % (required)</label>
                <input
                  type="number"
                  [(ngModel)]="discountForm.discountPercent"
                  placeholder="10"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                <input
                  type="text"
                  [(ngModel)]="discountForm.description"
                  placeholder="e.g., 10% off for weekly stays"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div class="flex items-center">
                <input
                  type="checkbox"
                  [(ngModel)]="discountForm.active"
                  id="discount-active"
                  class="w-4 h-4 text-emerald-600"
                />
                <label for="discount-active" class="ml-2 text-sm font-medium text-slate-700">Active</label>
              </div>
            </div>

            <div class="flex gap-4 mt-6">
              <button
                (click)="saveDiscount()"
                class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                {{ editingDiscountId ? 'Update' : 'Create' }}
              </button>
              <button
                (click)="closeDiscountModal()"
                class="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold py-2 px-4 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Special Offer Modal -->
      @if (showSpecialModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl shadow-lg p-8 w-full max-w-md max-h-96 overflow-y-auto">
            <h2 class="text-2xl font-bold text-slate-900 mb-6">
              {{ editingSpecialId ? '✏️ Edit Special Offer' : '➕ Add Special Offer' }}
            </h2>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Offer Name (required)</label>
                <input
                  type="text"
                  [(ngModel)]="specialForm.offerName"
                  placeholder="e.g., Early Bird Discount"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                <textarea
                  [(ngModel)]="specialForm.description"
                  placeholder="Describe your offer"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
                  rows="2"
                ></textarea>
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Discount Value (required)</label>
                <input
                  type="number"
                  [(ngModel)]="specialForm.discountValue"
                  placeholder="5000"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Discount Type</label>
                <select
                  [(ngModel)]="specialForm.discountType"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₦)</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Valid From (required)</label>
                <input
                  type="date"
                  [(ngModel)]="specialForm.validFrom"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Valid Until (required)</label>
                <input
                  type="date"
                  [(ngModel)]="specialForm.validUntil"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div class="flex items-center">
                <input
                  type="checkbox"
                  [(ngModel)]="specialForm.active"
                  id="special-active"
                  class="w-4 h-4 text-emerald-600"
                />
                <label for="special-active" class="ml-2 text-sm font-medium text-slate-700">Active</label>
              </div>
            </div>

            <div class="flex gap-4 mt-6">
              <button
                (click)="saveSpecial()"
                class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                {{ editingSpecialId ? 'Update' : 'Create' }}
              </button>
              <button
                (click)="closeSpecialModal()"
                class="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold py-2 px-4 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: []
})
export class PricingComponent implements OnInit {
  baseRates = signal<any[]>([]);
  seasonalRates = signal<any[]>([]);
  discounts = signal<any[]>([]);
  specialOffers = signal<any[]>([]);

  activeTab = 'base-rates';
  successMessage = signal('');
  errorMessage = signal('');

  // Modals
  showBaseRateModal = signal(false);
  showSeasonalModal = signal(false);
  showDiscountModal = signal(false);
  showSpecialModal = signal(false);

  // Editing flags
  editingRateId = '';
  editingSeasonId = '';
  editingDiscountId = '';
  editingSpecialId = '';

  // Form data
  baseRateForm: any = { roomType: '', basePrice: 0, minStay: 1, capacity: 2 };
  seasonalForm: any = { seasonName: '', startDate: '', endDate: '', priceMultiplier: 1.5, active: true };
  discountForm: any = { minNights: 7, discountPercent: 10, description: '', active: true };
  specialForm: any = { offerName: '', description: '', discountValue: 0, discountType: 'percentage', validFrom: '', validUntil: '', active: true };

  constructor(private hotelService: HotelService) {}

  ngOnInit(): void {
    this.loadPricingData();
  }

  loadPricingData(): void {
    this.hotelService.getPricingRates().subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.baseRates.set(response.data.baseRates || []);
          this.seasonalRates.set(response.data.seasonalRates || []);
          this.discounts.set(response.data.discounts || []);
          this.specialOffers.set(response.data.specialOffers || []);
        }
      },
      error: (error) => console.error('Error loading pricing:', error)
    });
  }

  // ==================== BASE RATES ====================
  openBaseRateModal(): void {
    this.editingRateId = '';
    this.baseRateForm = { roomType: '', basePrice: 0, minStay: 1, capacity: 2 };
    this.showBaseRateModal.set(true);
  }

  editBaseRate(rate: any): void {
    this.editingRateId = rate._id;
    this.baseRateForm = { ...rate };
    this.showBaseRateModal.set(true);
  }

  saveBaseRate(): void {
    if (!this.baseRateForm.roomType || !this.baseRateForm.basePrice) {
      this.errorMessage.set('Room type and base price are required');
      setTimeout(() => this.errorMessage.set(''), 3000);
      return;
    }

    if (this.editingRateId) {
      this.hotelService.updateBaseRate(this.editingRateId, this.baseRateForm).subscribe({
        next: () => {
          this.successMessage.set('Base rate updated successfully');
          setTimeout(() => this.successMessage.set(''), 3000);
          this.loadPricingData();
          this.closeBaseRateModal();
        },
        error: () => {
          this.errorMessage.set('Failed to update base rate');
          setTimeout(() => this.errorMessage.set(''), 3000);
        }
      });
    } else {
      this.hotelService.createBaseRate(this.baseRateForm).subscribe({
        next: () => {
          this.successMessage.set('Base rate created successfully');
          setTimeout(() => this.successMessage.set(''), 3000);
          this.loadPricingData();
          this.closeBaseRateModal();
        },
        error: () => {
          this.errorMessage.set('Failed to create base rate');
          setTimeout(() => this.errorMessage.set(''), 3000);
        }
      });
    }
  }

  deleteBaseRate(rateId: string): void {
    if (!confirm('Delete this base rate?')) return;
    this.hotelService.deleteRate(rateId).subscribe({
      next: () => {
        this.successMessage.set('Base rate deleted successfully');
        setTimeout(() => this.successMessage.set(''), 3000);
        this.loadPricingData();
      },
      error: () => {
        this.errorMessage.set('Failed to delete base rate');
        setTimeout(() => this.errorMessage.set(''), 3000);
      }
    });
  }

  closeBaseRateModal(): void {
    this.showBaseRateModal.set(false);
    this.editingRateId = '';
    this.baseRateForm = { roomType: '', basePrice: 0, minStay: 1, capacity: 2 };
  }

  // ==================== SEASONAL RATES ====================
  openSeasonalModal(): void {
    this.editingSeasonId = '';
    this.seasonalForm = { seasonName: '', startDate: '', endDate: '', priceMultiplier: 1.5, active: true };
    this.showSeasonalModal.set(true);
  }

  editSeason(season: any): void {
    this.editingSeasonId = season._id;
    this.seasonalForm = { ...season };
    this.showSeasonalModal.set(true);
  }

  saveSeason(): void {
    if (!this.seasonalForm.seasonName || !this.seasonalForm.startDate || !this.seasonalForm.endDate || !this.seasonalForm.priceMultiplier) {
      this.errorMessage.set('All fields are required');
      setTimeout(() => this.errorMessage.set(''), 3000);
      return;
    }

    if (this.editingSeasonId) {
      this.hotelService.updateSeasonalRate(this.editingSeasonId, this.seasonalForm).subscribe({
        next: () => {
          this.successMessage.set('Seasonal rate updated successfully');
          setTimeout(() => this.successMessage.set(''), 3000);
          this.loadPricingData();
          this.closeSeasonalModal();
        },
        error: () => {
          this.errorMessage.set('Failed to update seasonal rate');
          setTimeout(() => this.errorMessage.set(''), 3000);
        }
      });
    } else {
      this.hotelService.createSeasonalRate(this.seasonalForm).subscribe({
        next: () => {
          this.successMessage.set('Seasonal rate created successfully');
          setTimeout(() => this.successMessage.set(''), 3000);
          this.loadPricingData();
          this.closeSeasonalModal();
        },
        error: () => {
          this.errorMessage.set('Failed to create seasonal rate');
          setTimeout(() => this.errorMessage.set(''), 3000);
        }
      });
    }
  }

  deleteSeason(seasonId: string): void {
    if (!confirm('Delete this seasonal rate?')) return;
    this.hotelService.deleteSeason(seasonId).subscribe({
      next: () => {
        this.successMessage.set('Seasonal rate deleted successfully');
        setTimeout(() => this.successMessage.set(''), 3000);
        this.loadPricingData();
      },
      error: () => {
        this.errorMessage.set('Failed to delete seasonal rate');
        setTimeout(() => this.errorMessage.set(''), 3000);
      }
    });
  }

  closeSeasonalModal(): void {
    this.showSeasonalModal.set(false);
    this.editingSeasonId = '';
    this.seasonalForm = { seasonName: '', startDate: '', endDate: '', priceMultiplier: 1.5, active: true };
  }

  // ==================== DISCOUNTS ====================
  openDiscountModal(): void {
    this.editingDiscountId = '';
    this.discountForm = { minNights: 7, discountPercent: 10, description: '', active: true };
    this.showDiscountModal.set(true);
  }

  editDiscount(discount: any): void {
    this.editingDiscountId = discount._id;
    this.discountForm = { ...discount };
    this.showDiscountModal.set(true);
  }

  saveDiscount(): void {
    if (!this.discountForm.minNights || !this.discountForm.discountPercent) {
      this.errorMessage.set('Minimum nights and discount percentage are required');
      setTimeout(() => this.errorMessage.set(''), 3000);
      return;
    }

    if (this.editingDiscountId) {
      this.hotelService.updateDiscount(this.editingDiscountId, this.discountForm).subscribe({
        next: () => {
          this.successMessage.set('Discount updated successfully');
          setTimeout(() => this.successMessage.set(''), 3000);
          this.loadPricingData();
          this.closeDiscountModal();
        },
        error: () => {
          this.errorMessage.set('Failed to update discount');
          setTimeout(() => this.errorMessage.set(''), 3000);
        }
      });
    } else {
      this.hotelService.createDiscount(this.discountForm).subscribe({
        next: () => {
          this.successMessage.set('Discount created successfully');
          setTimeout(() => this.successMessage.set(''), 3000);
          this.loadPricingData();
          this.closeDiscountModal();
        },
        error: () => {
          this.errorMessage.set('Failed to create discount');
          setTimeout(() => this.errorMessage.set(''), 3000);
        }
      });
    }
  }

  deleteDiscount(discountId: string): void {
    if (!confirm('Delete this discount?')) return;
    this.hotelService.deleteDiscount(discountId).subscribe({
      next: () => {
        this.successMessage.set('Discount deleted successfully');
        setTimeout(() => this.successMessage.set(''), 3000);
        this.loadPricingData();
      },
      error: () => {
        this.errorMessage.set('Failed to delete discount');
        setTimeout(() => this.errorMessage.set(''), 3000);
      }
    });
  }

  closeDiscountModal(): void {
    this.showDiscountModal.set(false);
    this.editingDiscountId = '';
    this.discountForm = { minNights: 7, discountPercent: 10, description: '', active: true };
  }

  // ==================== SPECIAL OFFERS ====================
  openSpecialModal(): void {
    this.editingSpecialId = '';
    this.specialForm = { offerName: '', description: '', discountValue: 0, discountType: 'percentage', validFrom: '', validUntil: '', active: true };
    this.showSpecialModal.set(true);
  }

  editSpecial(special: any): void {
    this.editingSpecialId = special._id;
    this.specialForm = { ...special };
    this.showSpecialModal.set(true);
  }

  saveSpecial(): void {
    if (!this.specialForm.offerName || !this.specialForm.discountValue || !this.specialForm.validFrom || !this.specialForm.validUntil) {
      this.errorMessage.set('Offer name, discount value, and dates are required');
      setTimeout(() => this.errorMessage.set(''), 3000);
      return;
    }

    if (this.editingSpecialId) {
      this.hotelService.updateSpecialOffer(this.editingSpecialId, this.specialForm).subscribe({
        next: () => {
          this.successMessage.set('Special offer updated successfully');
          setTimeout(() => this.successMessage.set(''), 3000);
          this.loadPricingData();
          this.closeSpecialModal();
        },
        error: () => {
          this.errorMessage.set('Failed to update special offer');
          setTimeout(() => this.errorMessage.set(''), 3000);
        }
      });
    } else {
      this.hotelService.createSpecialOffer(this.specialForm).subscribe({
        next: () => {
          this.successMessage.set('Special offer created successfully');
          setTimeout(() => this.successMessage.set(''), 3000);
          this.loadPricingData();
          this.closeSpecialModal();
        },
        error: () => {
          this.errorMessage.set('Failed to create special offer');
          setTimeout(() => this.errorMessage.set(''), 3000);
        }
      });
    }
  }

  deleteSpecial(specialId: string): void {
    if (!confirm('Delete this special offer?')) return;
    this.hotelService.deleteSpecial(specialId).subscribe({
      next: () => {
        this.successMessage.set('Special offer deleted successfully');
        setTimeout(() => this.successMessage.set(''), 3000);
        this.loadPricingData();
      },
      error: () => {
        this.errorMessage.set('Failed to delete special offer');
        setTimeout(() => this.errorMessage.set(''), 3000);
      }
    });
  }

  closeSpecialModal(): void {
    this.showSpecialModal.set(false);
    this.editingSpecialId = '';
    this.specialForm = { offerName: '', description: '', discountValue: 0, discountType: 'percentage', validFrom: '', validUntil: '', active: true };
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
