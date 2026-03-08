import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { PaymentService, PaymentTransaction, Refund } from '../../../../../services/payment.service';

@Component({
  selector: 'app-retail-payments',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="p-8 space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Payments & Refunds</h1>
          <p class="text-slate-600 mt-1">Manage transactions and refund requests</p>
        </div>
      </div>

      <!-- Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-blue-500">
          <p class="text-slate-600 text-sm font-medium">Total Revenue</p>
          <p class="text-2xl font-bold text-slate-900">\${{ totalRevenue() | number: '1.2-2' }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-green-500">
          <p class="text-slate-600 text-sm font-medium">Completed</p>
          <p class="text-2xl font-bold text-green-600">{{ completedPayments() }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-yellow-500">
          <p class="text-slate-600 text-sm font-medium">Pending</p>
          <p class="text-2xl font-bold text-yellow-600">{{ pendingPayments() }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-red-500">
          <p class="text-slate-600 text-sm font-medium">Failed</p>
          <p class="text-2xl font-bold text-red-600">{{ failedPayments() }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-orange-500">
          <p class="text-slate-600 text-sm font-medium">Refunded</p>
          <p class="text-2xl font-bold text-orange-600">\${{ refundedAmount() | number: '1.2-2' }}</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-4 border-b border-slate-200">
        <button
          (click)="activeTab.set('transactions')"
          [ngClass]="{
            'text-blue-600 border-b-2 border-blue-600': activeTab() === 'transactions',
            'text-slate-600': activeTab() !== 'transactions'
          }"
          class="px-4 py-3 font-medium"
        >
          Transactions
        </button>
        <button
          (click)="activeTab.set('refunds')"
          [ngClass]="{
            'text-blue-600 border-b-2 border-blue-600': activeTab() === 'refunds',
            'text-slate-600': activeTab() !== 'refunds'
          }"
          class="px-4 py-3 font-medium"
        >
          Refunds
        </button>
      </div>

      <!-- Transactions Tab -->
      @if (activeTab() === 'transactions') {
        <!-- Search & Filter -->
        <div class="bg-white rounded-lg p-6 shadow-md space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Search</label>
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (keyup.enter)="loadPayments()"
                placeholder="Transaction ID, Order ID..."
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                [(ngModel)]="selectedPaymentStatus"
                (change)="loadPayments()"
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
              <select
                [(ngModel)]="selectedPaymentMethod"
                (change)="loadPayments()"
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Methods</option>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="wallet">Wallet</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Per Page</label>
              <select
                [(ngModel)]="pageSize"
                (change)="currentPage.set(1); loadPayments()"
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Payments Table -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Transaction ID</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Order ID</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Customer</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Amount</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Method</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Date</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Action</th>
                </tr>
              </thead>
              <tbody>
                @if (isLoading()) {
                  <tr>
                    <td colspan="8" class="px-6 py-8 text-center">
                      <div class="flex items-center justify-center gap-2">
                        <mat-icon class="animate-spin">refresh</mat-icon>
                        <span>Loading payments...</span>
                      </div>
                    </td>
                  </tr>
                } @else if (payments().length === 0) {
                  <tr>
                    <td colspan="8" class="px-6 py-8 text-center text-slate-600">
                      No payments found
                    </td>
                  </tr>
                } @else {
                  @for (payment of payments(); track payment._id) {
                    <tr class="border-b border-slate-200 hover:bg-slate-50 transition">
                      <td class="px-6 py-4 font-medium text-slate-900">{{ payment.transactionId }}</td>
                      <td class="px-6 py-4 text-slate-600">{{ payment.orderId }}</td>
                      <td class="px-6 py-4">
                        <div class="text-sm">
                          <p class="font-medium text-slate-900">{{ payment.customerName }}</p>
                          <p class="text-slate-500 text-xs">{{ payment.customerEmail }}</p>
                        </div>
                      </td>
                      <td class="px-6 py-4 font-medium text-slate-900">\${{ payment.amount | number: '1.2-2' }}</td>
                      <td class="px-6 py-4 text-sm text-slate-600">
                        <span class="inline-block px-3 py-1 bg-slate-100 rounded-full text-xs font-medium">
                          {{ formatPaymentMethod(payment.paymentMethod) }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <span
                          [ngClass]="getPaymentStatusColor(payment.status)"
                          class="px-3 py-1 rounded-full text-xs font-medium inline-block"
                        >
                          {{ payment.status | titlecase }}
                        </span>
                      </td>
                      <td class="px-6 py-4 text-sm text-slate-600">
                        {{ payment.createdAt | date: 'short' }}
                      </td>
                      <td class="px-6 py-4">
                        <button
                          (click)="viewPayment(payment)"
                          class="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          View
                        </button>
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
      }

      <!-- Refunds Tab -->
      @if (activeTab() === 'refunds') {
        <!-- Search & Filter -->
        <div class="bg-white rounded-lg p-6 shadow-md space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Search</label>
              <input
                type="text"
                [(ngModel)]="refundSearchQuery"
                (keyup.enter)="loadRefunds()"
                placeholder="Refund ID, Order ID..."
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                [(ngModel)]="selectedRefundStatus"
                (change)="loadRefunds()"
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Per Page</label>
              <select
                [(ngModel)]="refundPageSize"
                (change)="refundCurrentPage.set(1); loadRefunds()"
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Refunds Table -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Refund ID</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Order ID</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Amount</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Reason</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Date</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                @if (isRefundsLoading()) {
                  <tr>
                    <td colspan="7" class="px-6 py-8 text-center">
                      <div class="flex items-center justify-center gap-2">
                        <mat-icon class="animate-spin">refresh</mat-icon>
                        <span>Loading refunds...</span>
                      </div>
                    </td>
                  </tr>
                } @else if (refunds().length === 0) {
                  <tr>
                    <td colspan="7" class="px-6 py-8 text-center text-slate-600">
                      No refunds found
                    </td>
                  </tr>
                } @else {
                  @for (refund of refunds(); track refund._id) {
                    <tr class="border-b border-slate-200 hover:bg-slate-50 transition">
                      <td class="px-6 py-4 font-medium text-slate-900">{{ refund.refundId }}</td>
                      <td class="px-6 py-4 text-slate-600">{{ refund.orderId }}</td>
                      <td class="px-6 py-4 font-medium text-slate-900">\${{ refund.amount | number: '1.2-2' }}</td>
                      <td class="px-6 py-4 text-sm text-slate-600">{{ refund.reason }}</td>
                      <td class="px-6 py-4">
                        <span
                          [ngClass]="getRefundStatusColor(refund.status)"
                          class="px-3 py-1 rounded-full text-xs font-medium inline-block"
                        >
                          {{ refund.status | titlecase }}
                        </span>
                      </td>
                      <td class="px-6 py-4 text-sm text-slate-600">
                        {{ refund.createdAt | date: 'short' }}
                      </td>
                      <td class="px-6 py-4 space-x-2">
                        <button
                          (click)="viewRefund(refund)"
                          class="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          View
                        </button>
                        @if (refund.status === 'pending') {
                          <button
                            (click)="approveRefundModal.set(true); selectedRefund.set(refund)"
                            class="text-green-600 hover:text-green-700 font-medium text-sm"
                          >
                            Approve
                          </button>
                          <button
                            (click)="rejectRefundModal.set(true); selectedRefund.set(refund)"
                            class="text-red-600 hover:text-red-700 font-medium text-sm"
                          >
                            Reject
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
        @if (refundTotalPages() > 1) {
          <div class="flex justify-center items-center gap-2">
            <button
              (click)="refundPreviousPage()"
              [disabled]="refundCurrentPage() === 1"
              class="px-4 py-2 border border-slate-300 rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            @for (page of refundPaginationArray(); track page) {
              <button
                (click)="refundGoToPage(page)"
                [ngClass]="{
                  'bg-blue-600 text-white': page === refundCurrentPage(),
                  'border border-slate-300 hover:bg-slate-50': page !== refundCurrentPage()
                }"
                class="px-3 py-2 rounded-lg"
              >
                {{ page }}
              </button>
            }
            <button
              (click)="refundNextPage()"
              [disabled]="refundCurrentPage() === refundTotalPages()"
              class="px-4 py-2 border border-slate-300 rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        }
      }

      <!-- Payment Details Modal -->
      @if (showPaymentDetails() && selectedPayment()) {
        @let payment = selectedPayment()!;
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div>
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold text-slate-900">Transaction Details</h2>
                <button (click)="showPaymentDetails.set(false)" class="text-2xl text-gray-500">✕</button>
              </div>

              <div class="space-y-6">
                <!-- Transaction Info -->
                <div class="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p class="text-sm text-slate-600">Transaction ID</p>
                    <p class="text-lg font-semibold text-slate-900">{{ payment.transactionId }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-slate-600">Order ID</p>
                    <p class="text-lg font-semibold text-slate-900">{{ payment.orderId }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-slate-600">Amount</p>
                    <p class="text-lg font-semibold text-slate-900">\${{ payment.amount | number: '1.2-2' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-slate-600">Status</p>
                    <p class="text-lg font-semibold" [ngClass]="getPaymentStatusColor(payment.status)">
                      {{ payment.status | titlecase }}
                    </p>
                  </div>
                </div>

                <!-- Customer Info -->
                <div class="p-4 border border-slate-200 rounded-lg">
                  <h3 class="font-semibold text-slate-900 mb-3">Customer Information</h3>
                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p class="text-slate-600">Name</p>
                      <p class="font-medium text-slate-900">{{ payment.customerName }}</p>
                    </div>
                    <div>
                      <p class="text-slate-600">Email</p>
                      <p class="font-medium text-slate-900">{{ payment.customerEmail }}</p>
                    </div>
                  </div>
                </div>

                <!-- Payment Details -->
                <div class="p-4 border border-slate-200 rounded-lg">
                  <h3 class="font-semibold text-slate-900 mb-3">Payment Details</h3>
                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p class="text-slate-600">Payment Method</p>
                      <p class="font-medium text-slate-900">{{ formatPaymentMethod(payment.paymentMethod) }}</p>
                    </div>
                    <div>
                      <p class="text-slate-600">Gateway</p>
                      <p class="font-medium text-slate-900">{{ payment.paymentGateway || 'N/A' }}</p>
                    </div>
                    <div>
                      <p class="text-slate-600">Currency</p>
                      <p class="font-medium text-slate-900">{{ payment.currency }}</p>
                    </div>
                    <div>
                      <p class="text-slate-600">Date</p>
                      <p class="font-medium text-slate-900">{{ payment.createdAt | date: 'medium' }}</p>
                    </div>
                  </div>
                </div>

                @if (payment.description) {
                  <div class="p-4 border border-slate-200 rounded-lg">
                    <h3 class="font-semibold text-slate-900 mb-2">Description</h3>
                    <p class="text-sm text-slate-600">{{ payment.description }}</p>
                  </div>
                }
              </div>

              <div class="flex justify-end mt-6">
                <button
                  (click)="showPaymentDetails.set(false)"
                  class="px-6 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Refund Details Modal -->
      @if (showRefundDetails() && selectedRefund()) {
        @let refund = selectedRefund()!;
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div>
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold text-slate-900">Refund Details</h2>
                <button (click)="showRefundDetails.set(false)" class="text-2xl text-gray-500">✕</button>
              </div>

              <div class="space-y-6">
                <!-- Refund Info -->
                <div class="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p class="text-sm text-slate-600">Refund ID</p>
                    <p class="text-lg font-semibold text-slate-900">{{ refund.refundId }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-slate-600">Order ID</p>
                    <p class="text-lg font-semibold text-slate-900">{{ refund.orderId }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-slate-600">Amount</p>
                    <p class="text-lg font-semibold text-slate-900">\${{ refund.amount | number: '1.2-2' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-slate-600">Status</p>
                    <p class="text-lg font-semibold" [ngClass]="getRefundStatusColor(refund.status)">
                      {{ refund.status | titlecase }}
                    </p>
                  </div>
                </div>

                <!-- Refund Reason -->
                <div class="p-4 border border-slate-200 rounded-lg">
                  <h3 class="font-semibold text-slate-900 mb-2">Reason</h3>
                  <p class="text-sm text-slate-600">{{ refund.reason }}</p>
                </div>

                <!-- Refund Details -->
                <div class="p-4 border border-slate-200 rounded-lg">
                  <h3 class="font-semibold text-slate-900 mb-3">Refund Details</h3>
                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p class="text-slate-600">Refund Method</p>
                      <p class="font-medium text-slate-900">{{ refund.refundMethod }}</p>
                    </div>
                    <div>
                      <p class="text-slate-600">Transaction ID</p>
                      <p class="font-medium text-slate-900">{{ refund.transactionId }}</p>
                    </div>
                    <div>
                      <p class="text-slate-600">Requested Date</p>
                      <p class="font-medium text-slate-900">{{ refund.createdAt | date: 'medium' }}</p>
                    </div>
                    <div>
                      <p class="text-slate-600">Updated Date</p>
                      <p class="font-medium text-slate-900">{{ refund.updatedAt | date: 'medium' }}</p>
                    </div>
                  </div>
                </div>

                @if (refund.notes) {
                  <div class="p-4 border border-slate-200 rounded-lg">
                    <h3 class="font-semibold text-slate-900 mb-2">Notes</h3>
                    <p class="text-sm text-slate-600">{{ refund.notes }}</p>
                  </div>
                }
              </div>

              <div class="flex justify-end mt-6">
                <button
                  (click)="showRefundDetails.set(false)"
                  class="px-6 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Approve Refund Modal -->
      @if (approveRefundModal() && selectedRefund()) {
        @let refund = selectedRefund()!;
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg max-w-md w-full p-8">
            <h2 class="text-2xl font-bold text-slate-900 mb-6">Approve Refund</h2>

            <div class="space-y-4 mb-6">
              <div>
                <p class="text-sm text-slate-600">Refund ID</p>
                <p class="text-lg font-semibold text-slate-900">{{ refund.refundId }}</p>
              </div>
              <div>
                <p class="text-sm text-slate-600">Amount</p>
                <p class="text-lg font-semibold text-green-600">\${{ refund.amount | number: '1.2-2' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Notes (Optional)</label>
                <textarea
                  [(ngModel)]="refundNotes"
                  placeholder="Add any notes about this refund..."
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows="3"
                ></textarea>
              </div>
            </div>

            <div class="flex justify-end gap-3">
              <button
                (click)="approveRefundModal.set(false)"
                class="px-6 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                (click)="approveRefund()"
                [disabled]="isProcessingRefund()"
                class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50"
              >
                {{ isProcessingRefund() ? 'Approving...' : 'Approve' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Reject Refund Modal -->
      @if (rejectRefundModal() && selectedRefund()) {
        @let refund = selectedRefund()!;
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg max-w-md w-full p-8">
            <h2 class="text-2xl font-bold text-slate-900 mb-6">Reject Refund</h2>

            <div class="space-y-4 mb-6">
              <div>
                <p class="text-sm text-slate-600">Refund ID</p>
                <p class="text-lg font-semibold text-slate-900">{{ refund.refundId }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Rejection Reason</label>
                <textarea
                  [(ngModel)]="rejectionReason"
                  placeholder="Explain why you are rejecting this refund..."
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows="4"
                ></textarea>
              </div>
            </div>

            <div class="flex justify-end gap-3">
              <button
                (click)="rejectRefundModal.set(false)"
                class="px-6 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                (click)="rejectRefund()"
                [disabled]="!rejectionReason || isProcessingRefund()"
                class="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50"
              >
                {{ isProcessingRefund() ? 'Rejecting...' : 'Reject' }}
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
export class PaymentsComponent implements OnInit {
  // Tab management
  activeTab = signal<'transactions' | 'refunds'>('transactions');

  // Payment signals
  payments = signal<PaymentTransaction[]>([]);
  isLoading = signal(false);
  selectedPayment = signal<PaymentTransaction | null>(null);
  showPaymentDetails = signal(false);

  // Refund signals
  refunds = signal<Refund[]>([]);
  isRefundsLoading = signal(false);
  selectedRefund = signal<Refund | null>(null);
  showRefundDetails = signal(false);
  approveRefundModal = signal(false);
  rejectRefundModal = signal(false);
  isProcessingRefund = signal(false);

  // Filters & Pagination - Payments
  searchQuery = '';
  selectedPaymentStatus = '';
  selectedPaymentMethod = '';
  pageSize: number = 20;
  currentPage = signal(1);
  totalOrders = signal(0);
  totalPages = signal(1);

  // Filters & Pagination - Refunds
  refundSearchQuery = '';
  selectedRefundStatus = '';
  refundPageSize: number = 20;
  refundCurrentPage = signal(1);
  refundTotalOrders = signal(0);
  refundTotalPages = signal(1);

  // Modal states
  refundNotes = '';
  rejectionReason = '';

  // Messages
  successMessage = signal('');
  errorMessage = signal('');

  private vendorId: string = '';

  constructor(private paymentService: PaymentService) {
    this.vendorId = localStorage.getItem('storeId') || '';
  }

  ngOnInit(): void {
    if (this.vendorId) {
      this.loadPayments();
      this.loadRefunds();
    } else {
      this.errorMessage.set('Vendor ID not found');
    }
  }

  loadPayments(): void {
    if (!this.vendorId) {
      this.errorMessage.set('Vendor ID not found');
      return;
    }

    this.isLoading.set(true);
    this.paymentService
      .getVendorPayments(this.vendorId, this.currentPage(), this.pageSize, this.selectedPaymentStatus)
      .subscribe({
        next: (response: any) => {
          this.isLoading.set(false);
          if (response.success && response.data) {
            this.payments.set(Array.isArray(response.data) ? response.data : [response.data]);
            if (response.pagination) {
              this.totalOrders.set(response.pagination.total);
              this.totalPages.set(response.pagination.pages);
            }
          }
        },
        error: (error: any) => {
          this.isLoading.set(false);
          console.error('Error loading payments:', error);
          this.errorMessage.set('Failed to load payments');
          setTimeout(() => this.errorMessage.set(''), 3000);
        }
      });
  }

  loadRefunds(): void {
    if (!this.vendorId) {
      return;
    }

    this.isRefundsLoading.set(true);
    this.paymentService
      .getVendorRefunds(this.vendorId, this.refundCurrentPage(), this.refundPageSize, this.selectedRefundStatus)
      .subscribe({
        next: (response: any) => {
          this.isRefundsLoading.set(false);
          if (response.success && response.data) {
            this.refunds.set(Array.isArray(response.data) ? response.data : [response.data]);
            if (response.pagination) {
              this.refundTotalOrders.set(response.pagination.total);
              this.refundTotalPages.set(response.pagination.pages);
            }
          }
        },
        error: (error: any) => {
          this.isRefundsLoading.set(false);
          console.error('Error loading refunds:', error);
        }
      });
  }

  viewPayment(payment: PaymentTransaction): void {
    this.selectedPayment.set(payment);
    this.showPaymentDetails.set(true);
  }

  viewRefund(refund: Refund): void {
    this.selectedRefund.set(refund);
    this.showRefundDetails.set(true);
  }

  approveRefund(): void {
    if (!this.selectedRefund()) {
      return;
    }

    this.isProcessingRefund.set(true);
    const refundId = this.selectedRefund()?._id || '';

    this.paymentService
      .approveRefund(refundId, this.refundNotes || undefined)
      .subscribe({
        next: (response: any) => {
          this.isProcessingRefund.set(false);
          if (response.success) {
            this.successMessage.set('Refund approved successfully');
            this.approveRefundModal.set(false);
            this.refundNotes = '';
            this.loadRefunds();
            setTimeout(() => this.successMessage.set(''), 3000);
          }
        },
        error: (error: any) => {
          this.isProcessingRefund.set(false);
          console.error('Error approving refund:', error);
          this.errorMessage.set('Failed to approve refund');
          setTimeout(() => this.errorMessage.set(''), 3000);
        }
      });
  }

  rejectRefund(): void {
    if (!this.selectedRefund() || !this.rejectionReason) {
      return;
    }

    this.isProcessingRefund.set(true);
    const refundId = this.selectedRefund()?._id || '';

    this.paymentService
      .rejectRefund(refundId, this.rejectionReason)
      .subscribe({
        next: (response: any) => {
          this.isProcessingRefund.set(false);
          if (response.success) {
            this.successMessage.set('Refund rejected successfully');
            this.rejectRefundModal.set(false);
            this.rejectionReason = '';
            this.loadRefunds();
            setTimeout(() => this.successMessage.set(''), 3000);
          }
        },
        error: (error: any) => {
          this.isProcessingRefund.set(false);
          console.error('Error rejecting refund:', error);
          this.errorMessage.set('Failed to reject refund');
          setTimeout(() => this.errorMessage.set(''), 3000);
        }
      });
  }

  // Statistics
  completedPayments(): number {
    return this.payments().filter(p => p.status === 'completed').length;
  }

  pendingPayments(): number {
    return this.payments().filter(p => p.status === 'pending').length;
  }

  failedPayments(): number {
    return this.payments().filter(p => p.status === 'failed').length;
  }

  totalRevenue(): number {
    return this.payments()
      .filter(p => p.status === 'completed')
      .reduce((sum, payment) => sum + payment.amount, 0);
  }

  refundedAmount(): number {
    return this.refunds()
      .filter(r => r.status === 'completed')
      .reduce((sum, refund) => sum + refund.amount, 0);
  }

  // Color getters
  getPaymentStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'completed': 'bg-green-100 text-green-700',
      'pending': 'bg-yellow-100 text-yellow-700',
      'processing': 'bg-blue-100 text-blue-700',
      'failed': 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  }

  getRefundStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'completed': 'bg-green-100 text-green-700',
      'pending': 'bg-yellow-100 text-yellow-700',
      'processing': 'bg-blue-100 text-blue-700',
      'failed': 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  }

  formatPaymentMethod(method: string): string {
    const methods: { [key: string]: string } = {
      'credit_card': 'Credit Card',
      'debit_card': 'Debit Card',
      'bank_transfer': 'Bank Transfer',
      'mobile_money': 'Mobile Money',
      'wallet': 'Wallet'
    };
    return methods[method] || method;
  }

  // Pagination - Payments
  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
      this.loadPayments();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
      this.loadPayments();
    }
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadPayments();
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

  // Pagination - Refunds
  refundPreviousPage(): void {
    if (this.refundCurrentPage() > 1) {
      this.refundCurrentPage.set(this.refundCurrentPage() - 1);
      this.loadRefunds();
    }
  }

  refundNextPage(): void {
    if (this.refundCurrentPage() < this.refundTotalPages()) {
      this.refundCurrentPage.set(this.refundCurrentPage() + 1);
      this.loadRefunds();
    }
  }

  refundGoToPage(page: number): void {
    this.refundCurrentPage.set(page);
    this.loadRefunds();
  }

  refundPaginationArray(): number[] {
    const pages: number[] = [];
    const totalPages = this.refundTotalPages();
    const currentPage = this.refundCurrentPage();
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
