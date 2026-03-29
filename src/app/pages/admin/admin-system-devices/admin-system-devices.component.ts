import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-system-devices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4">
      <!-- Page Header -->
      <div class="flex items-center gap-3 mb-4">
        <span class="material-icons text-3xl text-indigo-600">devices</span>
        <div>
          <h2 class="text-2xl font-bold text-gray-800">Smart Devices</h2>
          <p class="text-xs text-gray-600">Manage all IoT and smart devices</p>
        </div>
      </div>

      <!-- Search and Filter -->
      <div class="bg-white rounded-lg shadow-md p-3 flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          [(ngModel)]="searchTerm"
          placeholder="Search devices..."
          class="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          [(ngModel)]="filterStatus"
          class="px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="error">Error</option>
        </select>
        <button
          (click)="searchDevices()"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-xs font-semibold transition flex items-center gap-1 whitespace-nowrap"
        >
          <span class="material-icons text-sm">search</span>
          <span class="hidden sm:inline">Search</span>
        </button>
        <button
          (click)="openAddDeviceModal()"
          class="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-semibold transition flex items-center gap-1 whitespace-nowrap"
        >
          <span class="material-icons text-sm">add_circle</span>
          <span class="hidden sm:inline">Add Device</span>
        </button>
      </div>

      <!-- Devices Table - Desktop View -->
      <div class="bg-white rounded-lg shadow-md overflow-x-auto hidden md:block">
        @if (devices().length > 0) {
          <table class="w-full text-sm">
            <thead class="bg-gray-200 border-b border-gray-300 sticky top-0">
              <tr>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-700">Device Name</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-700">Type</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-700">Owner</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-700">Status</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-700">Last Active</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (device of devices(); track device._id) {
                <tr class="border-b border-gray-200 hover:bg-gray-50">
                  <td class="px-3 py-2 text-xs font-semibold text-gray-800 truncate">{{ device.name }}</td>
                  <td class="px-3 py-2 text-xs text-gray-600 truncate">{{ device.type || '-' }}</td>
                  <td class="px-3 py-2 text-xs text-gray-600 truncate">{{ device.ownerName || '-' }}</td>
                  <td class="px-3 py-2 text-xs whitespace-nowrap">
                    <span [class]="'px-2 py-0.5 rounded text-xs font-semibold ' +
                      (device.status === 'active' ? 'bg-green-100 text-green-800' :
                       device.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                       'bg-red-100 text-red-800')">
                      {{ device.status || 'unknown' }}
                    </span>
                  </td>
                  <td class="px-3 py-2 text-xs text-gray-600">{{ (device.lastActive | date:'short') ?? '-' }}</td>
                  <td class="px-3 py-2 text-xs space-x-0.5">
                    <button
                      (click)="editDevice(device._id)"
                      class="text-blue-600 hover:text-blue-800 transition p-1 rounded hover:bg-blue-50"
                      title="Edit"
                    >
                      <span class="material-icons text-base">edit</span>
                    </button>
                    <button
                      (click)="deleteDevice(device._id)"
                      class="text-red-600 hover:text-red-800 transition p-1 rounded hover:bg-red-50"
                      title="Delete"
                    >
                      <span class="material-icons text-base">delete</span>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>

      <!-- Devices Cards - Mobile View -->
      <div class="space-y-2 md:hidden">
        @if (devices().length > 0) {
          @for (device of devices(); track device._id) {
            <div class="bg-white rounded shadow-sm p-3 border border-gray-200">
              <div class="flex justify-between items-start mb-2">
                <div class="flex-1 min-w-0">
                  <h3 class="text-xs font-semibold text-gray-800 truncate">{{ device.name }}</h3>
                  <p class="text-xs text-gray-600 truncate">{{ device.type || '-' }}</p>
                </div>
                <span [class]="'px-2 py-0.5 rounded text-xs font-semibold ml-2 ' +
                  (device.status === 'active' ? 'bg-green-100 text-green-800' :
                   device.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                   'bg-red-100 text-red-800')">
                  {{ device.status || 'unknown' }}
                </span>
              </div>
              <div class="text-xs text-gray-600 space-y-0.5 mb-2">
                <p><strong>Owner:</strong> {{ device.ownerName || '-' }}</p>
                <p><strong>Last Active:</strong> {{ (device.lastActive | date:'short') ?? '-' }}</p>
              </div>
              <div class="flex gap-1">
                <button
                  (click)="editDevice(device._id)"
                  class="flex-1 text-blue-600 hover:text-blue-800 transition text-xs py-1.5 px-2 border border-blue-300 rounded hover:bg-blue-50 flex items-center justify-center gap-1"
                >
                  <span class="material-icons text-sm">edit</span>
                  <span class="hidden sm:inline">Edit</span>
                </button>
                <button
                  (click)="deleteDevice(device._id)"
                  class="flex-1 text-red-600 hover:text-red-800 transition text-xs py-1.5 px-2 border border-red-300 rounded hover:bg-red-50 flex items-center justify-center gap-1"
                >
                  <span class="material-icons text-sm">delete</span>
                  <span class="hidden sm:inline">Delete</span>
                </button>
              </div>
            </div>
          }
        }
      </div>

      <!-- Empty State -->
      @if (devices().length === 0) {
        <div class="bg-white rounded-lg shadow-md p-8 text-center">
          <span class="material-icons text-6xl text-gray-300 mx-auto mb-4 block">devices_other</span>
          <p class="text-gray-600 font-medium">No devices found</p>
          <p class="text-gray-400 text-sm mt-1">Try adjusting your filters or add a new device</p>
        </div>
      }

      <!-- Pagination -->
      @if (totalPages() > 1 && devices().length > 0) {
        <div class="bg-white rounded-lg shadow-md p-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div class="text-xs text-gray-600">
            Page {{ currentPage() }}/{{ totalPages() }} ({{ totalItems() }} total)
          </div>
          <div class="flex items-center gap-1">
            <button
              (click)="previousPage()"
              [disabled]="currentPage() === 1"
              class="px-2 py-1 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 transition text-xs disabled:opacity-50 flex items-center gap-0.5 whitespace-nowrap"
            >
              <span class="material-icons text-sm">chevron_left</span>
            </button>

            <div class="flex gap-0.5">
              @for (page of getPageNumbers(); track page) {
                <button
                  (click)="goToPage(page)"
                  [class.bg-indigo-600]="page === currentPage()"
                  [class.text-white]="page === currentPage()"
                  [class.bg-gray-300]="page !== currentPage()"
                  [class.text-gray-900]="page !== currentPage()"
                  class="px-2 py-1 rounded hover:opacity-80 transition text-xs font-semibold"
                >
                  {{ page }}
                </button>
              }
            </div>

            <button
              (click)="nextPage()"
              [disabled]="currentPage() === totalPages()"
              class="px-2 py-1 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 transition text-xs disabled:opacity-50 flex items-center gap-0.5 whitespace-nowrap"
            >
              <span class="material-icons text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .material-icons {
      font-size: 24px;
      height: 24px;
      width: 24px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class AdminSystemDevicesComponent implements OnInit {
  devices = signal<any[]>([]);
  searchTerm = '';
  filterStatus = '';

  // Pagination
  currentPage = signal(1);
  pageSize = signal(10);
  totalItems = signal(0);
  totalPages = signal(0);

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadDevices();
  }

  loadDevices(): void {
    console.log(`🔄 Loading devices - Page: ${this.currentPage()}, Status: ${this.filterStatus || 'all'}`);

    this.adminService.getDevices(this.currentPage(), this.pageSize()).subscribe({
      next: (response: any) => {
        console.log('✅ Devices API Response:', response);

        // Handle response with data
        if (response.data) {
          const deviceList = Array.isArray(response.data) ? response.data : [response.data];

          // Filter by status if needed
          let filtered = deviceList;
          if (this.filterStatus) {
            filtered = deviceList.filter((d: any) => d.status === this.filterStatus);
          }

          this.devices.set(filtered);

          // Handle pagination
          if (response.pagination) {
            this.totalItems.set(response.pagination.total);
            this.totalPages.set(response.pagination.pages);
          } else {
            // Default pagination if not provided
            this.totalItems.set(filtered.length);
            this.totalPages.set(1);
          }

          console.log(`📱 Loaded ${filtered.length} devices`);
        } else {
          this.devices.set([]);
          this.totalItems.set(0);
          this.totalPages.set(0);
        }
      },
      error: (error: any) => {
        console.error('❌ Error loading devices:', error);
        this.devices.set([]);
        this.totalItems.set(0);
        this.totalPages.set(0);
      }
    });
  }

  searchDevices(): void {
    console.log(`🔍 Searching devices: "${this.searchTerm}", Status: "${this.filterStatus}"`);
    this.currentPage.set(1);
    this.loadDevices();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadDevices();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  previousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    if (total > 0) pages.push(1);
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      if (!pages.includes(i)) pages.push(i);
    }
    if (total > 1 && !pages.includes(total)) pages.push(total);

    return pages;
  }

  editDevice(deviceId: string): void {
    alert(`Edit device: ${deviceId} (To be implemented)`);
  }

  deleteDevice(deviceId: string): void {
    if (confirm('Are you sure you want to delete this device?')) {
      console.log(`🗑️  Deleting device: ${deviceId}`);

      // Note: deleteDevice endpoint might not be in admin service yet
      // For now, just reload the list
      // this.adminService.deleteDevice(deviceId).subscribe({...})

      alert('Device deletion not yet implemented on backend');
      this.loadDevices();
    }
  }

  openAddDeviceModal(): void {
    alert('Add Device modal (To be implemented)');
  }
}
