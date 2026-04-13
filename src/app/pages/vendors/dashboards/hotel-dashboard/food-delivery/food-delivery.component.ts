import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../../../../services/hotel.service';

interface DeliveryTask {
  _id?: string;
  orderId: string;
  roomNumber: string;
  guestName: string;
  items: string[];
  status: 'preparing' | 'ready-for-delivery' | 'in-transit' | 'delivered';
  assignedStaff?: string;
  estimatedTime?: number; // in minutes
  actualDeliveryTime?: string;
  specialInstructions?: string;
  deliveryNotes?: string;
  startTime?: string;
  deliveryStartTime?: string;
  deliveryEndTime?: string;
  currentLocation?: string;
}

@Component({
  selector: 'app-hotel-food-delivery',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8 space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">🚚 Restaurant Delivery Tracking</h1>
          <p class="text-slate-600 mt-1">Track real-time delivery of restaurant orders to guest rooms</p>
        </div>
        <button
          (click)="refreshDeliveries()"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
        >
          🔄 Refresh
        </button>
      </div>

      <!-- Live Delivery Status -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-blue-500">
          <p class="text-slate-600 text-sm font-medium mb-1">In Preparation</p>
          <p class="text-2xl font-bold text-blue-600">{{ getInPreparationCount() }}</p>
        </div>

        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-orange-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Ready for Delivery</p>
          <p class="text-2xl font-bold text-orange-600">{{ getReadyForDeliveryCount() }}</p>
        </div>

        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-purple-500">
          <p class="text-slate-600 text-sm font-medium mb-1">In Transit</p>
          <p class="text-2xl font-bold text-purple-600">{{ getInTransitCount() }}</p>
        </div>

        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-emerald-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Delivered Today</p>
          <p class="text-2xl font-bold text-emerald-600">{{ getDeliveredCount() }}</p>
        </div>
      </div>

      <!-- Delivery Timeline View -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="bg-gradient-to-r from-purple-600 to-purple-700 p-4 text-white">
          <h2 class="text-xl font-bold">🚚 Active Deliveries</h2>
        </div>

        @if (isLoading()) {
          <div class="p-8 text-center text-slate-600">
            <p class="font-semibold">Loading deliveries...</p>
          </div>
        } @else if (activeDeliveries().length === 0) {
          <div class="p-12 text-center">
            <p class="text-slate-600 font-medium text-lg">No active deliveries</p>
            <p class="text-sm text-slate-500 mt-2">All orders have been delivered successfully</p>
          </div>
        } @else {
          <div class="divide-y divide-slate-200">
            @for (delivery of activeDeliveries(); track delivery._id) {
              <div class="p-6 hover:bg-slate-50 transition">
                <!-- Order Header -->
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <h3 class="text-lg font-bold text-slate-900">Order {{ delivery.orderId }}</h3>
                    <p class="text-sm text-slate-600">Room {{ delivery.roomNumber }} - {{ delivery.guestName }}</p>
                  </div>
                  <span [class]="getDeliveryStatusBadge(delivery.status)">
                    {{ getDeliveryStatusIcon(delivery.status) }} {{ delivery.status | titlecase }}
                  </span>
                </div>

                <!-- Items -->
                <div class="mb-4">
                  <p class="text-sm font-semibold text-slate-700 mb-2">Items:</p>
                  <div class="flex flex-wrap gap-2">
                    @for (item of delivery.items; track item) {
                      <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">{{ item }}</span>
                    }
                  </div>
                </div>

                <!-- Delivery Status Timeline -->
                <div class="mb-4 p-4 bg-slate-50 rounded-lg">
                  <p class="text-sm font-semibold text-slate-700 mb-3">Delivery Progress:</p>
                  <div class="space-y-2">
                    <!-- Status 1: Preparing -->
                    <div class="flex items-center gap-3">
                      <div [class]="delivery.status === 'preparing' || ['ready-for-delivery', 'in-transit', 'delivered'].includes(delivery.status) ? 'w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold' : 'w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center'">
                        {{ ['ready-for-delivery', 'in-transit', 'delivered'].includes(delivery.status) ? '✓' : '👨‍🍳' }}
                      </div>
                      <div>
                        <p class="font-medium text-slate-900">Preparing</p>
                        <p class="text-xs text-slate-500">Kitchen preparing your order</p>
                      </div>
                    </div>

                    <!-- Status 2: Ready -->
                    <div class="flex items-center gap-3">
                      <div [class]="['ready-for-delivery', 'in-transit', 'delivered'].includes(delivery.status) ? 'w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold' : 'w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center'">
                        {{ ['in-transit', 'delivered'].includes(delivery.status) ? '✓' : '📦' }}
                      </div>
                      <div>
                        <p class="font-medium text-slate-900">Ready for Pickup</p>
                        <p class="text-xs text-slate-500">Order ready at kitchen counter</p>
                      </div>
                    </div>

                    <!-- Status 3: In Transit -->
                    <div class="flex items-center gap-3">
                      <div [class]="['in-transit', 'delivered'].includes(delivery.status) ? 'w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold' : 'w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center'">
                        {{ delivery.status === 'delivered' ? '✓' : '🚚' }}
                      </div>
                      <div>
                        <p class="font-medium text-slate-900">In Transit</p>
                        <p class="text-xs text-slate-500">Heading to your room</p>
                      </div>
                    </div>

                    <!-- Status 4: Delivered -->
                    <div class="flex items-center gap-3">
                      <div [class]="delivery.status === 'delivered' ? 'w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold' : 'w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center'">
                        {{ delivery.status === 'delivered' ? '✓' : '' }}
                      </div>
                      <div>
                        <p class="font-medium text-slate-900">Delivered</p>
                        <p class="text-xs text-slate-500">Enjoy your meal!</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Time & Instructions -->
                <div class="grid grid-cols-2 gap-4 mb-4">
                  @if (delivery.estimatedTime) {
                    <div class="p-3 bg-orange-50 rounded-lg">
                      <p class="text-xs text-orange-700 font-semibold">Est. Delivery Time</p>
                      <p class="text-sm font-bold text-orange-900">{{ delivery.estimatedTime }} mins</p>
                    </div>
                  }
                  @if (delivery.assignedStaff) {
                    <div class="p-3 bg-blue-50 rounded-lg">
                      <p class="text-xs text-blue-700 font-semibold">Assigned Staff</p>
                      <p class="text-sm font-bold text-blue-900">{{ delivery.assignedStaff }}</p>
                    </div>
                  }
                </div>

                @if (delivery.specialInstructions) {
                  <div class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p class="text-xs font-semibold text-yellow-900 mb-1">📝 Special Instructions:</p>
                    <p class="text-sm text-yellow-900">{{ delivery.specialInstructions }}</p>
                  </div>
                }

                <!-- Action Buttons -->
                <div class="flex gap-2">
                  @if (delivery.status === 'ready-for-delivery') {
                    <button
                      (click)="updateDeliveryStatus(delivery, 'in-transit')"
                      class="flex-1 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition"
                    >
                      🚚 Start Delivery
                    </button>
                  }
                  @if (delivery.status === 'in-transit') {
                    <button
                      (click)="updateDeliveryStatus(delivery, 'delivered')"
                      class="flex-1 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg font-medium hover:bg-emerald-200 transition"
                    >
                      ✅ Mark Delivered
                    </button>
                  }
                  <button
                    (click)="viewDeliveryDetails(delivery)"
                    class="flex-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition"
                  >
                    👁️ View Details
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Completed Deliveries -->
      @if (completedDeliveries().length > 0) {
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="bg-gradient-to-r from-emerald-600 to-emerald-700 p-4 text-white">
            <h2 class="text-xl font-bold">✅ Completed Deliveries</h2>
          </div>

          <div class="divide-y divide-slate-200">
            @for (delivery of completedDeliveries(); track delivery._id) {
              <div class="p-4 flex justify-between items-center hover:bg-slate-50 transition">
                <div>
                  <p class="font-semibold text-slate-900">Order {{ delivery.orderId }}</p>
                  <p class="text-sm text-slate-600">Room {{ delivery.roomNumber }} - {{ delivery.guestName }}</p>
                </div>
                <div class="text-right">
                  <span class="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-bold">✅ Delivered</span>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: []
})
export class HotelFoodDeliveryComponent implements OnInit {
  isLoading = signal(false);
  errorMessage = signal('');

  foodOrders = signal<any[]>([]);
  activeDeliveries = signal<DeliveryTask[]>([]);
  completedDeliveries = signal<DeliveryTask[]>([]);

  constructor(private hotelService: HotelService) {}

  ngOnInit(): void {
    this.loadDeliveries();
  }

  loadDeliveries(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.hotelService.getFoodOrders(1, 100).subscribe({
      next: (response: any) => {
        if (response.status === 'success' && Array.isArray(response.data)) {
          this.foodOrders.set(response.data);

          // Separate active and completed deliveries
          const active = response.data.filter((order: any) =>
            ['preparing', 'ready-for-delivery', 'in-transit'].includes(order.status)
          );
          const completed = response.data.filter((order: any) => order.status === 'delivered');

          this.activeDeliveries.set(active);
          this.completedDeliveries.set(completed);

          console.log('✅ Deliveries loaded:', { active: active.length, completed: completed.length });
        }
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading deliveries:', error);
        this.errorMessage.set('Failed to load deliveries. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  updateDeliveryStatus(delivery: DeliveryTask, newStatus: string): void {
    if (!delivery._id) return;

    this.hotelService.updateFoodOrderStatus(delivery._id, newStatus).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.loadDeliveries();
          console.log('✅ Delivery status updated to:', newStatus);
        }
      },
      error: (error: any) => {
        console.error('Error updating delivery status:', error);
        this.errorMessage.set('Failed to update delivery status');
      }
    });
  }

  viewDeliveryDetails(delivery: DeliveryTask): void {
    console.log('Viewing delivery details:', delivery);
    alert(`Order ${delivery.orderId}\nRoom: ${delivery.roomNumber}\nGuest: ${delivery.guestName}\nStatus: ${delivery.status}`);
  }

  refreshDeliveries(): void {
    this.loadDeliveries();
  }

  getInPreparationCount(): number {
    return this.foodOrders().filter(order => order.status === 'preparing').length;
  }

  getReadyForDeliveryCount(): number {
    return this.foodOrders().filter(order => order.status === 'ready').length;
  }

  getInTransitCount(): number {
    return this.foodOrders().filter(order => order.status === 'in-transit').length;
  }

  getDeliveredCount(): number {
    return this.foodOrders().filter(order => order.status === 'delivered').length;
  }

  getDeliveryStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'preparing': '👨‍🍳',
      'ready-for-delivery': '📦',
      'in-transit': '🚚',
      'delivered': '✅'
    };
    return icons[status] || '•';
  }

  getDeliveryStatusBadge(status: string): string {
    const baseClass = 'px-3 py-1 rounded-full text-sm font-semibold';
    const classes: { [key: string]: string } = {
      'preparing': `${baseClass} bg-blue-100 text-blue-800`,
      'ready-for-delivery': `${baseClass} bg-orange-100 text-orange-800`,
      'in-transit': `${baseClass} bg-purple-100 text-purple-800`,
      'delivered': `${baseClass} bg-emerald-100 text-emerald-800`
    };
    return classes[status] || baseClass;
  }
}
