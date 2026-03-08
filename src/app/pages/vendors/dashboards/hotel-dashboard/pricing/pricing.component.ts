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
              (click)="showAddRateModal()"
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
                            (click)="editRate(rate)"
                            class="text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            (click)="deleteRate(rate._id)"
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
              (click)="showAddSeasonalModal()"
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
              (click)="showAddDiscountModal()"
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
              (click)="showAddSpecialModal()"
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

  // Base Rates Methods
  showAddRateModal(): void {
    // In a real implementation, show a modal form
    alert('Add base rate form would appear here');
  }

  editRate(rate: any): void {
    alert(`Edit rate: ${rate.roomType}`);
  }

  deleteRate(rateId: string): void {
    if (confirm('Delete this base rate?')) {
      this.hotelService.deleteRate(rateId).subscribe({
        next: () => {
          this.successMessage.set('Base rate deleted');
          setTimeout(() => this.successMessage.set(''), 3000);
          this.loadPricingData();
        },
        error: () => this.errorMessage.set('Failed to delete rate')
      });
    }
  }

  // Seasonal Rates Methods
  showAddSeasonalModal(): void {
    alert('Add seasonal rate form would appear here');
  }

  editSeason(season: any): void {
    alert(`Edit season: ${season.seasonName}`);
  }

  deleteSeason(seasonId: string): void {
    if (confirm('Delete this seasonal rate?')) {
      this.hotelService.deleteSeason(seasonId).subscribe({
        next: () => {
          this.successMessage.set('Seasonal rate deleted');
          setTimeout(() => this.successMessage.set(''), 3000);
          this.loadPricingData();
        },
        error: () => this.errorMessage.set('Failed to delete season')
      });
    }
  }

  // Discounts Methods
  showAddDiscountModal(): void {
    alert('Add discount form would appear here');
  }

  editDiscount(discount: any): void {
    alert(`Edit discount: ${discount.minNights} nights`);
  }

  deleteDiscount(discountId: string): void {
    if (confirm('Delete this discount?')) {
      this.hotelService.deleteDiscount(discountId).subscribe({
        next: () => {
          this.successMessage.set('Discount deleted');
          setTimeout(() => this.successMessage.set(''), 3000);
          this.loadPricingData();
        },
        error: () => this.errorMessage.set('Failed to delete discount')
      });
    }
  }

  // Special Offers Methods
  showAddSpecialModal(): void {
    alert('Add special offer form would appear here');
  }

  editSpecial(special: any): void {
    alert(`Edit offer: ${special.offerName}`);
  }

  deleteSpecial(specialId: string): void {
    if (confirm('Delete this special offer?')) {
      this.hotelService.deleteSpecial(specialId).subscribe({
        next: () => {
          this.successMessage.set('Special offer deleted');
          setTimeout(() => this.successMessage.set(''), 3000);
          this.loadPricingData();
        },
        error: () => this.errorMessage.set('Failed to delete offer')
      });
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
