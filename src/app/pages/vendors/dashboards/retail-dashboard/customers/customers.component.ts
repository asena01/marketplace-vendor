import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

interface Customer {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  totalPurchases: number;
  totalSpent: number;
  joinDate: string;
  lastPurchaseDate?: string;
  status: 'active' | 'inactive' | 'vip';
}

@Component({
  selector: 'app-retail-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="p-8 space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Customer Management</h1>
          <p class="text-slate-600 mt-1">View and manage your customers</p>
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="bg-blue-50 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg">
          <p class="font-semibold flex items-center gap-2">
            <mat-icon class="text-lg animate-spin">refresh</mat-icon>
            Loading customers...
          </p>
        </div>
      }

      <!-- Error State -->
      @if (errorMessage()) {
        <div class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <mat-icon class="text-lg">error</mat-icon>
          <p class="font-semibold">{{ errorMessage() }}</p>
        </div>
      }

      <!-- Customer Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-blue-500">
          <p class="text-slate-600 text-sm font-medium">Total Customers</p>
          <p class="text-2xl font-bold text-slate-900">{{ customers().length }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-green-500">
          <p class="text-slate-600 text-sm font-medium">Active Customers</p>
          <p class="text-2xl font-bold text-green-600">{{ activeCount() }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-orange-500">
          <p class="text-slate-600 text-sm font-medium">VIP Customers</p>
          <p class="text-2xl font-bold text-orange-600">{{ vipCount() }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-purple-500">
          <p class="text-slate-600 text-sm font-medium">Total Revenue</p>
          <p class="text-2xl font-bold text-purple-600"><span>$</span>{{ totalRevenue() }}</p>
        </div>
      </div>

      <!-- Search & Filter -->
      <div class="bg-white rounded-lg p-6 shadow-md space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Search</label>
            <input
              type="text"
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event); filterCustomers()"
              placeholder="Search by name or email..."
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              [ngModel]="filterStatus"
              (ngModelChange)="filterStatus = $event; filterCustomers()"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Customers</option>
              <option value="active">Active</option>
              <option value="vip">VIP</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Sort By</label>
            <select
              [ngModel]="sortBy"
              (ngModelChange)="sortBy = $event; filterCustomers()"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="recent">Recently Active</option>
              <option value="spent">Highest Spender</option>
              <option value="purchases">Most Purchases</option>
              <option value="joined">Recently Joined</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Customers Table -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-100 border-b border-slate-200">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Customer Name</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Email</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Phone</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Purchases</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Total Spent</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Last Purchase</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
              </tr>
            </thead>
            <tbody>
              @if (filteredCustomers().length === 0) {
                <tr>
                  <td colspan="7" class="px-6 py-8 text-center text-slate-600">
                    No customers found
                  </td>
                </tr>
              } @else {
                @for (customer of filteredCustomers(); track customer._id) {
                  <tr class="border-b border-slate-200 hover:bg-slate-50 transition">
                    <td class="px-6 py-4 font-medium text-slate-900">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {{ customer.name.charAt(0) }}
                        </div>
                        <span>{{ customer.name }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-slate-600 text-sm">{{ customer.email }}</td>
                    <td class="px-6 py-4 text-slate-600 text-sm">{{ customer.phone || '-' }}</td>
                    <td class="px-6 py-4 font-medium text-slate-900">{{ customer.totalPurchases }}</td>
                    <td class="px-6 py-4 font-medium text-slate-900"><span>$</span>{{ customer.totalSpent.toFixed(2) }}</td>
                    <td class="px-6 py-4 text-slate-600 text-sm">
                      {{ customer.lastPurchaseDate ? (customer.lastPurchaseDate | date: 'short') : 'No purchases' }}
                    </td>
                    <td class="px-6 py-4">
                      <span
                        [ngClass]="{
                          'bg-green-100 text-green-700': customer.status === 'active',
                          'bg-orange-100 text-orange-700': customer.status === 'vip',
                          'bg-slate-100 text-slate-700': customer.status === 'inactive'
                        }"
                        class="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit"
                      >
                        @if (customer.status === 'vip') {
                          <mat-icon class="text-xs">star</mat-icon>
                        } @else if (customer.status === 'active') {
                          <mat-icon class="text-xs">check_circle</mat-icon>
                        } @else {
                          <mat-icon class="text-xs">circle_outline</mat-icon>
                        }
                        <span>{{ customer.status | titlecase }}</span>
                      </span>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Top Customers -->
      @if (topCustomers().length > 0) {
        <div class="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
          <div class="flex items-center gap-3 mb-4">
            <mat-icon class="text-purple-600 text-2xl">star</mat-icon>
            <h3 class="text-lg font-bold text-slate-900">Top Customers by Spending</h3>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            @for (customer of topCustomers(); track customer._id; let idx = $index) {
              <div class="bg-white rounded-lg p-4 shadow-md border-t-4" [ngClass]="{
                'border-yellow-400': idx === 0,
                'border-gray-400': idx === 1,
                'border-orange-400': idx === 2
              }">
                <div class="flex items-center gap-2 mb-3">
                  @if (idx === 0) {
                    <mat-icon class="text-yellow-500">emoji_events</mat-icon>
                    <span class="text-sm font-semibold text-yellow-600">Gold</span>
                  } @else if (idx === 1) {
                    <mat-icon class="text-gray-500">emoji_events</mat-icon>
                    <span class="text-sm font-semibold text-gray-600">Silver</span>
                  } @else {
                    <mat-icon class="text-orange-500">emoji_events</mat-icon>
                    <span class="text-sm font-semibold text-orange-600">Bronze</span>
                  }
                </div>
                <p class="font-bold text-slate-900 mb-1">{{ customer.name }}</p>
                <p class="text-sm text-slate-600 mb-3">{{ customer.email }}</p>
                <div class="border-t border-slate-200 pt-2">
                  <p class="text-xs text-slate-600">Total Spent</p>
                  <p class="text-xl font-bold text-slate-900"><span>$</span>{{ customer.totalSpent.toFixed(2) }}</p>
                </div>
              </div>
            }
          </div>
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
export class RetailCustomersComponent implements OnInit {
  customers = signal<Customer[]>([
    {
      _id: '1',
      name: 'John Smith',
      email: 'john@example.com',
      phone: '+1-234-567-8900',
      address: '123 Main St, City',
      totalPurchases: 15,
      totalSpent: 1250.00,
      joinDate: new Date(2023, 0, 15).toISOString(),
      lastPurchaseDate: new Date(2024, 2, 5).toISOString(),
      status: 'vip'
    },
    {
      _id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '+1-234-567-8901',
      address: '456 Oak Ave, Town',
      totalPurchases: 8,
      totalSpent: 645.50,
      joinDate: new Date(2023, 6, 22).toISOString(),
      lastPurchaseDate: new Date(2024, 2, 1).toISOString(),
      status: 'active'
    },
    {
      _id: '3',
      name: 'Michael Chen',
      email: 'michael@example.com',
      phone: '+1-234-567-8902',
      address: '789 Pine Rd, Village',
      totalPurchases: 3,
      totalSpent: 180.75,
      joinDate: new Date(2024, 1, 10).toISOString(),
      lastPurchaseDate: new Date(2024, 2, 3).toISOString(),
      status: 'active'
    },
    {
      _id: '4',
      name: 'Emma Wilson',
      email: 'emma@example.com',
      phone: '+1-234-567-8903',
      totalPurchases: 12,
      totalSpent: 980.00,
      joinDate: new Date(2023, 3, 5).toISOString(),
      lastPurchaseDate: new Date(2024, 1, 28).toISOString(),
      status: 'active'
    },
    {
      _id: '5',
      name: 'David Brown',
      email: 'david@example.com',
      phone: '+1-234-567-8904',
      totalPurchases: 2,
      totalSpent: 92.00,
      joinDate: new Date(2024, 0, 20).toISOString(),
      lastPurchaseDate: new Date(2024, 1, 15).toISOString(),
      status: 'inactive'
    }
  ]);
  
  filteredCustomers = signal<Customer[]>([]);
  searchQuery = signal('');
  filterStatus = '';
  sortBy = 'recent';
  isLoading = signal(false);
  errorMessage = signal('');

  // Computed signals
  activeCount = computed(() =>
    this.customers().filter(c => c.status === 'active' || c.status === 'vip').length
  );
  vipCount = computed(() =>
    this.customers().filter(c => c.status === 'vip').length
  );
  totalRevenue = computed(() =>
    this.customers().reduce((sum, c) => sum + c.totalSpent, 0).toFixed(2)
  );
  topCustomers = computed(() =>
    [...this.customers()].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 3)
  );

  ngOnInit(): void {
    this.filterCustomers();
  }

  filterCustomers(): void {
    let filtered = this.customers();

    // Filter by search query
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (this.filterStatus) {
      filtered = filtered.filter(c => c.status === this.filterStatus);
    }

    // Sort
    if (this.sortBy === 'spent') {
      filtered.sort((a, b) => b.totalSpent - a.totalSpent);
    } else if (this.sortBy === 'purchases') {
      filtered.sort((a, b) => b.totalPurchases - a.totalPurchases);
    } else if (this.sortBy === 'joined') {
      filtered.sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime());
    } else {
      // Default: recent purchases
      filtered.sort((a, b) => 
        new Date(b.lastPurchaseDate || 0).getTime() - new Date(a.lastPurchaseDate || 0).getTime()
      );
    }

    this.filteredCustomers.set(filtered);
  }
}
