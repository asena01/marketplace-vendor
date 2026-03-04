import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-service-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-8">
      <!-- Welcome Section -->
      <div class="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-8 text-white shadow-lg">
        <h1 class="text-3xl font-bold mb-2">Service Provider Dashboard</h1>
        <p class="text-purple-100">Manage appointments, staff schedules, services, and client interactions.</p>
      </div>

      <!-- Key Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-purple-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Today's Appointments</p>
          <p class="text-3xl font-bold text-slate-900">24</p>
          <p class="mt-2 text-sm text-slate-500">18 completed, 6 upcoming</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-purple-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Revenue (Today)</p>
          <p class="text-3xl font-bold text-slate-900">$3,240</p>
          <p class="mt-2 text-sm text-emerald-600">↑ 12.8% from yesterday</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-purple-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Avg. Session Duration</p>
          <p class="text-3xl font-bold text-slate-900">52 min</p>
          <p class="mt-2 text-sm text-slate-500">Per appointment</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-purple-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Staff Utilization</p>
          <p class="text-3xl font-bold text-slate-900">85%</p>
          <p class="mt-2 text-sm text-emerald-600">↑ 5.2% from last week</p>
        </div>
      </div>

      <!-- Appointments & Schedule -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Upcoming Appointments -->
        <div class="bg-white rounded-lg p-6 shadow-md">
          <h3 class="text-lg font-bold text-slate-900 mb-6">Upcoming Appointments</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p class="font-medium text-slate-900">Jessica Martinez</p>
                <p class="text-sm text-slate-600">Haircut & Styling - 2:00 PM</p>
              </div>
              <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">2h from now</span>
            </div>

            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p class="font-medium text-slate-900">Robert Chen</p>
                <p class="text-sm text-slate-600">Massage Therapy - 3:30 PM</p>
              </div>
              <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">3.5h from now</span>
            </div>

            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p class="font-medium text-slate-900">Amanda Foster</p>
                <p class="text-sm text-slate-600">Facial Treatment - 4:45 PM</p>
              </div>
              <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">4.75h from now</span>
            </div>

            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p class="font-medium text-slate-900">Michael Brown</p>
                <p class="text-sm text-slate-600">Personal Training - 5:00 PM</p>
              </div>
              <span class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">Confirmed</span>
            </div>
          </div>
        </div>

        <!-- Staff Schedule -->
        <div class="bg-white rounded-lg p-6 shadow-md">
          <h3 class="text-lg font-bold text-slate-900 mb-6">Staff On Duty</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <span class="font-bold text-purple-600 text-sm">SH</span>
                </div>
                <div>
                  <p class="font-medium text-slate-900">Sarah Hill</p>
                  <p class="text-sm text-slate-600">Stylist</p>
                </div>
              </div>
              <span class="text-xs font-medium text-slate-600">8h today</span>
            </div>

            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <span class="font-bold text-purple-600 text-sm">MM</span>
                </div>
                <div>
                  <p class="font-medium text-slate-900">Maria Martinez</p>
                  <p class="text-sm text-slate-600">Therapist</p>
                </div>
              </div>
              <span class="text-xs font-medium text-slate-600">8h today</span>
            </div>

            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <span class="font-bold text-purple-600 text-sm">JK</span>
                </div>
                <div>
                  <p class="font-medium text-slate-900">James Kumar</p>
                  <p class="text-sm text-slate-600">Trainer</p>
                </div>
              </div>
              <span class="text-xs font-medium text-slate-600">6h today</span>
            </div>

            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <span class="font-bold text-purple-600 text-sm">EB</span>
                </div>
                <div>
                  <p class="font-medium text-slate-900">Emma Brown</p>
                  <p class="text-sm text-slate-600">Esthetician</p>
                </div>
              </div>
              <span class="text-xs font-medium text-slate-600">4h today</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Services & Performance -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Top Services -->
        <div class="bg-white rounded-lg p-6 shadow-md">
          <h3 class="text-lg font-bold text-slate-900 mb-6">Most Booked Services</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-slate-700 font-medium">Haircut & Styling</span>
              <span class="font-bold text-slate-900">145 bookings</span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-2">
              <div class="bg-purple-500 h-2 rounded-full" style="width: 100%;"></div>
            </div>

            <div class="flex items-center justify-between mt-4">
              <span class="text-slate-700 font-medium">Massage Therapy</span>
              <span class="font-bold text-slate-900">98 bookings</span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-2">
              <div class="bg-purple-500 h-2 rounded-full" style="width: 68%;"></div>
            </div>

            <div class="flex items-center justify-between mt-4">
              <span class="text-slate-700 font-medium">Personal Training</span>
              <span class="font-bold text-slate-900">87 bookings</span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-2">
              <div class="bg-purple-500 h-2 rounded-full" style="width: 60%;"></div>
            </div>

            <div class="flex items-center justify-between mt-4">
              <span class="text-slate-700 font-medium">Facial Treatment</span>
              <span class="font-bold text-slate-900">64 bookings</span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-2">
              <div class="bg-purple-500 h-2 rounded-full" style="width: 44%;"></div>
            </div>
          </div>
        </div>

        <!-- Client Satisfaction -->
        <div class="bg-white rounded-lg p-6 shadow-md">
          <h3 class="text-lg font-bold text-slate-900 mb-6">Client Satisfaction</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <span class="text-slate-700 font-medium">Overall Rating</span>
              <span class="font-bold text-emerald-600">4.8/5.0</span>
            </div>

            <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span class="text-slate-700 font-medium">Total Reviews</span>
              <span class="font-bold text-slate-900">342</span>
            </div>

            <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span class="text-slate-700 font-medium">5-Star Reviews</span>
              <span class="font-bold text-slate-900">287 (84%)</span>
            </div>

            <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span class="text-slate-700 font-medium">Client Retention</span>
              <span class="font-bold text-emerald-600">92%</span>
            </div>

            <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span class="text-slate-700 font-medium">Avg. Response Time</span>
              <span class="font-bold text-slate-900">&lt; 2 hours</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-lg p-6 shadow-md">
        <h3 class="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button class="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">
            New Appointment
          </button>
          <button class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
            Manage Services
          </button>
          <button class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
            Staff Schedule
          </button>
          <button class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
            View Reports
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ServiceDashboardComponent {}
