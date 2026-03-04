import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface DeliveryPartner {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  isVerified: boolean;
  activeProviders: number;
  logo?: string;
}

interface DeliveryZone {
  _id: string;
  name: string;
  location: {
    city: string;
    state?: string;
    country: string;
  };
  category: string;
  basePricing: {
    basePrice: { value: number; currency: string };
    minPrice?: number;
  };
  distancePricing?: {
    enabled?: boolean;
    pricePerKm?: { value: number; currency?: string };
  };
  isActive: boolean;
  availableDeliveryPartners: string[];
}

interface ZoneTemplate extends DeliveryZone {
  description?: string;
  isEnabled?: boolean;
  partnersCount?: number;
  serviceOptions?: any[];
  deliveryTimeEstimates?: any;
  preferredPartner?: any;
}

@Component({
  selector: 'app-admin-delivery',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-lg shadow-lg">
        <div class="flex items-center gap-4 mb-2">
          <div class="text-4xl">🚚</div>
          <div>
            <h2 class="text-3xl font-bold">Delivery Management</h2>
            <p class="text-green-100 text-sm">Manage delivery partners and zones</p>
          </div>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="flex gap-2 border-b border-gray-200">
        <button
          (click)="setActiveTab('presets')"
          [class]="
            'px-6 py-3 font-semibold transition border-b-2 ' +
            (activeTab() === 'presets'
              ? 'text-green-600 border-green-600'
              : 'text-gray-600 border-transparent hover:text-gray-800')
          "
        >
          ⚡ Quick Setup
        </button>
        <button
          (click)="setActiveTab('partners')"
          [class]="
            'px-6 py-3 font-semibold transition border-b-2 ' +
            (activeTab() === 'partners'
              ? 'text-green-600 border-green-600'
              : 'text-gray-600 border-transparent hover:text-gray-800')
          "
        >
          🤝 Delivery Partners
        </button>
        <button
          (click)="setActiveTab('zones')"
          [class]="
            'px-6 py-3 font-semibold transition border-b-2 ' +
            (activeTab() === 'zones'
              ? 'text-green-600 border-green-600'
              : 'text-gray-600 border-transparent hover:text-gray-800')
          "
        >
          📍 Delivery Zones
        </button>
      </div>

      <!-- QUICK SETUP PRESETS SECTION -->
      @if (activeTab() === 'presets') {
        <div class="space-y-6">
          <!-- Info Box -->
          <div class="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
            <h3 class="text-lg font-semibold text-blue-900 mb-2">⚡ Quick Setup with Presets</h3>
            <p class="text-blue-800 text-sm">Enable pre-configured delivery zones instead of filling forms from scratch. All zones come with optimized pricing, service options, and verified delivery partners.</p>
          </div>

          <!-- Loading State -->
          @if (loadingPresets()) {
            <div class="flex justify-center py-12">
              <div class="text-center">
                <div class="inline-block animate-spin text-green-600 mb-3">⏳</div>
                <p class="text-gray-600">Loading preset zones...</p>
              </div>
            </div>
          } @else {
            <!-- Presets Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              @for (preset of defaultZones(); track preset._id) {
                <div
                  [class]="
                    'border-2 rounded-lg p-5 transition cursor-pointer hover:shadow-lg ' +
                    (enabledZoneNames().has(preset.name)
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-green-300')
                  "
                >
                  <!-- Header -->
                  <div class="flex justify-between items-start mb-3">
                    <div>
                      <h4 class="text-lg font-bold text-gray-900">{{ preset.name }}</h4>
                      <p class="text-xs text-gray-600 mt-1">
                        <span
                          [class]="
                            'inline-block px-2 py-1 rounded text-xs font-semibold ' +
                            (preset.category === 'urban'
                              ? 'bg-blue-100 text-blue-800'
                              : preset.category === 'suburban'
                                ? 'bg-purple-100 text-purple-800'
                                : preset.category === 'rural'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-orange-100 text-orange-800')
                          "
                        >
                          {{ preset.category }}
                        </span>
                      </p>
                    </div>
                    @if (enabledZoneNames().has(preset.name)) {
                      <span class="text-2xl">✅</span>
                    } @else {
                      <span class="text-2xl">📌</span>
                    }
                  </div>

                  <!-- Description -->
                  <p class="text-sm text-gray-600 mb-4">{{ preset.description }}</p>

                  <!-- Pricing Cards -->
                  <div class="space-y-2 mb-4">
                    <div class="bg-gray-50 p-2 rounded text-sm">
                      <span class="text-gray-600">Base Price:</span>
                      <span class="font-bold text-green-700 ml-2">
                        {{ '$' + preset.basePricing.basePrice.value }}
                      </span>
                    </div>
                    <div class="bg-gray-50 p-2 rounded text-sm">
                      <span class="text-gray-600">Distance Rate:</span>
                      <span class="font-bold text-blue-700 ml-2">
                        {{ '$' + (preset.distancePricing?.pricePerKm?.value || 0) + '/km' }}
                      </span>
                    </div>
                    <div class="bg-gray-50 p-2 rounded text-sm">
                      <span class="text-gray-600">Partners:</span>
                      <span class="font-bold text-purple-700 ml-2">
                        {{ preset.partnersCount || 0 }}
                      </span>
                    </div>
                  </div>

                  <!-- Service Options -->
                  @if (preset.serviceOptions && preset.serviceOptions.length > 0) {
                    <div class="mb-4 text-xs">
                      <span class="text-gray-600 font-semibold block mb-2">Service Options:</span>
                      <div class="flex flex-wrap gap-1">
                        @for (option of preset.serviceOptions; track option.name) {
                          <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {{ option.name }}
                          </span>
                        }
                      </div>
                    </div>
                  }

                  <!-- Enable Button -->
                  <button
                    (click)="enableZonePreset(preset)"
                    [disabled]="enabledZoneNames().has(preset.name)"
                    [class]="
                      'w-full py-2 rounded-lg font-semibold transition ' +
                      (enabledZoneNames().has(preset.name)
                        ? 'bg-green-200 text-green-800 cursor-default'
                        : 'bg-green-600 hover:bg-green-700 text-white')
                    "
                  >
                    @if (enabledZoneNames().has(preset.name)) {
                      ✅ Enabled
                    } @else {
                      ➕ Enable Zone
                    }
                  </button>
                </div>
              }
            </div>

            <!-- No Presets Message -->
            @if (defaultZones().length === 0) {
              <div class="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded">
                <p class="text-yellow-800">No preset zones available. Please check your database or create zones manually.</p>
              </div>
            }
          }
        </div>
      }

      <!-- DELIVERY PARTNERS SECTION -->
      @if (activeTab() === 'partners') {
        <div class="space-y-6">
          <!-- Add Partner Button -->
          <div class="flex justify-end">
            <button
              (click)="toggleAddPartnerForm()"
              class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition"
            >
              ➕ Add Delivery Partner
            </button>
          </div>

          <!-- Add Partner Form -->
          @if (showAddPartnerForm()) {
            <div class="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-600">
              <h3 class="text-xl font-bold mb-4">Add New Delivery Partner</h3>
              <form (ngSubmit)="submitAddPartner()" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold mb-2">Partner Name *</label>
                    <input
                      [(ngModel)]="newPartner.name"
                      name="name"
                      type="text"
                      placeholder="e.g., FastDeli Express"
                      class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-green-600"
                      required
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold mb-2">Email *</label>
                    <input
                      [(ngModel)]="newPartner.email"
                      name="email"
                      type="email"
                      placeholder="contact@delivery.com"
                      class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-green-600"
                      required
                    />
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold mb-2">Phone *</label>
                    <input
                      [(ngModel)]="newPartner.phone"
                      name="phone"
                      type="tel"
                      placeholder="+1234567890"
                      class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-green-600"
                      required
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold mb-2">Description</label>
                    <input
                      [(ngModel)]="newPartner.description"
                      name="description"
                      type="text"
                      placeholder="Service description"
                      class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-green-600"
                    />
                  </div>
                </div>
                <div class="flex gap-2 justify-end">
                  <button
                    type="button"
                    (click)="toggleAddPartnerForm()"
                    class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
                  >
                    Save Partner
                  </button>
                </div>
              </form>
            </div>
          }

          <!-- Partners List -->
          <div class="bg-white rounded-lg shadow-lg overflow-hidden">
            @if (partners().length === 0) {
              <div class="p-8 text-center text-gray-500">
                <p class="text-lg">No delivery partners yet</p>
                <p class="text-sm">Add your first delivery partner using the button above</p>
              </div>
            } @else {
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                      <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                      <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                      <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Verified</th>
                      <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Active Providers</th>
                      <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (partner of partners(); track partner._id) {
                      <tr class="border-b border-gray-200 hover:bg-gray-50 transition">
                        <td class="px-6 py-4 font-medium text-gray-900">{{ partner.name }}</td>
                        <td class="px-6 py-4 text-gray-700">{{ partner.email }}</td>
                        <td class="px-6 py-4 text-gray-700">{{ partner.phone }}</td>
                        <td class="px-6 py-4">
                          <span
                            [class]="
                              'px-3 py-1 rounded-full text-xs font-semibold ' +
                              (partner.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : partner.status === 'pending-verification'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800')"
                          >
                            {{ partner.status }}
                          </span>
                        </td>
                        <td class="px-6 py-4">
                          {{ partner.isVerified ? '✅ Verified' : '⏳ Pending' }}
                        </td>
                        <td class="px-6 py-4 text-center">
                          <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                            {{ partner.activeProviders }}
                          </span>
                        </td>
                        <td class="px-6 py-4">
                          @if (!partner.isVerified) {
                            <button
                              (click)="verifyPartner(partner._id)"
                              class="text-green-600 hover:text-green-800 font-semibold text-sm transition"
                            >
                              ✓ Verify
                            </button>
                          } @else {
                            <button
                              (click)="editPartner(partner._id)"
                              class="text-blue-600 hover:text-blue-800 font-semibold text-sm transition"
                            >
                              Edit
                            </button>
                          }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        </div>
      }

      <!-- DELIVERY ZONES SECTION -->
      @if (activeTab() === 'zones') {
        <div class="space-y-6">
          <!-- Add Zone Button -->
          <div class="flex justify-end">
            <button
              (click)="toggleAddZoneForm()"
              class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition"
            >
              ➕ Add Delivery Zone
            </button>
          </div>

          <!-- Add Zone Form -->
          @if (showAddZoneForm()) {
            <div class="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-600">
              <h3 class="text-xl font-bold mb-4">Add New Delivery Zone</h3>
              <form (ngSubmit)="submitAddZone()" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold mb-2">Zone Name *</label>
                    <input
                      [(ngModel)]="newZone.name"
                      name="name"
                      type="text"
                      placeholder="e.g., Downtown New York"
                      class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-green-600"
                      required
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold mb-2">Category *</label>
                    <select
                      [(ngModel)]="newZone.category"
                      name="category"
                      class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-green-600"
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="urban">Urban</option>
                      <option value="suburban">Suburban</option>
                      <option value="rural">Rural</option>
                      <option value="commercial">Commercial</option>
                    </select>
                  </div>
                </div>

                <div class="grid grid-cols-3 gap-4">
                  <div>
                    <label class="block text-sm font-semibold mb-2">City *</label>
                    <input
                      [(ngModel)]="newZone.location.city"
                      name="city"
                      type="text"
                      placeholder="e.g., New York"
                      class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-green-600"
                      required
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold mb-2">State</label>
                    <input
                      [(ngModel)]="newZone.location.state"
                      name="state"
                      type="text"
                      placeholder="e.g., NY"
                      class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-green-600"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold mb-2">Country *</label>
                    <input
                      [(ngModel)]="newZone.location.country"
                      name="country"
                      type="text"
                      placeholder="e.g., USA"
                      class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-green-600"
                      required
                    />
                  </div>
                </div>

                <div class="grid grid-cols-3 gap-4">
                  <div>
                    <label class="block text-sm font-semibold mb-2">Base Price ($) *</label>
                    <input
                      [(ngModel)]="newZone.basePricing.basePrice.value"
                      name="basePrice"
                      type="number"
                      step="0.01"
                      placeholder="5.00"
                      class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-green-600"
                      required
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold mb-2">Min Price ($)</label>
                    <input
                      [(ngModel)]="newZone.basePricing.minPrice"
                      name="minPrice"
                      type="number"
                      step="0.01"
                      placeholder="3.00"
                      class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-green-600"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold mb-2">Distance/Km ($)</label>
                    <input
                      [(ngModel)]="newZone.distancePricing.pricePerKm.value"
                      name="pricePerKm"
                      type="number"
                      step="0.01"
                      placeholder="0.50"
                      class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-green-600"
                    />
                  </div>
                </div>

                <div class="flex gap-2 justify-end">
                  <button
                    type="button"
                    (click)="toggleAddZoneForm()"
                    class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
                  >
                    Save Zone
                  </button>
                </div>
              </form>
            </div>
          }

          <!-- Zones List -->
          <div class="bg-white rounded-lg shadow-lg overflow-hidden">
            @if (zones().length === 0) {
              <div class="p-8 text-center text-gray-500">
                <p class="text-lg">No delivery zones yet</p>
                <p class="text-sm">Add your first delivery zone using the button above or enable presets from the Quick Setup tab</p>
              </div>
            } @else {
              <div class="grid gap-4 p-6">
                @for (zone of zones(); track zone._id) {
                  <div class="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
                    <div class="flex justify-between items-start mb-3">
                      <div>
                        <h4 class="text-lg font-bold text-gray-900">
                          {{ zone.name }}
                          @if (isPresetZone(zone.name)) {
                            <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded ml-2">📌 Preset</span>
                          }
                        </h4>
                        <p class="text-sm text-gray-600">
                          📍 {{ zone.location.city }}, {{ zone.location.state }}, {{ zone.location.country }}
                        </p>
                      </div>
                      <span
                        [class]="
                          'px-3 py-1 rounded-full text-xs font-semibold ' +
                          (zone.category === 'urban'
                            ? 'bg-blue-100 text-blue-800'
                            : zone.category === 'suburban'
                              ? 'bg-purple-100 text-purple-800'
                              : zone.category === 'rural'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-orange-100 text-orange-800')"
                      >
                        {{ zone.category }}
                      </span>
                    </div>
                    <div class="grid grid-cols-3 gap-4 mb-3">
                      <div class="bg-green-50 p-3 rounded">
                        <p class="text-xs text-gray-600">Base Price</p>
                        <p class="text-xl font-bold text-green-700">
                          {{ '$' + zone.basePricing.basePrice.value }}
                        </p>
                      </div>
                      <div class="bg-blue-50 p-3 rounded">
                        <p class="text-xs text-gray-600">Min Price</p>
                        <p class="text-xl font-bold text-blue-700">
                          {{ zone.basePricing.minPrice ? ('$' + zone.basePricing.minPrice) : 'N/A' }}
                        </p>
                      </div>
                      <div class="bg-purple-50 p-3 rounded">
                        <p class="text-xs text-gray-600">Per Km</p>
                        <p class="text-xl font-bold text-purple-700">
                          {{ zone.distancePricing?.pricePerKm?.value ? ('$' + (zone.distancePricing?.pricePerKm?.value || 0) + '/km') : 'N/A' }}
                        </p>
                      </div>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-sm text-gray-600">
                        {{ zone.availableDeliveryPartners.length || 0 }} delivery partners available
                      </span>
                      <button
                        (click)="editZone(zone._id)"
                        class="text-blue-600 hover:text-blue-800 font-semibold text-sm transition"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: []
})
export class AdminDeliveryComponent implements OnInit {
  activeTab = signal<'presets' | 'partners' | 'zones'>('presets');
  showAddPartnerForm = signal(false);
  showAddZoneForm = signal(false);
  loadingPresets = signal(false);

  partners = signal<DeliveryPartner[]>([]);
  zones = signal<DeliveryZone[]>([]);
  defaultZones = signal<ZoneTemplate[]>([]);
  enabledZoneNames = signal<Set<string>>(new Set());

  newPartner = {
    name: '',
    email: '',
    phone: '',
    description: ''
  };

  newZone = {
    name: '',
    category: '',
    location: {
      city: '',
      state: '',
      country: ''
    },
    basePricing: {
      basePrice: { value: 5, currency: 'USD' },
      minPrice: 3
    },
    distancePricing: {
      enabled: true,
      pricePerKm: { value: 0.5, currency: 'USD' }
    }
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDeliveryPartners();
    this.loadDeliveryZones();
    this.loadDefaultZoneTemplates();
  }

  setActiveTab(tab: 'presets' | 'partners' | 'zones'): void {
    this.activeTab.set(tab);
  }

  toggleAddPartnerForm(): void {
    this.showAddPartnerForm.update((val) => !val);
    if (!this.showAddPartnerForm()) {
      this.resetPartnerForm();
    }
  }

  toggleAddZoneForm(): void {
    this.showAddZoneForm.update((val) => !val);
    if (!this.showAddZoneForm()) {
      this.resetZoneForm();
    }
  }

  loadDeliveryPartners(): void {
    this.http.get<{ success: boolean; data: DeliveryPartner[] }>('/api/delivery-admin/partners').subscribe({
      next: (response) => {
        if (response.success) {
          this.partners.set(response.data);
        }
      },
      error: (err) => {
        console.error('Error loading delivery partners:', err);
      }
    });
  }

  loadDeliveryZones(): void {
    this.http.get<{ success: boolean; data: DeliveryZone[] }>('/api/delivery-admin/zones').subscribe({
      next: (response) => {
        if (response.success) {
          this.zones.set(response.data);
          // Update enabled zone names
          const enabledNames = new Set(response.data.map(z => z.name));
          this.enabledZoneNames.set(enabledNames);
        }
      },
      error: (err) => {
        console.error('Error loading delivery zones:', err);
      }
    });
  }

  loadDefaultZoneTemplates(): void {
    this.loadingPresets.set(true);
    this.http.get<{ success: boolean; data: ZoneTemplate[] }>('/api/delivery-admin/zones/templates/defaults').subscribe({
      next: (response) => {
        if (response.success) {
          this.defaultZones.set(response.data);
        }
        this.loadingPresets.set(false);
      },
      error: (err) => {
        console.error('Error loading default zone templates:', err);
        this.loadingPresets.set(false);
      }
    });
  }

  enableZonePreset(preset: ZoneTemplate): void {
    if (this.enabledZoneNames().has(preset.name)) {
      return; // Already enabled
    }

    this.http.post<{ success: boolean; data: DeliveryZone }>('/api/delivery-admin/zones/templates/enable', {
      templateId: preset._id
    }).subscribe({
      next: (response) => {
        if (response.success) {
          // Add to zones list
          this.zones.update((zones) => [...zones, response.data]);
          // Mark as enabled
          this.enabledZoneNames.update((names) => {
            names.add(preset.name);
            return new Set(names);
          });
          alert(`✅ ${preset.name} zone enabled successfully!`);
        }
      },
      error: (err) => {
        console.error('Error enabling zone preset:', err);
        alert('❌ Error enabling zone preset');
      }
    });
  }

  isPresetZone(zoneName: string): boolean {
    return this.defaultZones().some(z => z.name === zoneName);
  }

  submitAddPartner(): void {
    if (!this.newPartner.name || !this.newPartner.email || !this.newPartner.phone) {
      alert('Please fill in all required fields');
      return;
    }

    this.http.post<{ success: boolean; data: DeliveryPartner }>('/api/delivery-admin/partners', this.newPartner).subscribe({
      next: (response) => {
        if (response.success) {
          this.partners.update((partners) => [...partners, response.data]);
          this.toggleAddPartnerForm();
          alert('✅ Delivery partner added successfully');
        }
      },
      error: (err) => {
        console.error('Error adding partner:', err);
        alert('❌ Error adding delivery partner');
      }
    });
  }

  submitAddZone(): void {
    if (!this.newZone.name || !this.newZone.category || !this.newZone.location.city || !this.newZone.location.country) {
      alert('Please fill in all required fields');
      return;
    }

    this.http.post<{ success: boolean; data: DeliveryZone }>('/api/delivery-admin/zones', this.newZone).subscribe({
      next: (response) => {
        if (response.success) {
          this.zones.update((zones) => [...zones, response.data]);
          this.toggleAddZoneForm();
          alert('✅ Delivery zone added successfully');
        }
      },
      error: (err) => {
        console.error('Error adding zone:', err);
        alert('❌ Error adding delivery zone');
      }
    });
  }

  verifyPartner(partnerId: string): void {
    this.http.patch<{ success: boolean; data: DeliveryPartner }>(`/api/delivery-admin/partners/${partnerId}/verify`, { verified: true }).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadDeliveryPartners();
          alert('✅ Delivery partner verified successfully');
        }
      },
      error: (err) => {
        console.error('Error verifying partner:', err);
        alert('❌ Error verifying delivery partner');
      }
    });
  }

  editPartner(partnerId: string): void {
    console.log('Edit partner:', partnerId);
    alert('Edit functionality coming soon');
  }

  editZone(zoneId: string): void {
    console.log('Edit zone:', zoneId);
    alert('Edit functionality coming soon');
  }

  resetPartnerForm(): void {
    this.newPartner = {
      name: '',
      email: '',
      phone: '',
      description: ''
    };
  }

  resetZoneForm(): void {
    this.newZone = {
      name: '',
      category: '',
      location: {
        city: '',
        state: '',
        country: ''
      },
      basePricing: {
        basePrice: { value: 5, currency: 'USD' },
        minPrice: 3
      },
      distancePricing: {
        enabled: true,
        pricePerKm: { value: 0.5, currency: 'USD' }
      }
    };
  }
}
