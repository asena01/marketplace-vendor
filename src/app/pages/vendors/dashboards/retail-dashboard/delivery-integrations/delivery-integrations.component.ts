import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ExternalDeliveryService, ExternalDeliveryProvider, BusinessDeliveryIntegration } from '../../../../../services/external-delivery.service';

@Component({
  selector: 'app-retail-delivery-integrations',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="p-8 space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold text-slate-900">Delivery Integrations</h1>
        <p class="text-slate-600 mt-1">Integrate with delivery services to offer shipping options to customers</p>
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 border-b border-slate-200">
        <button
          (click)="currentTab = 'browse'"
          [ngClass]="{'border-b-2 border-blue-600 text-blue-600 font-semibold': currentTab === 'browse'}"
          class="px-4 py-3 text-slate-600 hover:text-slate-900 transition flex items-center gap-2"
        >
          <mat-icon class="text-lg">search</mat-icon>
          <span>Browse Services</span>
        </button>
        <button
          (click)="currentTab = 'integrated'"
          [ngClass]="{'border-b-2 border-blue-600 text-blue-600 font-semibold': currentTab === 'integrated'}"
          class="px-4 py-3 text-slate-600 hover:text-slate-900 transition flex items-center gap-2"
        >
          <mat-icon class="text-lg">check_circle</mat-icon>
          <span>My Integrations ({{ integratedServices().length }})</span>
        </button>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="bg-blue-50 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg">
          <p class="font-semibold flex items-center gap-2">
            <mat-icon class="text-lg animate-spin">refresh</mat-icon>
            Loading...
          </p>
        </div>
      }

      <!-- Browse Services Tab -->
      @if (currentTab === 'browse') {
        <div class="space-y-6">
          <!-- Search & Filters -->
          <div class="bg-white rounded-lg p-6 shadow-md">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Search</label>
                <input
                  type="text"
                  [(ngModel)]="searchQuery"
                  (keyup.enter)="searchProviders()"
                  placeholder="Search providers..."
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">City</label>
                <input
                  type="text"
                  [(ngModel)]="selectedCity"
                  (ngModelChange)="loadProviders()"
                  placeholder="Filter by city..."
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Category</label>
                <input
                  type="text"
                  [(ngModel)]="selectedCategory"
                  (ngModelChange)="loadProviders()"
                  placeholder="Filter by category..."
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <!-- Providers Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @if (availableProviders().length === 0) {
              <div class="col-span-full text-center py-12">
                <mat-icon class="text-slate-300 text-5xl">local_shipping</mat-icon>
                <p class="text-slate-600 mt-4">No delivery services available</p>
              </div>
            } @else {
              @for (provider of availableProviders(); track provider.id) {
                <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition border-l-4 border-blue-500">
                  <div class="p-6">
                    <!-- Provider Header -->
                    <div class="flex justify-between items-start mb-4">
                      <div>
                        <h3 class="text-lg font-bold text-slate-900">{{ provider.name }}</h3>
                        <p class="text-sm text-slate-600 mt-1">{{ provider.description }}</p>
                      </div>
                      <div class="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                        <mat-icon class="text-xs text-yellow-600">star</mat-icon>
                        <span class="text-sm font-semibold text-slate-900">{{ provider.rating }}</span>
                      </div>
                    </div>

                    <!-- Features -->
                    <div class="space-y-2 mb-4 text-sm">
                      @if (provider.features.realTimeTracking) {
                        <div class="flex items-center gap-2 text-slate-600">
                          <mat-icon class="text-sm text-green-600">check</mat-icon>
                          <span>Real-time Tracking</span>
                        </div>
                      }
                      @if (provider.features.insurance) {
                        <div class="flex items-center gap-2 text-slate-600">
                          <mat-icon class="text-sm text-green-600">check</mat-icon>
                          <span>Insurance Included</span>
                        </div>
                      }
                      @if (provider.features.temperature_control) {
                        <div class="flex items-center gap-2 text-slate-600">
                          <mat-icon class="text-sm text-green-600">check</mat-icon>
                          <span>Temperature Control</span>
                        </div>
                      }
                    </div>

                    <!-- Pricing -->
                    <div class="border-t border-slate-200 pt-4 mb-4">
                      <p class="text-sm text-slate-600">Base Rate</p>
                      <p class="text-xl font-bold text-slate-900"><span>$</span>{{ formatPrice(provider.basePrice) }}</p>
                    </div>

                    <!-- Action Button -->
                    @if (isServiceIntegrated(provider.id)) {
                      <button
                        disabled
                        class="w-full bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 cursor-default"
                      >
                        <mat-icon class="text-lg">check_circle</mat-icon>
                        <span>Integrated</span>
                      </button>
                    } @else {
                      <button
                        (click)="integrateService(provider)"
                        [disabled]="isIntegrating()"
                        class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
                      >
                        <mat-icon class="text-lg">add</mat-icon>
                        <span>{{ isIntegrating() ? 'Integrating...' : 'Integrate' }}</span>
                      </button>
                    }
                  </div>
                </div>
              }
            }
          </div>
        </div>
      }

      <!-- My Integrations Tab -->
      @if (currentTab === 'integrated') {
        <div class="space-y-4">
          @if (integratedServices().length === 0) {
            <div class="bg-blue-50 border border-blue-300 rounded-lg p-8 text-center">
              <mat-icon class="text-blue-600 text-5xl">info</mat-icon>
              <p class="text-slate-900 font-semibold mt-3">No integrated services yet</p>
              <p class="text-slate-600 text-sm mt-1">Browse available delivery services and integrate one</p>
            </div>
          } @else {
            @for (service of integratedServices(); track service.id) {
              <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-green-500">
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <h3 class="text-lg font-bold text-slate-900">{{ service.provider.name }}</h3>
                    <p
                      [ngClass]="{
                        'text-green-600': service.status === 'active',
                        'text-yellow-600': service.status === 'pending',
                        'text-red-600': service.status === 'inactive'
                      }"
                      class="text-sm font-semibold mt-1"
                    >
                      {{ service.status | titlecase }}
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm text-slate-600">Commission Rate</p>
                    <p class="text-xl font-bold text-slate-900">{{ service.commissionRate }}%</p>
                  </div>
                </div>

                <!-- Stats -->
                <div class="grid grid-cols-3 gap-4 mb-4 p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p class="text-xs text-slate-600">Total Orders</p>
                    <p class="text-xl font-bold text-slate-900">{{ service.totalOrders }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-600">Success Rate</p>
                    <p class="text-xl font-bold text-slate-900">{{ service.successRate }}%</p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-600">Rating</p>
                    <p class="text-xl font-bold text-slate-900">{{ service.averageRating }}</p>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex gap-2">
                  @if (!service.isDefault) {
                    <button
                      (click)="setAsDefault(service)"
                      class="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg font-medium transition text-sm flex items-center justify-center gap-1"
                    >
                      <mat-icon class="text-base">star</mat-icon>
                      <span>Set as Default</span>
                    </button>
                  }
                  <button
                    (click)="deactivateService(service)"
                    class="flex-1 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg font-medium transition text-sm flex items-center justify-center gap-1"
                  >
                    <mat-icon class="text-base">delete</mat-icon>
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            }
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class RetailDeliveryIntegrationsComponent implements OnInit {
  currentTab: 'browse' | 'integrated' = 'browse';
  
  availableProviders = signal<ExternalDeliveryProvider[]>([]);
  integratedServices = signal<BusinessDeliveryIntegration[]>([]);
  
  isLoading = signal(false);
  isIntegrating = signal(false);
  
  searchQuery = '';
  selectedCategory = '';
  selectedCity = '';

  private businessId = localStorage.getItem('storeId') || '';
  private businessType = 'retail';

  constructor(
    private externalDeliveryService: ExternalDeliveryService
  ) {}

  ngOnInit(): void {
    if (!this.businessId) return;
    this.loadProviders();
    this.loadIntegrations();
  }

  loadProviders(): void {
    this.isLoading.set(true);
    this.externalDeliveryService.getAvailableProviders(
      this.selectedCity || undefined,
      this.selectedCategory || undefined
    ).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.status === 'success') {
          this.availableProviders.set(response.data || []);
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Error loading providers:', error);
      }
    });
  }

  searchProviders(): void {
    if (!this.searchQuery.trim()) {
      this.loadProviders();
      return;
    }

    this.isLoading.set(true);
    this.externalDeliveryService.searchProviders(this.searchQuery).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.status === 'success') {
          this.availableProviders.set(response.data || []);
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Error searching providers:', error);
      }
    });
  }

  loadIntegrations(): void {
    this.externalDeliveryService.getBusinessIntegrations(this.businessId, this.businessType).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.integratedServices.set(response.data || []);
        }
      },
      error: (error) => {
        console.error('Error loading integrations:', error);
      }
    });
  }

  integrateService(provider: ExternalDeliveryProvider): void {
    if (!this.businessId) return;
    
    this.isIntegrating.set(true);
    this.externalDeliveryService.integrateDeliveryService(
      this.businessId,
      this.businessType,
      provider.id,
      {
        commissionRate: 10,
        isDefault: this.integratedServices().length === 0
      }
    ).subscribe({
      next: (response) => {
        this.isIntegrating.set(false);
        if (response.status === 'success') {
          this.loadIntegrations();
        }
      },
      error: (error) => {
        this.isIntegrating.set(false);
        console.error('Error integrating service:', error);
      }
    });
  }

  setAsDefault(service: BusinessDeliveryIntegration): void {
    if (!this.businessId || !service.id) return;
    
    this.externalDeliveryService.setDefaultDeliveryService(
      this.businessId,
      this.businessType,
      service.id
    ).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.loadIntegrations();
        }
      },
      error: (error) => {
        console.error('Error setting default:', error);
      }
    });
  }

  deactivateService(service: BusinessDeliveryIntegration): void {
    if (!this.businessId || !service.id) return;
    
    if (confirm('Are you sure you want to remove this delivery service?')) {
      this.externalDeliveryService.deactivateIntegration(
        this.businessId,
        this.businessType,
        service.id
      ).subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.loadIntegrations();
          }
        },
        error: (error) => {
          console.error('Error deactivating service:', error);
        }
      });
    }
  }

  isServiceIntegrated(providerId: string): boolean {
    return this.integratedServices().some(service => service.providerId === providerId);
  }

  formatPrice(price: number): string {
    return price.toFixed(2);
  }
}
