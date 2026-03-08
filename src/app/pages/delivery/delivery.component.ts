import { Component, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../../components/header/header.component';
import { DeliveryService } from '../../services/delivery.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-delivery',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, HeaderComponent],
  templateUrl: './delivery.component.html',
  styleUrl: './delivery.component.css'
})
export class DeliveryComponent implements OnDestroy {
  // State signals
  selectedVehicle = signal<string>('bike');
  selectedServiceType = signal<string>('standard');
  selectedPackageSize = signal<string>('small');
  distance = signal<number>(0);
  weight = signal<number>(0);
  quantity = signal<number>(1);
  packageDescription = signal<string>('');
  pickupLocation = signal<string>('');
  deliveryLocation = signal<string>('');
  customerName = signal<string>('');
  customerPhone = signal<string>('');
  isSubmitting = signal(false);
  orderSuccess = signal(false);
  orderError = signal('');

  // Tracking signals
  currentDelivery = signal<any>(null);
  trackingStatus = signal<string>('');
  currentLocation = signal<string>('');
  estimatedTime = signal<string>('');
  trackingHistory = signal<any[]>([]);
  courierName = signal<string>('');
  courierPhone = signal<string>('');
  courierRating = signal<number>(0);
  isTracking = signal(false);
  trackingError = signal('');

  private trackingSubscription: Subscription | null = null;

  // Delivery data
  deliveryMethods: any[] = [];
  serviceTypes: any[] = [];
  packageSizes: any[] = [];

  // Computed selected items
  selectedVehicleData = computed(() =>
    this.deliveryMethods.find(v => v.type === this.selectedVehicle())
  );

  selectedServiceData = computed(() =>
    this.serviceTypes.find(s => s.type === this.selectedServiceType())
  );

  selectedSizeData = computed(() =>
    this.packageSizes.find(s => s.category === this.selectedPackageSize())
  );

  // Computed pricing
  calculatedPrice = computed(() => {
    const d = this.distance();
    const w = this.weight();
    const size = this.selectedPackageSize();
    const service = this.selectedServiceType();
    const vehicle = this.selectedVehicle();

    if (!d || !w) return 0;

    // Base rate
    let total = 5;

    // Distance charge: $0.50/km
    total += d * 0.5;

    // Weight charge: $0.20/kg
    total += w * 0.2;

    // Size charge
    const sizeCharges: { [key: string]: number } = {
      'small': 0,
      'medium': 5,
      'large': 15,
      'extra-large': 30
    };
    total += sizeCharges[size] || 0;

    // Service multiplier
    const serviceMultipliers: { [key: string]: number } = {
      'standard': 1,
      'express': 1.5,
      'same-day': 2,
      'scheduled': 0.8,
      'bulk': 0.6
    };
    total *= serviceMultipliers[service] || 1;

    // Apply quantity discount for bulk
    if (this.quantity() > 5 && service === 'bulk') {
      total *= 0.9; // 10% discount
    }

    return Math.round(total * 100) / 100;
  });

  tax = computed(() => Math.round(this.calculatedPrice() * 0.1 * 100) / 100);
  totalPrice = computed(() => Math.round((this.calculatedPrice() + this.tax()) * 100) / 100);

  constructor(private deliveryService: DeliveryService) {
    this.loadDeliveryOptions();
  }

  loadDeliveryOptions(): void {
    this.deliveryService.getDeliveryMethods().subscribe({
      next: (response) => {
        this.deliveryMethods = response.data || [];
      },
      error: (error) => {
        console.error('Error loading delivery methods:', error);
        this.deliveryMethods = [];
      }
    });

    this.deliveryService.getServiceTypes().subscribe({
      next: (response) => {
        this.serviceTypes = response.data || [];
      },
      error: (error) => {
        console.error('Error loading service types:', error);
        this.serviceTypes = [];
      }
    });

    this.deliveryService.getPackageSizes().subscribe({
      next: (response) => {
        this.packageSizes = response.data || [];
      },
      error: (error) => {
        console.error('Error loading package sizes:', error);
        this.packageSizes = [];
      }
    });
  }

  getVehicleIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'bike': 'two_wheeler',
      'scooter': 'two_wheeler',
      'car': 'directions_car',
      'van': 'local_shipping',
      'truck': 'local_shipping'
    };
    return icons[type] || 'local_shipping';
  }

  getSizeIcon(size: string): string {
    const icons: { [key: string]: string } = {
      'small': 'inbox',
      'medium': 'inventory_2',
      'large': 'checkroom',
      'extra-large': 'local_shipping'
    };
    return icons[size] || 'inventory_2';
  }

  getServiceIcon(service: string): string {
    const icons: { [key: string]: string } = {
      'standard': 'local_shipping',
      'express': 'flash_on',
      'same-day': 'speed',
      'scheduled': 'schedule',
      'bulk': 'inventory_2'
    };
    return icons[service] || 'local_shipping';
  }

  // Emoji mappings for compatibility
  getVehicleEmojiIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'bike': '🚴',
      'scooter': '🛴',
      'car': '🚗',
      'van': '🚐',
      'truck': '🚚'
    };
    return icons[type] || '📦';
  }

  submitOrder(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting.set(true);
    this.orderError.set('');

    const vehicleData = this.selectedVehicleData() || this.deliveryMethods[0];

    const orderData = {
      provider: 'FastDeliver Inc',
      customerName: this.customerName(),
      customerPhone: this.customerPhone(),
      pickupLocation: {
        address: this.pickupLocation(),
        city: 'Current Location',
        state: 'Current',
        zipCode: '00000'
      },
      deliveryLocation: {
        address: this.deliveryLocation(),
        city: 'Delivery City',
        state: 'State',
        zipCode: '00000'
      },
      package: {
        description: this.packageDescription(),
        quantity: this.quantity(),
        weight: { value: this.weight(), unit: 'kg' as const },
        dimensions: { length: 10, width: 10, height: 10, unit: 'cm' as const },
        totalSize: { category: this.selectedPackageSize() as 'small' | 'medium' | 'large' | 'extra-large' }
      },
      deliveryMethod: vehicleData,
      serviceType: this.selectedServiceType() as 'standard' | 'express' | 'same-day' | 'scheduled' | 'bulk',
      distance: { value: this.distance(), unit: 'km' as const },
      paymentMethod: 'prepaid' as const
    };

    this.deliveryService.createDelivery(orderData).subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data) {
          this.orderSuccess.set(true);
          // Start tracking the delivery
          this.startTracking(response.data);
          console.log('✅ Order created:', response.data?.orderNumber);
        }
        this.isSubmitting.set(false);
      },
      error: (error: any) => {
        this.orderError.set('Failed to create order. Please try again.');
        console.error('Order error:', error);
        this.isSubmitting.set(false);
      }
    });
  }

  validateForm(): boolean {
    if (!this.customerName()) {
      this.orderError.set('Please enter your name');
      return false;
    }
    if (!this.customerPhone()) {
      this.orderError.set('Please enter your phone number');
      return false;
    }
    if (!this.pickupLocation()) {
      this.orderError.set('Please enter pickup location');
      return false;
    }
    if (!this.deliveryLocation()) {
      this.orderError.set('Please enter delivery location');
      return false;
    }
    if (!this.distance()) {
      this.orderError.set('Please enter distance');
      return false;
    }
    if (!this.weight()) {
      this.orderError.set('Please enter package weight');
      return false;
    }
    return true;
  }

  resetForm(): void {
    this.customerName.set('');
    this.customerPhone.set('');
    this.pickupLocation.set('');
    this.deliveryLocation.set('');
    this.distance.set(0);
    this.weight.set(0);
    this.quantity.set(1);
    this.packageDescription.set('');
    this.selectedVehicle.set('bike');
    this.selectedServiceType.set('standard');
    this.selectedPackageSize.set('small');
  }

  startTracking(delivery: any): void {
    this.currentDelivery.set(delivery);
    this.isTracking.set(true);
    this.trackingError.set('');

    // Set initial tracking data
    this.updateTrackingDisplay(delivery);

    // Start polling for updates every 5 seconds
    this.trackingSubscription = interval(5000).subscribe(() => {
      if (delivery._id || delivery.id) {
        const deliveryId = delivery._id || delivery.id;
        this.deliveryService.getDeliveryById(deliveryId).subscribe({
          next: (response: any) => {
            if (response.status === 'success' && response.data) {
              this.currentDelivery.set(response.data);
              this.updateTrackingDisplay(response.data);
            }
          },
          error: (error: any) => {
            console.error('Error fetching tracking data:', error);
            // Continue polling even on error
          }
        });
      }
    });
  }

  updateTrackingDisplay(delivery: any): void {
    // Update status
    const status = delivery.tracking?.status || 'pending';
    this.trackingStatus.set(this.getStatusLabel(status));

    // Update location
    const location = delivery.tracking?.currentLocation;
    if (location) {
      this.currentLocation.set(`${location.address || ''} - ${location.city || ''}`);
    } else {
      this.currentLocation.set(delivery.pickupLocation?.address || 'Location loading...');
    }

    // Update estimated time
    if (delivery.estimatedTime) {
      this.estimatedTime.set(`${delivery.estimatedTime.value} ${delivery.estimatedTime.unit}`);
    }

    // Update tracking history
    if (delivery.tracking?.trackingHistory) {
      this.trackingHistory.set(delivery.tracking.trackingHistory);
    }

    // Update courier info if available
    if (delivery.agent) {
      this.courierName.set(delivery.agent.name || 'Courier');
      this.courierPhone.set(delivery.agent.phone || '');
    }
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': '⏳ Pending',
      'confirmed': '✅ Confirmed',
      'picked-up': '📦 Picked Up',
      'in-transit': '🚗 In Transit',
      'out-for-delivery': '🏠 Out for Delivery',
      'delivered': '✅ Delivered',
      'failed': '❌ Failed',
      'cancelled': '❌ Cancelled'
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pending': 'bg-yellow-50 border-yellow-200',
      'confirmed': 'bg-blue-50 border-blue-200',
      'picked-up': 'bg-purple-50 border-purple-200',
      'in-transit': 'bg-cyan-50 border-cyan-200',
      'out-for-delivery': 'bg-orange-50 border-orange-200',
      'delivered': 'bg-green-50 border-green-200',
      'failed': 'bg-red-50 border-red-200',
      'cancelled': 'bg-gray-50 border-gray-200'
    };
    return colors[status] || 'bg-gray-50 border-gray-200';
  }

  getProgressPercentage(status: string): number {
    const progress: { [key: string]: number } = {
      'pending': 10,
      'confirmed': 25,
      'picked-up': 40,
      'in-transit': 60,
      'out-for-delivery': 80,
      'delivered': 100,
      'failed': 0,
      'cancelled': 0
    };
    return progress[status] || 0;
  }

  stopTracking(): void {
    if (this.trackingSubscription) {
      this.trackingSubscription.unsubscribe();
    }
    this.isTracking.set(false);
    this.currentDelivery.set(null);
  }

  placeNewOrder(): void {
    this.stopTracking();
    this.resetForm();
  }

  ngOnDestroy(): void {
    if (this.trackingSubscription) {
      this.trackingSubscription.unsubscribe();
    }
  }
}
