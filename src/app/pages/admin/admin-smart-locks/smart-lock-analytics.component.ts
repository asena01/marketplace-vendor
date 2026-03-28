import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface UnlockAttempt {
  id: string;
  bookingId: string;
  bookingNumber: string;
  deviceId: string;
  roomNumber: string;
  guestName: string;
  timestamp: Date;
  method: 'token' | 'pin' | 'qr';
  status: 'success' | 'failed';
  deviceStatus: 'online' | 'offline';
  errorMessage?: string;
  responseTime?: number; // milliseconds
}

interface DevicePerformance {
  deviceId: string;
  roomNumber: string;
  totalUnlocks: number;
  successRate: number;
  averageResponseTime: number;
  failureReasons: {
    [key: string]: number;
  };
  uptimePercentage: number;
  lastUnlock: Date;
}

@Component({
  selector: 'app-smart-lock-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 p-8">
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white shadow-lg">
        <div>
          <h1 class="text-3xl font-bold mb-2">📊 Smart Lock Analytics</h1>
          <p class="text-blue-100">Track unlock attempts and device performance metrics</p>
        </div>
      </div>

      <!-- Performance Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500">
          <p class="text-slate-600 text-sm font-medium mb-2">Total Unlock Attempts</p>
          <p class="text-3xl font-bold text-blue-600">{{ getTotalUnlocks() }}</p>
          <p class="text-xs text-slate-500 mt-2">Last 30 days</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-green-500">
          <p class="text-slate-600 text-sm font-medium mb-2">Success Rate</p>
          <p class="text-3xl font-bold text-green-600">{{ getSuccessRate() }}%</p>
          <p class="text-xs text-slate-500 mt-2">Successful unlocks</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-orange-500">
          <p class="text-slate-600 text-sm font-medium mb-2">Failed Attempts</p>
          <p class="text-3xl font-bold text-orange-600">{{ getFailedAttempts() }}</p>
          <p class="text-xs text-slate-500 mt-2">Require investigation</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-purple-500">
          <p class="text-slate-600 text-sm font-medium mb-2">Avg Response Time</p>
          <p class="text-3xl font-bold text-purple-600">{{ getAverageResponseTime() }}ms</p>
          <p class="text-xs text-slate-500 mt-2">Per unlock</p>
        </div>
      </div>

      <!-- Unlock Methods Distribution -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-bold text-slate-900 mb-6">Unlock Methods Distribution</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-slate-600 font-medium">📱 QR Code</span>
              <span class="text-slate-900 font-bold">{{ getUnlocksByMethod('qr') }}</span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-2">
              <div 
                class="bg-blue-500 h-2 rounded-full transition-all"
                [style.width.%]="(getUnlocksByMethod('qr') / getTotalUnlocks() * 100) || 0"
              ></div>
            </div>
            <p class="text-xs text-slate-500">Most popular method</p>
          </div>

          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-slate-600 font-medium">🔐 Access Token</span>
              <span class="text-slate-900 font-bold">{{ getUnlocksByMethod('token') }}</span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-2">
              <div 
                class="bg-green-500 h-2 rounded-full transition-all"
                [style.width.%]="(getUnlocksByMethod('token') / getTotalUnlocks() * 100) || 0"
              ></div>
            </div>
            <p class="text-xs text-slate-500">Token-based access</p>
          </div>

          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-slate-600 font-medium">🔑 Backup PIN</span>
              <span class="text-slate-900 font-bold">{{ getUnlocksByMethod('pin') }}</span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-2">
              <div 
                class="bg-orange-500 h-2 rounded-full transition-all"
                [style.width.%]="(getUnlocksByMethod('pin') / getTotalUnlocks() * 100) || 0"
              ></div>
            </div>
            <p class="text-xs text-slate-500">Emergency backups</p>
          </div>
        </div>
      </div>

      <!-- Device Performance Table -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-bold text-slate-900 mb-6">Device Performance</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-100 border-b">
              <tr>
                <th class="px-6 py-3 text-left font-semibold text-slate-900">Device ID</th>
                <th class="px-6 py-3 text-left font-semibold text-slate-900">Room</th>
                <th class="px-6 py-3 text-center font-semibold text-slate-900">Total Unlocks</th>
                <th class="px-6 py-3 text-center font-semibold text-slate-900">Success Rate</th>
                <th class="px-6 py-3 text-center font-semibold text-slate-900">Avg Response</th>
                <th class="px-6 py-3 text-center font-semibold text-slate-900">Uptime</th>
                <th class="px-6 py-3 text-center font-semibold text-slate-900">Last Unlock</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              @for (device of devicePerformance(); track device.deviceId) {
                <tr class="hover:bg-slate-50">
                  <td class="px-6 py-3 font-mono text-slate-900">{{ device.deviceId }}</td>
                  <td class="px-6 py-3 text-slate-600">
                    <span class="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {{ device.roomNumber }}
                    </span>
                  </td>
                  <td class="px-6 py-3 text-center font-bold text-slate-900">{{ device.totalUnlocks }}</td>
                  <td class="px-6 py-3 text-center">
                    <span class="px-3 py-1 rounded-full text-xs font-medium" [ngClass]="{
                      'bg-green-100 text-green-700': device.successRate >= 95,
                      'bg-yellow-100 text-yellow-700': device.successRate >= 85 && device.successRate < 95,
                      'bg-red-100 text-red-700': device.successRate < 85
                    }">
                      {{ device.successRate }}%
                    </span>
                  </td>
                  <td class="px-6 py-3 text-center text-slate-600">{{ device.averageResponseTime }}ms</td>
                  <td class="px-6 py-3 text-center">
                    <span class="px-3 py-1 rounded-full text-xs font-medium" [ngClass]="{
                      'bg-green-100 text-green-700': device.uptimePercentage >= 99,
                      'bg-yellow-100 text-yellow-700': device.uptimePercentage >= 95,
                      'bg-orange-100 text-orange-700': device.uptimePercentage < 95
                    }">
                      {{ device.uptimePercentage }}%
                    </span>
                  </td>
                  <td class="px-6 py-3 text-center text-xs text-slate-600">
                    {{ device.lastUnlock | date: 'short' }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent Unlock Attempts -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-bold text-slate-900 mb-6">Recent Unlock Attempts</h3>
        
        <!-- Filter -->
        <div class="mb-6 flex gap-4">
          <select
            [(ngModel)]="statusFilter"
            (change)="filterAttempts()"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
          >
            <option value="">All Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
          <select
            [(ngModel)]="methodFilter"
            (change)="filterAttempts()"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
          >
            <option value="">All Methods</option>
            <option value="qr">QR Code</option>
            <option value="token">Access Token</option>
            <option value="pin">PIN Code</option>
          </select>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-100 border-b">
              <tr>
                <th class="px-6 py-3 text-left font-semibold text-slate-900">Time</th>
                <th class="px-6 py-3 text-left font-semibold text-slate-900">Guest</th>
                <th class="px-6 py-3 text-left font-semibold text-slate-900">Room</th>
                <th class="px-6 py-3 text-left font-semibold text-slate-900">Method</th>
                <th class="px-6 py-3 text-left font-semibold text-slate-900">Status</th>
                <th class="px-6 py-3 text-left font-semibold text-slate-900">Device Status</th>
                <th class="px-6 py-3 text-center font-semibold text-slate-900">Response Time</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              @for (attempt of filteredAttempts(); track attempt.id) {
                <tr class="hover:bg-slate-50">
                  <td class="px-6 py-3 text-xs text-slate-600">{{ attempt.timestamp | date: 'short' }}</td>
                  <td class="px-6 py-3 text-slate-900 font-medium">{{ attempt.guestName }}</td>
                  <td class="px-6 py-3">
                    <span class="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {{ attempt.roomNumber }}
                    </span>
                  </td>
                  <td class="px-6 py-3 text-slate-600">
                    <span [ngClass]="{
                      'text-blue-600': attempt.method === 'qr',
                      'text-green-600': attempt.method === 'token',
                      'text-orange-600': attempt.method === 'pin'
                    }">
                      {{ attempt.method === 'qr' ? '📱 QR' : attempt.method === 'token' ? '🔐 Token' : '🔑 PIN' }}
                    </span>
                  </td>
                  <td class="px-6 py-3">
                    <span class="px-3 py-1 rounded-full text-xs font-medium" [ngClass]="{
                      'bg-green-100 text-green-700': attempt.status === 'success',
                      'bg-red-100 text-red-700': attempt.status === 'failed'
                    }">
                      {{ attempt.status === 'success' ? '✓ Success' : '✗ Failed' }}
                    </span>
                  </td>
                  <td class="px-6 py-3">
                    <span [ngClass]="{
                      'text-green-600 font-semibold': attempt.deviceStatus === 'online',
                      'text-red-600 font-semibold': attempt.deviceStatus === 'offline'
                    }">
                      {{ attempt.deviceStatus === 'online' ? '🟢 Online' : '🔴 Offline' }}
                    </span>
                  </td>
                  <td class="px-6 py-3 text-center text-slate-600">
                    @if (attempt.responseTime) {
                      <span [ngClass]="{
                        'text-green-600': attempt.responseTime < 500,
                        'text-yellow-600': attempt.responseTime >= 500 && attempt.responseTime < 1000,
                        'text-red-600': attempt.responseTime >= 1000
                      }">
                        {{ attempt.responseTime }}ms
                      </span>
                    } @else {
                      <span class="text-slate-400">—</span>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class SmartLockAnalyticsComponent implements OnInit {
  unlockAttempts = signal<UnlockAttempt[]>([]);
  filteredAttempts = signal<UnlockAttempt[]>([]);
  devicePerformance = signal<DevicePerformance[]>([]);

  statusFilter = '';
  methodFilter = '';

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    // Simulated data - in production, this would come from a backend API
    const simulatedAttempts: UnlockAttempt[] = [
      {
        id: '1',
        bookingId: 'booking_1',
        bookingNumber: 'BK001',
        deviceId: 'lock_room_101',
        roomNumber: '101',
        guestName: 'John Doe',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        method: 'qr',
        status: 'success',
        deviceStatus: 'online',
        responseTime: 245
      },
      {
        id: '2',
        bookingId: 'booking_2',
        bookingNumber: 'BK002',
        deviceId: 'lock_room_102',
        roomNumber: '102',
        guestName: 'Jane Smith',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        method: 'token',
        status: 'success',
        deviceStatus: 'online',
        responseTime: 187
      },
      {
        id: '3',
        bookingId: 'booking_3',
        bookingNumber: 'BK003',
        deviceId: 'lock_room_201',
        roomNumber: '201',
        guestName: 'Michael Brown',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        method: 'pin',
        status: 'failed',
        deviceStatus: 'offline',
        errorMessage: 'Device offline',
        responseTime: 5000
      },
      {
        id: '4',
        bookingId: 'booking_4',
        bookingNumber: 'BK004',
        deviceId: 'lock_room_101',
        roomNumber: '101',
        guestName: 'Sarah Wilson',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        method: 'qr',
        status: 'success',
        deviceStatus: 'online',
        responseTime: 156
      },
      {
        id: '5',
        bookingId: 'booking_5',
        bookingNumber: 'BK005',
        deviceId: 'lock_room_102',
        roomNumber: '102',
        guestName: 'David Lee',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        method: 'token',
        status: 'success',
        deviceStatus: 'online',
        responseTime: 220
      }
    ];

    this.unlockAttempts.set(simulatedAttempts);
    this.filteredAttempts.set(simulatedAttempts);

    // Simulated device performance data
    this.devicePerformance.set([
      {
        deviceId: 'lock_room_101',
        roomNumber: '101',
        totalUnlocks: 42,
        successRate: 98,
        averageResponseTime: 215,
        failureReasons: { 'Offline': 1 },
        uptimePercentage: 99.5,
        lastUnlock: new Date(Date.now() - 5 * 60 * 1000)
      },
      {
        deviceId: 'lock_room_102',
        roomNumber: '102',
        totalUnlocks: 38,
        successRate: 97,
        averageResponseTime: 198,
        failureReasons: { 'Timeout': 1 },
        uptimePercentage: 99.2,
        lastUnlock: new Date(Date.now() - 15 * 60 * 1000)
      },
      {
        deviceId: 'lock_room_201',
        roomNumber: '201',
        totalUnlocks: 35,
        successRate: 89,
        averageResponseTime: 456,
        failureReasons: { 'Offline': 3, 'Network Error': 1 },
        uptimePercentage: 94.8,
        lastUnlock: new Date(Date.now() - 30 * 60 * 1000)
      }
    ]);
  }

  filterAttempts(): void {
    let filtered = this.unlockAttempts();

    if (this.statusFilter) {
      filtered = filtered.filter(a => a.status === this.statusFilter);
    }

    if (this.methodFilter) {
      filtered = filtered.filter(a => a.method === this.methodFilter);
    }

    this.filteredAttempts.set(filtered);
  }

  getTotalUnlocks(): number {
    return this.unlockAttempts().length;
  }

  getSuccessRate(): number {
    const total = this.unlockAttempts().length;
    if (total === 0) return 0;
    const successful = this.unlockAttempts().filter(a => a.status === 'success').length;
    return Math.round((successful / total) * 100);
  }

  getFailedAttempts(): number {
    return this.unlockAttempts().filter(a => a.status === 'failed').length;
  }

  getAverageResponseTime(): number {
    const attempts = this.unlockAttempts().filter(a => a.responseTime);
    if (attempts.length === 0) return 0;
    const total = attempts.reduce((sum, a) => sum + (a.responseTime || 0), 0);
    return Math.round(total / attempts.length);
  }

  getUnlocksByMethod(method: string): number {
    return this.unlockAttempts().filter(a => a.method === method).length;
  }
}
