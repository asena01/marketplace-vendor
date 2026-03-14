import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { DeliveryService } from '../../../services/delivery.service';
import { NotificationService } from '../../../services/notification.service';

export interface ProviderService {
  id: string;
  name: string;
  category: 'food' | 'retail' | 'furniture' | 'packages' | 'pharmacy' | 'grocery' | 'luggage' | 'perishable';
  description: string;
  basePrice: number;
  perKmRate: number;
  perKgRate?: number;
  estimatedDeliveryTime: number;
  maxDistance?: number;
  maxWeight?: number;
  features: {
    realTimeTracking: boolean;
    insurance: boolean;
    temperature_control: boolean;
    signature_required: boolean;
    scheduled_delivery: boolean;
  };
  isActive: boolean;
  coverage: string[];
  createdAt?: Date;
}

@Component({
  selector: 'app-delivery-services',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './delivery-services.component.html',
  styleUrl: './delivery-services.component.css'
})
export class DeliveryServicesComponent implements OnInit {
  services = signal<ProviderService[]>([]);
  isLoading = signal(false);
  isSubmitting = signal(false);
  showAddForm = signal(false);
  serviceForm: FormGroup;

  private deliveryId = localStorage.getItem('deliveryId') || '';

  constructor(
    private deliveryService: DeliveryService,
    private notificationService: NotificationService,
    private fb: FormBuilder
  ) {
    this.serviceForm = this.createServiceForm();
  }

  ngOnInit(): void {
    this.loadServices();
  }

  createServiceForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      description: [''],
      basePrice: [0, [Validators.required, Validators.min(0)]],
      perKmRate: [0, [Validators.required, Validators.min(0)]],
      perKgRate: [0, Validators.min(0)],
      estimatedDeliveryTime: [30, [Validators.required, Validators.min(1)]],
      maxDistance: [null, Validators.min(1)],
      maxWeight: [null, Validators.min(1)],
      realTimeTracking: [false],
      insurance: [false],
      temperature_control: [false],
      signature_required: [false],
      scheduled_delivery: [false]
    });
  }

  loadServices(): void {
    this.isLoading.set(true);
    this.deliveryService.getDeliveryProviderServices(this.deliveryId).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        if (response.status === 'success' && response.data) {
          this.services.set(response.data);
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.notificationService.error('Error', 'Failed to load services');
      }
    });
  }

  addService(): void {
    if (!this.serviceForm.valid) return;

    this.isSubmitting.set(true);
    const formValue = this.serviceForm.value;
    const serviceData: Partial<ProviderService> = {
      name: formValue.name,
      category: formValue.category,
      description: formValue.description,
      basePrice: formValue.basePrice,
      perKmRate: formValue.perKmRate,
      perKgRate: formValue.perKgRate || undefined,
      estimatedDeliveryTime: formValue.estimatedDeliveryTime,
      maxDistance: formValue.maxDistance || undefined,
      maxWeight: formValue.maxWeight || undefined,
      features: {
        realTimeTracking: formValue.realTimeTracking,
        insurance: formValue.insurance,
        temperature_control: formValue.temperature_control,
        signature_required: formValue.signature_required,
        scheduled_delivery: formValue.scheduled_delivery
      },
      isActive: true,
      coverage: []
    };

    this.deliveryService.createDeliveryProviderService(this.deliveryId, serviceData).subscribe({
      next: (response: any) => {
        this.isSubmitting.set(false);
        if (response.status === 'success') {
          this.notificationService.success('Success', 'Service added successfully');
          this.serviceForm.reset();
          this.showAddForm.set(false);
          this.loadServices();
        }
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.notificationService.error('Error', 'Failed to add service');
      }
    });
  }

  toggleService(service: ProviderService): void {
    this.deliveryService.updateDeliveryProviderService(this.deliveryId, service.id, {
      isActive: !service.isActive
    }).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.notificationService.success('Success', `Service ${service.isActive ? 'deactivated' : 'activated'}`);
          this.loadServices();
        }
      },
      error: (error) => {
        this.notificationService.error('Error', 'Failed to update service');
      }
    });
  }

  deleteService(serviceId: string): void {
    if (!confirm('Are you sure you want to delete this service?')) return;

    this.deliveryService.deleteDeliveryProviderService(this.deliveryId, serviceId).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.notificationService.success('Success', 'Service deleted successfully');
          this.loadServices();
        }
      },
      error: (error) => {
        this.notificationService.error('Error', 'Failed to delete service');
      }
    });
  }

  toggleAddForm(): void {
    this.showAddForm.update(val => !val);
    if (!this.showAddForm()) {
      this.serviceForm.reset();
    }
  }

  getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      food: 'Food Delivery',
      retail: 'Retail Delivery',
      furniture: 'Furniture Delivery',
      packages: 'Package Delivery',
      pharmacy: 'Pharmacy Delivery',
      grocery: 'Grocery Delivery',
      luggage: 'Luggage/Travel',
      perishable: 'Perishable Goods'
    };
    return labels[category] || category;
  }

  formatPrice(price: number): string {
    return price.toFixed(2);
  }

  trackByServiceId(index: number, service: ProviderService): string {
    return service.id;
  }
}
