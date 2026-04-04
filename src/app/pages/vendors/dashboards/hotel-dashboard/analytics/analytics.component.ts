import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../../../../services/hotel.service';

interface OccupancyData {
  date: string;
  occupancyRate: number;
  occupiedRooms: number;
  totalRooms: number;
  revenue: number;
}

interface AnalyticsStats {
  averageOccupancy: number;
  peakOccupancy: number;
  lowOccupancy: number;
  averageRevenue: number;
  totalRevenue: number;
  totalGuests: number;
  averageStay: number;
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8 space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold text-slate-900">Analytics & Occupancy</h1>
        <p class="text-slate-600 mt-1">Track occupancy rates, revenue trends, and business insights</p>
      </div>

      <!-- Key Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Average Occupancy -->
        <div class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6 shadow-md border-l-4 border-blue-500">
          <p class="text-slate-600 text-sm font-medium">Average Occupancy</p>
          <p class="text-3xl font-bold text-blue-600 mt-2">{{ analyticsStats().averageOccupancy }}%</p>
          <p class="text-xs text-slate-500 mt-2">Last 30 days</p>
        </div>

        <!-- Peak Occupancy -->
        <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 shadow-md border-l-4 border-green-500">
          <p class="text-slate-600 text-sm font-medium">Peak Occupancy</p>
          <p class="text-3xl font-bold text-green-600 mt-2">{{ analyticsStats().peakOccupancy }}%</p>
          <p class="text-xs text-slate-500 mt-2">Highest recorded rate</p>
        </div>

        <!-- Total Revenue -->
        <div class="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-6 shadow-md border-l-4 border-yellow-500">
          <p class="text-slate-600 text-sm font-medium">Total Revenue</p>
          <p class="text-3xl font-bold text-yellow-600 mt-2">₦{{ formatCurrency(analyticsStats().totalRevenue) }}</p>
          <p class="text-xs text-slate-500 mt-2">Last 30 days</p>
        </div>

        <!-- Total Guests -->
        <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 shadow-md border-l-4 border-purple-500">
          <p class="text-slate-600 text-sm font-medium">Total Guests</p>
          <p class="text-3xl font-bold text-purple-600 mt-2">{{ analyticsStats().totalGuests }}</p>
          <p class="text-xs text-slate-500 mt-2">Checked in</p>
        </div>
      </div>

      <!-- Chart Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Occupancy Trend Chart -->
        <div class="bg-white rounded-lg p-6 shadow-md">
          <h3 class="text-lg font-semibold text-slate-900 mb-4">📈 Occupancy Trend (Last 7 Days)</h3>
          <div class="space-y-4">
            @for (data of lastSevenDays(); track data.date) {
              <div>
                <div class="flex justify-between mb-1">
                  <span class="text-sm text-slate-600">{{ formatShortDate(data.date) }}</span>
                  <span class="text-sm font-semibold text-slate-900">{{ data.occupancyRate }}%</span>
                </div>
                <div class="w-full bg-slate-200 rounded-full h-2">
                  <div
                    class="bg-blue-600 h-2 rounded-full transition-all"
                    [style.width.%]="data.occupancyRate"
                  ></div>
                </div>
                <p class="text-xs text-slate-500 mt-1">{{ data.occupiedRooms }}/{{ data.totalRooms }} rooms</p>
              </div>
            }
          </div>
        </div>

        <!-- Revenue Trend Chart -->
        <div class="bg-white rounded-lg p-6 shadow-md">
          <h3 class="text-lg font-semibold text-slate-900 mb-4">💰 Revenue Trend (Last 7 Days)</h3>
          <div class="space-y-4">
            @for (data of lastSevenDays(); track data.date) {
              <div>
                <div class="flex justify-between mb-1">
                  <span class="text-sm text-slate-600">{{ formatShortDate(data.date) }}</span>
                  <span class="text-sm font-semibold text-slate-900">₦{{ formatCurrency(data.revenue) }}</span>
                </div>
                <div class="w-full bg-slate-200 rounded-full h-2">
                  <div
                    class="bg-green-600 h-2 rounded-full transition-all"
                    [style.width.%]="getRevenuePercentage(data.revenue)"
                  ></div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Peak Hours & Room Types -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Peak Times -->
        <div class="bg-white rounded-lg p-6 shadow-md">
          <h3 class="text-lg font-semibold text-slate-900 mb-4">⏰ Peak Check-In Times</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span class="text-slate-700">2:00 PM - 4:00 PM</span>
              <span class="text-2xl font-bold text-blue-600">45%</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span class="text-slate-700">4:00 PM - 6:00 PM</span>
              <span class="text-2xl font-bold text-blue-600">35%</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span class="text-slate-700">6:00 PM - 8:00 PM</span>
              <span class="text-2xl font-bold text-blue-600">15%</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span class="text-slate-700">8:00 PM+</span>
              <span class="text-2xl font-bold text-blue-600">5%</span>
            </div>
          </div>
        </div>

        <!-- Room Type Performance -->
        <div class="bg-white rounded-lg p-6 shadow-md">
          <h3 class="text-lg font-semibold text-slate-900 mb-4">🛏️ Room Type Performance</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span class="text-slate-700">Single Rooms</span>
              <span class="text-2xl font-bold text-green-600">92%</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span class="text-slate-700">Double Rooms</span>
              <span class="text-2xl font-bold text-green-600">88%</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span class="text-slate-700">Suite Rooms</span>
              <span class="text-2xl font-bold text-green-600">75%</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span class="text-slate-700">Deluxe Rooms</span>
              <span class="text-2xl font-bold text-green-600">68%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Detailed Occupancy Table -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="p-6 border-b border-slate-200">
          <h3 class="text-lg font-semibold text-slate-900">📊 Detailed Occupancy Data</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-100 border-b border-slate-200">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Date</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Occupied Rooms</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Total Rooms</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Occupancy %</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Revenue</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Avg Rate</th>
              </tr>
            </thead>
            <tbody>
              @for (data of occupancyData(); track data.date) {
                <tr class="border-b border-slate-200 hover:bg-slate-50 transition">
                  <td class="px-6 py-4 text-sm font-medium text-slate-900">{{ formatShortDate(data.date) }}</td>
                  <td class="px-6 py-4 text-sm text-slate-600">{{ data.occupiedRooms }}</td>
                  <td class="px-6 py-4 text-sm text-slate-600">{{ data.totalRooms }}</td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                      <div class="w-20 bg-slate-200 rounded-full h-2">
                        <div
                          class="bg-blue-600 h-2 rounded-full"
                          [style.width.%]="data.occupancyRate"
                        ></div>
                      </div>
                      <span class="text-sm font-semibold text-slate-900">{{ data.occupancyRate }}%</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-sm font-semibold text-slate-900">₦{{ formatCurrency(data.revenue) }}</td>
                  <td class="px-6 py-4 text-sm text-slate-600">₦{{ getAverageRate(data.revenue, data.occupiedRooms) }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Insights -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 class="text-lg font-semibold text-blue-900 mb-3">💡 Occupancy Insight</h3>
          <p class="text-blue-700">Your average occupancy rate of {{ analyticsStats().averageOccupancy }}% is {{ analyticsStats().averageOccupancy > 70 ? 'excellent' : analyticsStats().averageOccupancy > 50 ? 'good' : 'needs improvement' }}. Peak times show highest occupancy between 2-6 PM.</p>
        </div>

        <div class="bg-green-50 rounded-lg p-6 border border-green-200">
          <h3 class="text-lg font-semibold text-green-900 mb-3">📈 Revenue Insight</h3>
          <p class="text-green-700">Your average daily revenue is ₦{{ formatCurrency(analyticsStats().averageRevenue) }}. Single and Double rooms are your top performers. Consider promoting Suite rooms during low occupancy periods.</p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AnalyticsComponent implements OnInit {
  occupancyData = signal<OccupancyData[]>([]);
  analyticsStats = signal<AnalyticsStats>({
    averageOccupancy: 0,
    peakOccupancy: 0,
    lowOccupancy: 0,
    averageRevenue: 0,
    totalRevenue: 0,
    totalGuests: 0,
    averageStay: 0
  });

  constructor(private hotelService: HotelService) {}

  ngOnInit() {
    this.loadAnalytics();
  }

  loadAnalytics() {
    // Mock data - Replace with actual API call
    const mockData: OccupancyData[] = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const occupancyRate = Math.floor(Math.random() * 40 + 50); // 50-90%
      const totalRooms = 10;
      const occupiedRooms = Math.floor((occupancyRate / 100) * totalRooms);
      const revenue = occupiedRooms * (Math.random() * 100 + 150);

      mockData.push({
        date: date.toISOString(),
        occupancyRate,
        occupiedRooms,
        totalRooms,
        revenue
      });
    }

    this.occupancyData.set(mockData);
    this.calculateStats();
  }

  calculateStats() {
    const data = this.occupancyData();
    
    const stats: AnalyticsStats = {
      averageOccupancy: Math.round(
        data.reduce((sum, d) => sum + d.occupancyRate, 0) / data.length
      ),
      peakOccupancy: Math.max(...data.map(d => d.occupancyRate)),
      lowOccupancy: Math.min(...data.map(d => d.occupancyRate)),
      averageRevenue: Math.round(
        data.reduce((sum, d) => sum + d.revenue, 0) / data.length
      ),
      totalRevenue: Math.round(data.reduce((sum, d) => sum + d.revenue, 0)),
      totalGuests: data.reduce((sum, d) => sum + d.occupiedRooms, 0),
      averageStay: 3.5 // Mock value
    };

    this.analyticsStats.set(stats);
  }

  lastSevenDays(): OccupancyData[] {
    return this.occupancyData().slice(-7);
  }

  getRevenuePercentage(revenue: number): number {
    const maxRevenue = Math.max(...this.occupancyData().map(d => d.revenue));
    return maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
  }

  getAverageRate(revenue: number, occupiedRooms: number): string {
    if (occupiedRooms === 0) return '0';
    return Math.round(revenue / occupiedRooms).toLocaleString();
  }

  formatCurrency(amount: number): string {
    return amount.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  formatShortDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
  }
}
