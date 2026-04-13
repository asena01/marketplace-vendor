import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminService } from '../../../services/admin.service';
import { AuthService } from '../../../services/auth.service';

type HotelAdminTab = 'overview' | 'bookings' | 'rooms' | 'staff' | 'devices' | 'reviews' | 'security';

@Component({
  selector: 'app-admin-hotel-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-100 pt-16">
      <header class="fixed top-0 left-0 right-0 z-50 h-16 bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg">
        <div class="flex h-16 items-center justify-between px-4">
          <div class="flex items-center gap-3">
            <span class="material-icons text-3xl">admin_panel_settings</span>
            <div>
              <h1 class="text-xl font-bold">Admin Dashboard</h1>
              <p class="text-xs text-slate-300">MarketHub Administration</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="hidden text-right text-xs sm:block">
              <p class="font-semibold">{{ getCurrentUserName() }}</p>
              <p class="text-xs text-slate-300">{{ getAdminRole() }}</p>
            </div>
            <button
              (click)="logout()"
              class="flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold transition hover:bg-red-700"
            >
              <span class="material-icons text-lg">logout</span>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div class="relative flex">
        <aside class="fixed top-16 left-0 bottom-0 z-30 w-72 flex-shrink-0 overflow-y-auto bg-white shadow-lg">
          <nav class="space-y-2 p-6">
            <p class="mb-4 text-xs font-semibold uppercase text-gray-500">System</p>

            <button (click)="navigateToPage('overview')" class="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left font-medium text-gray-700 transition hover:bg-gray-100">
              <span class="material-icons">dashboard</span>
              Overview
            </button>

            <button (click)="navigateToPage('profile')" class="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left font-medium text-gray-700 transition hover:bg-gray-100">
              <span class="material-icons">account_circle</span>
              Profile
            </button>

            <button (click)="navigateToPage('settings')" class="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left font-medium text-gray-700 transition hover:bg-gray-100">
              <span class="material-icons">settings</span>
              Settings
            </button>

            <button (click)="navigateToPage('roles')" class="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left font-medium text-gray-700 transition hover:bg-gray-100">
              <span class="material-icons">security</span>
              Roles & Permissions
            </button>

            <button (click)="navigateToPage('users')" class="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left font-medium text-gray-700 transition hover:bg-gray-100">
              <span class="material-icons">people</span>
              System Users
            </button>

            <button (click)="navigateToPage('devices')" class="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left font-medium text-gray-700 transition hover:bg-gray-100">
              <span class="material-icons">devices</span>
              Smart Devices
            </button>

            <p class="mb-4 mt-8 text-xs font-semibold uppercase text-gray-500">Businesses</p>

            <button
              (click)="goBack()"
              class="flex w-full items-center justify-between rounded-lg border-l-4 border-blue-600 bg-blue-100 px-4 py-3 text-left font-medium text-blue-700 transition"
            >
              <span class="flex items-center gap-3">
                <span class="material-icons">hotel</span>
                Hotels
              </span>
              <span class="material-icons text-lg">chevron_right</span>
            </button>

            <button (click)="navigateToCategory('restaurants')" class="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left font-medium text-gray-700 transition hover:bg-gray-100">
              <span class="flex items-center gap-3">
                <span class="material-icons">restaurant</span>
                Restaurants
              </span>
              <span class="material-icons text-lg">chevron_right</span>
            </button>

            <button (click)="navigateToCategory('retail')" class="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left font-medium text-gray-700 transition hover:bg-gray-100">
              <span class="flex items-center gap-3">
                <span class="material-icons">storefront</span>
                Retail Stores
              </span>
              <span class="material-icons text-lg">chevron_right</span>
            </button>

            <button (click)="navigateToCategory('services')" class="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left font-medium text-gray-700 transition hover:bg-gray-100">
              <span class="flex items-center gap-3">
                <span class="material-icons">handyman</span>
                Services
              </span>
              <span class="material-icons text-lg">chevron_right</span>
            </button>

            <button (click)="navigateToCategory('tours')" class="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left font-medium text-gray-700 transition hover:bg-gray-100">
              <span class="flex items-center gap-3">
                <span class="material-icons">flight_takeoff</span>
                Tours & Travel
              </span>
              <span class="material-icons text-lg">chevron_right</span>
            </button>

            <button (click)="navigateToCategory('delivery')" class="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left font-medium text-gray-700 transition hover:bg-gray-100">
              <span class="flex items-center gap-3">
                <span class="material-icons">local_shipping</span>
                Delivery
              </span>
              <span class="material-icons text-lg">chevron_right</span>
            </button>
          </nav>
        </aside>

        <main class="ml-72 flex-1 p-8">
          <div class="mx-auto max-w-7xl">
        <div class="mb-6 flex items-center gap-3">
          <button
            (click)="goBack()"
            class="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            <span class="material-icons">arrow_back</span>
          </button>
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Admin Hotels</p>
            <h1 class="text-2xl font-black tracking-tight text-slate-900">Hotel Workspace</h1>
          </div>
        </div>

        @if (isLoading()) {
          <div class="rounded-[28px] border border-slate-200 bg-white px-8 py-20 text-center shadow-sm">
            <p class="text-sm font-semibold text-slate-500">Loading hotel workspace...</p>
          </div>
        } @else if (errorMessage()) {
          <div class="rounded-[28px] border border-rose-200 bg-rose-50 px-8 py-10 text-rose-700 shadow-sm">
            <p class="text-sm font-bold uppercase tracking-[0.18em]">Load Error</p>
            <p class="mt-3 text-lg font-semibold">{{ errorMessage() }}</p>
          </div>
        } @else {
          <section class="rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-900 to-blue-900 px-6 py-7 text-white shadow-xl">
            <div class="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div class="max-w-3xl">
                <p class="text-xs font-bold uppercase tracking-[0.24em] text-blue-200">Hotel Profile</p>
                <h2 class="mt-3 text-3xl font-black tracking-tight">{{ hotelName() }}</h2>
                <p class="mt-2 text-sm text-slate-200">
                  {{ hotelEmail() || 'No email on file' }} · {{ hotelPhone() || 'No phone on file' }}
                </p>
                <p class="mt-3 max-w-2xl text-sm text-slate-300">{{ hotelAddress() || 'Address not available yet.' }}</p>
                @if (vendorStatus() === 'pending') {
                  <div class="mt-4">
                    <button
                      (click)="approveCurrentVendor()"
                      [disabled]="approvingVendor()"
                      class="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span class="material-icons text-base">check_circle</span>
                      {{ approvingVendor() ? 'Approving Hotel...' : 'Approve Hotel' }}
                    </button>
                  </div>
                }
              </div>
              <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div class="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
                  <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-100">Rooms</p>
                  <p class="mt-2 text-2xl font-black">{{ rooms().length }}</p>
                </div>
                <div class="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
                  <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-100">Staff</p>
                  <p class="mt-2 text-2xl font-black">{{ staff().length }}</p>
                </div>
                <div class="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
                  <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-100">Contactless</p>
                  <p class="mt-2 text-2xl font-black">{{ securitySummary().contactlessReadyRooms }}</p>
                </div>
                <div class="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
                  <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-100">Monitoring</p>
                  <p class="mt-2 text-2xl font-black">{{ securitySummary().monitoredOnlyRooms }}</p>
                </div>
              </div>
            </div>
          </section>

          <section class="mt-6 rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm">
            <div class="flex flex-wrap gap-2">
              @for (tab of tabs; track tab.id) {
                <button
                  (click)="activeTab.set(tab.id)"
                  [class]="'rounded-2xl px-4 py-3 text-sm font-bold transition ' + (activeTab() === tab.id ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')"
                >
                  {{ tab.label }}
                </button>
              }
            </div>
          </section>

          @if (activeTab() === 'overview') {
            <section class="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div class="space-y-6">
                <div class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 class="text-lg font-black tracking-tight text-slate-900">Operational Summary</h3>
                  <div class="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div class="rounded-2xl bg-slate-50 p-4">
                      <p class="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Active Rooms</p>
                      <p class="mt-2 text-2xl font-black text-slate-900">{{ getAvailableRoomCount() }}</p>
                    </div>
                    <div class="rounded-2xl bg-slate-50 p-4">
                      <p class="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Unassigned Devices</p>
                      <p class="mt-2 text-2xl font-black text-slate-900">{{ securitySummary().unassignedDevices }}</p>
                    </div>
                    <div class="rounded-2xl bg-slate-50 p-4">
                      <p class="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Assigned Devices</p>
                      <p class="mt-2 text-2xl font-black text-slate-900">{{ securitySummary().assignedDevices }}</p>
                    </div>
                    <div class="rounded-2xl bg-slate-50 p-4">
                      <p class="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Hotel Status</p>
                      <p class="mt-2 text-lg font-black" [class]="getStatusTextClass(vendorStatus())">{{ vendorStatus() || 'unknown' }}</p>
                    </div>
                  </div>
                </div>

                <div class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 class="text-lg font-black tracking-tight text-slate-900">Room Snapshot</h3>
                  <div class="mt-5 overflow-x-auto">
                    <table class="min-w-full divide-y divide-slate-200">
                      <thead class="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                        <tr>
                          <th class="px-4 py-3">Room</th>
                          <th class="px-4 py-3">Type</th>
                          <th class="px-4 py-3">Status</th>
                          <th class="px-4 py-3">Access</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100">
                        @for (room of rooms().slice(0, 8); track room.id || room._id) {
                          <tr>
                            <td class="px-4 py-4 text-sm font-semibold text-slate-900">{{ room.number || room.roomNumber || 'N/A' }}</td>
                            <td class="px-4 py-4 text-sm text-slate-600">{{ room.type || room.roomType || 'Room' }}</td>
                            <td class="px-4 py-4 text-sm text-slate-600">{{ room.status || 'unknown' }}</td>
                            <td class="px-4 py-4">
                              <span [class]="'inline-flex rounded-full px-3 py-1 text-xs font-bold ' + getRoomAccessBadgeClass(room)">
                                {{ getRoomAccessLabel(room) }}
                              </span>
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div class="space-y-6">
                <div class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 class="text-lg font-black tracking-tight text-slate-900">Vendor Contact</h3>
                  <dl class="mt-5 space-y-4 text-sm">
                    <div>
                      <dt class="font-bold uppercase tracking-[0.16em] text-slate-500">Vendor Email</dt>
                      <dd class="mt-1 font-semibold text-slate-900">{{ vendorEmail() || 'No email' }}</dd>
                    </div>
                    <div>
                      <dt class="font-bold uppercase tracking-[0.16em] text-slate-500">Phone</dt>
                      <dd class="mt-1 font-semibold text-slate-900">{{ vendorPhone() || 'No phone' }}</dd>
                    </div>
                    <div>
                      <dt class="font-bold uppercase tracking-[0.16em] text-slate-500">KYC</dt>
                      <dd class="mt-1">
                        <span [class]="'inline-flex rounded-full px-3 py-1 text-xs font-bold ' + getKycBadgeClass(vendorKycStatus())">
                          {{ vendorKycStatus() || 'unknown' }}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>

                <div class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 class="text-lg font-black tracking-tight text-slate-900">Security Posture</h3>
                  <div class="mt-5 space-y-3">
                    <div class="rounded-2xl bg-emerald-50 px-4 py-4">
                      <p class="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Contactless Ready</p>
                      <p class="mt-2 text-2xl font-black text-emerald-900">{{ securitySummary().contactlessReadyRooms }}</p>
                    </div>
                    <div class="rounded-2xl bg-amber-50 px-4 py-4">
                      <p class="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">Monitored Only</p>
                      <p class="mt-2 text-2xl font-black text-amber-900">{{ securitySummary().monitoredOnlyRooms }}</p>
                    </div>
                    <div class="rounded-2xl bg-slate-50 px-4 py-4">
                      <p class="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Manual Access</p>
                      <p class="mt-2 text-2xl font-black text-slate-900">{{ getManualAccessRoomCount() }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          }

          @if (activeTab() === 'bookings') {
            <section class="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div class="flex items-center justify-between gap-4">
                <div>
                  <h3 class="text-lg font-black tracking-tight text-slate-900">Booking Oversight</h3>
                  <p class="mt-1 text-sm text-slate-500">Super-admin visibility into guest stays and booking status.</p>
                </div>
                <div class="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">{{ bookings().length }} bookings</div>
              </div>
              @if (bookings().length >= defaultAdminPageSize) {
                <div class="mt-4 flex items-center justify-end gap-2 text-sm">
                  <button
                    (click)="previousBookingsPage()"
                    [disabled]="bookingsPage() === 1"
                    class="rounded-xl border border-slate-200 px-3 py-2 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <span class="font-semibold text-slate-600">Page {{ bookingsPage() }} / {{ getBookingsPageCount() }}</span>
                  <button
                    (click)="nextBookingsPage()"
                    [disabled]="bookingsPage() >= getBookingsPageCount()"
                    class="rounded-xl border border-slate-200 px-3 py-2 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              }

              @if (bookings().length === 0) {
                <p class="mt-8 rounded-2xl bg-slate-50 px-5 py-6 text-sm font-medium text-slate-500">No bookings available for this hotel.</p>
              } @else {
                <div class="mt-5 overflow-x-auto">
                  <table class="min-w-full divide-y divide-slate-200">
                    <thead class="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                      <tr>
                        <th class="px-4 py-3">Guest</th>
                        <th class="px-4 py-3">Room</th>
                        <th class="px-4 py-3">Stay</th>
                        <th class="px-4 py-3">Status</th>
                        <th class="px-4 py-3">Booked</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      @for (booking of getPaginatedBookings(); track booking._id) {
                        <tr>
                          <td class="px-4 py-4">
                            <p class="text-sm font-bold text-slate-900">{{ booking.guest?.name || booking.guestName || 'Guest' }}</p>
                            <p class="mt-1 text-xs text-slate-500">{{ booking.guest?.email || booking.guestEmail || 'No email' }}</p>
                          </td>
                          <td class="px-4 py-4 text-sm text-slate-600">
                            Room {{ booking.room?.roomNumber || booking.roomNumber || 'TBA' }}
                            <div class="mt-1 text-xs text-slate-500">{{ booking.room?.roomType || booking.roomType || 'Room' }}</div>
                          </td>
                          <td class="px-4 py-4 text-sm text-slate-600">
                            <div>{{ formatDateLabel(booking.checkInDate) }}</div>
                            <div class="mt-1 text-xs text-slate-500">to {{ formatDateLabel(booking.checkOutDate) }}</div>
                          </td>
                          <td class="px-4 py-4">
                            <span [class]="'inline-flex rounded-full px-3 py-1 text-xs font-bold ' + getStatusBadgeClass(booking.status)">
                              {{ booking.status || 'unknown' }}
                            </span>
                          </td>
                          <td class="px-4 py-4 text-sm text-slate-600">{{ formatDateLabel(booking.createdAt) }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </section>
          }

          @if (activeTab() === 'rooms') {
            <section class="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div class="flex items-center justify-between gap-4">
                <div>
                  <h3 class="text-lg font-black tracking-tight text-slate-900">Room Inventory</h3>
                  <p class="mt-1 text-sm text-slate-500">Room status, access mode, and security-readiness audit.</p>
                </div>
                <div class="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">{{ rooms().length }} rooms</div>
              </div>
              @if (rooms().length >= defaultAdminPageSize) {
                <div class="mt-4 flex items-center justify-end gap-2 text-sm">
                  <button
                    (click)="previousRoomsPage()"
                    [disabled]="roomsPage() === 1"
                    class="rounded-xl border border-slate-200 px-3 py-2 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <span class="font-semibold text-slate-600">Page {{ roomsPage() }} / {{ getRoomsPageCount() }}</span>
                  <button
                    (click)="nextRoomsPage()"
                    [disabled]="roomsPage() >= getRoomsPageCount()"
                    class="rounded-xl border border-slate-200 px-3 py-2 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              }

              <div class="mt-5 overflow-x-auto">
                <table class="min-w-full divide-y divide-slate-200">
                  <thead class="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    <tr>
                      <th class="px-4 py-3">Room</th>
                      <th class="px-4 py-3">Type</th>
                      <th class="px-4 py-3">Capacity</th>
                      <th class="px-4 py-3">Status</th>
                      <th class="px-4 py-3">Access</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    @for (room of getPaginatedRooms(); track room.id || room._id) {
                      <tr>
                        <td class="px-4 py-4 text-sm font-bold text-slate-900">{{ room.number || room.roomNumber || 'N/A' }}</td>
                        <td class="px-4 py-4 text-sm text-slate-600">{{ room.type || room.roomType || 'Room' }}</td>
                        <td class="px-4 py-4 text-sm text-slate-600">{{ room.capacity || 'N/A' }}</td>
                        <td class="px-4 py-4">
                          <span [class]="'inline-flex rounded-full px-3 py-1 text-xs font-bold ' + getStatusBadgeClass(room.status)">
                            {{ room.status || 'unknown' }}
                          </span>
                        </td>
                        <td class="px-4 py-4">
                          <span [class]="'inline-flex rounded-full px-3 py-1 text-xs font-bold ' + getRoomAccessBadgeClass(room)">
                            {{ getRoomAccessLabel(room) }}
                          </span>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </section>
          }

          @if (activeTab() === 'staff') {
            <section class="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div class="flex items-center justify-between gap-4">
                <div>
                  <h3 class="text-lg font-black tracking-tight text-slate-900">Staff Directory</h3>
                  <p class="mt-1 text-sm text-slate-500">Hotel staff users and operational roles.</p>
                </div>
                <div class="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">{{ staff().length }} staff</div>
              </div>
              @if (staff().length >= defaultAdminPageSize) {
                <div class="mt-4 flex items-center justify-end gap-2 text-sm">
                  <button
                    (click)="previousStaffPage()"
                    [disabled]="staffPage() === 1"
                    class="rounded-xl border border-slate-200 px-3 py-2 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <span class="font-semibold text-slate-600">Page {{ staffPage() }} / {{ getStaffPageCount() }}</span>
                  <button
                    (click)="nextStaffPage()"
                    [disabled]="staffPage() >= getStaffPageCount()"
                    class="rounded-xl border border-slate-200 px-3 py-2 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              }

              @if (staff().length === 0) {
                <p class="mt-8 rounded-2xl bg-slate-50 px-5 py-6 text-sm font-medium text-slate-500">No staff records available for this hotel.</p>
              } @else {
                <div class="mt-5 overflow-x-auto">
                  <table class="min-w-full divide-y divide-slate-200">
                    <thead class="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                      <tr>
                        <th class="px-4 py-3">Name</th>
                        <th class="px-4 py-3">Role</th>
                        <th class="px-4 py-3">Department</th>
                        <th class="px-4 py-3">Status</th>
                        <th class="px-4 py-3">Modules</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      @for (member of getPaginatedStaff(); track member._id) {
                        <tr>
                          <td class="px-4 py-4">
                            <p class="text-sm font-bold text-slate-900">{{ member.name }}</p>
                            <p class="mt-1 text-xs text-slate-500">{{ member.email }}</p>
                          </td>
                          <td class="px-4 py-4 text-sm font-medium text-slate-700">{{ member.position || member.accessRole || 'staff' }}</td>
                          <td class="px-4 py-4 text-sm text-slate-600">{{ member.department || 'N/A' }}</td>
                          <td class="px-4 py-4">
                            <span [class]="'inline-flex rounded-full px-3 py-1 text-xs font-bold ' + getStatusBadgeClass(member.status)">
                              {{ member.status || 'unknown' }}
                            </span>
                          </td>
                          <td class="px-4 py-4 text-sm text-slate-600">{{ formatAllowedModules(member.allowedModules) }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </section>
          }

          @if (activeTab() === 'reviews') {
            <section class="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div class="flex items-center justify-between gap-4">
                <div>
                  <h3 class="text-lg font-black tracking-tight text-slate-900">Review Oversight</h3>
                  <p class="mt-1 text-sm text-slate-500">Approved guest reviews and vendor response visibility.</p>
                </div>
                <div class="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">{{ reviews().length }} reviews</div>
              </div>
              @if (reviews().length >= defaultAdminPageSize) {
                <div class="mt-4 flex items-center justify-end gap-2 text-sm">
                  <button
                    (click)="previousReviewsPage()"
                    [disabled]="reviewsPage() === 1"
                    class="rounded-xl border border-slate-200 px-3 py-2 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <span class="font-semibold text-slate-600">Page {{ reviewsPage() }} / {{ getReviewsPageCount() }}</span>
                  <button
                    (click)="nextReviewsPage()"
                    [disabled]="reviewsPage() >= getReviewsPageCount()"
                    class="rounded-xl border border-slate-200 px-3 py-2 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              }

              @if (reviews().length === 0) {
                <p class="mt-8 rounded-2xl bg-slate-50 px-5 py-6 text-sm font-medium text-slate-500">No reviews available for this hotel.</p>
              } @else {
                <div class="mt-5 space-y-4">
                  @for (review of getPaginatedReviews(); track review._id) {
                    <div class="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                      <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div class="flex items-center gap-3">
                            <p class="text-sm font-bold text-slate-900">{{ review.guestName || review.customerName || 'Guest' }}</p>
                            <span class="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                              {{ review.rating || 0 }}/5
                            </span>
                            <button
                              (click)="promptBlockReview(review)"
                              class="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700 transition hover:bg-rose-200"
                            >
                              Block Review
                            </button>
                          </div>
                          <p class="mt-2 text-sm font-semibold text-slate-800">{{ review.title || 'Review' }}</p>
                          <p class="mt-2 text-sm leading-6 text-slate-600">{{ review.comment || review.review || 'No review text' }}</p>
                          @if (review.response) {
                            <div class="mt-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                              <p class="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">Hotel Response</p>
                              <p class="mt-2 text-sm text-blue-900">{{ review.response }}</p>
                            </div>
                          }
                        </div>
                        <div class="text-xs font-medium text-slate-500">
                          {{ formatDateLabel(review.createdAt) }}
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }
            </section>
          }

          @if (activeTab() === 'devices') {
            <section class="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <div class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div class="flex items-center justify-between gap-4">
                  <h3 class="text-lg font-black tracking-tight text-slate-900">Assigned Devices</h3>
                  <div class="flex gap-2">
                    <span class="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-700">
                      {{ getAssignedOnlineCount() }} online
                    </span>
                    <span class="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-700">
                      {{ getAssignedOfflineCount() }} offline
                    </span>
                  </div>
                </div>
                @if (assignedDevices().length === 0) {
                  <p class="mt-6 rounded-2xl bg-slate-50 px-5 py-6 text-sm font-medium text-slate-500">No devices are currently assigned.</p>
                } @else {
                  <div class="mt-5 space-y-3">
                    @for (device of assignedDevices(); track device._id || device.deviceId) {
                      <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                        <div class="flex items-start justify-between gap-3">
                          <div>
                            <p class="text-sm font-bold text-slate-900">{{ getDeviceDisplayName(device) }}</p>
                            <p class="mt-1 text-xs text-slate-500">{{ device.deviceType || 'device' }} · Room {{ device.roomNumber || 'Unmapped' }}</p>
                            <p class="mt-2 text-xs font-medium" [class]="getMonitoringTextClass(device.status)">
                              {{ getMonitoringLabel(device) }}
                            </p>
                          </div>
                          <span [class]="'rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ' + getMonitoringBadgeClass(device.status)">
                            {{ formatDeviceStatus(device.status) }}
                          </span>
                        </div>
                        <div class="mt-3 flex justify-end gap-2">
                          <button
                            (click)="checkLiveStatus(device)"
                            [disabled]="checkingDeviceId() === device._id"
                            class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {{ checkingDeviceId() === device._id ? 'Checking...' : 'Check Status' }}
                          </button>
                          <button
                            (click)="openDeviceLogs(device)"
                            class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                          >
                            View Logs
                          </button>
                          <button
                            (click)="promptDeleteDevice(device)"
                            class="rounded-xl bg-rose-100 px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-200 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>

              <div class="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div class="flex items-center justify-between gap-4">
                  <h3 class="text-lg font-black tracking-tight text-slate-900">Unassigned Devices</h3>
                  @if (unassignedDevices().length > unassignedDevicesPageSize) {
                    <div class="flex items-center gap-2 text-sm">
                      <button
                        (click)="previousUnassignedDevicesPage()"
                        [disabled]="unassignedDevicesPage() === 1"
                        class="rounded-xl border border-slate-200 px-3 py-2 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Prev
                      </button>
                      <span class="font-semibold text-slate-600">Page {{ unassignedDevicesPage() }} / {{ getUnassignedDevicesPageCount() }}</span>
                      <button
                        (click)="nextUnassignedDevicesPage()"
                        [disabled]="unassignedDevicesPage() >= getUnassignedDevicesPageCount()"
                        class="rounded-xl border border-slate-200 px-3 py-2 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  }
                </div>
                @if (unassignedDevices().length === 0) {
                  <p class="mt-6 rounded-2xl bg-slate-50 px-5 py-6 text-sm font-medium text-slate-500">All known devices are assigned to rooms.</p>
                } @else {
                  <div class="mt-5 overflow-x-auto">
                    <table class="min-w-full divide-y divide-slate-200">
                      <thead class="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                        <tr>
                          <th class="px-4 py-3">Device</th>
                          <th class="px-4 py-3">Type</th>
                          <th class="px-4 py-3">Status</th>
                          <th class="px-4 py-3">Status</th>
                          <th class="px-4 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100">
                        @for (device of getPaginatedUnassignedDevices(); track device._id || device.deviceId) {
                          <tr>
                            <td class="px-4 py-4">
                              <p class="text-sm font-bold text-slate-900">{{ getDeviceDisplayName(device) }}</p>
                              <p class="mt-1 text-xs text-slate-500">{{ device.deviceId }}</p>
                            </td>
                            <td class="px-4 py-4 text-sm text-slate-600">{{ getDeviceTypeLabel(device.deviceType || device.type) }}</td>
                            <td class="px-4 py-4">
                              <span
                                [class]="'rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ' + getMonitoringBadgeClass(device.status)"
                                [title]="getMonitoringLabel(device)"
                              >
                                {{ formatDeviceStatus(device.status) }}
                              </span>
                            </td>
                            <td class="px-4 py-4">
                              <div class="flex justify-end gap-2">
                                <button
                                  (click)="checkLiveStatus(device)"
                                  [disabled]="checkingDeviceId() === device._id"
                                  class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {{ checkingDeviceId() === device._id ? 'Checking...' : 'Check Status' }}
                                </button>
                                <button
                                  (click)="promptDeleteDevice(device)"
                                  class="rounded-xl bg-rose-100 px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-200"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                }
              </div>
            </section>
          }

          @if (activeTab() === 'security') {
            <section class="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div class="flex items-center justify-between gap-4">
                <div>
                  <h3 class="text-lg font-black tracking-tight text-slate-900">Room Security & Access</h3>
                  <p class="mt-1 text-sm text-slate-500">Assign smart locks or door sensors and audit access posture room by room.</p>
                </div>
                <button
                  (click)="reloadSecurity()"
                  class="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <span class="material-icons text-base">refresh</span>
                  Refresh
                </button>
              </div>

              @if (securityError()) {
                <div class="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                  {{ securityError() }}
                </div>
              }

              <div class="mt-6 overflow-x-auto">
                <table class="min-w-full divide-y divide-slate-200">
                  <thead class="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    <tr>
                      <th class="px-4 py-3">Room</th>
                      <th class="px-4 py-3">Access Mode</th>
                      <th class="px-4 py-3">Smart Lock</th>
                      <th class="px-4 py-3">Door Sensor</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    @for (room of rooms(); track room.id || room._id) {
                      <tr>
                        <td class="px-4 py-4">
                          <p class="text-sm font-bold text-slate-900">{{ room.number || room.roomNumber || 'N/A' }}</p>
                          <p class="mt-1 text-xs text-slate-500">{{ room.type || room.roomType || 'Room' }}</p>
                        </td>
                        <td class="px-4 py-4">
                          <span [class]="'inline-flex rounded-full px-3 py-1 text-xs font-bold ' + getRoomAccessBadgeClass(room)">
                            {{ getRoomAccessLabel(room) }}
                          </span>
                        </td>
                        <td class="px-4 py-4">
                          @if (room.smartLockDevice) {
                            <div class="flex items-center justify-between gap-2 rounded-2xl bg-slate-50 px-3 py-3">
                              <div>
                                <p class="text-sm font-semibold text-slate-900">{{ room.smartLockDevice.deviceId || room.smartLockDevice.name || 'Smart Lock' }}</p>
                                <p class="mt-1 text-xs font-medium" [class]="getMonitoringTextClass(room.smartLockDevice.status)">
                                  {{ getMonitoringLabel(room.smartLockDevice) }}
                                </p>
                              </div>
                              <button
                                (click)="unassignSecurityDevice(room.smartLockDevice._id)"
                                class="rounded-xl bg-rose-100 px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-200"
                              >
                                Remove
                              </button>
                            </div>
                          } @else {
                            <div class="flex items-center gap-2">
                              <select
                                [ngModel]="getSelectedDevice(room.id || room._id, 'smart_lock')"
                                (ngModelChange)="setSelectedDevice(room.id || room._id, 'smart_lock', $event)"
                                class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-900 outline-none"
                              >
                                <option value="">Assign smart lock</option>
                                @for (device of getAvailableSecurityDevices('smart_lock'); track device._id) {
                                  <option [value]="device._id">{{ device.deviceId || device.name || 'Smart Lock' }}</option>
                                }
                              </select>
                              <button
                                (click)="assignSecurityDevice(room.id || room._id, 'smart_lock')"
                                [disabled]="!getSelectedDevice(room.id || room._id, 'smart_lock')"
                                class="rounded-2xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                Assign
                              </button>
                            </div>
                          }
                        </td>
                        <td class="px-4 py-4">
                          @if (room.doorSensorDevice) {
                            <div class="flex items-center justify-between gap-2 rounded-2xl bg-slate-50 px-3 py-3">
                              <div>
                                <p class="text-sm font-semibold text-slate-900">{{ room.doorSensorDevice.deviceId || room.doorSensorDevice.name || 'Door Sensor' }}</p>
                                <p class="mt-1 text-xs font-medium" [class]="getMonitoringTextClass(room.doorSensorDevice.status)">
                                  {{ getMonitoringLabel(room.doorSensorDevice) }}
                                </p>
                              </div>
                              <button
                                (click)="unassignSecurityDevice(room.doorSensorDevice._id)"
                                class="rounded-xl bg-rose-100 px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-200"
                              >
                                Remove
                              </button>
                            </div>
                          } @else {
                            <div class="flex items-center gap-2">
                              <select
                                [ngModel]="getSelectedDevice(room.id || room._id, 'door_sensor')"
                                (ngModelChange)="setSelectedDevice(room.id || room._id, 'door_sensor', $event)"
                                class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-900 outline-none"
                              >
                                <option value="">Assign door sensor</option>
                                @for (device of getAvailableSecurityDevices('door_sensor'); track device._id) {
                                  <option [value]="device._id">{{ device.deviceId || device.name || 'Door Sensor' }}</option>
                                }
                              </select>
                              <button
                                (click)="assignSecurityDevice(room.id || room._id, 'door_sensor')"
                                [disabled]="!getSelectedDevice(room.id || room._id, 'door_sensor')"
                                class="rounded-2xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                Assign
                              </button>
                            </div>
                          }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </section>
          }
        }
      </div>

      @if (showDeviceLogsModal()) {
        <div class="fixed inset-0 z-50 bg-slate-950/55">
          <button
            (click)="closeDeviceLogs()"
            class="absolute inset-0 h-full w-full cursor-default"
            aria-label="Close device logs drawer"
          ></button>
          <div class="absolute top-0 right-0 flex h-full w-full max-w-2xl flex-col overflow-hidden bg-white shadow-2xl">
            <div class="flex items-center justify-between border-b border-sky-100 bg-sky-50 px-6 py-5">
              <div>
                <p class="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">Device Logs</p>
                <h3 class="mt-1 text-xl font-black tracking-tight text-slate-900">
                  {{ selectedLogDevice()?.name || 'Device Activity' }}
                </h3>
                <p class="mt-1 text-sm text-slate-500">{{ getDeviceTypeLabel(selectedLogDevice()?.deviceType || selectedLogDevice()?.type || '') }}</p>
              </div>
              <button
                (click)="closeDeviceLogs()"
                class="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
              >
                <span class="material-icons">close</span>
              </button>
            </div>

            <div class="border-b border-slate-200 px-6 py-4">
              <div class="flex items-center justify-between gap-4">
                <p class="text-sm font-medium text-slate-500">
                  {{ getVisibleLogTotal() }} entries
                </p>
                @if (!logsLoading() && getVisibleLogTotal() > logPageSize) {
                  <div class="flex items-center gap-2 text-sm">
                    <button
                      (click)="previousLogsPage()"
                      [disabled]="logsPage() === 1"
                      class="rounded-xl border border-slate-200 px-3 py-2 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Prev
                    </button>
                    <span class="font-semibold text-slate-600">Page {{ logsPage() }} / {{ getLogsPageCount() }}</span>
                    <button
                      (click)="nextLogsPage()"
                      [disabled]="logsPage() >= getLogsPageCount()"
                      class="rounded-xl border border-slate-200 px-3 py-2 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                }
              </div>
            </div>

            <div class="flex-1 overflow-y-auto px-6 py-5">
              @if (logsLoading()) {
                <p class="text-sm font-semibold text-slate-500">Loading device logs...</p>
              } @else if (deviceLogs().length === 0) {
                <div class="rounded-2xl bg-slate-50 px-5 py-6 text-sm font-medium text-slate-500">
                  {{ deviceLogsMessage() || 'No logs available for this device.' }}
                </div>
              } @else if (isDoorActivityDevice(selectedLogDevice())) {
                <div class="space-y-3">
                  @for (period of getPaginatedDoorOccupancySessions(); track $index) {
                    <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                      <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p class="text-sm font-bold text-slate-900">
                            Estimated in-room stay
                          </p>
                          <p class="mt-1 text-xs font-medium text-slate-600">
                            Entered / door closed: {{ formatLogTimestamp(period.enterTime) }}
                          </p>
                          <p class="mt-1 text-xs font-medium text-slate-600">
                            Next door activity: {{ period.exitTime ? formatLogTimestamp(period.exitTime) : 'No later door event yet' }}
                          </p>
                          <p class="mt-1 text-xs font-medium text-slate-500">
                            Best guess based on previous close event and next open event.
                          </p>
                        </div>
                        <div class="text-xs font-semibold text-slate-500">
                          {{ getDoorOccupancyDurationLabel(period.enterTime, period.exitTime) }}
                        </div>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="space-y-3">
                  @for (log of getPaginatedRawLogs(); track $index) {
                    <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                      <div class="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p class="text-sm font-bold text-slate-900">{{ log.code || 'event' }}</p>
                          <p class="mt-1 text-xs font-medium text-slate-500">{{ formatLogValue(log.value) }}</p>
                        </div>
                        <div class="text-xs text-slate-500">
                          {{ formatLogTimestamp(log.event_time || log.time || log.timestamp) }}
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      }

      @if (showDeleteDeviceConfirm()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
          <div class="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
            <p class="text-xs font-bold uppercase tracking-[0.18em] text-rose-600">Delete Device</p>
            <h3 class="mt-2 text-xl font-black tracking-tight text-slate-900">Remove this device?</h3>
            <p class="mt-3 text-sm text-slate-600">
              {{ deleteDeviceCandidate()?.name || deleteDeviceCandidate()?.deviceId || 'This device' }} will be deleted from the platform and disappear from room assignment lists.
            </p>
            <div class="mt-6 flex justify-end gap-3">
              <button
                (click)="cancelDeleteDevice()"
                class="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                (click)="confirmDeleteDevice()"
                [disabled]="!deleteDeviceCandidate() || deletingDeviceId() === deleteDeviceCandidate()?._id"
                class="rounded-2xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {{ deletingDeviceId() === deleteDeviceCandidate()?._id ? 'Deleting...' : 'Delete Device' }}
              </button>
            </div>
          </div>
        </div>
      }

      @if (showBlockReviewConfirm()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
          <div class="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
            <p class="text-xs font-bold uppercase tracking-[0.18em] text-rose-600">Block Review</p>
            <h3 class="mt-2 text-xl font-black tracking-tight text-slate-900">Hide this review from the hotel?</h3>
            <p class="mt-3 text-sm text-slate-600">
              This will move the review to a rejected state and remove it from the public hotel review list.
            </p>
            <div class="mt-6 flex justify-end gap-3">
              <button
                (click)="cancelBlockReview()"
                class="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                (click)="confirmBlockReview()"
                [disabled]="!reviewToBlock() || moderatingReviewId() === reviewToBlock()?._id"
                class="rounded-2xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {{ moderatingReviewId() === reviewToBlock()?._id ? 'Blocking...' : 'Block Review' }}
              </button>
            </div>
          </div>
        </div>
      }
        </main>
      </div>
    </div>
  `,
  styles: [`
    .material-icons {
      font-size: 22px;
      height: 22px;
      width: 22px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class AdminHotelDetailComponent implements OnInit {
  readonly tabs: Array<{ id: HotelAdminTab; label: string }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'bookings', label: 'Bookings' },
    { id: 'rooms', label: 'Rooms' },
    { id: 'staff', label: 'Staff' },
    { id: 'devices', label: 'Devices' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'security', label: 'Room Security' }
  ];

  activeTab = signal<HotelAdminTab>('overview');
  isLoading = signal(true);
  errorMessage = signal('');
  securityError = signal('');
  logsLoading = signal(false);
  showDeviceLogsModal = signal(false);
  logsPage = signal(1);
  selectedLogDevice = signal<any | null>(null);
  deviceLogs = signal<any[]>([]);
  deviceLogsMessage = signal('');
  approvingVendor = signal(false);
  deletingDeviceId = signal<string | null>(null);
  checkingDeviceId = signal<string | null>(null);
  bookingsPage = signal(1);
  roomsPage = signal(1);
  staffPage = signal(1);
  reviewsPage = signal(1);
  moderatingReviewId = signal<string | null>(null);
  unassignedDevicesPage = signal(1);
  showDeleteDeviceConfirm = signal(false);
  deleteDeviceCandidate = signal<any | null>(null);
  showBlockReviewConfirm = signal(false);
  reviewToBlock = signal<any | null>(null);
  vendor = signal<any | null>(null);
  hotel = signal<any | null>(null);
  staff = signal<any[]>([]);
  bookings = signal<any[]>([]);
  rooms = signal<any[]>([]);
  reviews = signal<any[]>([]);
  assignedDevices = signal<any[]>([]);
  unassignedDevices = signal<any[]>([]);
  securitySummary = signal({
    assignedDevices: 0,
    unassignedDevices: 0,
    totalRooms: 0,
    contactlessReadyRooms: 0,
    monitoredOnlyRooms: 0
  });
  readonly defaultAdminPageSize = 10;
  readonly logPageSize = 10;
  readonly unassignedDevicesPageSize = 8;
  private currentHotelId = signal<string | null>(null);
  deviceSelections: Record<string, string> = {};

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const vendorId = this.route.snapshot.paramMap.get('vendorId');
    if (!vendorId) {
      this.errorMessage.set('Hotel vendor ID is missing.');
      this.isLoading.set(false);
      return;
    }
    this.loadWorkspace(vendorId);
  }

  private loadWorkspace(vendorId: string): void {
    this.isLoading.set(true);
    this.adminService.getVendorById(vendorId).subscribe({
      next: (vendorResponse: any) => {
        this.vendor.set(vendorResponse?.data || null);
        this.adminService.getHotelByVendorOwner(vendorId).subscribe({
          next: (hotelResponse: any) => {
            const hotel = hotelResponse?.data || null;
            if (!hotel?._id) {
              this.errorMessage.set('Hotel profile was not found for this vendor.');
              this.isLoading.set(false);
              return;
            }

            this.hotel.set(hotel);
            this.currentHotelId.set(hotel._id);
            this.loadHotelData(hotel._id);
          },
          error: (error: any) => {
            console.error('❌ Failed to resolve hotel:', error);
            this.errorMessage.set('Failed to load hotel profile.');
            this.isLoading.set(false);
          }
        });
      },
      error: (error: any) => {
        console.error('❌ Failed to load vendor:', error);
        this.errorMessage.set('Failed to load hotel vendor.');
        this.isLoading.set(false);
      }
    });
  }

  private loadHotelData(hotelId: string): void {
    forkJoin({
      staff: this.adminService.getHotelStaff(hotelId).pipe(catchError(() => of({ data: [] }))),
      bookings: this.adminService.getHotelBookings(hotelId).pipe(catchError(() => of({ data: [] }))),
      rooms: this.adminService.getHotelRooms(hotelId).pipe(catchError(() => of({ data: [] }))),
      reviews: this.adminService.getHotelReviews(hotelId).pipe(catchError(() => of({ data: [] }))),
      assignments: this.adminService.getHotelDeviceAssignments(hotelId).pipe(catchError(() => of({ data: null })))
    }).subscribe({
      next: ({ staff, bookings, rooms, reviews, assignments }) => {
        this.staff.set(Array.isArray(staff?.data) ? staff.data : []);
        this.bookings.set(Array.isArray(bookings?.data) ? bookings.data : []);
        this.rooms.set(this.mapRooms(rooms?.data));
        this.reviews.set(Array.isArray(reviews?.data) ? reviews.data : []);
        this.applySecurity(assignments?.data || null);
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('❌ Failed to load hotel workspace data:', error);
        this.errorMessage.set('Failed to load hotel workspace data.');
        this.isLoading.set(false);
      }
    });
  }

  private mapRooms(rooms: any): any[] {
    const list = Array.isArray(rooms) ? rooms : [];
    return list.map((room: any) => ({
      id: room._id,
      number: room.roomNumber,
      type: room.roomType,
      capacity: room.capacity,
      status: room.status,
      accessMode: room.accessMode || 'none',
      contactlessReady: room.contactlessReady === true,
      monitoringEnabled: room.monitoringEnabled === true,
      smartLockDevice: room.smartLockDevice || null,
      doorSensorDevice: room.doorSensorDevice || null
    }));
  }

  private applySecurity(data: any): void {
    const assignmentMap = data?.assignmentMap || {};
    const roomEntries = Object.values(assignmentMap).map((entry: any) => ({
      id: entry.room?._id,
      number: entry.room?.roomNumber,
      type: entry.room?.roomType,
      capacity: entry.room?.capacity,
      status: entry.room?.status,
      accessMode: entry.room?.accessMode || 'none',
      contactlessReady: entry.room?.contactlessReady === true,
      monitoringEnabled: entry.room?.monitoringEnabled === true,
      smartLockDevice: entry.room?.smartLockDevice || null,
      doorSensorDevice: entry.room?.doorSensorDevice || null
    }));

    if (roomEntries.length) {
      this.rooms.set(roomEntries);
    }

    this.assignedDevices.set(
      Object.values(assignmentMap).flatMap((entry: any) => (entry?.devices || []).map((device: any) => ({
        ...device,
        roomNumber: entry.room?.roomNumber || null
      })))
    );
    this.unassignedDevices.set(Array.isArray(data?.unassignedDevices) ? data.unassignedDevices : []);
    this.securitySummary.set({
      assignedDevices: Number(data?.summary?.assignedDevices) || 0,
      unassignedDevices: Number(data?.summary?.unassignedDevices) || 0,
      totalRooms: Number(data?.summary?.totalRooms) || this.rooms().length,
      contactlessReadyRooms: Number(data?.summary?.contactlessReadyRooms) || 0,
      monitoredOnlyRooms: Number(data?.summary?.monitoredOnlyRooms) || 0
    });
  }

  reloadSecurity(): void {
    const hotelId = this.currentHotelId();
    if (!hotelId) {
      return;
    }

    this.securityError.set('');
    this.adminService.getHotelDeviceAssignments(hotelId).subscribe({
      next: (response: any) => {
        this.applySecurity(response?.data || null);
      },
      error: (error: any) => {
        console.error('❌ Failed to refresh security data:', error);
        this.securityError.set('Failed to refresh room security data.');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin-dashboard'], { queryParams: { category: 'hotels' } });
  }

  navigateToPage(page: string): void {
    this.router.navigate(['/admin-dashboard'], { queryParams: { page } });
  }

  navigateToCategory(category: string): void {
    this.router.navigate(['/admin-dashboard'], { queryParams: { category } });
  }

  getCurrentUserName(): string {
    const user = this.authService.getCurrentUser();
    return user?.name || 'Admin';
  }

  getAdminRole(): string {
    const role = localStorage.getItem('adminRole');
    return role ? role.replace('-', ' ').toUpperCase() : 'ADMIN';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  approveCurrentVendor(): void {
    const vendorId = this.vendor()?._id;
    if (!vendorId) {
      return;
    }

    this.approvingVendor.set(true);
    this.adminService.approveVendor(vendorId).subscribe({
      next: () => {
        this.vendor.set({
          ...(this.vendor() || {}),
          status: 'active',
          kycStatus: 'approved'
        });
        this.approvingVendor.set(false);
      },
      error: (error: any) => {
        console.error('❌ Failed to approve hotel vendor:', error);
        this.approvingVendor.set(false);
      }
    });
  }

  hotelName(): string {
    return this.hotel()?.name || this.vendor()?.name || 'Hotel';
  }

  hotelEmail(): string {
    return this.hotel()?.email || this.vendor()?.email || '';
  }

  hotelPhone(): string {
    return this.hotel()?.phone || this.vendor()?.phone || '';
  }

  hotelAddress(): string {
    const hotel = this.hotel();
    return [hotel?.address, hotel?.city, hotel?.state, hotel?.country].filter(Boolean).join(', ');
  }

  vendorStatus(): string {
    return this.vendor()?.status || 'unknown';
  }

  vendorEmail(): string {
    return this.vendor()?.email || '';
  }

  vendorPhone(): string {
    return this.vendor()?.phone || '';
  }

  vendorKycStatus(): string {
    return this.vendor()?.kycStatus || '';
  }

  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700',
      verified: 'bg-sky-100 text-sky-700',
      active: 'bg-emerald-100 text-emerald-700',
      suspended: 'bg-rose-100 text-rose-700'
    };
    return classes[status] || 'bg-slate-100 text-slate-700';
  }

  getKycBadgeClass(kycStatus: string): string {
    const classes: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700',
      approved: 'bg-emerald-100 text-emerald-700',
      rejected: 'bg-rose-100 text-rose-700'
    };
    return classes[kycStatus] || 'bg-slate-100 text-slate-700';
  }

  getStatusTextClass(status: string): string {
    const classes: Record<string, string> = {
      active: 'text-emerald-300',
      verified: 'text-sky-300',
      pending: 'text-amber-300',
      suspended: 'text-rose-300'
    };
    return classes[status] || 'text-slate-200';
  }

  getAvailableRoomCount(): number {
    return this.rooms().filter((room) => room.status === 'available').length;
  }

  getManualAccessRoomCount(): number {
    return this.rooms().filter((room) => (room.accessMode || 'none') === 'none').length;
  }

  formatAllowedModules(modules: string[] | undefined): string {
    return Array.isArray(modules) && modules.length ? modules.join(', ') : 'No modules assigned';
  }

  private paginate<T>(items: T[], page: number): T[] {
    const start = (page - 1) * this.defaultAdminPageSize;
    return items.slice(start, start + this.defaultAdminPageSize);
  }

  private getPageCount(total: number): number {
    return Math.max(1, Math.ceil(total / this.defaultAdminPageSize));
  }

  getPaginatedBookings(): any[] {
    return this.paginate(this.bookings(), this.bookingsPage());
  }

  getBookingsPageCount(): number {
    return this.getPageCount(this.bookings().length);
  }

  previousBookingsPage(): void {
    this.bookingsPage.set(Math.max(1, this.bookingsPage() - 1));
  }

  nextBookingsPage(): void {
    this.bookingsPage.set(Math.min(this.getBookingsPageCount(), this.bookingsPage() + 1));
  }

  getPaginatedRooms(): any[] {
    return this.paginate(this.rooms(), this.roomsPage());
  }

  getRoomsPageCount(): number {
    return this.getPageCount(this.rooms().length);
  }

  previousRoomsPage(): void {
    this.roomsPage.set(Math.max(1, this.roomsPage() - 1));
  }

  nextRoomsPage(): void {
    this.roomsPage.set(Math.min(this.getRoomsPageCount(), this.roomsPage() + 1));
  }

  getPaginatedStaff(): any[] {
    return this.paginate(this.staff(), this.staffPage());
  }

  getStaffPageCount(): number {
    return this.getPageCount(this.staff().length);
  }

  previousStaffPage(): void {
    this.staffPage.set(Math.max(1, this.staffPage() - 1));
  }

  nextStaffPage(): void {
    this.staffPage.set(Math.min(this.getStaffPageCount(), this.staffPage() + 1));
  }

  getPaginatedReviews(): any[] {
    return this.paginate(this.reviews(), this.reviewsPage());
  }

  getReviewsPageCount(): number {
    return this.getPageCount(this.reviews().length);
  }

  previousReviewsPage(): void {
    this.reviewsPage.set(Math.max(1, this.reviewsPage() - 1));
  }

  nextReviewsPage(): void {
    this.reviewsPage.set(Math.min(this.getReviewsPageCount(), this.reviewsPage() + 1));
  }

  formatDateLabel(value: any): string {
    if (!value) {
      return 'N/A';
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
  }

  getDeviceTypeLabel(deviceType: string): string {
    const normalized = String(deviceType || '').toLowerCase();
    const labels: Record<string, string> = {
      smart_lock: 'Smart Lock',
      door_sensor: 'Door Sensor',
      motion_sensor: 'Motion Sensor',
      thermostat: 'Thermostat',
      camera: 'Camera',
      light: 'Light',
      speaker: 'Speaker'
    };
    return labels[normalized] || deviceType || 'Device';
  }

  getDeviceDisplayName(device: any): string {
    return device?.name
      || device?.metadata?.productName
      || device?.metadata?.product_name
      || device?.metadata?.customName
      || device?.description
      || device?.deviceId
      || 'Device';
  }

  formatDeviceStatus(status: string | boolean | undefined): string {
    if (status === true || status === 'active') {
      return 'Active';
    }
    if (status === false) {
      return 'Offline';
    }
    return String(status || 'unknown');
  }

  getMonitoringBadgeClass(status: string | boolean | undefined): string {
    return (status === true || status === 'active')
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-slate-100 text-slate-700';
  }

  getMonitoringTextClass(status: string | boolean | undefined): string {
    return (status === true || status === 'active')
      ? 'text-emerald-700'
      : 'text-slate-500';
  }

  getMonitoringLabel(device: any): string {
    const lastSeen = device?.lastDetectionTime || device?.lastActive || device?.updatedAt || device?.createdAt;
    if (statusIsOnline(device?.status)) {
      return lastSeen ? `Online · last seen ${new Date(lastSeen).toLocaleString()}` : 'Online';
    }
    return lastSeen ? `Offline · last seen ${new Date(lastSeen).toLocaleString()}` : 'Offline';
  }

  getAssignedOnlineCount(): number {
    return this.assignedDevices().filter((device) => statusIsOnline(device?.status)).length;
  }

  getAssignedOfflineCount(): number {
    return this.assignedDevices().filter((device) => !statusIsOnline(device?.status)).length;
  }

  openDeviceLogs(device: any): void {
    const hotelId = this.currentHotelId();
    const deviceId = device?.tuyaDeviceId || device?.deviceId;
    if (!hotelId || !deviceId) {
      this.securityError.set('Device logs are unavailable because the device identifier is missing.');
      return;
    }

    this.selectedLogDevice.set(device);
    this.showDeviceLogsModal.set(true);
    this.logsLoading.set(true);
    this.logsPage.set(1);
    this.deviceLogs.set([]);
    this.deviceLogsMessage.set('');

    const endTime = Date.now();
    const now = new Date();
    const startTime = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const deviceType = String(device?.deviceType || device?.type || '').toLowerCase();
    const codes = deviceType === 'door_sensor' || deviceType === 'motion_sensor'
      ? 'doorcontact_state'
      : undefined;

    this.adminService.getHotelDeviceLogs(hotelId, deviceId, startTime, endTime, codes).subscribe({
      next: (response: any) => {
        const logs = Array.isArray(response?.logs)
          ? response.logs
          : Array.isArray(response?.data?.logs)
            ? response.data.logs
            : [];
        this.deviceLogs.set(logs);
        this.deviceLogsMessage.set(response?.message || '');
        this.logsLoading.set(false);
      },
      error: (error: any) => {
        console.error('❌ Failed to load device logs:', error);
        this.deviceLogs.set([]);
        this.deviceLogsMessage.set(error?.error?.message || 'Failed to load logs for this device.');
        this.logsLoading.set(false);
      }
    });
  }

  closeDeviceLogs(): void {
    this.showDeviceLogsModal.set(false);
    this.logsPage.set(1);
    this.selectedLogDevice.set(null);
    this.deviceLogs.set([]);
    this.deviceLogsMessage.set('');
    this.logsLoading.set(false);
  }

  formatLogTimestamp(value: any): string {
    if (!value) {
      return 'Unknown time';
    }
    const timestamp = Number(value);
    const parsed = Number.isFinite(timestamp) ? new Date(timestamp) : new Date(value);
    return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleString();
  }

  formatLogValue(value: any): string {
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    try {
      return JSON.stringify(value);
    } catch {
      return 'Event value unavailable';
    }
  }

  isDoorActivityDevice(device: any): boolean {
    const deviceType = String(device?.deviceType || device?.type || '').toLowerCase();
    return deviceType === 'door_sensor' || deviceType === 'motion_sensor';
  }

  getDoorOccupancySessions(): Array<{ enterTime: number | null; exitTime: number | null }> {
    const logs = [...this.deviceLogs()]
      .filter((log: any) => log?.code === 'doorcontact_state')
      .sort((a: any, b: any) => Number(a?.event_time || 0) - Number(b?.event_time || 0));

    const sessions: Array<{ enterTime: number | null; exitTime: number | null }> = [];

    for (let index = 0; index < logs.length; index += 1) {
      const log = logs[index];
      const eventTime = Number(log?.event_time);
      if (!Number.isFinite(eventTime)) {
        continue;
      }

      if (String(log?.value) === 'false') {
        let nextOpen: number | null = null;

        for (let nextIndex = index + 1; nextIndex < logs.length; nextIndex += 1) {
          const nextLog = logs[nextIndex];
          const nextEventTime = Number(nextLog?.event_time);
          if (!Number.isFinite(nextEventTime)) {
            continue;
          }

          if (String(nextLog?.value) === 'true') {
            nextOpen = nextEventTime;
            break;
          }
        }

        sessions.push({
          enterTime: eventTime,
          exitTime: nextOpen
        });
      }
    }

    return sessions.sort((a, b) => Number(b.enterTime || b.exitTime || 0) - Number(a.enterTime || a.exitTime || 0));
  }

  getPaginatedDoorOccupancySessions(): Array<{ enterTime: number | null; exitTime: number | null }> {
    const periods = this.getDoorOccupancySessions();
    const start = (this.logsPage() - 1) * this.logPageSize;
    return periods.slice(start, start + this.logPageSize);
  }

  getPaginatedRawLogs(): any[] {
    const logs = [...this.deviceLogs()].sort(
      (a: any, b: any) => Number(b?.event_time || b?.time || b?.timestamp || 0) - Number(a?.event_time || a?.time || a?.timestamp || 0)
    );
    const start = (this.logsPage() - 1) * this.logPageSize;
    return logs.slice(start, start + this.logPageSize);
  }

  getVisibleLogTotal(): number {
    return this.isDoorActivityDevice(this.selectedLogDevice())
      ? this.getDoorOccupancySessions().length
      : this.deviceLogs().length;
  }

  getLogsPageCount(): number {
    return Math.max(1, Math.ceil(this.getVisibleLogTotal() / this.logPageSize));
  }

  previousLogsPage(): void {
    this.logsPage.set(Math.max(1, this.logsPage() - 1));
  }

  nextLogsPage(): void {
    this.logsPage.set(Math.min(this.getLogsPageCount(), this.logsPage() + 1));
  }

  getPaginatedUnassignedDevices(): any[] {
    const start = (this.unassignedDevicesPage() - 1) * this.unassignedDevicesPageSize;
    return this.unassignedDevices().slice(start, start + this.unassignedDevicesPageSize);
  }

  getUnassignedDevicesPageCount(): number {
    return Math.max(1, Math.ceil(this.unassignedDevices().length / this.unassignedDevicesPageSize));
  }

  previousUnassignedDevicesPage(): void {
    this.unassignedDevicesPage.set(Math.max(1, this.unassignedDevicesPage() - 1));
  }

  nextUnassignedDevicesPage(): void {
    this.unassignedDevicesPage.set(Math.min(this.getUnassignedDevicesPageCount(), this.unassignedDevicesPage() + 1));
  }

  getDoorOccupancyDurationLabel(enterTime: number | null, exitTime: number | null): string {
    if (!enterTime || !exitTime) {
      return exitTime ? 'Missing prior close event' : 'Stayed inside until next door event is unknown';
    }

    const durationMinutes = Math.max(0, Math.round((exitTime - enterTime) / 60000));
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    if (hours > 0 && minutes > 0) {
      return `Stayed inside about ${hours}h ${minutes}m`;
    }
    if (hours > 0) {
      return `Stayed inside about ${hours}h`;
    }
    return `Stayed inside about ${minutes}m`;
  }

  getRoomAccessBadgeClass(room: any): string {
    const classes: Record<string, string> = {
      hybrid: 'bg-emerald-100 text-emerald-700',
      smart_lock: 'bg-blue-100 text-blue-700',
      door_sensor: 'bg-amber-100 text-amber-700',
      none: 'bg-slate-100 text-slate-700'
    };
    return classes[room?.accessMode || 'none'] || 'bg-slate-100 text-slate-700';
  }

  getRoomAccessLabel(room: any): string {
    const labels: Record<string, string> = {
      hybrid: 'Contactless + Monitoring',
      smart_lock: 'Contactless Ready',
      door_sensor: 'Monitored Only',
      none: 'Manual Access'
    };
    return labels[room?.accessMode || 'none'] || 'Manual Access';
  }

  getAvailableSecurityDevices(type: 'smart_lock' | 'door_sensor'): any[] {
    if (type === 'door_sensor') {
      return this.unassignedDevices().filter((device: any) =>
        device.deviceType === 'door_sensor' || device.deviceType === 'motion_sensor'
      );
    }

    return this.unassignedDevices().filter((device: any) => device.deviceType === type);
  }

  getSelectedDevice(roomId: string, type: 'smart_lock' | 'door_sensor'): string {
    return this.deviceSelections[`${roomId}:${type}`] || '';
  }

  setSelectedDevice(roomId: string, type: 'smart_lock' | 'door_sensor', value: string): void {
    this.deviceSelections[`${roomId}:${type}`] = value;
  }

  assignSecurityDevice(roomId: string, type: 'smart_lock' | 'door_sensor'): void {
    const hotelId = this.currentHotelId();
    const deviceId = this.getSelectedDevice(roomId, type);
    if (!hotelId || !deviceId) {
      return;
    }

    this.securityError.set('');
    this.adminService.assignHotelDeviceToRoom(hotelId, deviceId, roomId).subscribe({
      next: () => {
        this.setSelectedDevice(roomId, type, '');
        this.reloadSecurity();
      },
      error: (error: any) => {
        console.error('❌ Failed to assign security device:', error);
        this.securityError.set(`Failed to assign ${type.replace('_', ' ')}.`);
      }
    });
  }

  unassignSecurityDevice(deviceId: string): void {
    const hotelId = this.currentHotelId();
    if (!hotelId) {
      return;
    }

    this.securityError.set('');
    this.adminService.unassignHotelDeviceFromRoom(hotelId, deviceId).subscribe({
      next: () => {
        this.reloadSecurity();
      },
      error: (error: any) => {
        console.error('❌ Failed to remove security device:', error);
        this.securityError.set('Failed to remove device assignment.');
      }
    });
  }

  deletePlatformDevice(deviceId: string): void {
    if (!deviceId) {
      return;
    }

    this.deletingDeviceId.set(deviceId);
    this.securityError.set('');
    this.adminService.deleteDevice(deviceId).subscribe({
      next: () => {
        this.reloadSecurity();
        this.deletingDeviceId.set(null);
      },
      error: (error: any) => {
        console.error('❌ Failed to delete device:', error);
        this.securityError.set(error?.error?.message || 'Failed to delete device.');
        this.deletingDeviceId.set(null);
      }
    });
  }

  promptDeleteDevice(device: any): void {
    this.deleteDeviceCandidate.set(device);
    this.showDeleteDeviceConfirm.set(true);
  }

  cancelDeleteDevice(): void {
    this.showDeleteDeviceConfirm.set(false);
    this.deleteDeviceCandidate.set(null);
  }

  confirmDeleteDevice(): void {
    const deviceId = this.deleteDeviceCandidate()?._id;
    if (!deviceId) {
      return;
    }

    this.deletingDeviceId.set(deviceId);
    this.securityError.set('');
    this.adminService.deleteDevice(deviceId).subscribe({
      next: () => {
        this.reloadSecurity();
        this.deletingDeviceId.set(null);
        this.cancelDeleteDevice();
      },
      error: (error: any) => {
        console.error('❌ Failed to delete device:', error);
        this.securityError.set(error?.error?.message || 'Failed to delete device.');
        this.deletingDeviceId.set(null);
      }
    });
  }

  promptBlockReview(review: any): void {
    this.reviewToBlock.set(review);
    this.showBlockReviewConfirm.set(true);
  }

  cancelBlockReview(): void {
    this.showBlockReviewConfirm.set(false);
    this.reviewToBlock.set(null);
  }

  confirmBlockReview(): void {
    const reviewId = this.reviewToBlock()?._id;
    if (!reviewId) {
      return;
    }

    this.moderatingReviewId.set(reviewId);
    this.adminService.rejectReview(reviewId).subscribe({
      next: () => {
        this.reviews.set(this.reviews().filter((review) => review._id !== reviewId));
        this.moderatingReviewId.set(null);
        this.cancelBlockReview();
      },
      error: (error: any) => {
        console.error('❌ Failed to block review:', error);
        this.errorMessage.set(error?.error?.message || 'Failed to block review.');
        this.moderatingReviewId.set(null);
      }
    });
  }

  checkLiveStatus(device: any): void {
    if (!device?._id) {
      return;
    }

    this.checkingDeviceId.set(device._id);
    this.securityError.set('');
    this.adminService.getAdminDeviceLiveStatus(device._id).subscribe({
      next: (response: any) => {
        const online = response?.data?.online === true;
        const lastDetectionTime = response?.data?.lastDetectionTime || null;

        this.assignedDevices.set(
          this.assignedDevices().map((item) =>
            item._id === device._id
              ? { ...item, status: online, lastDetectionTime, updatedAt: new Date().toISOString() }
              : item
          )
        );

        this.unassignedDevices.set(
          this.unassignedDevices().map((item) =>
            item._id === device._id
              ? { ...item, status: online, lastDetectionTime, updatedAt: new Date().toISOString() }
              : item
          )
        );

        this.rooms.set(
          this.rooms().map((room) => ({
            ...room,
            smartLockDevice: room.smartLockDevice?._id === device._id
              ? { ...room.smartLockDevice, status: online, lastDetectionTime }
              : room.smartLockDevice,
            doorSensorDevice: room.doorSensorDevice?._id === device._id
              ? { ...room.doorSensorDevice, status: online, lastDetectionTime }
              : room.doorSensorDevice
          }))
        );

        this.checkingDeviceId.set(null);
      },
      error: (error: any) => {
        console.error('❌ Failed to check live device status:', error);
        this.securityError.set(error?.error?.message || 'Failed to check live device status.');
        this.checkingDeviceId.set(null);
      }
    });
  }
}

function statusIsOnline(status: string | boolean | undefined): boolean {
  return status === true || status === 'active';
}
