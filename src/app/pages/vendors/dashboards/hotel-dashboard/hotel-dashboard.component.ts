import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HotelService } from '../../../../services/hotel.service';
import { AuthService } from '../../../../services/auth.service';
import { VendorSidenavComponent } from '../../../../layout/vendor-sidenav/vendor-sidenav.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-hotel-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, VendorSidenavComponent],
  template: `
    <div class="flex h-screen bg-slate-50">
      <!-- Sidenav -->
      <app-vendor-sidenav
        vendorType="hotel"
        [sidenavItems]="hotelSidenavItems"
        (logout)="onLogout()"
      ></app-vendor-sidenav>

      <!-- Main Content -->
      <div class="flex-1 overflow-y-auto">
        <!-- Router Outlet for Child Pages -->
        <router-outlet></router-outlet>

        <!-- Dashboard Content (shown only on main dashboard page) -->
        @if (!hasChildRoute()) {
        <div class="p-8 space-y-8">
      <!-- Welcome Section -->
      <div class="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white shadow-lg">
        <h1 class="text-3xl font-bold mb-2">Hotel Management Dashboard</h1>
        <p class="text-blue-100">Monitor bookings, rooms, guests, and hotel operations in real-time.</p>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="bg-blue-50 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">Loading hotel data...</p>
        </div>
      }

      <!-- Error State -->
      @if (errorMessage()) {
        <div class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">Error: {{ errorMessage() }}</p>
        </div>
      }

      <!-- Key Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Occupancy Rate</p>
          <p class="text-3xl font-bold text-slate-900">{{ getOccupancyRate() }}%</p>
          <p class="mt-2 text-sm text-emerald-600">{{ bookings().length }} of {{ totalRoomsCount() || 0 }} rooms</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Total Rooms</p>
          <p class="text-3xl font-bold text-slate-900">{{ totalRoomsCount() || 0 }}</p>
          <p class="mt-2 text-sm text-slate-500">{{ bookings().length }} occupied, {{ getAvailableRooms() }} available</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-emerald-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Today's Revenue</p>
          <p class="text-3xl font-bold text-slate-900">$ {{ getTotalRevenue() }}</p>
          <p class="mt-2 text-sm text-emerald-600">Updated: Real-time data</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Active Bookings</p>
          <p class="text-3xl font-bold text-slate-900">{{ bookings().length }}</p>
          <p class="mt-2 text-sm text-slate-500">{{ stats()?.checkInsToday || 0 }} check-ins today</p>
        </div>

      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="rounded-lg border-l-4 border-blue-500 bg-white p-6 shadow-md">
          <p class="text-sm font-medium text-slate-600">Contactless Ready Rooms</p>
          <p class="mt-2 text-3xl font-bold text-slate-900">{{ securitySummary()?.contactlessReadyRooms || 0 }}</p>
          <p class="mt-2 text-sm text-blue-700">Rooms equipped with smart locks</p>
        </div>
        <div class="rounded-lg border-l-4 border-amber-500 bg-white p-6 shadow-md">
          <p class="text-sm font-medium text-slate-600">Monitored Only Rooms</p>
          <p class="mt-2 text-3xl font-bold text-slate-900">{{ securitySummary()?.monitoredOnlyRooms || 0 }}</p>
          <p class="mt-2 text-sm text-amber-700">Door sensor monitoring without digital unlock</p>
        </div>
        <div class="rounded-lg border-l-4 border-indigo-500 bg-white p-6 shadow-md">
          <p class="text-sm font-medium text-slate-600">Unassigned Security Devices</p>
          <p class="mt-2 text-3xl font-bold text-slate-900">{{ securitySummary()?.unassignedDevices || 0 }}</p>
          <p class="mt-2 text-sm text-indigo-700">Hardware still waiting for room assignment</p>
        </div>
      </div>

      <!-- Room Status, Bookings, Reports -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Room Status -->
        <div class="bg-white rounded-lg p-6 shadow-md">
          <h3 class="text-lg font-bold text-slate-900 mb-6">Room Status Overview</h3>
          @if (roomStatusSummary()) {
            <div class="space-y-4">
              <div>
                <div class="flex justify-between mb-2">
                  <span class="text-slate-700 font-medium">Occupied</span>
                  <span class="text-slate-900 font-bold">{{ roomStatusSummary().occupied || 0 }}</span>
                </div>
                <div class="w-full bg-slate-200 rounded-full h-2">
                  <div class="bg-emerald-500 h-2 rounded-full" [style.width.%]="getRoomStatusPercentage('occupied')"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between mb-2">
                  <span class="text-slate-700 font-medium">Available</span>
                  <span class="text-slate-900 font-bold">{{ roomStatusSummary().available || 0 }}</span>
                </div>
                <div class="w-full bg-slate-200 rounded-full h-2">
                  <div class="bg-blue-500 h-2 rounded-full" [style.width.%]="getRoomStatusPercentage('available')"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between mb-2">
                  <span class="text-slate-700 font-medium">Cleaning</span>
                  <span class="text-slate-900 font-bold">{{ roomStatusSummary().cleaning || 0 }}</span>
                </div>
                <div class="w-full bg-slate-200 rounded-full h-2">
                  <div class="bg-yellow-500 h-2 rounded-full" [style.width.%]="getRoomStatusPercentage('cleaning')"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between mb-2">
                  <span class="text-slate-700 font-medium">Maintenance</span>
                  <span class="text-slate-900 font-bold">{{ roomStatusSummary().maintenance || 0 }}</span>
                </div>
                <div class="w-full bg-slate-200 rounded-full h-2">
                  <div class="bg-red-500 h-2 rounded-full" [style.width.%]="getRoomStatusPercentage('maintenance')"></div>
                </div>
              </div>
            </div>
          } @else {
            <p class="text-slate-600 text-center py-4">No room status data available</p>
          }
        </div>

        <!-- Recent Bookings -->
        <div class="bg-white rounded-lg p-6 shadow-md">
          <h3 class="text-lg font-bold text-slate-900 mb-6">Recent Bookings</h3>
          <div class="space-y-4">
            @if (bookings().length === 0) {
              <p class="text-slate-600 text-center py-4">No bookings yet</p>
            } @else {
              @for (booking of bookings(); track booking._id) {
                <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p class="font-medium text-slate-900">{{ booking.guest.name || 'Guest' }}</p>
                    <p class="text-sm text-slate-600">Room {{ booking.roomNumber || 'TBA' }} - {{ booking.roomType || 'Standard' }}</p>
                  </div>
                  <span class="px-3 py-1 rounded-full text-xs font-medium" [ngClass]="{
                    'bg-emerald-100 text-emerald-700': booking.status === 'checked-in',
                    'bg-blue-100 text-blue-700': booking.status === 'confirmed',
                    'bg-yellow-100 text-yellow-700': booking.status === 'pending'
                  }">
                    {{ booking.status ? (booking.status | titlecase) : 'Pending' }}
                  </span>
                </div>
              }
            }
          </div>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md">
          <div class="flex items-start justify-between gap-4 mb-5">
            <div>
              <h3 class="text-lg font-bold text-slate-900">Income Reports</h3>
              <p class="text-sm text-slate-600 mt-1">
                Generate daily or monthly income reports from room bookings, food orders, and inhouse services.
              </p>
            </div>
            <span class="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
              Live Data
            </span>
          </div>

          <div class="space-y-4">
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                (click)="openReportModal('daily')"
                class="group min-h-[132px] rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 px-5 py-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
              >
                <div class="flex h-full flex-col justify-between">
                  <div class="flex items-start justify-between gap-3">
                    <div class="rounded-xl bg-blue-100 px-3 py-2 text-lg text-blue-700">D</div>
                    <span class="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Quick View
                    </span>
                  </div>
                  <div class="mt-6">
                    <p class="text-base font-bold text-slate-900">Daily Income Report</p>
                    <p class="mt-2 text-sm leading-5 text-slate-600">
                      Choose a specific date and preview the full income statement before printing.
                    </p>
                  </div>
                </div>
              </button>
              <button
                (click)="openReportModal('monthly')"
                class="group min-h-[132px] rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 px-5 py-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
              >
                <div class="flex h-full flex-col justify-between">
                  <div class="flex items-start justify-between gap-3">
                    <div class="rounded-xl bg-amber-100 px-3 py-2 text-lg text-amber-700">M</div>
                    <span class="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Statement
                    </span>
                  </div>
                  <div class="mt-6">
                    <p class="text-base font-bold text-slate-900">Monthly Income Report</p>
                    <p class="mt-2 text-sm leading-5 text-slate-600">
                      Generate a month-level statement across bookings, orders, and inhouse services.
                    </p>
                  </div>
                </div>
              </button>
            </div>

            @if (lastGeneratedReport()) {
              <div class="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                <p class="text-sm font-semibold text-emerald-900">
                  Last report: {{ getReportPeriodLabel(lastGeneratedReport()) }}
                </p>
                <p class="mt-1 text-sm text-emerald-700">
                  Total income {{ formatCurrency(lastGeneratedReport().summary?.totalIncome || 0) }}
                </p>
              </div>
            } @else {
              <div class="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                No report preview generated yet
              </div>
            }

            <button
              (click)="openLatestReportPreview()"
              [disabled]="!lastGeneratedReport()"
              class="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              Open Latest Preview
            </button>
          </div>
        </div>

      </div>

      <!-- Staff -->
      <div class="bg-white rounded-lg p-6 shadow-md">
        <h3 class="text-lg font-bold text-slate-900 mb-6">Staff On Duty</h3>
        @if (staffMembers().length > 0) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (staff of staffMembers().slice(0, 6); track staff._id || staff.id) {
              <div class="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span class="font-bold text-blue-600 text-sm">{{ getInitials(staff.name) }}</span>
                </div>
                <div>
                  <p class="font-medium text-slate-900">{{ staff.name }}</p>
                  <p class="text-sm text-slate-600">{{ staff.position || 'Staff' }}</p>
                </div>
              </div>
            }
          </div>
        } @else {
          <p class="text-slate-600 text-center py-4">No staff members available</p>
        }
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-lg p-6 shadow-md">
        <h3 class="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            (click)="navigateTo('/hotel-dashboard/bookings')"
            class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">
            📅 New Booking
          </button>
          <button
            (click)="navigateTo('/hotel-dashboard/rooms')"
            class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
            🏨 Manage Rooms
          </button>
          <button
            (click)="navigateTo('/hotel-dashboard/bookings')"
            class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
            ✅ Check-in Guest
          </button>
          <button
            (click)="openReportModal('daily')"
            class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
            📄 Generate Report
          </button>
        </div>
      </div>

      @if (showReportModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h3 class="text-xl font-bold text-slate-900">Generate Income Report</h3>
                <p class="mt-1 text-sm text-slate-600">Choose the report period before generating the preview.</p>
              </div>
              <button
                type="button"
                (click)="closeReportModal()"
                class="rounded-full px-3 py-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                Close
              </button>
            </div>

            <div class="mt-6 space-y-5">
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Report Type</label>
                <div class="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    (click)="reportType = 'daily'"
                    [class.bg-blue-600]="reportType === 'daily'"
                    [class.text-white]="reportType === 'daily'"
                    [class.border-blue-600]="reportType === 'daily'"
                    class="rounded-lg border px-4 py-3 text-sm font-semibold transition"
                  >
                    Daily
                  </button>
                  <button
                    type="button"
                    (click)="reportType = 'monthly'"
                    [class.bg-blue-600]="reportType === 'monthly'"
                    [class.text-white]="reportType === 'monthly'"
                    [class.border-blue-600]="reportType === 'monthly'"
                    class="rounded-lg border px-4 py-3 text-sm font-semibold transition"
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    (click)="reportType = 'custom'"
                    [class.bg-blue-600]="reportType === 'custom'"
                    [class.text-white]="reportType === 'custom'"
                    [class.border-blue-600]="reportType === 'custom'"
                    class="rounded-lg border px-4 py-3 text-sm font-semibold transition"
                  >
                    Custom
                  </button>
                </div>
              </div>

              @if (reportType === 'monthly') {
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Month</label>
                  <input
                    type="month"
                    [(ngModel)]="reportMonth"
                    class="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              } @else {
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-2">{{ reportType === 'custom' ? 'Start Date' : 'Date' }}</label>
                    <input
                      type="date"
                      [(ngModel)]="reportDate"
                      class="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  @if (reportType === 'custom') {
                    <div>
                      <label class="block text-sm font-semibold text-slate-700 mb-2">End Date</label>
                      <input
                        type="date"
                        [(ngModel)]="reportEndDate"
                        class="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  }
                </div>
              }

              <div class="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
                The report preview includes room bookings, food and drink orders, and inhouse service revenue for the selected period or date range.
              </div>
            </div>

            <div class="mt-6 flex justify-end gap-3">
              <button
                type="button"
                (click)="closeReportModal()"
                class="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                (click)="generateIncomeReport()"
                [disabled]="isGeneratingReport()"
                class="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {{ isGeneratingReport() ? 'Generating...' : 'Generate Preview' }}
              </button>
            </div>
          </div>
        </div>
      }

      @if (showReportPreviewModal() && reportPreviewMarkup()) {
        <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm">
          <div class="mx-auto flex h-[calc(100vh-2rem)] max-h-[calc(100vh-2rem)] min-h-0 max-w-7xl flex-col overflow-hidden rounded-[28px] bg-slate-100 shadow-2xl">
            <div class="border-b border-slate-200 bg-white px-6 py-5">
              <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Report Workspace</p>
                  <h3 class="mt-1 text-2xl font-bold text-slate-900">Income Report Preview</h3>
                  <p class="mt-1 text-sm text-slate-500">{{ getReportPeriodLabel(lastGeneratedReport()) }}</p>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    (click)="printReport()"
                    class="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Print
                  </button>
                  <button
                    type="button"
                    (click)="saveReportAsPdf()"
                    class="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Save as PDF
                  </button>
                  <button
                    type="button"
                    (click)="closeReportPreviewModal()"
                    class="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>

            <div class="grid min-h-0 flex-1 overflow-hidden grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div class="flex min-h-0 flex-col overflow-hidden border-b border-slate-200 bg-slate-200 lg:border-b-0 lg:border-r">
                <div class="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-3">
                  <div>
                    <p class="text-sm font-semibold text-slate-900">Document Preview</p>
                    <p class="text-xs text-slate-500">Review layout, totals, and entries before exporting</p>
                  </div>
                  <span class="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm">
                    A4 Ready
                  </span>
                </div>
                <div class="min-h-0 flex-1 overflow-hidden p-5">
                  <div class="h-full min-h-0 overflow-y-auto overflow-x-hidden rounded-2xl border border-slate-300 bg-white shadow-inner">
                    <div class="min-h-full" [innerHTML]="reportPreviewMarkup()"></div>
                  </div>
                </div>
              </div>

              <div class="min-h-0 overflow-y-auto bg-white p-6">
                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Delivery</p>
                  <h4 class="mt-2 text-lg font-bold text-slate-900">Send Email</h4>
                  <p class="mt-1 text-sm leading-6 text-slate-600">
                    Share the report summary through your email client after reviewing the preview.
                  </p>
                </div>

                <div class="mt-6 space-y-5">
                  <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p class="text-sm font-semibold text-slate-900">Report Summary</p>
                    <div class="mt-3 space-y-2 text-sm text-slate-600">
                      <div class="flex items-center justify-between gap-4">
                        <span>Total Income</span>
                        <span class="font-semibold text-slate-900">{{ formatCurrency(lastGeneratedReport().summary?.totalIncome || 0) }}</span>
                      </div>
                      <div class="flex items-center justify-between gap-4">
                        <span>Room Bookings</span>
                        <span class="font-semibold text-slate-900">{{ formatCurrency(lastGeneratedReport().summary?.roomBookings || 0) }}</span>
                      </div>
                      <div class="flex items-center justify-between gap-4">
                        <span>Food & Drinks</span>
                        <span class="font-semibold text-slate-900">{{ formatCurrency(lastGeneratedReport().summary?.foodAndDrinks || 0) }}</span>
                      </div>
                      <div class="flex items-center justify-between gap-4">
                        <span>Inhouse Services</span>
                        <span class="font-semibold text-slate-900">{{ formatCurrency(lastGeneratedReport().summary?.inhouseServices || 0) }}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label class="mb-2 block text-sm font-semibold text-slate-700">Recipient Email</label>
                    <input
                      type="email"
                      [(ngModel)]="reportRecipientEmail"
                      placeholder="finance@example.com"
                      class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    (click)="sendReportEmail()"
                    [disabled]="isSendingReportEmail()"
                    class="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {{ isSendingReportEmail() ? 'Sending...' : 'Send Email' }}
                  </button>

                  @if (reportEmailFeedback()) {
                    <div
                      class="rounded-2xl px-4 py-4 text-sm leading-6"
                      [class.border]="true"
                      [class.border-emerald-200]="reportEmailFeedbackType() === 'success'"
                      [class.bg-emerald-50]="reportEmailFeedbackType() === 'success'"
                      [class.text-emerald-900]="reportEmailFeedbackType() === 'success'"
                      [class.border-red-200]="reportEmailFeedbackType() === 'error'"
                      [class.bg-red-50]="reportEmailFeedbackType() === 'error'"
                      [class.text-red-900]="reportEmailFeedbackType() === 'error'"
                    >
                      {{ reportEmailFeedback() }}
                    </div>
                  }

                  <div class="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-4 text-sm leading-6 text-blue-900">
                    Preview first, then use <span class="font-semibold">Print</span> or <span class="font-semibold">Save as PDF</span> to export the final document.
                  </div>

                  <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
                    Use <span class="font-semibold">Save as PDF</span> to open the browser print dialog and choose <span class="font-semibold">Save as PDF</span>.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
        </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      overflow: hidden;
    }
  `]
})
export class HotelDashboardComponent implements OnInit {
  hotelData = signal<any>(null);
  bookings = signal<any[]>([]);
  stats = signal<any>(null);
  staffMembers = signal<any[]>([]);
  roomStatusSummary = signal<any>(null);
  totalRoomsCount = signal<number>(0);
  isLoading = signal(false);
  errorMessage = signal('');
  showReportModal = signal(false);
  showReportPreviewModal = signal(false);
  isGeneratingReport = signal(false);
  isSendingReportEmail = signal(false);
  lastGeneratedReport = signal<any>(null);
  reportPreviewHtml = signal('');
  reportPreviewMarkup = signal<SafeHtml | null>(null);
  reportEmailFeedback = signal('');
  reportEmailFeedbackType = signal<'success' | 'error' | ''>('');
  securitySummary = signal<any>(null);

  hotelSidenavItems = [];
  currentRoute = signal('');
  reportType: 'daily' | 'monthly' | 'custom' = 'custom';
  reportDate = this.getTodayDateInput();
  reportMonth = this.getCurrentMonthInput();
  reportEndDate = this.getTodayDateInput();
  reportRecipientEmail = '';

  constructor(
    private hotelService: HotelService,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    // Refresh hotelId from localStorage to ensure HotelService has the correct ID
    const hotelId = localStorage.getItem('hotelId');
    if (hotelId) {
      this.hotelService.setHotelId(hotelId);
      console.log('✅ Hotel dashboard: hotelId refreshed in service:', hotelId);
    }

    this.loadHotelData();
    // Detect child routes
    this.activatedRoute.firstChild?.params.subscribe(() => {
      const firstChild = this.activatedRoute.firstChild;
      if (firstChild) {
        this.currentRoute.set(firstChild.component?.name || 'dashboard');
      }
    });
  }

  hasChildRoute(): boolean {
    return !!this.activatedRoute.firstChild;
  }

  loadHotelData(): void {
    this.isLoading.set(true);

    // Load all data in parallel
    forkJoin({
      details: this.hotelService.getHotelDetails(),
      stats: this.hotelService.getHotelStats(),
      bookings: this.hotelService.getHotelBookings(1, 5),
      staff: this.hotelService.getStaff(1, 10),
      rooms: this.hotelService.getRooms(1, 100),
      deviceAssignments: this.hotelService.getDeviceAssignments()
    }).subscribe({
      next: (results: any) => {
        // Load hotel details
        if (results.details.status === 'success' && results.details.data) {
          this.hotelData.set(results.details.data);
          console.log('✅ Hotel data loaded:', results.details.data);
        }

        // Load stats
        if (results.stats.status === 'success' && results.stats.data) {
          this.stats.set(results.stats.data);
        }

        // Load bookings
        if (results.bookings.status === 'success' && Array.isArray(results.bookings.data)) {
          this.bookings.set(results.bookings.data);
          console.log('✅ Bookings loaded:', results.bookings.data);
        }

        // Load staff
        if (results.staff.status === 'success' && Array.isArray(results.staff.data)) {
          this.staffMembers.set(results.staff.data);
          console.log('✅ Staff loaded:', results.staff.data);
        }

        // Calculate room status summary from rooms data
        if (results.rooms.status === 'success' && Array.isArray(results.rooms.data)) {
          const roomSummary = this.calculateRoomStatusSummary(results.rooms.data);
          this.roomStatusSummary.set(roomSummary);
          this.totalRoomsCount.set(results.rooms.data.length);
          console.log('✅ Room status summary calculated:', roomSummary);
        }

        if (results.deviceAssignments.status === 'success' && results.deviceAssignments.data?.summary) {
          this.securitySummary.set(results.deviceAssignments.data.summary);
        }

        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('❌ Error loading hotel data:', error);
        this.errorMessage.set('Failed to load hotel data. Please try refreshing.');
        this.isLoading.set(false);
      }
    });
  }

  private calculateRoomStatusSummary(rooms: any[]): any {
    const summary = {
      occupied: 0,
      available: 0,
      cleaning: 0,
      maintenance: 0
    };

    rooms.forEach((room: any) => {
      const status = room.status?.toLowerCase() || 'available';
      if (status === 'occupied' || status === 'checked-in') {
        summary.occupied++;
      } else if (status === 'available') {
        summary.available++;
      } else if (status === 'cleaning') {
        summary.cleaning++;
      } else if (status === 'maintenance') {
        summary.maintenance++;
      }
    });

    return summary;
  }

  getOccupancyRate(): number {
    const total = this.totalRoomsCount() || 0;
    if (total === 0) return 0;
    const occupied = this.bookings().length || 0;
    return Math.round((occupied / total) * 100);
  }

  getTotalRevenue(): number {
    if (!this.stats()) return 0;
    return this.stats().totalRevenue || 0;
  }

  getAvailableRooms(): number {
    return (this.totalRoomsCount() || 0) - (this.bookings().length || 0);
  }

  getRoomStatusPercentage(status: string): number {
    const summary = this.roomStatusSummary();
    if (!summary) return 0;

    const total = summary.occupied + summary.available + summary.cleaning + summary.maintenance;
    if (total === 0) return 0;

    const count = summary[status] || 0;
    return Math.round((count / total) * 100);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  openReportModal(type: 'daily' | 'monthly' | 'custom' = 'custom'): void {
    this.reportType = type;
    this.showReportModal.set(true);
    this.errorMessage.set('');
    this.reportEmailFeedback.set('');
    this.reportEmailFeedbackType.set('');
  }

  closeReportModal(): void {
    this.showReportModal.set(false);
  }

  closeReportPreviewModal(): void {
    this.showReportPreviewModal.set(false);
  }

  openLatestReportPreview(): void {
    if (!this.lastGeneratedReport()) return;
    const reportDocument = this.buildReportPreviewHtml(this.lastGeneratedReport());
    this.reportPreviewHtml.set(reportDocument);
    this.reportPreviewMarkup.set(this.sanitizer.bypassSecurityTrustHtml(this.extractReportBody(reportDocument)));
    this.showReportPreviewModal.set(true);
  }

  generateIncomeReport(): void {
    this.isGeneratingReport.set(true);
    this.errorMessage.set('');
    this.reportEmailFeedback.set('');
    this.reportEmailFeedbackType.set('');

    this.hotelService.getIncomeReport(this.reportType, this.getSelectedReportDate(), this.getSelectedReportEndDate()).subscribe({
      next: (response: any) => {
        this.isGeneratingReport.set(false);

        if (response.status === 'success' && response.data) {
          this.lastGeneratedReport.set(response.data);
          const reportDocument = this.buildReportPreviewHtml(response.data);
          this.reportPreviewHtml.set(reportDocument);
          this.reportPreviewMarkup.set(this.sanitizer.bypassSecurityTrustHtml(this.extractReportBody(reportDocument)));
          this.showReportModal.set(false);
          this.showReportPreviewModal.set(true);
        } else {
          this.errorMessage.set(response.message || 'Failed to generate report');
        }
      },
      error: (error: any) => {
        this.isGeneratingReport.set(false);
        this.errorMessage.set(error.message || 'Failed to generate report');
      }
    });
  }

  printReport(): void {
    this.openReportPrintWindow();
  }

  saveReportAsPdf(): void {
    this.openReportPrintWindow();
  }

  sendReportEmail(): void {
    const report = this.lastGeneratedReport();
    if (!report || !this.reportRecipientEmail.trim()) {
      this.reportEmailFeedback.set('Enter a recipient email before sending the report');
      this.reportEmailFeedbackType.set('error');
      return;
    }

    this.isSendingReportEmail.set(true);
    this.reportEmailFeedback.set('');
    this.reportEmailFeedbackType.set('');

    this.hotelService.sendIncomeReportEmail(
      this.reportRecipientEmail.trim(),
      report.period === 'monthly' ? 'monthly' : report.period === 'custom' ? 'custom' : 'daily',
      this.getReportRequestDate(report),
      this.getReportRequestEndDate(report)
    ).subscribe({
      next: (response: any) => {
        this.isSendingReportEmail.set(false);

        if (response.status === 'success') {
          this.reportEmailFeedback.set(response.message || `Income report sent to ${this.reportRecipientEmail.trim()}`);
          this.reportEmailFeedbackType.set('success');
          return;
        }

        this.reportEmailFeedback.set(response.message || 'Failed to send income report email');
        this.reportEmailFeedbackType.set('error');
      },
      error: (error: any) => {
        this.isSendingReportEmail.set(false);
        this.reportEmailFeedback.set(error.message || 'Failed to send income report email');
        this.reportEmailFeedbackType.set('error');
      }
    });
  }

  getReportPeriodLabel(report: any): string {
    if (!report) return 'Income Report';

    const startDate = new Date(report.startDate);
    if (report.period === 'monthly') {
      return startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }

    return startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  }

  private openReportPrintWindow(): void {
    const previewWindow = window.open('', '_blank', 'width=1100,height=900');
    if (!previewWindow) return;

    previewWindow.document.open();
    previewWindow.document.write(this.reportPreviewHtml());
    previewWindow.document.close();
    previewWindow.focus();
    setTimeout(() => previewWindow.print(), 250);
  }

  private getSelectedReportDate(): string {
    if (this.reportType === 'monthly') return this.reportMonth;
    return this.reportDate;
  }

  private getSelectedReportEndDate(): string | undefined {
    return this.reportType === 'custom' ? this.reportEndDate : undefined;
  }

  private getReportRequestDate(report: any): string {
    const startDate = new Date(report?.startDate || Date.now());
    return report?.period === 'monthly'
      ? startDate.toISOString().slice(0, 7)
      : startDate.toISOString().slice(0, 10);
  }

  private getReportRequestEndDate(report: any): string | undefined {
    if (report?.period !== 'custom') return undefined;
    const endDate = new Date(report?.endDate || Date.now());
    return endDate.toISOString().slice(0, 10);
  }

  private getTodayDateInput(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private getCurrentMonthInput(): string {
    return new Date().toISOString().slice(0, 7);
  }

  private buildReportPreviewHtml(report: any): string {
    const entries = Array.isArray(report?.entries) ? report.entries : [];
    const rows = entries.length > 0
      ? entries.map((entry: any) => `
          <tr>
            <td class="cell cell-date">${this.escapeHtml(this.formatReportDate(entry.occurredAt))}</td>
            <td class="cell cell-category">${this.escapeHtml(entry.category || '-')}</td>
            <td class="cell cell-description">${this.escapeHtml(entry.label || '-')}</td>
            <td class="cell cell-guest">${this.escapeHtml(entry.guestName || '-')}</td>
            <td class="cell cell-room">${this.escapeHtml(entry.roomNumber || '-')}</td>
            <td class="cell cell-status"><span class="status-chip">${this.escapeHtml((entry.status || '-').toString())}</span></td>
            <td class="cell amount">${this.escapeHtml(this.formatCurrency(entry.amount || 0))}</td>
          </tr>
        `).join('')
      : `
        <tr>
          <td colspan="7" class="empty-row">No income records found for the selected period.</td>
        </tr>
      `;

    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>Hotel Income Report</title>
          <style>
            * { box-sizing: border-box; }
            body {
              margin: 0;
              background: #dde5ee;
              color: #212529;
              font-family: Arial, sans-serif;
              line-height: 1.45;
            }
            .page {
              max-width: 1160px;
              margin: 28px auto;
              background: #ffffff;
              padding: 40px 42px 36px;
              border: 2px solid #cfd4da;
              box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
            }
            .eyebrow {
              display: inline-block;
              margin-bottom: 12px;
              color: #6c757d;
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 0.18em;
              text-transform: uppercase;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              gap: 28px;
              padding-bottom: 24px;
              border-bottom: 2px solid #ced4da;
            }
            .header h1 {
              margin: 0;
              font-size: 30px;
              font-weight: 700;
            }
            .subheading {
              margin: 8px 0 0;
              color: #495057;
              font-size: 14px;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 14px 22px;
              margin-top: 20px;
            }
            .meta-card {
              min-height: 86px;
              padding: 16px 18px;
              border: 1px solid #adb5bd;
              border-radius: 0;
              background: #f8f9fa;
            }
            .meta-label {
              margin-bottom: 6px;
              color: #6c757d;
              font-size: 12px;
              font-weight: 700;
              letter-spacing: 0.08em;
              text-transform: uppercase;
            }
            .meta-value {
              color: #212529;
              font-size: 15px;
              font-weight: 700;
              line-height: 1.5;
              word-break: break-word;
            }
            .summary {
              display: grid;
              grid-template-columns: repeat(4, minmax(0, 1fr));
              gap: 16px;
              margin: 28px 0 34px;
            }
            .card {
              padding: 18px 18px 20px;
              border: 1px solid #adb5bd;
              border-radius: 0;
              background: #ffffff;
            }
            .card .label {
              margin-bottom: 10px;
              color: #6c757d;
              font-size: 12px;
              font-weight: 700;
              letter-spacing: 0.08em;
              text-transform: uppercase;
            }
            .card .value {
              color: #212529;
              font-size: 26px;
              font-weight: 700;
              line-height: 1.2;
            }
            .section-title {
              margin: 0 0 12px;
              font-size: 20px;
              font-weight: 700;
            }
            .section-block {
              margin-top: 10px;
              padding: 14px 14px 16px;
              border: 1px solid #adb5bd;
              background: #ffffff;
            }
            .table-wrap {
              overflow: hidden;
              border: 1px solid #adb5bd;
              border-radius: 0;
              background: #ffffff;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              table-layout: fixed;
            }
            thead th {
              padding: 12px;
              background: #f8f9fa;
              color: #212529;
              font-size: 12px;
              font-weight: 700;
              text-align: left;
              border-bottom: 2px solid #dee2e6;
            }
            tbody tr:nth-child(odd) {
              background: #ffffff;
            }
            tbody tr:nth-child(even) {
              background: rgba(0, 0, 0, 0.05);
            }
            .cell {
              padding: 12px;
              vertical-align: top;
              color: #212529;
              font-size: 13px;
              line-height: 1.5;
              word-break: break-word;
              border-top: 1px solid #dee2e6;
            }
            .cell-date { width: 120px; color: #495057; }
            .cell-category { width: 150px; color: #495057; font-weight: 600; }
            .cell-description { width: 260px; }
            .cell-guest { width: 160px; }
            .cell-room { width: 90px; color: #495057; font-weight: 600; }
            .cell-status { width: 110px; }
            .status-chip {
              display: inline-block;
              padding: 4px 8px;
              border: 1px solid #adb5bd;
              border-radius: 0;
              background: #e9ecef;
              color: #495057;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
            }
            .amount {
              width: 132px;
              text-align: right;
              font-weight: 800;
              white-space: nowrap;
            }
            .empty-row {
              padding: 20px 12px;
              text-align: center;
              color: #6c757d;
              font-size: 14px;
            }
            .footer {
              display: flex;
              justify-content: space-between;
              gap: 24px;
              margin-top: 20px;
              padding-top: 18px;
              border-top: 2px solid #ced4da;
              color: #6c757d;
              font-size: 12px;
              line-height: 1.7;
            }
            .footer-note {
              max-width: 680px;
            }
            .footer-total {
              text-align: right;
            }
            .footer-total strong {
              display: block;
              color: #212529;
              font-size: 18px;
              margin-top: 4px;
            }
            @media (max-width: 900px) {
              .page { margin: 0; padding: 24px; }
              .header { flex-direction: column; }
              .meta-grid, .summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            }
            @media print {
              body { background: #fff; }
              .page {
                margin: 0;
                max-width: none;
                padding: 20px 22px;
                box-shadow: none;
              }
              .table-wrap { border-radius: 0; }
            }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="eyebrow">Income Statement</div>
            <div class="header">
              <div>
                <h1>Hotel Income Report</h1>
                <p class="subheading">
                  Revenue summary for room bookings, food and drink orders, and inhouse service activity.
                </p>
              </div>
              <div style="min-width: 220px; text-align: right;">
                <div class="meta-label">Period</div>
                <div class="meta-value">${this.escapeHtml(this.getReportPeriodLabel(report))}</div>
              </div>
            </div>

            <div class="meta-grid">
              <div class="meta-card">
                <div class="meta-label">Hotel</div>
                <div class="meta-value">${this.escapeHtml(this.hotelData()?.name || 'Hotel')}</div>
              </div>
              <div class="meta-card">
                <div class="meta-label">Generated</div>
                <div class="meta-value">${this.escapeHtml(this.formatReportDateTime(report.generatedAt))}</div>
              </div>
              <div class="meta-card">
                <div class="meta-label">Start Date</div>
                <div class="meta-value">${this.escapeHtml(this.formatReportDate(report.startDate))}</div>
              </div>
              <div class="meta-card">
                <div class="meta-label">End Date</div>
                <div class="meta-value">${this.escapeHtml(this.formatReportDate(report.endDate))}</div>
              </div>
            </div>

            <div class="summary">
              <div class="card">
                <div class="label">Total Income</div>
                <div class="value">${this.escapeHtml(this.formatCurrency(report.summary?.totalIncome || 0))}</div>
              </div>
              <div class="card">
                <div class="label">Room Bookings</div>
                <div class="value">${this.escapeHtml(this.formatCurrency(report.summary?.roomBookings || 0))}</div>
              </div>
              <div class="card">
                <div class="label">Food and Drinks</div>
                <div class="value">${this.escapeHtml(this.formatCurrency(report.summary?.foodAndDrinks || 0))}</div>
              </div>
              <div class="card">
                <div class="label">Inhouse Services</div>
                <div class="value">${this.escapeHtml(this.formatCurrency(report.summary?.inhouseServices || 0))}</div>
              </div>
            </div>

            <div class="section-block">
              <div class="section-title">Revenue Entries</div>
              <div class="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Guest</th>
                      <th>Room</th>
                      <th>Status</th>
                      <th class="amount">Amount</th>
                    </tr>
                  </thead>
                  <tbody>${rows}</tbody>
                </table>
              </div>
            </div>

            <div class="footer">
              <div class="footer-note">
                Generated from live hotel bookings, food and drink orders, and inhouse service records for the selected period.
              </div>
              <div class="footer-total">
                Grand Total
                <strong>${this.escapeHtml(this.formatCurrency(report.summary?.totalIncome || 0))}</strong>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private formatReportDate(value: string): string {
    return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  private formatReportDateTime(value: string): string {
    return new Date(value).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private escapeHtml(value: string): string {
    return (value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private extractReportBody(documentHtml: string): string {
    const styleMatch = documentHtml.match(/<style>([\s\S]*?)<\/style>/i);
    const bodyMatch = documentHtml.match(/<body>([\s\S]*?)<\/body>/i);
    const styles = styleMatch ? `<style>${styleMatch[1]}</style>` : '';
    const body = bodyMatch ? bodyMatch[1] : documentHtml;
    return `${styles}${body}`;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  onLogout(): void {
    this.authService.logout();
    console.log('User logged out');
  }
}
