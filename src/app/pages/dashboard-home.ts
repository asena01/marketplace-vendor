import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  icon: string;
}

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8">
      <!-- Welcome Section -->
      <div class="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white shadow-lg">
        <h1 class="text-3xl font-bold mb-2">Welcome back, User!</h1>
        <p class="text-primary-100">Here&#39;s what&#39;s happening with your business today.</p>
      </div>

      <!-- Metrics Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div *ngFor="let metric of metrics" class="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-slate-600 text-sm font-medium mb-1">{{ metric.title }}</p>
              <p class="text-3xl font-bold text-slate-900">{{ metric.value }}</p>
              <p class="mt-2 text-sm" [ngClass]="metric.change >= 0 ? 'text-emerald-600' : 'text-red-600'">
                <span [ngClass]="metric.change >= 0 ? 'text-emerald-600' : 'text-red-600'">
                  {{ metric.change >= 0 ? '+' : '' }}{{ metric.change }}%
                </span>
                <span class="text-slate-500">from last month</span>
              </p>
            </div>
            <div class="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600">
              <svg [innerHTML]="getIconSvg(metric.icon)" class="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Chart Section -->
        <div class="lg:col-span-2 bg-white rounded-lg p-6 shadow-md">
          <div class="mb-6">
            <h3 class="text-lg font-bold text-slate-900 mb-1">Revenue Overview</h3>
            <p class="text-slate-600 text-sm">Monthly revenue for the past 6 months</p>
          </div>
          
          <div class="h-80">
            <svg viewBox="0 0 600 300" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <!-- Grid lines -->
              <line x1="60" y1="250" x2="580" y2="250" stroke="#e2e8f0" stroke-width="1" />
              <line x1="60" y1="190" x2="580" y2="190" stroke="#e2e8f0" stroke-width="1" />
              <line x1="60" y1="130" x2="580" y2="130" stroke="#e2e8f0" stroke-width="1" />
              <line x1="60" y1="70" x2="580" y2="70" stroke="#e2e8f0" stroke-width="1" />

              <!-- Axes -->
              <line x1="60" y1="250" x2="580" y2="250" stroke="#cbd5e1" stroke-width="2" />
              <line x1="60" y1="250" x2="60" y2="20" stroke="#cbd5e1" stroke-width="2" />

              <!-- Chart area background -->
              <rect x="60" y="20" width="520" height="230" fill="#f0f9ff" opacity="0.3" />

              <!-- Data line -->
              <polyline points="100,200 165,120 230,150 295,80 360,110 425,60 490,90 555,40" 
                fill="none" stroke="#0ea5e9" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

              <!-- Filled area under line -->
              <polygon points="100,200 165,120 230,150 295,80 360,110 425,60 490,90 555,40 555,250 100,250" 
                fill="#0ea5e9" opacity="0.1" />

              <!-- Data points -->
              <circle cx="100" cy="200" r="4" fill="#0ea5e9" />
              <circle cx="165" cy="120" r="4" fill="#0ea5e9" />
              <circle cx="230" cy="150" r="4" fill="#0ea5e9" />
              <circle cx="295" cy="80" r="4" fill="#0ea5e9" />
              <circle cx="360" cy="110" r="4" fill="#0ea5e9" />
              <circle cx="425" cy="60" r="4" fill="#0ea5e9" />
              <circle cx="490" cy="90" r="4" fill="#0ea5e9" />
              <circle cx="555" cy="40" r="4" fill="#0ea5e9" />

              <!-- X-axis labels -->
              <text x="100" y="270" text-anchor="middle" class="text-xs fill-slate-600">Jan</text>
              <text x="165" y="270" text-anchor="middle" class="text-xs fill-slate-600">Feb</text>
              <text x="230" y="270" text-anchor="middle" class="text-xs fill-slate-600">Mar</text>
              <text x="295" y="270" text-anchor="middle" class="text-xs fill-slate-600">Apr</text>
              <text x="360" y="270" text-anchor="middle" class="text-xs fill-slate-600">May</text>
              <text x="425" y="270" text-anchor="middle" class="text-xs fill-slate-600">Jun</text>

              <!-- Y-axis labels -->
              <text x="50" y="255" text-anchor="end" class="text-xs fill-slate-600">0K</text>
              <text x="50" y="195" text-anchor="end" class="text-xs fill-slate-600">20K</text>
              <text x="50" y="135" text-anchor="end" class="text-xs fill-slate-600">40K</text>
              <text x="50" y="75" text-anchor="end" class="text-xs fill-slate-600">60K</text>
            </svg>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="bg-white rounded-lg p-6 shadow-md">
          <div class="mb-6">
            <h3 class="text-lg font-bold text-slate-900 mb-1">Recent Activity</h3>
            <p class="text-slate-600 text-sm">Latest updates and actions</p>
          </div>

          <div class="space-y-4">
            <div class="flex items-start gap-4 pb-4 border-b border-slate-200">
              <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg class="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-slate-900">New customer added</p>
                <p class="text-sm text-slate-600">Acme Corporation</p>
                <p class="text-xs text-slate-500 mt-1">2 hours ago</p>
              </div>
            </div>

            <div class="flex items-start gap-4 pb-4 border-b border-slate-200">
              <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-slate-900">Order shipped</p>
                <p class="text-sm text-slate-600">Order #12345</p>
                <p class="text-xs text-slate-500 mt-1">5 hours ago</p>
              </div>
            </div>

            <div class="flex items-start gap-4 pb-4">
              <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg class="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.5 3A1.5 1.5 0 001 4.5v.006c0 .596.182 1.15.5 1.62V10.5A1.5 1.5 0 003 12h14a1.5 1.5 0 001.5-1.5V6.12c.318-.47.5-1.024.5-1.62V4.5A1.5 1.5 0 0017.5 3h-15z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-slate-900">Invoice created</p>
                <p class="text-sm text-slate-600">Invoice #INV-789</p>
                <p class="text-xs text-slate-500 mt-1">1 day ago</p>
              </div>
            </div>
          </div>

          <button class="w-full mt-6 text-primary-600 hover:text-primary-700 font-medium text-sm py-2 hover:bg-primary-50 rounded-lg transition-colors">
            View all activity →
          </button>
        </div>
      </div>

      <!-- Bottom Section with Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Top Products -->
        <div class="bg-white rounded-lg p-6 shadow-md">
          <h3 class="text-lg font-bold text-slate-900 mb-4">Top Products</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-slate-700 font-medium">Product A</span>
              <span class="text-slate-900 font-bold">1,234</span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-2">
              <div class="bg-primary-600 h-2 rounded-full" style="width: 85%;"></div>
            </div>

            <div class="flex items-center justify-between mt-4">
              <span class="text-slate-700 font-medium">Product B</span>
              <span class="text-slate-900 font-bold">987</span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-2">
              <div class="bg-primary-500 h-2 rounded-full" style="width: 68%;"></div>
            </div>

            <div class="flex items-center justify-between mt-4">
              <span class="text-slate-700 font-medium">Product C</span>
              <span class="text-slate-900 font-bold">654</span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-2">
              <div class="bg-primary-400 h-2 rounded-full" style="width: 45%;"></div>
            </div>
          </div>
        </div>

        <!-- Customer Stats -->
        <div class="bg-white rounded-lg p-6 shadow-md">
          <h3 class="text-lg font-bold text-slate-900 mb-4">Customer Stats</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-slate-600">Total Customers</span>
              <span class="font-bold text-slate-900">2,543</span>
            </div>
            <div class="border-t border-slate-200 pt-4 flex items-center justify-between">
              <span class="text-slate-600">Active Today</span>
              <span class="font-bold text-emerald-600">834</span>
            </div>
            <div class="border-t border-slate-200 pt-4 flex items-center justify-between">
              <span class="text-slate-600">Retention Rate</span>
              <span class="font-bold text-slate-900">92.5%</span>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-lg p-6 shadow-md">
          <h3 class="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
          <div class="space-y-2">
            <button class="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              Create New Report
            </button>
            <button class="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors">
              Export Data
            </button>
            <button class="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors">
              View Documentation
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardHomeComponent implements OnInit {
  metrics: MetricCard[] = [];

  ngOnInit() {
    this.metrics = [
      {
        title: 'Total Revenue',
        value: '$45,231.89',
        change: 20.1,
        icon: 'trending-up',
      },
      {
        title: 'Total Sales',
        value: '12,543',
        change: 15.3,
        icon: 'shopping-cart',
      },
      {
        title: 'Active Users',
        value: '8,234',
        change: 8.7,
        icon: 'users',
      },
      {
        title: 'Conversion Rate',
        value: '3.24%',
        change: -2.4,
        icon: 'target',
      },
    ];
  }

  getIconSvg(iconName: string): string {
    const icons: { [key: string]: string } = {
      'trending-up': `<path d="M13 7H11v12h2V7zm-4 4H7v8h2v-8zm8-4h-2v16h2V7z" fill="currentColor"/>`,
      'shopping-cart': `<path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" fill="currentColor"/>`,
      'users': `<path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.5 1.1 2.97 2.29 2.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="currentColor"/>`,
      'target': `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" fill="currentColor"/>`,
    };
    return icons[iconName] || '';
  }
}
