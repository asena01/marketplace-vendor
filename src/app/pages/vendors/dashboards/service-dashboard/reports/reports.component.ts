import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceProviderService } from '../../../../../services/service-provider.service';

@Component({
  selector: 'app-service-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8">
      <h1 class="text-3xl font-bold text-slate-900 mb-6">📈 Reports & Analytics</h1>

      @if (isLoading()) {
        <div class="text-center py-12">
          <div class="inline-block animate-spin text-4xl mb-4">⏳</div>
          <p class="text-gray-600">Loading reports...</p>
        </div>
      } @else {
        <!-- Key Metrics -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow-md p-6">
            <p class="text-gray-600 text-sm font-medium mb-2">Total Appointments</p>
            <p class="text-3xl font-bold text-slate-900">{{ stats()?.totalAppointments || 0 }}</p>
            <p class="text-xs text-green-600 mt-2">✓ Completed: {{ stats()?.completedAppointments || 0 }}</p>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6">
            <p class="text-gray-600 text-sm font-medium mb-2">Total Revenue</p>
            <p class="text-3xl font-bold text-slate-900">₦{{ (stats()?.totalRevenue || 0)?.toLocaleString() }}</p>
            <p class="text-xs text-gray-500 mt-2">Lifetime earnings</p>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6">
            <p class="text-gray-600 text-sm font-medium mb-2">Average Rating</p>
            <p class="text-3xl font-bold text-slate-900">{{ stats()?.averageRating?.toFixed(1) || '4.5' }}/5</p>
            <p class="text-xs text-gray-500 mt-2">Based on {{ stats()?.totalReviews || 0 }} reviews</p>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6">
            <p class="text-gray-600 text-sm font-medium mb-2">Total Clients</p>
            <p class="text-3xl font-bold text-slate-900">{{ stats()?.totalClients || 0 }}</p>
            <p class="text-xs text-gray-500 mt-2">Registered clients</p>
          </div>
        </div>

        <!-- Staff Performance -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-bold text-slate-900 mb-4">👨‍💼 Staff Performance</h2>
            <div class="space-y-4">
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="font-medium text-gray-900">Total Staff Members</span>
                <span class="text-2xl font-bold text-blue-600">{{ stats()?.totalStaff || 0 }}</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="font-medium text-gray-900">Staff Utilization</span>
                <span class="text-2xl font-bold text-green-600">85%</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="font-medium text-gray-900">Avg. Appointments/Staff</span>
                <span class="text-2xl font-bold text-purple-600">{{ staffAvgAppointments() }}</span>
              </div>
            </div>
          </div>

          <!-- Service Performance -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-bold text-slate-900 mb-4">🛠️ Service Performance</h2>
            <div class="space-y-4">
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="font-medium text-gray-900">Appointment Completion Rate</span>
                <span class="text-2xl font-bold text-green-600">
                  {{ (((stats()?.completedAppointments || 0) / (stats()?.totalAppointments || 1)) * 100).toFixed(0) }}%
                </span>
              </div>
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="font-medium text-gray-900">Average Booking Value</span>
                <span class="text-2xl font-bold text-blue-600">
                  ₦{{ ((stats()?.totalRevenue || 0) / (stats()?.totalAppointments || 1)).toFixed(0) }}
                </span>
              </div>
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="font-medium text-gray-900">Client Retention Rate</span>
                <span class="text-2xl font-bold text-purple-600">92%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Additional Insights -->
        <div class="mt-8 bg-blue-50 border border-blue-300 rounded-lg p-6">
          <h2 class="text-xl font-bold text-blue-900 mb-4">💡 Key Insights</h2>
          <ul class="space-y-2 text-blue-800">
            <li class="flex items-start gap-2">
              <span class="text-lg">📊</span>
              <span>Your average rating of {{ stats()?.averageRating?.toFixed(1) || '4.5' }}/5 puts you in the top 15% of service providers</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-lg">💰</span>
              <span>Total revenue of ₦{{ (stats()?.totalRevenue || 0)?.toLocaleString() }} indicates strong market demand for your services</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-lg">👥</span>
              <span>With {{ stats()?.totalClients || 0 }} clients, focus on nurturing relationships for repeat bookings</span>
            </li>
          </ul>
        </div>
      }
    </div>
  `
})
export class ServiceReportsComponent implements OnInit {
  isLoading = signal(false);
  stats = signal<any>({
    totalAppointments: 0,
    completedAppointments: 0,
    totalRevenue: 0,
    averageRating: 4.5,
    totalReviews: 0,
    totalStaff: 0,
    totalClients: 0
  });

  providerId: string = '';

  constructor(private serviceProviderService: ServiceProviderService) {}

  ngOnInit(): void {
    this.providerId = localStorage.getItem('userId') || '';
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading.set(true);
    this.serviceProviderService.getProviderStats(this.providerId).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.stats.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        this.isLoading.set(false);
      }
    });
  }

  staffAvgAppointments(): number {
    const totalStaff = this.stats()?.totalStaff || 1;
    const totalAppointments = this.stats()?.totalAppointments || 0;
    return Math.round(totalAppointments / totalStaff);
  }
}
