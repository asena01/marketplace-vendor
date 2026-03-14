import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ExternalDeliveryService, ExternalDeliveryProvider, BusinessDeliveryIntegration } from '../../../../../services/external-delivery.service';
import { NotificationService } from '../../../../../services/notification.service';

@Component({
  selector: 'app-delivery-integrations',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './delivery-integrations.component.html',
  styleUrl: './delivery-integrations.component.css'
})
export class DeliveryIntegrationsComponent implements OnInit {
  currentTab: 'browse' | 'integrated' = 'browse';
  
  availableProviders = signal<ExternalDeliveryProvider[]>([]);
  integratedServices = signal<BusinessDeliveryIntegration[]>([]);
  
  isLoading = signal(false);
  isIntegrating = signal(false);
  
  searchQuery = '';
  selectedCategory = '';
  selectedCity = '';

  private businessId = localStorage.getItem('restaurantId') || '';
  private businessType = 'restaurant';

  constructor(
    private externalDeliveryService: ExternalDeliveryService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
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
        this.notificationService.error('Error', 'Failed to load delivery services');
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
        this.notificationService.error('Error', 'Failed to search delivery services');
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
        this.notificationService.error('Error', 'Failed to load integrations');
      }
    });
  }

  isServiceIntegrated(providerId: string): boolean {
    return this.integratedServices().some(service => service.providerId === providerId);
  }

  formatPrice(price: number): string {
    return price.toFixed(2);
  }

  integrateService(provider: ExternalDeliveryProvider): void {
    if (this.isServiceIntegrated(provider.id)) {
      return;
    }

    this.isIntegrating.set(true);
    this.externalDeliveryService.integrateDeliveryService(
      this.businessId,
      this.businessType,
      provider.id,
      {
        status: 'pending',
        contractStartDate: new Date(),
        autoRenew: true,
        isDefault: this.integratedServices().length === 0
      }
    ).subscribe({
      next: (response) => {
        this.isIntegrating.set(false);
        if (response.status === 'success') {
          this.notificationService.success('Success', `${provider.name} has been integrated`);
          this.loadIntegrations();
          this.loadProviders();
        }
      },
      error: (error) => {
        this.isIntegrating.set(false);
        this.notificationService.error('Error', 'Failed to integrate delivery service');
      }
    });
  }

  setAsDefault(integration: BusinessDeliveryIntegration): void {
    this.externalDeliveryService.setDefaultDeliveryService(
      this.businessId,
      this.businessType,
      integration.id
    ).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.notificationService.success('Success', 'Default delivery service updated');
          this.loadIntegrations();
        }
      },
      error: (error) => {
        this.notificationService.error('Error', 'Failed to set default service');
      }
    });
  }

  deactivateService(integration: BusinessDeliveryIntegration): void {
    if (confirm(`Are you sure you want to deactivate ${integration.provider.name}?`)) {
      this.externalDeliveryService.deactivateIntegration(
        this.businessId,
        this.businessType,
        integration.id
      ).subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.notificationService.success('Success', 'Delivery service deactivated');
            this.loadIntegrations();
          }
        },
        error: (error) => {
          this.notificationService.error('Error', 'Failed to deactivate service');
        }
      });
    }
  }
}
