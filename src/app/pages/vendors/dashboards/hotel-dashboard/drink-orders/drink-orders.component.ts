import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../../../../services/hotel.service';

interface DrinkOrder {
  _id?: string;
  orderId: string;
  roomNumber: string;
  guestName: string;
  items: string[];
  totalPrice: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  category: string;
  assignedStaff?: string;
  orderTime: string;
  prepStartTime?: string;
  prepEndTime?: string;
  deliveryStartTime?: string;
  deliveryEndTime?: string;
  specialInstructions?: string;
}

@Component({
  selector: 'app-hotel-drink-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8 space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">🍹 Drink Orders</h1>
          <p class="text-slate-600 mt-1">Manage beverage orders and in-room drinks service</p>
        </div>
        <button
          (click)="refreshOrders()"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
        >
          🔄 Refresh Orders
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-blue-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Total Orders</p>
          <p class="text-2xl font-bold text-slate-900">{{ drinkOrders().length }}</p>
        </div>

        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-yellow-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Pending</p>
          <p class="text-2xl font-bold text-yellow-600">{{ getPendingCount() }}</p>
        </div>

        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-purple-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Preparing</p>
          <p class="text-2xl font-bold text-purple-600">{{ getPreparingCount() }}</p>
        </div>

        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-emerald-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Ready</p>
          <p class="text-2xl font-bold text-emerald-600">{{ getReadyCount() }}</p>
        </div>

        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-cyan-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Revenue</p>
          <p class="text-2xl font-bold text-cyan-600">₦{{ getTotalRevenue() | number }}</p>
        </div>
      </div>

      <!-- Filters & Search -->
      <div class="bg-white rounded-lg p-6 shadow-md space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Search</label>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (change)="filterOrders()"
              placeholder="Search room or guest..."
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              [(ngModel)]="selectedStatus"
              (change)="filterOrders()"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">🟡 Pending</option>
              <option value="preparing">🍹 Preparing</option>
              <option value="ready">✅ Ready</option>
              <option value="delivered">🚚 Delivered</option>
              <option value="cancelled">❌ Cancelled</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Type</label>
            <select
              [(ngModel)]="selectedCategory"
              (change)="filterOrders()"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="hot-beverages">☕ Hot Beverages</option>
              <option value="cold-beverages">🧊 Cold Beverages</option>
              <option value="alcoholic">🍻 Alcoholic</option>
              <option value="mocktails">🍹 Mocktails</option>
              <option value="juices">🥤 Juices</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Sort By</label>
            <select
              [(ngModel)]="sortBy"
              (change)="filterOrders()"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="time-desc">Latest First</option>
              <option value="time-asc">Oldest First</option>
              <option value="price-high">Highest Price</option>
              <option value="price-low">Lowest Price</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading & Error States -->
      @if (isLoading()) {
        <div class="bg-blue-50 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">Loading drink orders...</p>
        </div>
      }

      @if (errorMessage()) {
        <div class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">{{ errorMessage() }}</p>
        </div>
      }

      <!-- Orders Table -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <table class="w-full">
          <thead class="bg-slate-100 border-b border-slate-200">
            <tr>
              <th class="px-6 py-3 text-left text-sm font-semibold text-slate-900">Order ID</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-slate-900">Room</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-slate-900">Guest</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-slate-900">Items</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-slate-900">Amount</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            @if (filteredOrders().length === 0) {
              <tr>
                <td colspan="7" class="px-6 py-8 text-center text-slate-500">
                  <p class="font-medium">No drink orders found</p>
                  <p class="text-sm mt-1">Orders will appear here when guests order beverages</p>
                </td>
              </tr>
            } @else {
              @for (order of filteredOrders(); track order._id) {
                <tr class="hover:bg-slate-50 transition">
                  <td class="px-6 py-4 text-sm font-medium text-slate-900">{{ order.orderId }}</td>
                  <td class="px-6 py-4 text-sm text-slate-700 font-medium">{{ order.roomNumber }}</td>
                  <td class="px-6 py-4 text-sm text-slate-700">{{ order.guestName }}</td>
                  <td class="px-6 py-4 text-sm text-slate-600">
                    <div class="flex flex-wrap gap-1">
                      @for (item of order.items.slice(0, 2); track item) {
                        <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{{ item }}</span>
                      }
                      @if (order.items.length > 2) {
                        <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">+{{ order.items.length - 2 }}</span>
                      }
                    </div>
                  </td>
                  <td class="px-6 py-4 text-sm">
                    <span [class]="getStatusBadgeClass(order.status)">
                      {{ getStatusIcon(order.status) }} {{ order.status | titlecase }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm font-semibold text-slate-900">₦{{ order.totalPrice | number }}</td>
                  <td class="px-6 py-4 text-sm space-x-2">
                    @if (order.status === 'pending') {
                      <button
                        (click)="updateStatus(order, 'preparing')"
                        class="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition text-xs font-medium"
                      >
                        Start
                      </button>
                    }
                    @if (order.status === 'preparing') {
                      <button
                        (click)="updateStatus(order, 'ready')"
                        class="px-3 py-1 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition text-xs font-medium"
                      >
                        Ready
                      </button>
                    }
                    @if (order.status === 'ready') {
                      <button
                        (click)="updateStatus(order, 'delivered')"
                        class="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-xs font-medium"
                      >
                        Deliver
                      </button>
                    }
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: []
})
export class HotelDrinkOrdersComponent implements OnInit {
  isLoading = signal(false);
  errorMessage = signal('');
  searchQuery = signal('');
  selectedStatus = signal('');
  selectedCategory = signal('');
  sortBy = signal('time-desc');

  drinkOrders = signal<DrinkOrder[]>([]);
  filteredOrders = signal<DrinkOrder[]>([]);

  constructor(private hotelService: HotelService) {}

  ngOnInit(): void {
    this.loadDrinkOrders();
  }

  loadDrinkOrders(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    // For now, load food orders and filter for beverages
    // In a real scenario, you'd have a dedicated drinks API endpoint
    this.hotelService.getFoodOrders().subscribe({
      next: (response: any) => {
        if (response.status === 'success' && Array.isArray(response.data)) {
          // Filter orders that contain beverages
          const drinks = response.data.filter((order: any) =>
            order.category === 'beverages' || order.items?.some((item: string) =>
              item.toLowerCase().includes('juice') ||
              item.toLowerCase().includes('coffee') ||
              item.toLowerCase().includes('tea') ||
              item.toLowerCase().includes('water') ||
              item.toLowerCase().includes('smoothie')
            )
          );
          
          // If no drinks found, create sample data for demo
          if (drinks.length === 0) {
            const sampleDrinks: DrinkOrder[] = [
              {
                _id: '1',
                orderId: 'DR-001',
                roomNumber: '201',
                guestName: 'Jane Smith',
                items: ['Espresso', 'Orange Juice'],
                totalPrice: 10.98,
                status: 'pending',
                category: 'hot-beverages',
                orderTime: new Date().toISOString()
              },
              {
                _id: '2',
                orderId: 'DR-002',
                roomNumber: '305',
                guestName: 'Mike Johnson',
                items: ['Iced Tea', 'Smoothie'],
                totalPrice: 13.98,
                status: 'preparing',
                category: 'cold-beverages',
                orderTime: new Date(Date.now() - 5 * 60000).toISOString()
              }
            ];
            this.drinkOrders.set(sampleDrinks);
          } else {
            this.drinkOrders.set(drinks);
          }

          this.filterOrders();
          console.log('✅ Drink orders loaded:', this.drinkOrders().length);
        }
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading drink orders:', error);
        this.errorMessage.set('Failed to load drink orders. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  filterOrders(): void {
    let filtered = this.drinkOrders();

    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(order =>
        order.roomNumber.toLowerCase().includes(query) ||
        order.guestName.toLowerCase().includes(query) ||
        order.orderId.toLowerCase().includes(query)
      );
    }

    if (this.selectedStatus()) {
      filtered = filtered.filter(order => order.status === this.selectedStatus());
    }

    if (this.selectedCategory()) {
      filtered = filtered.filter(order => order.category === this.selectedCategory());
    }

    // Sort
    filtered.sort((a, b) => {
      switch (this.sortBy()) {
        case 'time-desc':
          return new Date(b.orderTime).getTime() - new Date(a.orderTime).getTime();
        case 'time-asc':
          return new Date(a.orderTime).getTime() - new Date(b.orderTime).getTime();
        case 'price-high':
          return b.totalPrice - a.totalPrice;
        case 'price-low':
          return a.totalPrice - b.totalPrice;
        default:
          return 0;
      }
    });

    this.filteredOrders.set(filtered);
  }

  updateStatus(order: DrinkOrder, newStatus: string): void {
    if (!order._id) return;

    // Call backend API to update the status
    this.hotelService.updateFoodOrderStatus(order._id, newStatus).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          // Update local drink order after successful backend update
          const updatedOrders = this.drinkOrders().map(o =>
            o._id === order._id ? { ...o, status: newStatus as any } : o
          );
          this.drinkOrders.set(updatedOrders);
          this.filterOrders();
          console.log('✅ Drink order status updated to:', newStatus);
        }
      },
      error: (error: any) => {
        console.error('Error updating drink order status:', error);
        this.errorMessage.set('Failed to update drink order status');
      }
    });
  }

  refreshOrders(): void {
    this.loadDrinkOrders();
  }

  getPendingCount(): number {
    return this.drinkOrders().filter(o => o.status === 'pending').length;
  }

  getPreparingCount(): number {
    return this.drinkOrders().filter(o => o.status === 'preparing').length;
  }

  getReadyCount(): number {
    return this.drinkOrders().filter(o => o.status === 'ready').length;
  }

  getTotalRevenue(): number {
    return this.drinkOrders()
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + o.totalPrice, 0);
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'pending': '🟡',
      'preparing': '🍹',
      'ready': '✅',
      'delivered': '🚚',
      'cancelled': '❌'
    };
    return icons[status] || '•';
  }

  getStatusBadgeClass(status: string): string {
    const baseClass = 'px-3 py-1 rounded-full text-sm font-medium';
    const classes: { [key: string]: string } = {
      'pending': `${baseClass} bg-yellow-100 text-yellow-800`,
      'preparing': `${baseClass} bg-purple-100 text-purple-800`,
      'ready': `${baseClass} bg-emerald-100 text-emerald-800`,
      'delivered': `${baseClass} bg-blue-100 text-blue-800`,
      'cancelled': `${baseClass} bg-red-100 text-red-800`
    };
    return classes[status] || baseClass;
  }
}
