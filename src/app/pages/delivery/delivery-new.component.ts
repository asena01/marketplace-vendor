import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { DeliveryService } from '../../services/delivery.service';
import { NotificationService } from '../../services/notification.service';
import { DeliveryServiceDefinition, PREDEFINED_DELIVERY_SERVICES } from '../../services/delivery-service-definitions';

@Component({
  selector: 'app-delivery-new',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './delivery-new.component.html',
  styleUrl: './delivery-new.component.css'
})
export class DeliveryNewComponent implements OnInit {
  availableServices = signal<DeliveryServiceDefinition[]>(Object.values(PREDEFINED_DELIVERY_SERVICES));
  selectedService = signal<DeliveryServiceDefinition | null>(null);
  
  deliveryForm: FormGroup;
  isSubmitting = signal(false);
  orderSuccess = signal(false);
  orderError = signal('');

  calculatedPrice = signal(0);
  tax = computed(() => Math.round(this.calculatedPrice() * 0.1 * 100) / 100);
  totalPrice = computed(() => Math.round((this.calculatedPrice() + this.tax()) * 100) / 100);

  isRushDelivery = computed(() => this.deliveryForm.get('deliveryType')?.value === 'rush');

  constructor(
    private deliveryService: DeliveryService,
    private notificationService: NotificationService,
    private fb: FormBuilder
  ) {
    this.deliveryForm = this.fb.group({
      customerName: ['', Validators.required],
      phone: ['', [Validators.required]],
      pickupLocation: ['', Validators.required],
      deliveryLocation: ['', Validators.required],
      distance: ['', [Validators.required, Validators.min(0.1)]],
      weight: ['', [Validators.required, Validators.min(0.1)]],
      description: [''],
      deliveryType: ['standard'],
      vehicle: ['']
    });
  }

  ngOnInit(): void {
    this.loadDeliveryServices();
    if (this.availableServices().length > 0) {
      this.selectService(this.availableServices()[0]);
    }
  }

  loadDeliveryServices(): void {
    this.deliveryService.getDeliveryServices('restaurant').subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.availableServices.set(response.data);
        }
      },
      error: (error) => {
        console.error('Error loading delivery services:', error);
        this.notificationService.warning('Warning', 'Using default delivery services');
      }
    });
  }

  selectService(service: DeliveryServiceDefinition): void {
    this.selectedService.set(service);
    this.deliveryForm.patchValue({
      vehicle: service.availableVehicles[0] || 'bike'
    });
    this.calculatePrice();
  }

  calculatePrice(): void {
    const service = this.selectedService();
    if (!service) return;

    const distance = this.deliveryForm.get('distance')?.value || 0;
    const weight = this.deliveryForm.get('weight')?.value || 0;
    
    if (distance && weight) {
      this.deliveryService.calculateDeliveryPrice(service.id, distance, weight).subscribe({
        next: (response) => {
          if (response.status === 'success' && response.data) {
            let price = response.data.price;
            if (this.isRushDelivery() && service.pricing.rushDeliveryFee) {
              price += service.pricing.rushDeliveryFee;
            }
            this.calculatedPrice.set(price);
          }
        },
        error: (error) => {
          console.error('Error calculating price:', error);
          let price = this.deliveryService.calculatePrice(service, distance, weight);
          if (this.isRushDelivery() && service.pricing.rushDeliveryFee) {
            price += service.pricing.rushDeliveryFee;
          }
          this.calculatedPrice.set(price);
        }
      });
    }
  }

  submitOrder(): void {
    if (!this.deliveryForm.valid || !this.selectedService()) {
      this.orderError.set('Please fill in all required fields');
      return;
    }

    this.isSubmitting.set(true);
    this.orderError.set('');
    this.orderSuccess.set(false);

    const orderData = {
      ...this.deliveryForm.value,
      serviceId: this.selectedService()?.id,
      totalPrice: this.totalPrice(),
      tax: this.tax(),
      subtotal: this.calculatedPrice()
    };

    this.deliveryService.createDeliveryOrderWithService(this.selectedService()!.id, orderData).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        if (response.status === 'success') {
          this.orderSuccess.set(true);
          this.notificationService.success('Success', 'Delivery order created successfully');
          setTimeout(() => this.resetForm(), 2000);
        } else {
          this.orderError.set(response.message || 'Failed to create delivery order');
        }
      },
      error: (error) => {
        this.isSubmitting.set(false);
        console.error('Error creating delivery order:', error);
        this.orderError.set('An error occurred. Please try again.');
        this.notificationService.error('Error', 'Failed to create delivery order');
      }
    });
  }

  resetForm(): void {
    this.deliveryForm.reset();
    this.calculatedPrice.set(0);
    this.orderSuccess.set(false);
    this.orderError.set('');
  }

  formatCurrency(value: number): string {
    return value.toFixed(2);
  }

  getServiceBasePrice(): string {
    return this.formatCurrency(this.selectedService()?.pricing.basePrice || 0);
  }

  getRushFee(): string {
    return this.formatCurrency(this.selectedService()?.pricing.rushDeliveryFee || 0);
  }

  getPerKmRate(): string {
    return this.formatCurrency(this.selectedService()?.pricing.perKmRate || 0);
  }

  getPerKgRate(): string {
    return this.formatCurrency(this.selectedService()?.pricing.perKgRate || 0);
  }

  getStandardDeliveryTime(): number {
    return this.selectedService()?.estimatedDeliveryTime?.standard || 0;
  }

  getRushDeliveryTime(): number {
    return this.selectedService()?.estimatedDeliveryTime?.rush || 0;
  }

  hasRushOption(): boolean {
    return !!this.selectedService()?.estimatedDeliveryTime?.rush;
  }
}
