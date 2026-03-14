import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ReturnService, Return } from '../../../../../services/return.service';

@Component({
  selector: 'app-retail-returns',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="p-8 space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Returns Management</h1>
          <p class="text-slate-600 mt-1">Manage product return requests and refunds</p>
        </div>
        <div class="flex gap-2">
          <button
            (click)="exportReturns()"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
          >
            <mat-icon>download</mat-icon>
            Export
          </button>
        </div>
      </div>

      <!-- Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-blue-500">
          <p class="text-slate-600 text-sm font-medium">Total Returns</p>
          <p class="text-2xl font-bold text-slate-900">{{ totalReturns() }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-yellow-500">
          <p class="text-slate-600 text-sm font-medium">Pending Approval</p>
          <p class="text-2xl font-bold text-yellow-600">{{ pendingReturns() }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-green-500">
          <p class="text-slate-600 text-sm font-medium">Approved</p>
          <p class="text-2xl font-bold text-green-600">{{ approvedReturns() }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-red-500">
          <p class="text-slate-600 text-sm font-medium">Rejected</p>
          <p class="text-2xl font-bold text-red-600">{{ rejectedReturns() }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-purple-500">
          <p class="text-slate-600 text-sm font-medium">Total Refunds</p>
          <p class="text-2xl font-bold text-purple-600">\${{ totalRefundAmount() | number: '1.2-2' }}</p>
        </div>
      </div>

      <!-- Search & Filter -->
      <div class="bg-white rounded-lg p-6 shadow-md space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Search</label>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (keyup.enter)="loadReturns()"
              placeholder="Return ID, Order ID..."
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              [(ngModel)]="selectedStatus"
              (change)="loadReturns()"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="shipped">Shipped</option>
              <option value="received">Received</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Refund Status</label>
            <select
              [(ngModel)]="selectedRefundStatus"
              (change)="loadReturns()"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Refund Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Sort By</label>
            <select
              [(ngModel)]="sortBy"
              (change)="loadReturns()"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="-createdAt">Latest First</option>
              <option value="refundAmount">Lowest Refund</option>
              <option value="-refundAmount">Highest Refund</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Per Page</label>
            <select
              [(ngModel)]="pageSize"
              (change)="currentPage.set(1); loadReturns()"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Returns Table -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-100 border-b border-slate-200">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Return ID</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Order ID</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Customer</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Items</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Refund Amount</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Refund Status</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Date</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              @if (isLoading()) {
                <tr>
                  <td colspan="9" class="px-6 py-8 text-center">
                    <div class="flex items-center justify-center gap-2">
                      <mat-icon class="animate-spin">refresh</mat-icon>
                      <span>Loading returns...</span>
                    </div>
                  </td>
                </tr>
              } @else if (returns().length === 0) {
                <tr>
                  <td colspan="9" class="px-6 py-8 text-center text-slate-600">
                    No returns found
                  </td>
                </tr>
              } @else {
                @for (returnItem of returns(); track returnItem._id) {
                  <tr class="border-b border-slate-200 hover:bg-slate-50 transition">
                    <td class="px-6 py-4 font-medium text-slate-900">{{ returnItem.returnId }}</td>
                    <td class="px-6 py-4 text-slate-600">{{ returnItem.orderId }}</td>
                    <td class="px-6 py-4">
                      <div class="text-sm">
                        <p class="font-medium text-slate-900">{{ returnItem.customerName }}</p>
                        <p class="text-slate-500 text-xs">{{ returnItem.customerEmail }}</p>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-sm text-slate-600">
                      {{ returnItem.items.length }} item{{ returnItem.items.length !== 1 ? 's' : '' }}
                    </td>
                    <td class="px-6 py-4 font-medium text-slate-900">\${{ returnItem.refundAmount | number: '1.2-2' }}</td>
                    <td class="px-6 py-4">
                      <span
                        [ngClass]="{
                          'bg-yellow-100 text-yellow-700': returnItem.status === 'pending',
                          'bg-green-100 text-green-700': returnItem.status === 'approved',
                          'bg-red-100 text-red-700': returnItem.status === 'rejected',
                          'bg-blue-100 text-blue-700': returnItem.status === 'shipped',
                          'bg-purple-100 text-purple-700': returnItem.status === 'received',
                          'bg-cyan-100 text-cyan-700': returnItem.status === 'completed'
                        }"
                        class="px-3 py-1 rounded-full text-xs font-medium inline-block"
                      >
                        {{ returnItem.status | titlecase }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <span
                        [ngClass]="{
                          'text-yellow-600': returnItem.refundStatus === 'pending',
                          'text-blue-600': returnItem.refundStatus === 'processing',
                          'text-green-600': returnItem.refundStatus === 'completed',
                          'text-red-600': returnItem.refundStatus === 'failed'
                        }"
                        class="text-xs font-medium"
                      >
                        {{ returnItem.refundStatus | titlecase }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-slate-600">
                      {{ returnItem.createdAt | date: 'short' }}
                    </td>
                    <td class="px-6 py-4 space-x-2 text-sm">
                      <button
                        (click)="viewReturn(returnItem)"
                        class="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View
                      </button>
                      @if (returnItem.status === 'pending') {
                        <button
                          (click)="approveReturnModal.set(true); selectedReturn.set(returnItem)"
                          class="text-green-600 hover:text-green-700 font-medium"
                        >
                          Approve
                        </button>
                        <button
                          (click)="rejectReturnModal.set(true); selectedReturn.set(returnItem)"
                          class="text-red-600 hover:text-red-700 font-medium"
                        >
                          Reject
                        </button>
                      }
                      @if (returnItem.status === 'approved' && !returnItem.shippingLabel) {
                        <button
                          (click)="generateLabel(returnItem)"
                          [disabled]="isProcessing()"
                          class="text-orange-600 hover:text-orange-700 font-medium disabled:opacity-50"
                        >
                          Label
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

      <!-- Pagination -->
      @if (totalPages() > 1) {
        <div class="flex justify-center items-center gap-2">
          <button
            (click)="previousPage()"
            [disabled]="currentPage() === 1"
            class="px-4 py-2 border border-slate-300 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          @for (page of paginationArray(); track page) {
            <button
              (click)="goToPage(page)"
              [ngClass]="{
                'bg-blue-600 text-white': page === currentPage(),
                'border border-slate-300 hover:bg-slate-50': page !== currentPage()
              }"
              class="px-3 py-2 rounded-lg"
            >
              {{ page }}
            </button>
          }
          <button
            (click)="nextPage()"
            [disabled]="currentPage() === totalPages()"
            class="px-4 py-2 border border-slate-300 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      }

      <!-- Return Details Modal -->
      @if (showReturnDetails() && selectedReturn()) {
        @let returnItem = selectedReturn()!;
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div>
              <div class="p-8">
                <div class="flex items-center justify-between mb-6">
                  <h2 class="text-2xl font-bold text-slate-900">Return Details</h2>
                  <button (click)="showReturnDetails.set(false)" class="text-2xl text-gray-500">✕</button>
                </div>

                <!-- Return Info -->
                <div class="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p class="text-sm text-slate-600">Return ID</p>
                    <p class="text-lg font-semibold text-slate-900">{{ returnItem.returnId }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-slate-600">Return Date</p>
                    <p class="text-lg font-semibold text-slate-900">{{ returnItem.createdAt | date: 'medium' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-slate-600">Status</p>
                    <p class="text-lg font-semibold" [ngClass]="getStatusColor(returnItem.status)">
                      {{ returnItem.status | titlecase }}
                    </p>
                  </div>
                  <div>
                    <p class="text-sm text-slate-600">Refund Amount</p>
                    <p class="text-lg font-semibold text-slate-900">\${{ returnItem.refundAmount | number: '1.2-2' }}</p>
                  </div>
                </div>

                <!-- Customer Info -->
                <div class="mb-6 p-4 border border-slate-200 rounded-lg">
                  <h3 class="font-semibold text-slate-900 mb-3">Customer Information</h3>
                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p class="text-slate-600">Name</p>
                      <p class="font-medium text-slate-900">{{ returnItem.customerName }}</p>
                    </div>
                    <div>
                      <p class="text-slate-600">Email</p>
                      <p class="font-medium text-slate-900">{{ returnItem.customerEmail }}</p>
                    </div>
                  </div>
                </div>

                <!-- Return Reason -->
                <div class="mb-6 p-4 border border-slate-200 rounded-lg">
                  <h3 class="font-semibold text-slate-900 mb-2">Return Reason</h3>
                  <p class="text-sm text-slate-600">{{ returnItem.returnReason }}</p>
                  @if (returnItem.description) {
                    <p class="text-sm text-slate-600 mt-2">{{ returnItem.description }}</p>
                  }
                </div>

                <!-- Return Items -->
                <div class="mb-6 p-4 border border-slate-200 rounded-lg">
                  <h3 class="font-semibold text-slate-900 mb-3">Return Items</h3>
                  <table class="w-full text-sm">
                    <thead class="border-b border-slate-200">
                      <tr>
                        <th class="text-left py-2 text-slate-600">Product</th>
                        <th class="text-left py-2 text-slate-600">Qty</th>
                        <th class="text-right py-2 text-slate-600">Price</th>
                        <th class="text-left py-2 text-slate-600">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (item of returnItem.items; track item._id) {
                        <tr class="border-b border-slate-100">
                          <td class="py-2">{{ item.productName }}</td>
                          <td class="py-2">{{ item.quantity }}</td>
                          <td class="text-right py-2">\${{ item.price | number: '1.2-2' }}</td>
                          <td class="py-2 text-xs">{{ item.reason }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>

                <!-- Refund Status -->
                <div class="mb-6 p-4 bg-slate-50 rounded-lg">
                  <div class="flex justify-between items-center">
                    <div>
                      <p class="text-sm text-slate-600">Refund Status</p>
                      <p class="text-lg font-semibold" [ngClass]="getRefundStatusColor(returnItem.refundStatus)">
                        {{ returnItem.refundStatus | titlecase }}
                      </p>
                    </div>
                    <div class="text-right">
                      <p class="text-sm text-slate-600">Refund Amount</p>
                      <p class="text-2xl font-bold text-slate-900">\${{ returnItem.refundAmount | number: '1.2-2' }}</p>
                    </div>
                  </div>
                </div>

                <!-- Tracking Info -->
                @if (returnItem.trackingNumber) {
                  <div class="mb-6 p-4 border border-slate-200 rounded-lg">
                    <h3 class="font-semibold text-slate-900 mb-2">Return Tracking</h3>
                    <p class="text-slate-600 text-sm">Tracking Number:</p>
                    <p class="font-mono text-lg font-medium text-slate-900">{{ returnItem.trackingNumber }}</p>
                  </div>
                }

                <!-- Notes -->
                @if (returnItem.notes) {
                  <div class="mb-6 p-4 border border-slate-200 rounded-lg">
                    <h3 class="font-semibold text-slate-900 mb-2">Notes</h3>
                    <p class="text-sm text-slate-600">{{ returnItem.notes }}</p>
                  </div>
                }

                <div class="flex justify-end gap-3">
                  <button
                    (click)="showReturnDetails.set(false)"
                    class="px-6 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Approve Return Modal -->
      @if (approveReturnModal() && selectedReturn()) {
        @let returnItem = selectedReturn()!;
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg max-w-md w-full p-8">
            <h2 class="text-2xl font-bold text-slate-900 mb-6">Approve Return</h2>

            <div class="space-y-4 mb-6">
              <div>
                <p class="text-sm text-slate-600">Return ID</p>
                <p class="text-lg font-semibold text-slate-900">{{ returnItem.returnId }}</p>
              </div>
              <div>
                <p class="text-sm text-slate-600">Refund Amount</p>
                <p class="text-lg font-semibold text-green-600">\${{ returnItem.refundAmount | number: '1.2-2' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Notes (Optional)</label>
                <textarea
                  [(ngModel)]="approvalNotes"
                  placeholder="Add approval notes..."
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows="3"
                ></textarea>
              </div>
            </div>

            <div class="flex justify-end gap-3">
              <button
                (click)="approveReturnModal.set(false)"
                class="px-6 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                (click)="approveReturn()"
                [disabled]="isProcessing()"
                class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50"
              >
                {{ isProcessing() ? 'Approving...' : 'Approve' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Reject Return Modal -->
      @if (rejectReturnModal() && selectedReturn()) {
        @let returnItem = selectedReturn()!;
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg max-w-md w-full p-8">
            <h2 class="text-2xl font-bold text-slate-900 mb-6">Reject Return</h2>

            <div class="space-y-4 mb-6">
              <div>
                <p class="text-sm text-slate-600">Return ID</p>
                <p class="text-lg font-semibold text-slate-900">{{ returnItem.returnId }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Rejection Reason</label>
                <textarea
                  [(ngModel)]="rejectionReason"
                  placeholder="Explain why you are rejecting this return..."
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows="4"
                ></textarea>
              </div>
            </div>

            <div class="flex justify-end gap-3">
              <button
                (click)="rejectReturnModal.set(false)"
                class="px-6 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                (click)="rejectReturn()"
                [disabled]="!rejectionReason || isProcessing()"
                class="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50"
              >
                {{ isProcessing() ? 'Rejecting...' : 'Reject' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Success Message -->
      @if (successMessage()) {
        <div class="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg shadow-lg max-w-md">
          {{ successMessage() }}
        </div>
      }

      <!-- Error Message -->
      @if (errorMessage()) {
        <div class="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-lg max-w-md">
          {{ errorMessage() }}
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
export class ReturnsComponent implements OnInit {
  // Signals
  returns = signal<Return[]>([]);
  isLoading = signal(false);
  isProcessing = signal(false);
  selectedReturn = signal<Return | null>(null);
  showReturnDetails = signal(false);
  approveReturnModal = signal(false);
  rejectReturnModal = signal(false);

  // Filters
  searchQuery = '';
  selectedStatus = '';
  selectedRefundStatus = '';
  sortBy = '-createdAt';
  pageSize: number = 20;
  currentPage = signal(1);
  totalOrders = signal(0);
  totalPages = signal(1);

  // Modal states
  approvalNotes = '';
  rejectionReason = '';

  // Messages
  successMessage = signal('');
  errorMessage = signal('');

  private vendorId: string = '';

  constructor(private returnService: ReturnService) {
    this.vendorId = localStorage.getItem('storeId') || '';
  }

  ngOnInit(): void {
    if (this.vendorId) {
      this.loadReturns();
    } else {
      this.errorMessage.set('Vendor ID not found');
    }
  }

  loadReturns(): void {
    if (!this.vendorId) {
      this.errorMessage.set('Vendor ID not found');
      return;
    }

    this.isLoading.set(true);
    this.returnService
      .getVendorReturns(this.vendorId, this.currentPage(), this.pageSize, this.selectedStatus, this.searchQuery)
      .subscribe({
        next: (response: any) => {
          this.isLoading.set(false);
          if (response.success && response.data) {
            this.returns.set(Array.isArray(response.data) ? response.data : [response.data]);
            if (response.pagination) {
              this.totalOrders.set(response.pagination.total);
              this.totalPages.set(response.pagination.pages);
            }
          }
        },
        error: (error: any) => {
          this.isLoading.set(false);
          console.error('Error loading returns:', error);
          this.errorMessage.set('Failed to load returns');
          setTimeout(() => this.errorMessage.set(''), 3000);
        }
      });
  }

  viewReturn(returnItem: Return): void {
    this.selectedReturn.set(returnItem);
    this.showReturnDetails.set(true);
  }

  approveReturn(): void {
    if (!this.selectedReturn()) {
      return;
    }

    this.isProcessing.set(true);
    const returnId = this.selectedReturn()?._id || '';

    this.returnService
      .approveReturn(returnId, this.approvalNotes || undefined)
      .subscribe({
        next: (response: any) => {
          this.isProcessing.set(false);
          if (response.success) {
            this.successMessage.set('Return approved successfully');
            this.approveReturnModal.set(false);
            this.approvalNotes = '';
            this.loadReturns();
            setTimeout(() => this.successMessage.set(''), 3000);
          }
        },
        error: (error: any) => {
          this.isProcessing.set(false);
          console.error('Error approving return:', error);
          this.errorMessage.set('Failed to approve return');
          setTimeout(() => this.errorMessage.set(''), 3000);
        }
      });
  }

  rejectReturn(): void {
    if (!this.selectedReturn() || !this.rejectionReason) {
      return;
    }

    this.isProcessing.set(true);
    const returnId = this.selectedReturn()?._id || '';

    this.returnService
      .rejectReturn(returnId, this.rejectionReason)
      .subscribe({
        next: (response: any) => {
          this.isProcessing.set(false);
          if (response.success) {
            this.successMessage.set('Return rejected successfully');
            this.rejectReturnModal.set(false);
            this.rejectionReason = '';
            this.loadReturns();
            setTimeout(() => this.successMessage.set(''), 3000);
          }
        },
        error: (error: any) => {
          this.isProcessing.set(false);
          console.error('Error rejecting return:', error);
          this.errorMessage.set('Failed to reject return');
          setTimeout(() => this.errorMessage.set(''), 3000);
        }
      });
  }

  generateLabel(returnItem: Return): void {
    this.isProcessing.set(true);
    const returnId = returnItem._id || '';

    this.returnService
      .generateShippingLabel(returnId)
      .subscribe({
        next: (response: any) => {
          this.isProcessing.set(false);
          this.successMessage.set('Shipping label generated successfully');
          this.loadReturns();
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: (error: any) => {
          this.isProcessing.set(false);
          console.error('Error generating label:', error);
          this.errorMessage.set('Failed to generate shipping label');
          setTimeout(() => this.errorMessage.set(''), 3000);
        }
      });
  }

  exportReturns(): void {
    this.returnService.exportReturns(this.vendorId, 'csv').subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `returns-${new Date().getTime()}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error: any) => {
        console.error('Error exporting returns:', error);
        this.errorMessage.set('Failed to export returns');
      }
    });
  }

  // Statistics
  totalReturns(): number {
    return this.returns().length;
  }

  pendingReturns(): number {
    return this.returns().filter(r => r.status === 'pending').length;
  }

  approvedReturns(): number {
    return this.returns().filter(r => r.status === 'approved').length;
  }

  rejectedReturns(): number {
    return this.returns().filter(r => r.status === 'rejected').length;
  }

  totalRefundAmount(): number {
    return this.returns()
      .filter(r => r.refundStatus === 'completed')
      .reduce((sum, returnItem) => sum + returnItem.refundAmount, 0);
  }

  // Color getters
  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pending': 'text-yellow-600',
      'approved': 'text-green-600',
      'rejected': 'text-red-600',
      'shipped': 'text-blue-600',
      'received': 'text-purple-600',
      'completed': 'text-cyan-600'
    };
    return colors[status] || 'text-slate-600';
  }

  getRefundStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pending': 'text-yellow-600',
      'processing': 'text-blue-600',
      'completed': 'text-green-600',
      'failed': 'text-red-600'
    };
    return colors[status] || 'text-slate-600';
  }

  // Pagination
  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
      this.loadReturns();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
      this.loadReturns();
    }
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadReturns();
  }

  paginationArray(): number[] {
    const pages: number[] = [];
    const totalPages = this.totalPages();
    const currentPage = this.currentPage();
    const maxPagesToShow = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }
}
