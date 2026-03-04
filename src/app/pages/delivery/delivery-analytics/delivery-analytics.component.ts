import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeliveryService } from '../../../services/delivery.service';

@Component({
  selector: 'app-delivery-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div>
        <h2 class="text-3xl font-bold text-gray-800 mb-2">Analytics & Reports</h2>
        <p class="text-gray-600">Delivery service performance metrics and insights</p>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white rounded-lg shadow-md p-6">
          <p class="text-gray-600 text-sm font-medium">Total Deliveries</p>
          <p class="text-4xl font-bold text-gray-800">{{ stats()?.totalOrders || 0 }}</p>
          <p class="text-xs text-gray-500 mt-2">All-time</p>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <p class="text-gray-600 text-sm font-medium">Completion Rate</p>
          <p class="text-4xl font-bold text-green-600">{{ stats()?.completionRate || 0 }}%</p>
          <p class="text-xs text-gray-500 mt-2">Success metric</p>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <p class="text-gray-600 text-sm font-medium">Active Fleet</p>
          <p class="text-4xl font-bold text-blue-600">{{ stats()?.activeCouriers || 0 }}</p>
          <p class="text-xs text-gray-500 mt-2">Online couriers</p>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <p class="text-gray-600 text-sm font-medium">Avg Delivery Time</p>
          <p class="text-4xl font-bold text-orange-600">{{ stats()?.avgDeliveryTime || 0 }}</p>
          <p class="text-xs text-gray-500 mt-2">Minutes</p>
        </div>
      </div>

      <!-- Performance Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Deliveries Trend -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">Deliveries Trend</h3>
          <div class="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <div class="text-center">
              <div class="text-4xl mb-2">📈</div>
              <p class="text-gray-500">Chart visualization coming soon</p>
              <p class="text-xs text-gray-400 mt-2">Daily delivery trends</p>
            </div>
          </div>
        </div>

        <!-- Courier Performance -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">Top Couriers</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p class="font-semibold text-gray-800">John Ahmed</p>
                <p class="text-xs text-gray-500">45 deliveries • 4.9★</p>
              </div>
              <span class="text-lg font-bold text-teal-600">95%</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p class="font-semibold text-gray-800">Sarah Smith</p>
                <p class="text-xs text-gray-500">38 deliveries • 4.8★</p>
              </div>
              <span class="text-lg font-bold text-teal-600">92%</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p class="font-semibold text-gray-800">Mike Johnson</p>
                <p class="text-xs text-gray-500">32 deliveries • 4.7★</p>
              </div>
              <span class="text-lg font-bold text-teal-600">88%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Delivery Status Distribution -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4">Order Status Distribution</h3>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div class="text-center p-4 bg-yellow-50 rounded-lg">
            <p class="text-3xl font-bold text-yellow-600">12</p>
            <p class="text-sm text-gray-600 mt-1">Pending</p>
          </div>
          <div class="text-center p-4 bg-blue-50 rounded-lg">
            <p class="text-3xl font-bold text-blue-600">8</p>
            <p class="text-sm text-gray-600 mt-1">Accepted</p>
          </div>
          <div class="text-center p-4 bg-purple-50 rounded-lg">
            <p class="text-3xl font-bold text-purple-600">5</p>
            <p class="text-sm text-gray-600 mt-1">Picked Up</p>
          </div>
          <div class="text-center p-4 bg-cyan-50 rounded-lg">
            <p class="text-3xl font-bold text-cyan-600">15</p>
            <p class="text-sm text-gray-600 mt-1">In Transit</p>
          </div>
          <div class="text-center p-4 bg-orange-50 rounded-lg">
            <p class="text-3xl font-bold text-orange-600">3</p>
            <p class="text-sm text-gray-600 mt-1">Arriving</p>
          </div>
          <div class="text-center p-4 bg-green-50 rounded-lg">
            <p class="text-3xl font-bold text-green-600">142</p>
            <p class="text-sm text-gray-600 mt-1">Delivered</p>
          </div>
        </div>
      </div>

      <!-- Revenue Analytics -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4">Revenue Breakdown</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p class="text-gray-600 text-sm font-medium">Total Revenue</p>
            <p class="text-3xl font-bold text-gray-800 mt-2">\$2,450.50</p>
            <p class="text-xs text-green-600 mt-2">↑ 12% from last week</p>
          </div>
          <div>
            <p class="text-gray-600 text-sm font-medium">Avg Order Value</p>
            <p class="text-3xl font-bold text-gray-800 mt-2">\$18.75</p>
            <p class="text-xs text-green-600 mt-2">↑ 5% from last week</p>
          </div>
          <div>
            <p class="text-gray-600 text-sm font-medium">Platform Earnings</p>
            <p class="text-3xl font-bold text-gray-800 mt-2">\$247.50</p>
            <p class="text-xs text-gray-500 mt-2">10% commission</p>
          </div>
        </div>
      </div>

      <!-- Export Reports -->
      <div class="bg-teal-50 border-2 border-teal-300 rounded-lg p-6">
        <h3 class="text-lg font-bold text-teal-800 mb-4">📊 Export Reports</h3>
        <div class="flex gap-4">
          <button class="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-semibold transition">
            📥 Download Daily Report
          </button>
          <button class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition">
            📈 Download Weekly Report
          </button>
          <button class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition">
            📋 Download Monthly Report
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DeliveryAnalyticsComponent implements OnInit {
  stats = signal<any>(null);
  isLoading = signal(true);

  constructor(private deliveryService: DeliveryService) {}

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.deliveryService.getServiceStats().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.stats.set(response.data);
          console.log('✅ Analytics loaded:', response.data);
        }
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('❌ Error loading analytics:', error);
        this.isLoading.set(false);
      }
    });
  }
}
