import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-hotel-directory',
  standalone: true,
  imports: [CommonModule, FormsModule, TitleCasePipe],
  template: `
    <div class="space-y-6">
      <section class="rounded-[28px] bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 px-6 py-7 text-white shadow-xl">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.24em] text-blue-200">Admin Workspace</p>
            <h2 class="mt-3 text-3xl font-black tracking-tight">Hotel Partners</h2>
            <p class="mt-2 max-w-2xl text-sm text-slate-200">
              Review registered hotel operators, check their compliance posture, and open a dedicated operational workspace.
            </p>
          </div>
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div class="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
              <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-100">Hotels</p>
              <p class="mt-2 text-2xl font-black">{{ vendors().length }}</p>
            </div>
            <div class="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
              <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-100">Active</p>
              <p class="mt-2 text-2xl font-black">{{ getStatusCount('active') }}</p>
            </div>
            <div class="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
              <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-100">Pending</p>
              <p class="mt-2 text-2xl font-black">{{ getStatusCount('pending') }}</p>
            </div>
            <div class="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
              <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-100">Suspended</p>
              <p class="mt-2 text-2xl font-black">{{ getStatusCount('suspended') }}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex flex-col gap-3 lg:flex-row">
          <label class="flex-1">
            <span class="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Search Hotels</span>
            <input
              [(ngModel)]="searchQuery"
              (ngModelChange)="filterVendors()"
              type="text"
              placeholder="Search by hotel name, email, or phone"
              class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white"
            />
          </label>

          <label class="w-full lg:max-w-xs">
            <span class="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Status</span>
            <select
              [(ngModel)]="selectedStatus"
              (ngModelChange)="filterVendors()"
              class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </label>
        </div>
      </section>

      @if (isLoading()) {
        <div class="rounded-[24px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <p class="text-sm font-semibold text-slate-500">Loading hotel vendors...</p>
        </div>
      } @else if (filteredVendors().length === 0) {
        <div class="rounded-[24px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
          <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <span class="material-icons">hotel</span>
          </div>
          <h3 class="mt-5 text-xl font-black tracking-tight text-slate-900">No hotels match this view</h3>
          <p class="mt-2 text-sm text-slate-500">Adjust the search or status filter to find a hotel partner.</p>
        </div>
      } @else {
        <section class="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-200">
              <thead class="bg-slate-50">
                <tr class="text-left text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  <th class="px-6 py-4">Hotel</th>
                  <th class="px-6 py-4">Contact</th>
                  <th class="px-6 py-4">Health</th>
                  <th class="px-6 py-4">Joined</th>
                  <th class="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 bg-white">
                @for (vendor of filteredVendors(); track vendor._id) {
                  <tr class="transition hover:bg-slate-50/80">
                    <td class="px-6 py-5">
                      <div class="flex items-center gap-4">
                        <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                          <span class="material-icons">apartment</span>
                        </div>
                        <div>
                          <p class="text-sm font-bold text-slate-900">{{ vendor.name }}</p>
                          <p class="mt-1 text-xs font-medium text-slate-500">{{ (vendor.vendorType || 'hotel') | titlecase }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-5">
                      <p class="text-sm font-semibold text-slate-900">{{ vendor.email || 'No email' }}</p>
                      <p class="mt-1 text-xs text-slate-500">{{ vendor.phone || 'No phone' }}</p>
                    </td>
                    <td class="px-6 py-5">
                      <div class="flex flex-wrap items-center gap-2">
                        <span [class]="'inline-flex rounded-full px-3 py-1 text-xs font-bold ' + getStatusBadgeClass(vendor.status)">
                          {{ vendor.status || 'unknown' }}
                        </span>
                        <span [class]="'inline-flex rounded-full px-3 py-1 text-xs font-bold ' + getKycBadgeClass(vendor.kycStatus)">
                          KYC {{ vendor.kycStatus || 'n/a' }}
                        </span>
                      </div>
                      <p class="mt-2 text-xs font-medium text-slate-500">Rating {{ vendor.rating || 0 }}/5</p>
                    </td>
                    <td class="px-6 py-5">
                      <p class="text-sm font-semibold text-slate-900">{{ vendor.createdAt ? (vendor.createdAt | date:'mediumDate') : 'N/A' }}</p>
                      <p class="mt-1 text-xs text-slate-500">{{ vendor.createdAt ? (vendor.createdAt | date:'shortTime') : '' }}</p>
                    </td>
                    <td class="px-6 py-5 text-right">
                      <div class="flex justify-end gap-2">
                        @if (vendor.status === 'pending') {
                          <button
                            (click)="approveHotel(vendor._id)"
                            [disabled]="approvingVendorId() === vendor._id"
                            class="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <span class="material-icons text-base">check_circle</span>
                            {{ approvingVendorId() === vendor._id ? 'Approving...' : 'Approve' }}
                          </button>
                        }
                        <button
                          (click)="openHotel(vendor._id)"
                          class="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-600"
                        >
                          Open Workspace
                          <span class="material-icons text-base">arrow_forward</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>
      }
    </div>
  `,
  styles: [`
    .material-icons {
      font-size: 22px;
      height: 22px;
      width: 22px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class AdminHotelDirectoryComponent implements OnInit {
  vendors = signal<any[]>([]);
  filteredVendors = signal<any[]>([]);
  isLoading = signal(false);
  approvingVendorId = signal<string | null>(null);
  searchQuery = '';
  selectedStatus = '';

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadHotels();
  }

  loadHotels(): void {
    this.isLoading.set(true);
    this.adminService.getVendors(1, 200, { vendorType: 'hotel' }).subscribe({
      next: (response: any) => {
        const vendors = Array.isArray(response?.data) ? response.data : [];
        this.vendors.set(vendors);
        this.filteredVendors.set(vendors);
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('❌ Failed to load hotel vendors:', error);
        this.vendors.set([]);
        this.filteredVendors.set([]);
        this.isLoading.set(false);
      }
    });
  }

  filterVendors(): void {
    const query = this.searchQuery.trim().toLowerCase();
    const status = this.selectedStatus;

    this.filteredVendors.set(
      this.vendors().filter((vendor) => {
        const matchesQuery = !query || [vendor.name, vendor.email, vendor.phone]
          .some((value) => String(value || '').toLowerCase().includes(query));
        const matchesStatus = !status || vendor.status === status;
        return matchesQuery && matchesStatus;
      })
    );
  }

  getStatusCount(status: string): number {
    return this.vendors().filter((vendor) => vendor.status === status).length;
  }

  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700',
      verified: 'bg-sky-100 text-sky-700',
      active: 'bg-emerald-100 text-emerald-700',
      suspended: 'bg-rose-100 text-rose-700'
    };
    return classes[status] || 'bg-slate-100 text-slate-700';
  }

  getKycBadgeClass(kycStatus: string): string {
    const classes: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700',
      approved: 'bg-emerald-100 text-emerald-700',
      rejected: 'bg-rose-100 text-rose-700'
    };
    return classes[kycStatus] || 'bg-slate-100 text-slate-700';
  }

  openHotel(vendorId: string): void {
    this.router.navigate(['/admin-dashboard/hotels', vendorId]);
  }

  approveHotel(vendorId: string): void {
    this.approvingVendorId.set(vendorId);
    this.adminService.approveVendor(vendorId).subscribe({
      next: () => {
        const updatedVendors = this.vendors().map((vendor) =>
          vendor._id === vendorId ? { ...vendor, status: 'active', kycStatus: 'approved' } : vendor
        );
        this.vendors.set(updatedVendors);
        this.filterVendors();
        this.approvingVendorId.set(null);
      },
      error: (error: any) => {
        console.error('❌ Failed to approve hotel vendor:', error);
        this.approvingVendorId.set(null);
      }
    });
  }
}
