import { Component, OnInit, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-vendor-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header with Back Button -->
      <div class="flex items-center gap-4 mb-6">
        <button
          (click)="goBack()"
          class="text-gray-600 hover:text-gray-900 transition"
        >
          <span class="material-icons text-2xl">arrow_back</span>
        </button>
        <div>
          <h1 class="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <span class="material-icons text-4xl text-blue-600">person_outline</span>
            Vendor Details
          </h1>
          @if (vendor()) {
            <p class="text-gray-600 mt-2">{{ vendor().name }} - {{ vendor().vendorType }}</p>
          }
        </div>
      </div>

      <!-- Vendor Header Info -->
      @if (vendor()) {
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span class="material-icons text-3xl text-blue-600">business</span>
              </div>
              <div>
                <p class="text-gray-600 text-sm">Vendor Name</p>
                <p class="text-lg font-bold text-gray-900">{{ vendor().name }}</p>
              </div>
            </div>

            <div>
              <p class="text-gray-600 text-sm flex items-center gap-1">
                <span class="material-icons text-sm">email</span>
                Email
              </p>
              <p class="text-lg font-bold text-gray-900">{{ vendor().email }}</p>
            </div>

            <div>
              <p class="text-gray-600 text-sm flex items-center gap-1">
                <span class="material-icons text-sm">category</span>
                Vendor Type
              </p>
              <p class="text-lg font-bold text-gray-900 capitalize">{{ vendor().vendorType }}</p>
            </div>

            <div>
              <p class="text-gray-600 text-sm flex items-center gap-1">
                <span class="material-icons text-sm">calendar_today</span>
                Joined
              </p>
              <p class="text-lg font-bold text-gray-900">
                {{ vendor().createdAt ? (vendor().createdAt | date:'short') : 'N/A' }}
              </p>
            </div>
          </div>
        </div>
      }

      <!-- Tabs -->
      <div class="border-b border-gray-200">
        <div class="flex gap-8">
          <button
            (click)="setActiveTab('profile')"
            [class]="'px-4 py-4 font-semibold border-b-2 transition flex items-center gap-2 ' +
              (activeTab() === 'profile'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900')"
          >
            <span class="material-icons">person</span>
            Profile & KYC
          </button>

          <button
            (click)="setActiveTab('performance')"
            [class]="'px-4 py-4 font-semibold border-b-2 transition flex items-center gap-2 ' +
              (activeTab() === 'performance'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900')"
          >
            <span class="material-icons">assessment</span>
            Performance & Finance
          </button>

          <button
            (click)="setActiveTab('compliance')"
            [class]="'px-4 py-4 font-semibold border-b-2 transition flex items-center gap-2 ' +
              (activeTab() === 'compliance'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900')"
          >
            <span class="material-icons">verified_user</span>
            Compliance & Activity
          </button>
        </div>
      </div>

      <!-- Tab Content -->

      <!-- Profile & KYC Tab -->
      @if (activeTab() === 'profile') {
        <div class="space-y-6">
          <!-- Basic Info -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span class="material-icons text-blue-600">info</span>
              Basic Information
            </h3>

            @if (vendor()) {
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Vendor Name</label>
                  <p class="text-gray-900 py-2">{{ vendor().name }}</p>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <p class="text-gray-900 py-2">{{ vendor().email }}</p>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                  <p class="text-gray-900 py-2">{{ vendor().phone || 'N/A' }}</p>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Vendor Type</label>
                  <p class="text-gray-900 py-2 capitalize">{{ vendor().vendorType }}</p>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <span class="px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 w-fit"
                    [class]="getStatusClass(vendor().status)"
                  >
                    <span class="material-icons text-sm">{{ getStatusIcon(vendor().status) }}</span>
                    {{ vendor().status || 'pending' }}
                  </span>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Joined Date</label>
                  <p class="text-gray-900 py-2">{{ vendor().createdAt | date:'medium' }}</p>
                </div>
              </div>
            }
          </div>

          <!-- KYC Status -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span class="material-icons text-blue-600">verified_user</span>
              KYC Status
            </h3>

            @if (kyc()) {
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p class="text-gray-600 text-sm font-semibold mb-2">Overall Status</p>
                  <span class="px-3 py-2 rounded-full text-sm font-semibold flex items-center gap-1 w-fit"
                    [class]="getKycStatusClass(kyc().status)"
                  >
                    <span class="material-icons text-sm">{{ getKycStatusIcon(kyc().status) }}</span>
                    {{ kyc().status }}
                  </span>
                </div>

                <div class="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p class="text-gray-600 text-sm font-semibold mb-2">Risk Level</p>
                  <span class="px-3 py-2 rounded-full text-sm font-semibold flex items-center gap-1 w-fit"
                    [class]="getRiskClass(kyc().riskLevel)"
                  >
                    <span class="material-icons text-sm">assessment</span>
                    {{ kyc().riskLevel }}
                  </span>
                </div>

                <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p class="text-gray-600 text-sm font-semibold mb-2">AML Check</p>
                  <span class="px-3 py-2 rounded-full text-sm font-semibold flex items-center gap-1 w-fit"
                    [class]="getAmlClass(kyc().amlCheck?.status)"
                  >
                    <span class="material-icons text-sm">{{ getAmlIcon(kyc().amlCheck?.status) }}</span>
                    {{ kyc().amlCheck?.status || 'pending' }}
                  </span>
                </div>
              </div>

              <!-- KYC Documents -->
              @if (kyc().documents && kyc().documents.length > 0) {
                <div class="mb-6">
                  <h4 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span class="material-icons text-blue-600">description</span>
                    Submitted Documents
                  </h4>
                  <div class="space-y-3">
                    @for (doc of kyc().documents; track doc._id) {
                      <div class="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div class="flex items-center gap-3">
                          <span class="material-icons text-gray-600">insert_drive_file</span>
                          <div>
                            <p class="font-semibold text-gray-900 capitalize">{{ doc.type }}</p>
                            <p class="text-sm text-gray-600">{{ doc.uploadedAt | date:'short' }}</p>
                          </div>
                        </div>
                        <span class="px-3 py-1 rounded-full text-sm font-semibold"
                          [class]="getDocumentStatusClass(doc.verificationStatus)"
                        >
                          {{ doc.verificationStatus }}
                        </span>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- Action Buttons -->
              <div class="flex gap-4">
                @if (kyc().status === 'pending' || kyc().status === 'under-review') {
                  <button
                    (click)="approveKyc()"
                    class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2"
                  >
                    <span class="material-icons">check_circle</span>
                    Approve KYC
                  </button>
                  <button
                    (click)="rejectKyc()"
                    class="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2"
                  >
                    <span class="material-icons">cancel</span>
                    Reject KYC
                  </button>
                }
              </div>
            } @else {
              <div class="text-center py-8">
                <span class="material-icons text-6xl text-gray-300 mb-4">lock</span>
                <p class="text-gray-500 font-semibold">No KYC data found</p>
              </div>
            }
          </div>
        </div>
      }

      <!-- Performance & Finance Tab -->
      @if (activeTab() === 'performance') {
        <div class="space-y-6">
          <!-- Key Metrics -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <p class="text-gray-600 text-sm font-semibold flex items-center gap-1 mb-2">
                <span class="material-icons text-sm">star</span>
                Rating
              </p>
              <p class="text-3xl font-bold text-gray-900">{{ performance()?.rating?.average || 0 }}</p>
              <p class="text-gray-600 text-xs mt-2">{{ performance()?.rating?.count || 0 }} reviews</p>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <p class="text-gray-600 text-sm font-semibold flex items-center gap-1 mb-2">
                <span class="material-icons text-sm">shopping_cart</span>
                Bookings
              </p>
              <p class="text-3xl font-bold text-gray-900">{{ performance()?.bookings?.total || 0 }}</p>
              <p class="text-gray-600 text-xs mt-2">{{ performance()?.bookings?.completed || 0 }} completed</p>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
              <p class="text-gray-600 text-sm font-semibold flex items-center gap-1 mb-2">
                <span class="material-icons text-sm">attach_money</span>
                Revenue
              </p>
              <p class="text-3xl font-bold text-gray-900">\${{ performance()?.revenue?.thisMonth || 0 | number:'1.2-2' }}</p>
              <p class="text-gray-600 text-xs mt-2">This month</p>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
              <p class="text-gray-600 text-sm font-semibold flex items-center gap-1 mb-2">
                <span class="material-icons text-sm">trending_up</span>
                Performance
              </p>
              <p class="text-3xl font-bold text-gray-900">{{ performance()?.performanceLevel || 'standard' }}</p>
              <p class="text-gray-600 text-xs mt-2 capitalize">{{ performance()?.performanceLevel }}</p>
            </div>
          </div>

          <!-- Performance Details -->
          @if (performance()) {
            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span class="material-icons text-blue-600">assessment</span>
                Performance Details
              </h3>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-gray-50 p-4 rounded-lg">
                  <p class="text-gray-600 text-sm font-semibold mb-2 flex items-center gap-1">
                    <span class="material-icons text-sm">cancel</span>
                    Cancellation Rate
                  </p>
                  <p class="text-2xl font-bold text-gray-900">{{ performance().bookings?.cancellationRate || 0 }}%</p>
                </div>

                <div class="bg-gray-50 p-4 rounded-lg">
                  <p class="text-gray-600 text-sm font-semibold mb-2 flex items-center gap-1">
                    <span class="material-icons text-sm">speed</span>
                    Response Time (Avg)
                  </p>
                  <p class="text-2xl font-bold text-gray-900">{{ performance().responseTime?.average || 0 }} min</p>
                </div>

                <div class="bg-gray-50 p-4 rounded-lg">
                  <p class="text-gray-600 text-sm font-semibold mb-2 flex items-center gap-1">
                    <span class="material-icons text-sm">message</span>
                    Response Rate
                  </p>
                  <p class="text-2xl font-bold text-gray-900">{{ performance().responseRate || 0 }}%</p>
                </div>

                <div class="bg-gray-50 p-4 rounded-lg">
                  <p class="text-gray-600 text-sm font-semibold mb-2 flex items-center gap-1">
                    <span class="material-icons text-sm">event_seat</span>
                    Occupancy Rate
                  </p>
                  <p class="text-2xl font-bold text-gray-900">{{ performance().occupancy?.rate || 0 }}%</p>
                </div>
              </div>

              <!-- Customer Satisfaction -->
              <h4 class="text-lg font-bold text-gray-800 mt-8 mb-4 flex items-center gap-2">
                <span class="material-icons text-blue-600">favorite</span>
                Customer Satisfaction
              </h4>

              <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div class="text-center bg-blue-50 p-4 rounded-lg">
                  <p class="text-gray-600 text-sm mb-2">Cleanliness</p>
                  <div class="flex items-center justify-center">
                    <span class="material-icons text-yellow-500">star</span>
                    <p class="text-lg font-bold text-gray-900">{{ performance().satisfaction?.cleanliness || 'N/A' }}</p>
                  </div>
                </div>
                <div class="text-center bg-green-50 p-4 rounded-lg">
                  <p class="text-gray-600 text-sm mb-2">Communication</p>
                  <div class="flex items-center justify-center">
                    <span class="material-icons text-yellow-500">star</span>
                    <p class="text-lg font-bold text-gray-900">{{ performance().satisfaction?.communication || 'N/A' }}</p>
                  </div>
                </div>
                <div class="text-center bg-purple-50 p-4 rounded-lg">
                  <p class="text-gray-600 text-sm mb-2">Accuracy</p>
                  <div class="flex items-center justify-center">
                    <span class="material-icons text-yellow-500">star</span>
                    <p class="text-lg font-bold text-gray-900">{{ performance().satisfaction?.accuracy || 'N/A' }}</p>
                  </div>
                </div>
                <div class="text-center bg-orange-50 p-4 rounded-lg">
                  <p class="text-gray-600 text-sm mb-2">Check-in</p>
                  <div class="flex items-center justify-center">
                    <span class="material-icons text-yellow-500">star</span>
                    <p class="text-lg font-bold text-gray-900">{{ performance().satisfaction?.checkIn || 'N/A' }}</p>
                  </div>
                </div>
                <div class="text-center bg-red-50 p-4 rounded-lg">
                  <p class="text-gray-600 text-sm mb-2">Value</p>
                  <div class="flex items-center justify-center">
                    <span class="material-icons text-yellow-500">star</span>
                    <p class="text-lg font-bold text-gray-900">{{ performance().satisfaction?.value || 'N/A' }}</p>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Compliance & Activity Tab -->
      @if (activeTab() === 'compliance') {
        <div class="space-y-6">
          <!-- Compliance Status -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span class="material-icons text-blue-600">verified_user</span>
              Compliance Status
            </h3>

            @if (vendor()) {
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="border-l-4 border-blue-500 pl-4">
                  <p class="text-gray-600 text-sm font-semibold mb-2">Current Status</p>
                  <span class="px-3 py-2 rounded-full text-sm font-semibold flex items-center gap-1 w-fit"
                    [class]="getStatusClass(vendor().status)"
                  >
                    <span class="material-icons text-sm">{{ getStatusIcon(vendor().status) }}</span>
                    {{ vendor().status }}
                  </span>
                </div>

                <div class="border-l-4 border-green-500 pl-4">
                  <p class="text-gray-600 text-sm font-semibold mb-2">Verification</p>
                  <span class="px-3 py-2 rounded-full text-sm font-semibold flex items-center gap-1 w-fit bg-green-100 text-green-800">
                    <span class="material-icons text-sm">verified</span>
                    Verified
                  </span>
                </div>

                <div class="border-l-4 border-orange-500 pl-4">
                  <p class="text-gray-600 text-sm font-semibold mb-2">Documents</p>
                  <span class="px-3 py-2 rounded-full text-sm font-semibold flex items-center gap-1 w-fit bg-blue-100 text-blue-800">
                    <span class="material-icons text-sm">description</span>
                    Complete
                  </span>
                </div>
              </div>
            }
          </div>

          <!-- Action Panel -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span class="material-icons text-blue-600">admin_panel_settings</span>
              Vendor Actions
            </h3>

            @if (vendor()) {
              <div class="space-y-4">
                @if (vendor().status !== 'active') {
                  <button
                    (click)="approveVendor()"
                    class="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                  >
                    <span class="material-icons">check_circle</span>
                    Approve Vendor
                  </button>
                }

                @if (vendor().status === 'active') {
                  <button
                    (click)="suspendVendor()"
                    class="w-full bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                  >
                    <span class="material-icons">pause_circle</span>
                    Suspend Vendor
                  </button>
                }

                @if (vendor().status !== 'blocked') {
                  <button
                    (click)="blockVendor()"
                    class="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                  >
                    <span class="material-icons">block</span>
                    Block Vendor
                  </button>
                }
              </div>
            }
          </div>

          <!-- Recent Activity -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span class="material-icons text-blue-600">history</span>
              Recent Activity
            </h3>

            <div class="space-y-4">
              <div class="border-l-4 border-blue-500 pl-4 py-2">
                <p class="text-gray-900 font-semibold">Vendor Registered</p>
                <p class="text-gray-600 text-sm">{{ vendor()?.createdAt | date:'medium' }}</p>
              </div>

              @if (kyc()) {
                <div class="border-l-4 border-purple-500 pl-4 py-2">
                  <p class="text-gray-900 font-semibold">KYC Status: {{ kyc().status }}</p>
                  <p class="text-gray-600 text-sm">{{ kyc().createdAt | date:'medium' }}</p>
                </div>
              }

              <div class="border-l-4 border-green-500 pl-4 py-2">
                <p class="text-gray-900 font-semibold">Profile Updated</p>
                <p class="text-gray-600 text-sm">{{ vendor()?.updatedAt | date:'medium' }}</p>
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
export class VendorDetailComponent implements OnInit {
  @Input() vendorId: string = '';

  vendor = signal<any>(null);
  kyc = signal<any>(null);
  performance = signal<any>(null);
  activeTab = signal<'profile' | 'performance' | 'compliance'>('profile');

  constructor(
    private adminService: AdminService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.vendorId = params['id'];
        this.loadVendorData();
      }
    });
  }

  loadVendorData(): void {
    this.adminService.getVendorById(this.vendorId).subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data) {
          this.vendor.set(response.data);
          this.loadKycAndPerformance();
        }
      },
      error: (error: any) => console.error('Error loading vendor:', error)
    });
  }

  loadKycAndPerformance(): void {
    this.adminService.getVendorKyc(this.vendorId).subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data) {
          this.kyc.set(response.data);
        }
      },
      error: (error: any) => console.error('Error loading KYC:', error)
    });

    this.adminService.getVendorPerformance(this.vendorId).subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data) {
          this.performance.set(response.data);
        }
      },
      error: (error: any) => console.error('Error loading performance:', error)
    });
  }

  setActiveTab(tab: 'profile' | 'performance' | 'compliance'): void {
    this.activeTab.set(tab);
  }

  goBack(): void {
    this.router.navigate(['/admin-dashboard']);
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-orange-100 text-orange-800',
      blocked: 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      pending: 'schedule',
      verified: 'verified',
      active: 'check_circle',
      suspended: 'pause_circle',
      blocked: 'block'
    };
    return icons[status] || 'help';
  }

  getKycStatusClass(status: string): string {
    const classes: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      'under-review': 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      'resubmit-required': 'bg-orange-100 text-orange-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  getKycStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      pending: 'schedule',
      'under-review': 'search',
      approved: 'verified_user',
      rejected: 'cancel',
      'resubmit-required': 'warning'
    };
    return icons[status] || 'help';
  }

  getRiskClass(level: string): string {
    const classes: Record<string, string> = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return classes[level] || 'bg-gray-100 text-gray-800';
  }

  getAmlClass(status?: string): string {
    const classes: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      passed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };
    return classes[status || 'pending'] || 'bg-gray-100 text-gray-800';
  }

  getAmlIcon(status?: string): string {
    const icons: Record<string, string> = {
      pending: 'schedule',
      passed: 'check_circle',
      failed: 'cancel'
    };
    return icons[status || 'pending'] || 'help';
  }

  getDocumentStatusClass(status: string): string {
    const classes: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  approveKyc(): void {
    if (confirm('Are you sure you want to approve this vendor KYC?')) {
      this.adminService.approveVendorKyc(this.vendorId).subscribe({
        next: () => {
          console.log('KYC approved successfully');
          this.loadKycAndPerformance();
        },
        error: (error: any) => console.error('Error approving KYC:', error)
      });
    }
  }

  rejectKyc(): void {
    const reason = prompt('Please enter reason for rejection:');
    if (reason) {
      this.adminService.rejectVendorKyc(this.vendorId, reason).subscribe({
        next: () => {
          console.log('KYC rejected successfully');
          this.loadKycAndPerformance();
        },
        error: (error: any) => console.error('Error rejecting KYC:', error)
      });
    }
  }

  approveVendor(): void {
    if (confirm('Are you sure you want to approve this vendor?')) {
      this.adminService.approveVendor(this.vendorId).subscribe({
        next: () => {
          console.log('Vendor approved successfully');
          this.loadVendorData();
        },
        error: (error: any) => console.error('Error approving vendor:', error)
      });
    }
  }

  suspendVendor(): void {
    const reason = prompt('Please enter reason for suspension:');
    if (reason) {
      this.adminService.suspendVendor(this.vendorId, reason).subscribe({
        next: () => {
          console.log('Vendor suspended successfully');
          this.loadVendorData();
        },
        error: (error: any) => console.error('Error suspending vendor:', error)
      });
    }
  }

  blockVendor(): void {
    const reason = prompt('Please enter reason for blocking:');
    if (reason) {
      this.adminService.blockVendor(this.vendorId, reason).subscribe({
        next: () => {
          console.log('Vendor blocked successfully');
          this.loadVendorData();
        },
        error: (error: any) => console.error('Error blocking vendor:', error)
      });
    }
  }
}
