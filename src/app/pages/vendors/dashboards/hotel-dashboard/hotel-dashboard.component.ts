import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-hotel-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-8">
      <!-- Welcome Section -->
      <div class="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white shadow-lg">
        <h1 class="text-3xl font-bold mb-2">Hotel Management Dashboard</h1>
        <p class="text-blue-100">Monitor bookings, rooms, guests, and hotel operations in real-time.</p>
      </div>

      <!-- Key Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Occupancy Rate</p>
          <p class="text-3xl font-bold text-slate-900">87.5%</p>
          <p class="mt-2 text-sm text-emerald-600">↑ 5.2% from last week</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Total Rooms</p>
          <p class="text-3xl font-bold text-slate-900">156</p>
          <p class="mt-2 text-sm text-slate-500">142 occupied, 14 available</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Today's Revenue</p>
          <p class="text-3xl font-bold text-slate-900">$12,450</p>
          <p class="mt-2 text-sm text-emerald-600">↑ 8.1% increase</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Active Bookings</p>
          <p class="text-3xl font-bold text-slate-900">127</p>
          <p class="mt-2 text-sm text-slate-500">23 check-ins today</p>
        </div>
      </div>

      <!-- Room Status & Bookings -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Room Status -->
        <div class="bg-white rounded-lg p-6 shadow-md">
          <h3 class="text-lg font-bold text-slate-900 mb-6">Room Status Overview</h3>
          <div class="space-y-4">
            <div>
              <div class="flex justify-between mb-2">
                <span class="text-slate-700 font-medium">Occupied</span>
                <span class="text-slate-900 font-bold">142</span>
              </div>
              <div class="w-full bg-slate-200 rounded-full h-2">
                <div class="bg-emerald-500 h-2 rounded-full" style="width: 91%;"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between mb-2">
                <span class="text-slate-700 font-medium">Available</span>
                <span class="text-slate-900 font-bold">14</span>
              </div>
              <div class="w-full bg-slate-200 rounded-full h-2">
                <div class="bg-blue-500 h-2 rounded-full" style="width: 9%;"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between mb-2">
                <span class="text-slate-700 font-medium">Cleaning</span>
                <span class="text-slate-900 font-bold">0</span>
              </div>
              <div class="w-full bg-slate-200 rounded-full h-2">
                <div class="bg-yellow-500 h-2 rounded-full" style="width: 0%;"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between mb-2">
                <span class="text-slate-700 font-medium">Maintenance</span>
                <span class="text-slate-900 font-bold">0</span>
              </div>
              <div class="w-full bg-slate-200 rounded-full h-2">
                <div class="bg-red-500 h-2 rounded-full" style="width: 0%;"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Bookings -->
        <div class="bg-white rounded-lg p-6 shadow-md">
          <h3 class="text-lg font-bold text-slate-900 mb-6">Recent Bookings</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p class="font-medium text-slate-900">John Smith</p>
                <p class="text-sm text-slate-600">Room 305 - Deluxe Suite</p>
              </div>
              <span class="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">Checked In</span>
            </div>

            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p class="font-medium text-slate-900">Sarah Johnson</p>
                <p class="text-sm text-slate-600">Room 412 - Standard Room</p>
              </div>
              <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Confirmed</span>
            </div>

            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p class="font-medium text-slate-900">Michael Brown</p>
                <p class="text-sm text-slate-600">Room 201 - Premium Room</p>
              </div>
              <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Confirmed</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Revenue & Services -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Services Performance -->
        <div class="bg-white rounded-lg p-6 shadow-md">
          <h3 class="text-lg font-bold text-slate-900 mb-6">Additional Services</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-slate-700 font-medium">Restaurant Orders</span>
              <span class="font-bold text-slate-900">$3,240</span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-2">
              <div class="bg-blue-500 h-2 rounded-full" style="width: 65%;"></div>
            </div>

            <div class="flex items-center justify-between mt-4">
              <span class="text-slate-700 font-medium">Spa & Wellness</span>
              <span class="font-bold text-slate-900">$2,150</span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-2">
              <div class="bg-purple-500 h-2 rounded-full" style="width: 43%;"></div>
            </div>

            <div class="flex items-center justify-between mt-4">
              <span class="text-slate-700 font-medium">Room Service</span>
              <span class="font-bold text-slate-900">$1,560</span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-2">
              <div class="bg-orange-500 h-2 rounded-full" style="width: 31%;"></div>
            </div>
          </div>
        </div>

        <!-- Staff Management -->
        <div class="bg-white rounded-lg p-6 shadow-md">
          <h3 class="text-lg font-bold text-slate-900 mb-6">Staff On Duty</h3>
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span class="font-bold text-blue-600">HK</span>
              </div>
              <div class="flex-1">
                <p class="font-medium text-slate-900">Housekeeping</p>
                <p class="text-sm text-slate-600">8 staff members on duty</p>
              </div>
            </div>

            <div class="flex items-center gap-3 mt-4">
              <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <span class="font-bold text-green-600">FO</span>
              </div>
              <div class="flex-1">
                <p class="font-medium text-slate-900">Front Office</p>
                <p class="text-sm text-slate-600">4 staff members on duty</p>
              </div>
            </div>

            <div class="flex items-center gap-3 mt-4">
              <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <span class="font-bold text-purple-600">RS</span>
              </div>
              <div class="flex-1">
                <p class="font-medium text-slate-900">Restaurant Service</p>
                <p class="text-sm text-slate-600">6 staff members on duty</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-lg p-6 shadow-md">
        <h3 class="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">
            New Booking
          </button>
          <button class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
            Manage Rooms
          </button>
          <button class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
            Check-in Guest
          </button>
          <button class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
            View Reports
          </button>
        </div>
      </div>
    </div>
  `,
})
export class HotelDashboardComponent {}
