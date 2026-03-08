import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-settlements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="material-icons text-4xl text-blue-600">account_balance_wallet</span>
          <div>
            <h2 class="text-3xl font-bold text-gray-800">Settlement Management</h2>
            <p class="text-gray-600">Manage vendor financial settlements</p>
          </div>
        </div>
        <button
          (click)="openCreateModal()"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2"
        >
          <span class="material-icons">add_circle</span>
          New Settlement
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <p class="text-gray-600 text-sm font-semibold flex items-center gap-1">
            <span class="material-icons text-sm">assessment</span>
            Total Settlements
          </p>
          <p class="text-3xl font-bold text-gray-800 mt-2">{{ stats()?.total || 0 }}</p>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <p class="text-gray-600 text-sm font-semibold flex items-center gap-1">
            <span class="material-icons text-sm">check_circle</span>
            Approved
          </p>
          <p class="text-3xl font-bold text-green-600 mt-2">{{ stats()?.approved || 0 }}</p>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <p class="text-gray-600 text-sm font-semibold flex items-center gap-1">
            <span class="material-icons text-sm">attach_money</span>
            Net Amount
          </p>
          <p class="text-3xl font-bold text-purple-600 mt-2">
            \${{ (stats()?.financials?.totalNetAmount || 0) | number:'1.0-0' }}
          </p>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <p class="text-gray-600 text-sm font-semibold flex items-center gap-1">
            <span class="material-icons text-sm">commission</span>
            Commission
          </p>
          <p class="text-3xl font-bold text-orange-600 mt-2">
            \${{ (stats()?.financials?.totalCommission || 0) | number:'1.0-0' }}
          </p>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span class="material-icons">filter_list</span>
          Filters
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Search Vendor</label>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Vendor name or ID..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <select
              [(ngModel)]="selectedStatus"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending-review">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="settled">Settled</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Vendor Type</label>
            <select
              [(ngModel)]="selectedType"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="hotel">Hotel</option>
              <option value="restaurant">Restaurant</option>
              <option value="retail">Retail</option>
              <option value="service">Service</option>
              <option value="tours">Tours</option>
            </select>
          </div>
          <div class="flex items-end gap-2">
            <button
              (click)="loadSettlements()"
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              <span class="material-icons">search</span>
              Filter
            </button>
            <button
              (click)="resetFilters()"
              class="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              <span class="material-icons">refresh</span>
              Reset
            </button>
          </div>
        </div>
      </div>

      <!-- Settlements Table -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b">
              <tr>
                <th class="px-6 py-4 text-left text-gray-700 font-semibold">
                  <span class="material-icons inline mr-2">person</span>
                  Vendor
                </th>
                <th class="px-6 py-4 text-left text-gray-700 font-semibold">
                  <span class="material-icons inline mr-2">calendar_today</span>
                  Period
                </th>
                <th class="px-6 py-4 text-left text-gray-700 font-semibold">
                  <span class="material-icons inline mr-2">attach_money</span>
                  Amount
                </th>
                <th class="px-6 py-4 text-left text-gray-700 font-semibold">
                  <span class="material-icons inline mr-2">info</span>
                  Status
                </th>
                <th class="px-6 py-4 text-left text-gray-700 font-semibold">
                  <span class="material-icons inline mr-2">more_vert</span>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              @if (settlements().length === 0) {
                <tr>
                  <td colspan="5" class="px-6 py-12 text-center">
                    <span class="material-icons text-6xl text-gray-300 mb-4">inventory_2</span>
                    <p class="text-gray-500 font-semibold">No settlements found</p>
                  </td>
                </tr>
              } @else {
                @for (settlement of settlements(); track settlement._id) {
                  <tr class="border-b hover:bg-gray-50 transition">
                    <td class="px-6 py-4 font-semibold text-gray-900">{{ settlement.vendor?.name }}</td>
                    <td class="px-6 py-4 text-gray-700">
                      {{ settlement.period?.startDate | date:'MMM d, y' }} -
                      {{ settlement.period?.endDate | date:'MMM d, y' }}
                    </td>
                    <td class="px-6 py-4 text-gray-900 font-semibold">
                      \${{ settlement.financialSummary?.netAmount | number:'1.2-2' }}
                    </td>
                    <td class="px-6 py-4">
                      <span
                        class="px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 w-fit"
                        [class]="getStatusClass(settlement.status)"
                      >
                        <span class="material-icons text-sm">{{ getStatusIcon(settlement.status) }}</span>
                        {{ settlement.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-2">
                        <button
                          (click)="viewSettlement(settlement._id)"
                          title="View"
                          class="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded transition"
                        >
                          <span class="material-icons">visibility</span>
                        </button>
                        @if (settlement.status === 'pending-review') {
                          <button
                            (click)="approveSettlement(settlement._id)"
                            title="Approve"
                            class="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded transition"
                          >
                            <span class="material-icons">check_circle</span>
                          </button>
                          <button
                            (click)="rejectSettlement(settlement._id)"
                            title="Reject"
                            class="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition"
                          >
                            <span class="material-icons">cancel</span>
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal for Creating Settlement -->
      @if (showCreateModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <h3 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span class="material-icons">add_circle</span>
              Create Settlement
            </h3>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Vendor ID</label>
                <input
                  type="text"
                  [(ngModel)]="newSettlement.vendorId"
                  placeholder="Select vendor..."
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    [(ngModel)]="newSettlement.startDate"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    [(ngModel)]="newSettlement.endDate"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Commission %</label>
                <input
                  type="number"
                  [(ngModel)]="newSettlement.commission"
                  placeholder="15"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div class="flex gap-2 pt-4">
                <button
                  (click)="createSettlement()"
                  class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  <span class="material-icons">save</span>
                  Create
                </button>
                <button
                  (click)="showCreateModal.set(false)"
                  class="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  <span class="material-icons">close</span>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .material-icons {
        font-size: 24px;
        height: 24px;
        width: 24px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        user-select: none;
      }
    `
  ]
})
export class SettlementsComponent implements OnInit {
  settlements = signal<any[]>([]);
  stats = signal<any>(null);
  showCreateModal = signal(false);

  searchQuery = '';
  selectedStatus = '';
  selectedType = '';

  newSettlement = {
    vendorId: '',
    startDate: '',
    endDate: '',
    commission: 15
  };

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadSettlements();
  }

  loadSettlements(): void {
    this.adminService.getSettlements().subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data) {
          this.settlements.set(response.data);
        }
        this.loadStats();
      },
      error: (error: any) => console.error('Error loading settlements:', error)
    });
  }

  loadStats(): void {
    this.adminService.getSettlementStats().subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.stats.set(response.data);
        }
      },
      error: (error: any) => console.error('Error loading stats:', error)
    });
  }

  createSettlement(): void {
    if (!this.newSettlement.vendorId || !this.newSettlement.startDate || !this.newSettlement.endDate) {
      alert('Please fill all fields');
      return;
    }

    const data = {
      vendorId: this.newSettlement.vendorId,
      period: {
        startDate: new Date(this.newSettlement.startDate),
        endDate: new Date(this.newSettlement.endDate)
      },
      platformCommission: this.newSettlement.commission
    };

    this.adminService.createSettlement(data).subscribe({
      next: () => {
        this.showCreateModal.set(false);
        this.loadSettlements();
        this.newSettlement = { vendorId: '', startDate: '', endDate: '', commission: 15 };
      },
      error: (error: any) => console.error('Error creating settlement:', error)
    });
  }

  approveSettlement(settlementId: string): void {
    if (confirm('Approve this settlement?')) {
      this.adminService.approveSettlement(settlementId).subscribe({
        next: () => this.loadSettlements(),
        error: (error: any) => console.error('Error approving:', error)
      });
    }
  }

  rejectSettlement(settlementId: string): void {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      this.adminService.rejectSettlement(settlementId, reason).subscribe({
        next: () => this.loadSettlements(),
        error: (error: any) => console.error('Error rejecting:', error)
      });
    }
  }

  viewSettlement(settlementId: string): void {
    console.log('View settlement:', settlementId);
  }

  openCreateModal(): void {
    this.showCreateModal.set(true);
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = '';
    this.selectedType = '';
    this.loadSettlements();
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      'pending-review': 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      settled: 'bg-blue-100 text-blue-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      draft: 'edit',
      'pending-review': 'schedule',
      approved: 'check_circle',
      rejected: 'cancel',
      settled: 'done_all'
    };
    return icons[status] || 'help';
  }
}
