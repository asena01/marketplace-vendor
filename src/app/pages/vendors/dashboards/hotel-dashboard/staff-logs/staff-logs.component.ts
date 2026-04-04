import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../../../../services/hotel.service';

interface ActivityLog {
  _id?: string;
  staffId: string;
  staffName: string;
  staffPosition: string;
  action: 'check-in' | 'check-out' | 'room-cleaned' | 'order-processed' | 'guest-complaint' | 'maintenance' | 'login' | 'logout';
  description: string;
  actionDetail?: string;
  relatedId?: string; // booking ID, order ID, etc.
  timestamp: string;
  status: 'success' | 'pending' | 'failed';
}

interface StaffStats {
  totalActions: number;
  actionsToday: number;
  activeStaff: number;
  checkedIn: number;
  checkedOut: number;
}

@Component({
  selector: 'app-staff-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8 space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold text-slate-900">Staff Activity Logs</h1>
        <p class="text-slate-600 mt-1">Track all staff actions and performance metrics</p>
      </div>

      <!-- Staff Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <!-- Total Actions -->
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-blue-500">
          <p class="text-slate-600 text-sm font-medium">Total Actions</p>
          <p class="text-2xl font-bold text-blue-600 mt-2">{{ staffStats().totalActions }}</p>
        </div>

        <!-- Actions Today -->
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-green-500">
          <p class="text-slate-600 text-sm font-medium">Today's Actions</p>
          <p class="text-2xl font-bold text-green-600 mt-2">{{ staffStats().actionsToday }}</p>
        </div>

        <!-- Active Staff -->
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-purple-500">
          <p class="text-slate-600 text-sm font-medium">Active Staff</p>
          <p class="text-2xl font-bold text-purple-600 mt-2">{{ staffStats().activeStaff }}</p>
        </div>

        <!-- Checked In -->
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-emerald-500">
          <p class="text-slate-600 text-sm font-medium">Checked In</p>
          <p class="text-2xl font-bold text-emerald-600 mt-2">{{ staffStats().checkedIn }}</p>
        </div>

        <!-- Checked Out -->
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-red-500">
          <p class="text-slate-600 text-sm font-medium">Checked Out</p>
          <p class="text-2xl font-bold text-red-600 mt-2">{{ staffStats().checkedOut }}</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg p-4 shadow-md">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Filter by Staff</label>
            <input
              type="text"
              [(ngModel)]="searchStaff"
              (keyup)="filterLogs()"
              placeholder="Search staff name..."
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Action Type</label>
            <select
              [(ngModel)]="selectedAction"
              (change)="filterLogs()"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Actions</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="check-in">Check-In Guest</option>
              <option value="check-out">Check-Out Guest</option>
              <option value="order-processed">Order Processed</option>
              <option value="room-cleaned">Room Cleaned</option>
              <option value="maintenance">Maintenance</option>
              <option value="guest-complaint">Guest Complaint</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              [(ngModel)]="selectedStatus"
              (change)="filterLogs()"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Sort By</label>
            <select
              [(ngModel)]="sortBy"
              (change)="filterLogs()"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Activity Logs Table -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-100 border-b border-slate-200">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Staff Name</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Position</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Action</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Details</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Date & Time</th>
              </tr>
            </thead>
            <tbody>
              @if (filteredLogs().length === 0) {
                <tr>
                  <td colspan="6" class="px-6 py-8 text-center text-slate-600">
                    No activity logs found
                  </td>
                </tr>
              } @else {
                @for (log of filteredLogs(); track log._id) {
                  <tr class="border-b border-slate-200 hover:bg-slate-50 transition">
                    <td class="px-6 py-4 font-medium text-slate-900">{{ log.staffName }}</td>
                    <td class="px-6 py-4 text-sm text-slate-600">{{ log.staffPosition | titlecase }}</td>
                    <td class="px-6 py-4">
                      <span
                        class="px-3 py-1 rounded-full text-xs font-medium"
                        [ngClass]="{
                          'bg-blue-100 text-blue-700': log.action === 'login',
                          'bg-red-100 text-red-700': log.action === 'logout',
                          'bg-green-100 text-green-700': log.action === 'check-in',
                          'bg-orange-100 text-orange-700': log.action === 'check-out',
                          'bg-purple-100 text-purple-700': log.action === 'order-processed',
                          'bg-yellow-100 text-yellow-700': log.action === 'room-cleaned',
                          'bg-indigo-100 text-indigo-700': log.action === 'maintenance',
                          'bg-pink-100 text-pink-700': log.action === 'guest-complaint'
                        }"
                      >
                        {{ getActionLabel(log.action) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-slate-600">{{ log.description }}</td>
                    <td class="px-6 py-4">
                      <span
                        class="px-3 py-1 rounded-full text-xs font-medium"
                        [ngClass]="{
                          'bg-green-100 text-green-700': log.status === 'success',
                          'bg-yellow-100 text-yellow-700': log.status === 'pending',
                          'bg-red-100 text-red-700': log.status === 'failed'
                        }"
                      >
                        {{ log.status | titlecase }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-slate-600">{{ formatDate(log.timestamp) }}</td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class StaffLogsComponent implements OnInit {
  activityLogs = signal<ActivityLog[]>([]);
  filteredLogs = signal<ActivityLog[]>([]);
  staffStats = signal<StaffStats>({
    totalActions: 0,
    actionsToday: 0,
    activeStaff: 0,
    checkedIn: 0,
    checkedOut: 0
  });

  searchStaff = '';
  selectedAction = '';
  selectedStatus = '';
  sortBy = 'latest';

  constructor(private hotelService: HotelService) {}

  ngOnInit() {
    this.loadActivityLogs();
  }

  loadActivityLogs() {
    // Mock data - Replace with actual API call
    const mockLogs: ActivityLog[] = [
      {
        _id: '1',
        staffId: 'staff1',
        staffName: 'Alice Johnson',
        staffPosition: 'front-desk',
        action: 'login',
        description: 'Staff logged in to system',
        timestamp: new Date().toISOString(),
        status: 'success'
      },
      {
        _id: '2',
        staffId: 'staff2',
        staffName: 'Bob Smith',
        staffPosition: 'housekeeping',
        action: 'room-cleaned',
        description: 'Room 101 cleaned and inspected',
        actionDetail: 'Room ready for guests',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        status: 'success'
      },
      {
        _id: '3',
        staffId: 'staff1',
        staffName: 'Alice Johnson',
        staffPosition: 'front-desk',
        action: 'check-in',
        description: 'Guest checked in',
        actionDetail: 'John Doe - Room 101',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: 'success'
      },
      {
        _id: '4',
        staffId: 'staff3',
        staffName: 'Carol Davis',
        staffPosition: 'kitchen',
        action: 'order-processed',
        description: 'Room service order prepared',
        actionDetail: '2 orders - Ready for delivery',
        timestamp: new Date(Date.now() - 5400000).toISOString(),
        status: 'success'
      },
      {
        _id: '5',
        staffId: 'staff2',
        staffName: 'Bob Smith',
        staffPosition: 'housekeeping',
        action: 'guest-complaint',
        description: 'Guest complaint logged',
        actionDetail: 'Room temperature issue',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        status: 'pending'
      },
      {
        _id: '6',
        staffId: 'staff4',
        staffName: 'David Wilson',
        staffPosition: 'maintenance',
        action: 'maintenance',
        description: 'Maintenance task completed',
        actionDetail: 'Room 205 AC repaired',
        timestamp: new Date(Date.now() - 9000000).toISOString(),
        status: 'success'
      }
    ];

    this.activityLogs.set(mockLogs);
    this.calculateStats();
    this.filterLogs();
  }

  calculateStats() {
    const logs = this.activityLogs();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats: StaffStats = {
      totalActions: logs.length,
      actionsToday: logs.filter(l => new Date(l.timestamp) >= today).length,
      activeStaff: new Set(logs.map(l => l.staffId)).size,
      checkedIn: logs.filter(l => l.action === 'login').length,
      checkedOut: logs.filter(l => l.action === 'logout').length
    };

    this.staffStats.set(stats);
  }

  filterLogs() {
    let filtered = [...this.activityLogs()];

    if (this.searchStaff) {
      filtered = filtered.filter(l =>
        l.staffName.toLowerCase().includes(this.searchStaff.toLowerCase())
      );
    }

    if (this.selectedAction) {
      filtered = filtered.filter(l => l.action === this.selectedAction);
    }

    if (this.selectedStatus) {
      filtered = filtered.filter(l => l.status === this.selectedStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return this.sortBy === 'latest' ? timeB - timeA : timeA - timeB;
    });

    this.filteredLogs.set(filtered);
  }

  getActionLabel(action: string): string {
    const labels: { [key: string]: string } = {
      'login': '🔓 Login',
      'logout': '🔐 Logout',
      'check-in': '✓ Check-In',
      'check-out': '✗ Check-Out',
      'order-processed': '📦 Order Processed',
      'room-cleaned': '🧹 Room Cleaned',
      'maintenance': '🔧 Maintenance',
      'guest-complaint': '⚠️ Complaint'
    };
    return labels[action] || action;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
