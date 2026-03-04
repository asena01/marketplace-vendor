import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div>
        <h2 class="text-3xl font-bold text-gray-800 mb-2">Payment Processing</h2>
        <p class="text-gray-600">View and manage payment transactions</p>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <p class="text-gray-600 text-sm font-medium">Total Completed</p>
          <p class="text-3xl font-bold text-gray-800">{{ completedCount() }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <p class="text-gray-600 text-sm font-medium">Pending Transactions</p>
          <p class="text-3xl font-bold text-gray-800">{{ pendingCount() }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <p class="text-gray-600 text-sm font-medium">Total Commission</p>
          <p class="text-3xl font-bold text-gray-800">
            \${{ totalCommission().toLocaleString('en-US', { maximumFractionDigits: 2 }) }}
          </p>
        </div>
      </div>

      <!-- Search and Filter -->
      <div class="bg-white rounded-lg shadow-md p-4 flex gap-4">
        <input
          type="text"
          [(ngModel)]="searchTerm"
          placeholder="Search transactions..."
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          [(ngModel)]="filterStatus"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <button
          (click)="loadPayments()"
          class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition"
        >
          🔄 Refresh
        </button>
      </div>

      <!-- Payments Table -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        @if (payments().length > 0) {
          <table class="w-full">
            <thead class="bg-gray-200 border-b border-gray-300">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Transaction ID</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Organization</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Amount</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Commission</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (payment of payments(); track payment._id) {
                <tr class="border-b border-gray-200 hover:bg-gray-50">
                  <td class="px-6 py-4 text-sm font-mono text-gray-600">{{ payment.transactionId }}</td>
                  <td class="px-6 py-4 text-sm text-gray-800">{{ payment.organization?.name || 'N/A' }}</td>
                  <td class="px-6 py-4 text-sm font-semibold text-gray-800">
                    \${{ payment.amount?.toLocaleString('en-US', { maximumFractionDigits: 2 }) || 0 }}
                  </td>
                  <td class="px-6 py-4 text-sm text-green-600 font-semibold">
                    \${{ payment.platformCommission?.toLocaleString('en-US', { maximumFractionDigits: 2 }) || 0 }}
                  </td>
                  <td class="px-6 py-4 text-sm">
                    @switch (payment.status) {
                      @case ('completed') {
                        <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          ✅ Completed
                        </span>
                      }
                      @case ('pending') {
                        <span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                          ⏳ Pending
                        </span>
                      }
                      @case ('failed') {
                        <span class="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                          ❌ Failed
                        </span>
                      }
                      @case ('refunded') {
                        <span class="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">
                          🔄 Refunded
                        </span>
                      }
                    }
                  </td>
                  <td class="px-6 py-4 text-sm">
                    <span class="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-semibold">
                      {{ payment.type }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm space-x-2">
                    @if (payment.status !== 'refunded') {
                      <button
                        (click)="refundPayment(payment._id)"
                        class="text-orange-600 hover:text-orange-800 font-semibold"
                      >
                        🔄 Refund
                      </button>
                    }
                    <button
                      (click)="viewDetails(payment._id)"
                      class="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      👁️ View
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        } @else if (isLoading()) {
          <div class="p-12 text-center">
            <div class="inline-block animate-spin text-4xl mb-4">⏳</div>
            <p class="text-gray-600">Loading payments...</p>
          </div>
        } @else {
          <div class="p-12 text-center text-gray-600">
            <p class="text-lg">No payments found</p>
          </div>
        }

        <!-- Pagination Controls -->
        @if (totalPages() > 1 && payments().length > 0) {
          <div class="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div class="text-sm text-gray-600">
              Page {{ currentPage() }} of {{ totalPages() }} ({{ totalItems() }} total transactions)
            </div>
            <div class="flex items-center gap-2">
              <button
                (click)="previousPage()"
                [disabled]="currentPage() === 1"
                class="px-3 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 transition font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>

              <div class="flex gap-1">
                @for (page of getPageNumbers(); track page) {
                  <button
                    (click)="goToPage(page)"
                    [class.bg-blue-600]="page === currentPage()"
                    [class.text-white]="page === currentPage()"
                    [class.bg-gray-300]="page !== currentPage()"
                    [class.text-gray-900]="page !== currentPage()"
                    class="px-3 py-2 rounded hover:opacity-80 transition font-semibold text-sm"
                  >
                    {{ page }}
                  </button>
                }
              </div>

              <button
                (click)="nextPage()"
                [disabled]="currentPage() === totalPages()"
                class="px-3 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 transition font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        }
      </div>

      <!-- Error Message -->
      @if (error()) {
        <div class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">❌ Error</p>
          <p class="text-sm mt-1">{{ error() }}</p>
        </div>
      }
    </div>
  `,
  styles: []
})
export class AdminPaymentsComponent implements OnInit {
  payments = signal<any[]>([]);
  isLoading = signal(true);
  error = signal('');
  searchTerm = '';
  filterStatus = '';

  // Pagination
  currentPage = signal(1);
  pageSize = signal(10);
  totalItems = signal(0);
  totalPages = signal(0);

  constructor(private adminService: AdminService) {}

  get completedCount(): () => number {
    return () => this.payments().filter(p => p.status === 'completed').length;
  }

  get pendingCount(): () => number {
    return () => this.payments().filter(p => p.status === 'pending').length;
  }

  get totalCommission(): () => number {
    return () => this.payments()
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + (p.platformCommission || 0), 0);
  }

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.isLoading.set(true);
    this.error.set('');

    const status = this.filterStatus || undefined;
    this.adminService.getPayments(this.currentPage(), this.pageSize(), status).subscribe({
      next: (response) => {
        if (response.success) {
          this.payments.set(response.data || []);

          // Update pagination info from response
          if (response.pagination) {
            this.totalItems.set(response.pagination.total);
            this.totalPages.set(response.pagination.pages);
          }

          console.log('✅ Payments loaded:', response.data?.length);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Error loading payments:', error);
        this.error.set(error.error?.message || 'Failed to load payments');
        this.isLoading.set(false);
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadPayments();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  previousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    if (total > 0) pages.push(1);
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      if (!pages.includes(i)) pages.push(i);
    }
    if (total > 1 && !pages.includes(total)) pages.push(total);

    return pages.sort((a, b) => a - b);
  }

  refundPayment(paymentId: string): void {
    if (!confirm('Are you sure you want to refund this payment?')) {
      return;
    }

    this.adminService.refundPayment(paymentId).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('✅ Payment refunded');
          // If only one payment on page and it's the last page, go back one page
          if (this.payments().length === 1 && this.currentPage() > 1) {
            this.previousPage();
          } else {
            this.loadPayments();
          }
        }
      },
      error: (error) => {
        this.error.set(error.error?.message || 'Failed to refund payment');
      }
    });
  }

  viewDetails(paymentId: string): void {
    console.log('Viewing payment details:', paymentId);
    // Can expand to show detailed modal later
  }
}
