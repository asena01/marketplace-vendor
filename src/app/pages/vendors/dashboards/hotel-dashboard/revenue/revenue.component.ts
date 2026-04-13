import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../../../../services/hotel.service';

interface Transaction {
  _id?: string;
  type: 'room' | 'food' | 'drink' | 'service';
  description: string;
  amount: number;
  bookingId?: string;
  orderId?: string;
  guestName: string;
  status: 'pending' | 'completed' | 'cancelled';
  timestamp: string;
  roomNumber?: string;
}

interface IncomeReportEntry {
  type: 'room-booking' | 'food-order' | 'drink-order' | 'room-service' | 'inhouse-service';
  category: string;
  label: string;
  guestName: string;
  roomNumber?: string;
  amount: number;
  status: string;
  occurredAt: string;
}

interface RevenueStats {
  totalRevenue: number;
  roomRevenue: number;
  foodRevenue: number;
  drinkRevenue: number;
  serviceRevenue: number;
  totalTransactions: number;
  pendingAmount: number;
}

@Component({
  selector: 'app-revenue',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8 space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold text-slate-900">Revenue Dashboard</h1>
        <p class="text-slate-600 mt-1">Track all hotel income from rooms, food, drinks, and services</p>
      </div>

      <!-- Revenue Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Total Revenue -->
        <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 shadow-md border-l-4 border-emerald-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-slate-600 text-sm font-medium">Total Revenue</p>
              <p class="text-3xl font-bold text-emerald-600 mt-2">₦{{ formatCurrency(revenueStats().totalRevenue) }}</p>
            </div>
            <div class="text-5xl opacity-20">💰</div>
          </div>
        </div>

        <!-- Pending Amount -->
        <div class="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-6 shadow-md border-l-4 border-amber-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-slate-600 text-sm font-medium">Pending</p>
              <p class="text-3xl font-bold text-amber-600 mt-2">₦{{ formatCurrency(revenueStats().pendingAmount) }}</p>
            </div>
            <div class="text-5xl opacity-20">⏳</div>
          </div>
        </div>

        <!-- Total Transactions -->
        <div class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6 shadow-md border-l-4 border-blue-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-slate-600 text-sm font-medium">Total Transactions</p>
              <p class="text-3xl font-bold text-blue-600 mt-2">{{ revenueStats().totalTransactions }}</p>
            </div>
            <div class="text-5xl opacity-20">📊</div>
          </div>
        </div>
      </div>

      <!-- Revenue Breakdown -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <!-- Room Revenue -->
        <div class="bg-white rounded-lg p-4 shadow-md border-t-4 border-blue-500">
          <p class="text-slate-600 text-xs font-semibold uppercase">Room Revenue</p>
          <p class="text-2xl font-bold text-blue-600 mt-2">₦{{ formatCurrency(revenueStats().roomRevenue) }}</p>
          <p class="text-xs text-slate-500 mt-2">{{ getPercentage(revenueStats().roomRevenue) }}%</p>
        </div>

        <!-- Food Revenue -->
        <div class="bg-white rounded-lg p-4 shadow-md border-t-4 border-orange-500">
          <p class="text-slate-600 text-xs font-semibold uppercase">Food Revenue</p>
          <p class="text-2xl font-bold text-orange-600 mt-2">₦{{ formatCurrency(revenueStats().foodRevenue) }}</p>
          <p class="text-xs text-slate-500 mt-2">{{ getPercentage(revenueStats().foodRevenue) }}%</p>
        </div>

        <!-- Drink Revenue -->
        <div class="bg-white rounded-lg p-4 shadow-md border-t-4 border-red-500">
          <p class="text-slate-600 text-xs font-semibold uppercase">Drink Revenue</p>
          <p class="text-2xl font-bold text-red-600 mt-2">₦{{ formatCurrency(revenueStats().drinkRevenue) }}</p>
          <p class="text-xs text-slate-500 mt-2">{{ getPercentage(revenueStats().drinkRevenue) }}%</p>
        </div>

        <!-- Service Revenue -->
        <div class="bg-white rounded-lg p-4 shadow-md border-t-4 border-purple-500">
          <p class="text-slate-600 text-xs font-semibold uppercase">Service Revenue</p>
          <p class="text-2xl font-bold text-purple-600 mt-2">₦{{ formatCurrency(revenueStats().serviceRevenue) }}</p>
          <p class="text-xs text-slate-500 mt-2">{{ getPercentage(revenueStats().serviceRevenue) }}%</p>
        </div>

        <!-- Completed vs Pending -->
        <div class="bg-white rounded-lg p-4 shadow-md border-t-4 border-green-500">
          <p class="text-slate-600 text-xs font-semibold uppercase">Completion Rate</p>
          <p class="text-2xl font-bold text-green-600 mt-2">{{ getCompletionRate() }}%</p>
          <p class="text-xs text-slate-500 mt-2">{{ revenueStats().totalTransactions - getPendingCount() }} completed</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg p-4 shadow-md">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Report Period</label>
            <select
              [(ngModel)]="reportPeriod"
              (change)="loadRevenueReport()"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">
              {{ reportPeriod === 'monthly' ? 'Month' : 'Date' }}
            </label>
            @if (reportPeriod === 'monthly') {
              <input
                type="month"
                [(ngModel)]="reportMonth"
                (change)="loadRevenueReport()"
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            } @else {
              <input
                type="date"
                [(ngModel)]="reportDate"
                (change)="loadRevenueReport()"
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            }
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Filter by Type</label>
            <select
              [(ngModel)]="selectedType"
              (change)="filterTransactions()"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Types</option>
              <option value="room">Room</option>
              <option value="food">Food</option>
              <option value="drink">Drink</option>
              <option value="service">Service</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Filter by Status</label>
            <select
              [(ngModel)]="selectedStatus"
              (change)="filterTransactions()"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Search Guest</label>
            <input
              type="text"
              [(ngModel)]="searchGuest"
              (keyup)="filterTransactions()"
              placeholder="Search guest name..."
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      @if (isLoading()) {
        <div class="bg-blue-50 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg">
          Loading revenue report...
        </div>
      }

      @if (errorMessage()) {
        <div class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          {{ errorMessage() }}
        </div>
      }

      <!-- Transactions Table -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-100 border-b border-slate-200">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Guest Name</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Type</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Description</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Amount</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Date & Time</th>
              </tr>
            </thead>
            <tbody>
              @if (filteredTransactions().length === 0) {
                <tr>
                  <td colspan="6" class="px-6 py-8 text-center text-slate-600">
                    No transactions found
                  </td>
                </tr>
              } @else {
                @for (transaction of paginatedTransactions(); track transaction._id) {
                  <tr class="border-b border-slate-200 hover:bg-slate-50 transition">
                    <td class="px-6 py-4 font-medium text-slate-900">{{ transaction.guestName }}</td>
                    <td class="px-6 py-4">
                      <span
                        class="px-3 py-1 rounded-full text-xs font-medium"
                        [ngClass]="{
                          'bg-blue-100 text-blue-700': transaction.type === 'room',
                          'bg-orange-100 text-orange-700': transaction.type === 'food',
                          'bg-red-100 text-red-700': transaction.type === 'drink',
                          'bg-purple-100 text-purple-700': transaction.type === 'service'
                        }"
                      >
                        {{ transaction.type | titlecase }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-slate-600">{{ transaction.description }}</td>
                    <td class="px-6 py-4 font-semibold text-slate-900">₦{{ transaction.amount.toLocaleString() }}</td>
                    <td class="px-6 py-4">
                      <span
                        class="px-3 py-1 rounded-full text-xs font-medium"
                        [ngClass]="{
                          'bg-green-100 text-green-700': transaction.status === 'completed',
                          'bg-yellow-100 text-yellow-700': transaction.status === 'pending',
                          'bg-red-100 text-red-700': transaction.status === 'cancelled'
                        }"
                      >
                        {{ transaction.status | titlecase }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-slate-600">{{ formatDate(transaction.timestamp) }}</td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
        @if (filteredTransactions().length > 0 && totalPages() > 1) {
          <div class="flex items-center justify-between px-6 py-4 border-t bg-slate-50">
            <p class="text-sm text-slate-500">
              Showing {{ pageStartIndex() + 1 }}-{{ pageEndIndex() }} of {{ filteredTransactions().length }} transactions
            </p>
            <div class="flex items-center gap-2">
              <button
                (click)="goToPage(currentPage - 1)"
                [disabled]="currentPage === 1"
                class="px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition"
              >
                Previous
              </button>
              <span class="text-sm font-medium text-slate-700">Page {{ currentPage }} of {{ totalPages() }}</span>
              <button
                (click)="goToPage(currentPage + 1)"
                [disabled]="currentPage === totalPages()"
                class="px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition"
              >
                Next
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: []
})
export class RevenueComponent implements OnInit {
  transactions = signal<Transaction[]>([]);
  filteredTransactions = signal<Transaction[]>([]);
  paginatedTransactions = signal<Transaction[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');
  revenueStats = signal<RevenueStats>({
    totalRevenue: 0,
    roomRevenue: 0,
    foodRevenue: 0,
    drinkRevenue: 0,
    serviceRevenue: 0,
    totalTransactions: 0,
    pendingAmount: 0
  });

  selectedType = '';
  selectedStatus = '';
  searchGuest = '';
  reportPeriod: 'daily' | 'monthly' = 'daily';
  reportDate = this.getTodayDateInput();
  reportMonth = this.getCurrentMonthInput();
  currentPage = 1;
  readonly itemsPerPage = 10;

  constructor(private hotelService: HotelService) {}

  ngOnInit() {
    this.loadRevenueReport();
  }

  loadRevenueReport() {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.hotelService.getIncomeReport(this.reportPeriod, this.getSelectedReportDate()).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);

        if (response.status === 'success' && response.data?.entries) {
          const entries = response.data.entries as IncomeReportEntry[];
          this.transactions.set(entries.map((entry, index) => this.mapReportEntryToTransaction(entry, index)));
          this.revenueStats.set(this.buildStatsFromReport(entries));
        } else {
          this.transactions.set([]);
          this.revenueStats.set(this.getEmptyStats());
          this.errorMessage.set(response.message || 'No revenue report data available');
        }
        this.filterTransactions();
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Error loading revenue report:', error);
        this.transactions.set([]);
        this.revenueStats.set(this.getEmptyStats());
        this.errorMessage.set(error.message || 'Failed to load revenue report');
        this.filterTransactions();
      }
    });
  }

  getEmptyStats(): RevenueStats {
    return {
      totalRevenue: 0,
      roomRevenue: 0,
      foodRevenue: 0,
      drinkRevenue: 0,
      serviceRevenue: 0,
      totalTransactions: 0,
      pendingAmount: 0
    };
  }

  buildStatsFromReport(entries: IncomeReportEntry[]): RevenueStats {
    const stats = this.getEmptyStats();
    stats.totalTransactions = entries.length;

    entries.forEach((entry) => {
      const amount = entry.amount || 0;
      stats.totalRevenue += amount;

      if (entry.type === 'room-booking') {
        stats.roomRevenue += amount;
      } else if (entry.type === 'drink-order') {
        stats.drinkRevenue += amount;
      } else if (entry.type === 'inhouse-service') {
        stats.serviceRevenue += amount;
      } else {
        stats.foodRevenue += amount;
      }

      if (this.mapEntryStatus(entry.status) === 'pending') {
        stats.pendingAmount += amount;
      }
    });

    return stats;
  }

  mapReportEntryToTransaction(entry: IncomeReportEntry, index: number): Transaction {
    return {
      _id: `${entry.type}-${entry.occurredAt}-${index}`,
      type: this.mapEntryType(entry.type),
      description: entry.label,
      amount: entry.amount || 0,
      guestName: entry.guestName || 'Unknown Guest',
      status: this.mapEntryStatus(entry.status),
      timestamp: entry.occurredAt,
      roomNumber: entry.roomNumber
    };
  }

  mapEntryType(entryType: IncomeReportEntry['type']): Transaction['type'] {
    if (entryType === 'room-booking') return 'room';
    if (entryType === 'drink-order') return 'drink';
    if (entryType === 'inhouse-service') return 'service';
    return 'food';
  }

  mapEntryStatus(status: string): Transaction['status'] {
    if (['checked-out', 'delivered', 'completed', 'paid'].includes(status)) {
      return 'completed';
    }
    if (status === 'cancelled') {
      return 'cancelled';
    }
    return 'pending';
  }

  getSelectedReportDate(): string {
    return this.reportPeriod === 'monthly' ? this.reportMonth : this.reportDate;
  }

  getTodayDateInput(): string {
    return new Date().toISOString().slice(0, 10);
  }

  getCurrentMonthInput(): string {
    return new Date().toISOString().slice(0, 7);
  }

  filterTransactions() {
    let filtered = this.transactions();

    if (this.selectedType) {
      filtered = filtered.filter(t => t.type === this.selectedType);
    }

    if (this.selectedStatus) {
      filtered = filtered.filter(t => t.status === this.selectedStatus);
    }

    if (this.searchGuest) {
      filtered = filtered.filter(t =>
        t.guestName.toLowerCase().includes(this.searchGuest.toLowerCase())
      );
    }

    this.filteredTransactions.set(filtered);
    this.currentPage = 1;
    this.updatePaginatedTransactions();
  }

  updatePaginatedTransactions(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedTransactions.set(this.filteredTransactions().slice(start, end));
  }

  totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredTransactions().length / this.itemsPerPage));
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage = page;
    this.updatePaginatedTransactions();
  }

  pageStartIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  pageEndIndex(): number {
    return Math.min(this.pageStartIndex() + this.itemsPerPage, this.filteredTransactions().length);
  }

  getPercentage(amount: number): number {
    const total = this.revenueStats().totalRevenue;
    return total > 0 ? Math.round((amount / total) * 100) : 0;
  }

  getCompletionRate(): number {
    const total = this.revenueStats().totalTransactions;
    const completed = this.transactions().filter(t => t.status === 'completed').length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  getPendingCount(): number {
    return this.transactions().filter(t => t.status === 'pending').length;
  }

  formatCurrency(amount: number): string {
    return amount.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
