import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CustomerService } from '../../../services/customer.service';

interface DeliveryOrder {
  _id: string;
  orderId: string;
  itemName: string;
  description: string;
  pickupLocation: string;
  deliveryLocation: string;
  price: number;
  deliveryFee: number;
  totalPrice: number;
  status: 'pending' | 'accepted' | 'picked-up' | 'in-transit' | 'arriving' | 'delivered' | 'failed' | 'cancelled';
  courierName?: string;
  courierPhone?: string;
  courierLocation?: { type: string; coordinates: number[] };
  estimatedDelivery?: string;
  deliveryDate: string;
}

@Component({
  selector: 'app-customer-delivery-orders',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="space-y-6">
      <!-- Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <p class="text-gray-600 text-sm">Total Deliveries</p>
          <p class="text-3xl font-bold text-gray-800">{{ deliveryOrders().length }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow border-l-4 border-orange-500">
          <p class="text-gray-600 text-sm">In Transit</p>
          <p class="text-3xl font-bold text-gray-800">{{ getInTransitCount() }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
          <p class="text-gray-600 text-sm">Arriving</p>
          <p class="text-3xl font-bold text-gray-800">{{ getArrivingCount() }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <p class="text-gray-600 text-sm">Delivered</p>
          <p class="text-3xl font-bold text-gray-800">{{ getDeliveredCount() }}</p>
        </div>
      </div>

      <!-- Orders Grid -->
      @if (deliveryOrders().length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          @for (order of deliveryOrders(); track order._id) {
            <div class="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
              <!-- Header -->
              <div class="bg-gradient-to-r from-orange-600 to-red-600 p-4 text-white">
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <h3 class="text-lg font-bold">{{ order.itemName }}</h3>
                    <p class="text-sm opacity-90 flex items-center gap-1">
                      <mat-icon class="text-sm">local_shipping</mat-icon>
                      <span>Order #{{ order.orderId.slice(0, 8) }}</span>
                    </p>
                  </div>
                  <span [class]="getStatusBadgeClass(order.status)">
                    {{ getStatusBadge(order.status) }}
                  </span>
                </div>
              </div>

              <!-- Content -->
              <div class="p-4 space-y-4">
                <!-- Item Details -->
                <div class="border-b pb-4">
                  <p class="text-sm text-gray-600 font-semibold mb-1">Item Details</p>
                  <p class="text-sm text-gray-700">{{ order.description }}</p>
                </div>

                <!-- Locations -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-xs text-gray-600 font-semibold mb-1 flex items-center gap-1">
                      <mat-icon class="text-xs">location_on</mat-icon>
                      <span>Pickup</span>
                    </p>
                    <p class="text-xs text-gray-700 line-clamp-2">{{ order.pickupLocation }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-600 font-semibold mb-1 flex items-center gap-1">
                      <mat-icon class="text-xs">location_on</mat-icon>
                      <span>Delivery</span>
                    </p>
                    <p class="text-xs text-gray-700 line-clamp-2">{{ order.deliveryLocation }}</p>
                  </div>
                </div>

                <!-- Courier Info -->
                @if (order.courierName && (order.status === 'accepted' || order.status === 'picked-up' || order.status === 'in-transit' || order.status === 'arriving')) {
                  <div class="bg-blue-50 rounded p-3 border border-blue-200">
                    <p class="text-xs text-gray-600 font-semibold mb-2 flex items-center gap-1">
                      <mat-icon class="text-xs">person</mat-icon>
                      <span>Courier Info</span>
                    </p>
                    <div class="flex justify-between items-center">
                      <div>
                        <p class="text-sm font-semibold text-gray-900">{{ order.courierName }}</p>
                        @if (order.courierPhone) {
                          <p class="text-xs text-gray-600">{{ order.courierPhone }}</p>
                        }
                      </div>
                      <div class="text-right">
                        @if (order.status === 'in-transit' || order.status === 'arriving') {
                          <p class="text-xs text-green-600 font-semibold flex items-center gap-1">
                            <mat-icon class="text-xs">check_circle</mat-icon>
                            <span>On the way</span>
                          </p>
                        } @else if (order.status === 'picked-up') {
                          <p class="text-xs text-orange-600 font-semibold flex items-center gap-1">
                            <mat-icon class="text-xs">local_shipping</mat-icon>
                            <span>Picked up</span>
                          </p>
                        }
                      </div>
                    </div>
                  </div>
                }

                <!-- Pricing -->
                <div class="border-t pt-4">
                  <div class="flex justify-between text-sm mb-2">
                    <span class="text-gray-600">Item Price:</span>
                    <span class="font-semibold text-gray-900">₦{{ order.price.toLocaleString() }}</span>
                  </div>
                  <div class="flex justify-between text-sm mb-3">
                    <span class="text-gray-600">Delivery Fee:</span>
                    <span class="font-semibold text-gray-900">₦{{ order.deliveryFee.toLocaleString() }}</span>
                  </div>
                  <div class="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span class="text-green-600">₦{{ order.totalPrice.toLocaleString() }}</span>
                  </div>
                </div>

                <!-- Estimated Delivery -->
                @if (order.estimatedDelivery) {
                  <div class="bg-yellow-50 rounded p-3 border border-yellow-200">
                    <p class="text-xs text-gray-600 font-semibold flex items-center gap-1">
                      <mat-icon class="text-xs">schedule</mat-icon>
                      <span>Estimated Delivery</span>
                    </p>
                    <p class="text-sm font-semibold text-gray-900">{{ formatTime(order.estimatedDelivery) }}</p>
                  </div>
                }
              </div>

              <!-- Progress Bar -->
              <div class="bg-gray-50 px-4 py-3 border-t">
                <p class="text-xs text-gray-600 font-semibold mb-2">Progress</p>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-green-600 h-2 rounded-full transition-all duration-300"
                    [style.width.%]="getProgressPercentage(order.status)">
                  </div>
                </div>
                <p class="text-xs text-gray-700 mt-1">{{ getProgressPercentage(order.status) }}% Complete</p>
              </div>

              <!-- Actions -->
              <div class="bg-white px-4 py-3 flex gap-2 border-t">
                <button
                  (click)="viewOrderDetails(order)"
                  class="flex-1 text-blue-600 hover:text-blue-800 font-semibold text-sm py-2 hover:bg-blue-50 rounded transition flex items-center justify-center gap-1">
                  <mat-icon class="text-sm">visibility</mat-icon>
                  <span>View Details</span>
                </button>
                @if (order.status === 'pending') {
                  <button
                    (click)="cancelOrder(order)"
                    class="flex-1 text-red-600 hover:text-red-800 font-semibold text-sm py-2 hover:bg-red-50 rounded transition flex items-center justify-center gap-1">
                    <mat-icon class="text-sm">cancel</mat-icon>
                    <span>Cancel</span>
                  </button>
                }
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="bg-white rounded-lg shadow p-12 text-center">
          <div class="flex justify-center mb-4">
            <mat-icon class="text-5xl text-gray-400">local_shipping</mat-icon>
          </div>
          <p class="text-gray-500 text-lg mb-2 font-semibold">No delivery orders yet</p>
          <p class="text-gray-400 text-sm">Order delivery from your favorite shops and restaurants!</p>
        </div>
      }
    </div>
  `,
  styles: [`
    ::ng-deep mat-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class CustomerDeliveryOrdersComponent implements OnInit {
  deliveryOrders = signal<DeliveryOrder[]>([]);

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    this.loadDeliveryOrders();
  }

  loadDeliveryOrders(): void {
    this.customerService.getDeliveryOrders().subscribe(
      (response: any) => {
        if (response.success && response.data) {
          this.deliveryOrders.set(response.data);
        }
      },
      (error) => {
        console.error('Error loading delivery orders:', error);
      }
    );
  }

  getInTransitCount(): number {
    return this.deliveryOrders().filter(o => o.status === 'in-transit').length;
  }

  getArrivingCount(): number {
    return this.deliveryOrders().filter(o => o.status === 'arriving').length;
  }

  getDeliveredCount(): number {
    return this.deliveryOrders().filter(o => o.status === 'delivered').length;
  }

  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  getStatusBadge(status: string): string {
    const badges: { [key: string]: string } = {
      pending: 'Pending',
      accepted: 'Accepted',
      'picked-up': 'Picked Up',
      'in-transit': 'In Transit',
      arriving: 'Arriving',
      delivered: 'Delivered',
      failed: 'Failed',
      cancelled: 'Cancelled'
    };
    return badges[status] || status;
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      pending: 'inline-block px-3 py-1 rounded-full bg-yellow-200 text-yellow-900 text-xs font-semibold',
      accepted: 'inline-block px-3 py-1 rounded-full bg-blue-200 text-blue-900 text-xs font-semibold',
      'picked-up': 'inline-block px-3 py-1 rounded-full bg-purple-200 text-purple-900 text-xs font-semibold',
      'in-transit': 'inline-block px-3 py-1 rounded-full bg-orange-200 text-orange-900 text-xs font-semibold',
      arriving: 'inline-block px-3 py-1 rounded-full bg-pink-200 text-pink-900 text-xs font-semibold',
      delivered: 'inline-block px-3 py-1 rounded-full bg-green-200 text-green-900 text-xs font-semibold',
      failed: 'inline-block px-3 py-1 rounded-full bg-red-200 text-red-900 text-xs font-semibold',
      cancelled: 'inline-block px-3 py-1 rounded-full bg-gray-200 text-gray-900 text-xs font-semibold'
    };
    return classes[status] || 'inline-block px-3 py-1 rounded-full bg-gray-200 text-gray-900 text-xs font-semibold';
  }

  getProgressPercentage(status: string): number {
    const progress: { [key: string]: number } = {
      pending: 10,
      accepted: 20,
      'picked-up': 40,
      'in-transit': 60,
      arriving: 80,
      delivered: 100,
      failed: 0,
      cancelled: 0
    };
    return progress[status] || 0;
  }

  viewOrderDetails(order: DeliveryOrder): void {
    console.log('View order details:', order);
    // TODO: Implement view details modal with map
  }

  cancelOrder(order: DeliveryOrder): void {
    if (confirm('Are you sure you want to cancel this delivery order?')) {
      console.log('Cancel order:', order._id);
      // TODO: Implement cancel order API call
    }
  }
}
