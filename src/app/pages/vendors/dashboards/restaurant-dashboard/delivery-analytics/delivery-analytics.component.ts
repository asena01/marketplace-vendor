import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { DeliveryService } from '../../../../../services/delivery.service';
import { NotificationService } from '../../../../../services/notification.service';

@Component({
  selector: 'app-delivery-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Delivery Analytics</h1>
          <p class="text-slate-600 mt-2">Track delivery performance and metrics</p>
        </div>
      </div>

      <!-- Key Metrics -->
      @if (stats().totalDeliveries === 0 && stats().totalRevenue === 0) {
        <div class="bg-white rounded-lg p-12 shadow-md text-center">
          <mat-icon class="text-5xl text-slate-300 mx-auto mb-2">analytics</mat-icon>
          <p class="text-slate-600 text-lg">No analytics data available</p>
          <p class="text-slate-500 text-sm mt-2">Analytics will appear once deliveries are processed</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500">
            <p class="text-slate-600 text-sm font-medium mb-1">Total Deliveries</p>
            <p class="text-3xl font-bold text-slate-900">{{ stats().totalDeliveries }}</p>
            <p class="mt-2 text-sm text-blue-600">This month</p>
          </div>

          <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-emerald-500">
            <p class="text-slate-600 text-sm font-medium mb-1">Successful Rate</p>
            <p class="text-3xl font-bold text-slate-900">{{ stats().successRate }}%</p>
            <p class="mt-2 text-sm text-emerald-600">On-time deliveries</p>
          </div>

          <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-orange-500">
            <p class="text-slate-600 text-sm font-medium mb-1">Avg Delivery Time</p>
            <p class="text-3xl font-bold text-slate-900">{{ stats().avgDeliveryTime }}</p>
            <p class="mt-2 text-sm text-orange-600">minutes</p>
          </div>

          <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-purple-500">
            <p class="text-slate-600 text-sm font-medium mb-1">Revenue</p>
            <p class="text-3xl font-bold text-slate-900"><span class="currency-prefix">$</span>{{ stats().totalRevenue }}</p>
            <p class="mt-2 text-sm text-purple-600">From deliveries</p>
          </div>
        </div>
      }

      <!-- Detailed Analytics -->
      @if (stats().totalDeliveries > 0) {
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Delivery Status Distribution -->
        <div class="bg-white rounded-lg p-6 shadow-md">
          <h2 class="text-lg font-bold text-slate-900 mb-6">Delivery Status Distribution</h2>
          <div class="space-y-4">
            <div>
              <div class="flex justify-between mb-2">
                <span class="text-slate-700">Completed</span>
                <span class="font-bold text-slate-900">{{ stats().completed }}</span>
              </div>
              <div class="w-full bg-slate-200 rounded-full h-3">
                <div class="bg-emerald-500 h-3 rounded-full" style="width: 85%;"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between mb-2">
                <span class="text-slate-700">In Transit</span>
                <span class="font-bold text-slate-900">{{ stats().inTransit }}</span>
              </div>
              <div class="w-full bg-slate-200 rounded-full h-3">
                <div class="bg-blue-500 h-3 rounded-full" style="width: 10%;"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between mb-2">
                <span class="text-slate-700">Failed</span>
                <span class="font-bold text-slate-900">{{ stats().failed }}</span>
              </div>
              <div class="w-full bg-slate-200 rounded-full h-3">
                <div class="bg-red-500 h-3 rounded-full" style="width: 5%;"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Driver Performance -->
        <div class="bg-white rounded-lg p-6 shadow-md">
          <h2 class="text-lg font-bold text-slate-900 mb-6">Top Performers</h2>
          <div class="space-y-4">
            @for (driver of getTopPerformers(); track driver.driverId) {
              <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div class="flex-1">
                  <p class="font-medium text-slate-900">{{ driver.name }}</p>
                  <p class="text-sm text-slate-600">{{ driver.deliveries }} deliveries</p>
                </div>
                <div class="text-right">
                  <p class="font-bold text-slate-900">⭐ {{ driver.rating }}</p>
                  <p class="text-xs text-slate-600">{{ driver.onTimeRate }}% on-time</p>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Delivery Trends Chart -->
      <div class="bg-white rounded-lg p-6 shadow-md">
        <h2 class="text-lg font-bold text-slate-900 mb-6">Delivery Trends (Last 7 Days)</h2>
        <div class="space-y-6">
          @for (day of getTrendData(); track day.date) {
            <div>
              <div class="flex justify-between mb-2">
                <span class="text-slate-700 font-medium">{{ day.date }}</span>
                <span class="font-bold text-slate-900">{{ day.count }} deliveries</span>
              </div>
              <div class="w-full bg-slate-200 rounded-full h-8">
                <div 
                  class="bg-gradient-to-r from-blue-500 to-purple-500 h-8 rounded-full flex items-center justify-end pr-3 transition-all duration-300"
                  [style.width.%]="(day.count / getMaxTrendValue()) * 100"
                >
                  <span class="text-white text-xs font-bold">{{ day.count }}</span>
                </div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Performance by Time -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="bg-white rounded-lg p-6 shadow-md">
          <h3 class="text-lg font-bold text-slate-900 mb-4">Peak Hours</h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-slate-700">11:00 - 13:00</span>
              <span class="font-bold text-orange-600">48 orders</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-700">18:00 - 20:00</span>
              <span class="font-bold text-orange-600">42 orders</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-700">12:00 - 14:00</span>
              <span class="font-bold text-orange-600">35 orders</span>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md">
          <h3 class="text-lg font-bold text-slate-900 mb-4">Avg Delivery Times</h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-slate-700">Short Distance</span>
              <span class="font-bold text-blue-600">12 min</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-700">Medium Distance</span>
              <span class="font-bold text-blue-600">25 min</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-700">Long Distance</span>
              <span class="font-bold text-blue-600">40 min</span>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md">
          <h3 class="text-lg font-bold text-slate-900 mb-4">Issues Reported</h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-slate-700">Late Delivery</span>
              <span class="font-bold text-red-600">12</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-700">Wrong Address</span>
              <span class="font-bold text-red-600">3</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-700">Damaged Items</span>
              <span class="font-bold text-red-600">5</span>
            </div>
          </div>
        </div>
      </div>
      }

      <!-- Export Options -->
      <div class="bg-slate-50 rounded-lg p-4 flex justify-end gap-3">
        <button class="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-white transition-colors">
          <mat-icon class="text-lg inline-block mr-2">download</mat-icon>
          Download Report
        </button>
        <button class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          <mat-icon class="text-lg inline-block mr-2">share</mat-icon>
          Share Analytics
        </button>
      </div>
    </div>
  `,
  styles: [`
    .currency-prefix {
      margin-right: 2px;
    }
  `]
})
export class DeliveryAnalyticsComponent implements OnInit {
  stats = signal({
    totalDeliveries: 0,
    successRate: 0,
    avgDeliveryTime: 0,
    totalRevenue: 0,
    completed: 0,
    inTransit: 0,
    failed: 0
  });

  isLoading = signal(false);

  constructor(
    private deliveryService: DeliveryService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.isLoading.set(true);
    this.deliveryService.getDeliveryPerformanceStats().subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        if (response.status === 'success' && response.data) {
          this.stats.set({
            totalDeliveries: response.data.totalDeliveries || 0,
            successRate: response.data.successRate || 0,
            avgDeliveryTime: response.data.avgDeliveryTime || 0,
            totalRevenue: response.data.totalRevenue || 0,
            completed: response.data.completed || 0,
            inTransit: response.data.inTransit || 0,
            failed: response.data.failed || 0
          });
        }
      },
      error: (error: any) => {
        this.isLoading.set(false);
        console.error('Error loading analytics:', error);
      }
    });
  }

  getTopPerformers() {
    return [
      { driverId: '1', name: 'Ahmed Hassan', deliveries: 45, rating: 4.9, onTimeRate: 98 },
      { driverId: '2', name: 'Fatima Ahmed', deliveries: 38, rating: 4.8, onTimeRate: 96 },
      { driverId: '3', name: 'Mohamed Ali', deliveries: 35, rating: 4.7, onTimeRate: 94 }
    ];
  }

  getTrendData() {
    return [
      { date: 'Mon', count: 28 },
      { date: 'Tue', count: 35 },
      { date: 'Wed', count: 32 },
      { date: 'Thu', count: 41 },
      { date: 'Fri', count: 38 },
      { date: 'Sat', count: 45 },
      { date: 'Sun', count: 22 }
    ];
  }

  getMaxTrendValue(): number {
    return Math.max(...this.getTrendData().map(d => d.count));
  }
}
