import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelAmenityService, HotelService } from '../../../../../services/hotel.service';
import { ImageUploadService } from '../../../../../services/image-upload.service';

type HotelServiceCategory = 'service' | 'laundry' | 'massage' | 'spa' | 'gym' | 'shuttle';

interface HotelAmenityServiceForm extends HotelAmenityService {
  category: HotelServiceCategory;
  pricingType: 'per-request' | 'per-hour' | 'per-session' | 'per-day';
}

interface HotelServiceRequest {
  orderId: string;
  bookingId: string;
  guestName: string;
  roomLabel: string;
  serviceName: string;
  category: HotelServiceCategory;
  amount: number;
  quantity: number;
  requestedAt: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  orderStatusTask?: LinkedTask | null;
}

interface StaffOption {
  _id?: string;
  name: string;
  position: string;
  department?: string;
}

interface LinkedTask {
  _id?: string;
  sourceType?: string;
  sourceId?: string;
  status?: string;
  assignedStaff?: { _id?: string; name?: string } | string;
}

@Component({
  selector: 'app-hotel-services',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8 space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">✨ Stay Services</h1>
          <p class="text-slate-600 mt-1">Manage paid hotel amenities and in-stay guest services.</p>
        </div>
        <button
          (click)="openAddModal()"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
        >
          ➕ Add Service
        </button>
      </div>

      <div class="bg-white rounded-2xl p-6 shadow-md space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold text-slate-900">Guest Service Requests</h2>
            <p class="text-sm text-slate-500 mt-1">Live requests submitted from active hotel bookings.</p>
          </div>
          <button
            (click)="loadServiceRequests()"
            class="bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded-lg font-medium transition"
          >
            Refresh Requests
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p class="text-xs font-semibold text-slate-500 uppercase">All Requests</p>
            <p class="text-2xl font-bold text-slate-900 mt-1">{{ serviceRequests().length }}</p>
          </div>
          <div class="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
            <p class="text-xs font-semibold text-yellow-700 uppercase">Pending</p>
            <p class="text-2xl font-bold text-yellow-700 mt-1">{{ countRequestsByStatus('pending') }}</p>
          </div>
          <div class="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p class="text-xs font-semibold text-blue-700 uppercase">In Progress</p>
            <p class="text-2xl font-bold text-blue-700 mt-1">{{ countRequestsByStatus('in-progress') }}</p>
          </div>
          <div class="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
            <p class="text-xs font-semibold text-emerald-700 uppercase">Completed</p>
            <p class="text-2xl font-bold text-emerald-700 mt-1">{{ countRequestsByStatus('completed') }}</p>
          </div>
        </div>

        @if (requestErrorMessage()) {
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {{ requestErrorMessage() }}
          </div>
        }

        <div class="overflow-x-auto">
          <table class="w-full min-w-[900px]">
            <thead class="bg-slate-50 border-b border-slate-200">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Guest</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Room</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Service</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Amount</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Requested</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Status</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Task Assignment</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Actions</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Notes</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @if (serviceRequests().length === 0) {
                <tr>
                  <td colspan="9" class="px-4 py-8 text-center text-slate-500">
                    No guest service requests yet.
                  </td>
                </tr>
              } @else {
                @for (request of paginatedServiceRequests(); track request.orderId) {
                  <tr class="hover:bg-slate-50 transition">
                    <td class="px-4 py-4">
                      <p class="font-semibold text-slate-900">{{ request.guestName }}</p>
                      <p class="text-xs text-slate-500">Booking #{{ request.bookingId.slice(-8) }}</p>
                    </td>
                    <td class="px-4 py-4 text-sm text-slate-700">{{ request.roomLabel }}</td>
                    <td class="px-4 py-4">
                      <p class="font-semibold text-slate-900">{{ request.serviceName }}</p>
                      <p class="text-xs text-slate-500 capitalize">{{ request.category }}</p>
                    </td>
                    <td class="px-4 py-4 text-sm font-semibold text-slate-900">
                      ₦{{ request.amount | number }}
                      <span class="block text-xs text-slate-500">Qty {{ request.quantity }}</span>
                    </td>
                    <td class="px-4 py-4 text-sm text-slate-700">{{ formatDateTime(request.requestedAt) }}</td>
                    <td class="px-4 py-4">
                      <span [class]="getRequestStatusBadgeClass(request.status)">
                        {{ getRequestStatusLabel(request.status) }}
                      </span>
                    </td>
                    <td class="px-4 py-4">
                      <div class="space-y-2">
                        <select
                          [ngModel]="linkedTaskAssignedStaffId(request)"
                          (ngModelChange)="assignRequestTask(request, $event)"
                          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Assign service task</option>
                          @for (staff of assignableServiceStaff(request.category); track staff._id) {
                            <option [value]="staff._id">{{ staff.name }} · {{ formatTaskLabel(staff.position) }}</option>
                          }
                        </select>
                        @if (linkedTask(request)) {
                          <span class="inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold"
                            [ngClass]="{
                              'bg-slate-100 text-slate-700': linkedTask(request)?.status === 'open' || linkedTask(request)?.status === 'assigned',
                              'bg-amber-100 text-amber-700': linkedTask(request)?.status === 'in-progress',
                              'bg-emerald-100 text-emerald-700': linkedTask(request)?.status === 'completed'
                            }"
                          >
                            Task {{ formatTaskLabel(linkedTask(request)?.status || 'assigned') }}
                          </span>
                        }
                      </div>
                    </td>
                    <td class="px-4 py-4">
                      <div class="flex flex-wrap gap-2">
                        @for (action of getAvailableActions(request.status); track action.status) {
                          <button
                            (click)="updateRequestStatus(request, action.status)"
                            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                            [ngClass]="action.className"
                          >
                            {{ action.label }}
                          </button>
                        }
                      </div>
                    </td>
                    <td class="px-4 py-4 text-sm text-slate-600 max-w-xs">
                      {{ request.notes || 'No notes provided' }}
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
        @if (requestTotalPages() > 1) {
          <div class="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-4">
            <p class="text-sm text-slate-500">
              Showing {{ requestPageStartIndex() + 1 }}-{{ requestPageEndIndex() }} of {{ serviceRequests().length }} requests
            </p>
            <div class="flex items-center gap-2">
              <button
                (click)="goToRequestPage(currentRequestPage - 1)"
                [disabled]="currentRequestPage === 1"
                class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-100"
              >
                Previous
              </button>
              <span class="text-sm font-medium text-slate-700">Page {{ currentRequestPage }} of {{ requestTotalPages() }}</span>
              <button
                (click)="goToRequestPage(currentRequestPage + 1)"
                [disabled]="currentRequestPage === requestTotalPages()"
                class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-100"
              >
                Next
              </button>
            </div>
          </div>
        }
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-blue-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Total Services</p>
          <p class="text-2xl font-bold text-slate-900">{{ services().length }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-emerald-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Active</p>
          <p class="text-2xl font-bold text-emerald-600">{{ getActiveCount() }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-amber-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Average Price</p>
          <p class="text-2xl font-bold text-amber-600">₦{{ getAveragePrice() | number }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-purple-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Categories</p>
          <p class="text-2xl font-bold text-purple-600">{{ getCategories().length }}</p>
        </div>
      </div>

      <div class="bg-white rounded-lg p-6 shadow-md space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Search</label>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="filterServices()"
              placeholder="Search service..."
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Category</label>
            <select
              [(ngModel)]="selectedCategory"
              (ngModelChange)="filterServices()"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="service">Service</option>
              <option value="laundry">Laundry</option>
              <option value="massage">Massage</option>
              <option value="spa">Spa</option>
              <option value="gym">Gym</option>
              <option value="shuttle">Airport Shuttle</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              [(ngModel)]="selectedStatus"
              (ngModelChange)="filterServices()"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      @if (isLoading()) {
        <div class="bg-blue-50 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg">
          Loading stay services...
        </div>
      }

      @if (errorMessage()) {
        <div class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          {{ errorMessage() }}
        </div>
      }

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        @if (filteredServices().length === 0) {
          <div class="col-span-full bg-white rounded-lg p-12 text-center shadow-md">
            <p class="text-slate-700 font-semibold text-lg">No stay services found</p>
            <p class="text-sm text-slate-500 mt-2">Create hotel services so guests can request them from their stay dashboard.</p>
          </div>
        } @else {
          @for (service of filteredServices(); track service._id) {
            <div class="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-100">
              @if (service.image) {
                <div class="h-44 bg-slate-100 overflow-hidden">
                  <img [src]="service.image" [alt]="service.name" class="w-full h-full object-cover" />
                </div>
              }

              <div class="p-5 space-y-4">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="text-2xl">{{ service.icon || '✨' }}</span>
                      <h3 class="text-lg font-bold text-slate-900">{{ service.name }}</h3>
                    </div>
                    <p class="text-sm text-slate-500 capitalize mt-1">{{ service.category }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-xl font-bold text-slate-900">₦{{ service.price | number }}</p>
                    <p class="text-xs text-slate-500 uppercase">{{ service.pricingType || 'per-request' }}</p>
                  </div>
                </div>

                <p class="text-sm text-slate-600">{{ service.description }}</p>

                @if (service.serviceDetails) {
                  <div class="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                    {{ service.serviceDetails }}
                  </div>
                }

                <div class="flex flex-wrap gap-2">
                  <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{{ service.duration || 'On request' }}</span>
                  <span class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">{{ service.availability || 'Available daily' }}</span>
                  <span [class]="service.available !== false && service.isActive !== false ? 'px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold' : 'px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold'">
                    {{ service.available !== false && service.isActive !== false ? 'Available' : 'Hidden' }}
                  </span>
                </div>

                <div class="flex gap-2 pt-2">
                  <button
                    (click)="editService(service)"
                    class="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium text-sm hover:bg-blue-200 transition"
                  >
                    Edit
                  </button>
                  <button
                    (click)="toggleServiceStatus(service)"
                    class="flex-1 px-3 py-2 bg-amber-100 text-amber-700 rounded-lg font-medium text-sm hover:bg-amber-200 transition"
                  >
                    {{ service.isActive === false ? 'Activate' : 'Hide' }}
                  </button>
                  <button
                    (click)="deleteService(service._id!)"
                    class="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg font-medium text-sm hover:bg-red-200 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          }
        }
      </div>

      @if (showModal()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white rounded-2xl p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-slate-900">{{ editingService() ? 'Edit Stay Service' : 'Add Stay Service' }}</h2>
              <button (click)="closeModal()" class="text-slate-500 hover:text-slate-900 text-2xl">✕</button>
            </div>

            <form class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Service Name *</label>
                  <input [(ngModel)]="formData.name" name="name" type="text" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Category *</label>
                  <select [(ngModel)]="formData.category" (ngModelChange)="applyCategoryDefaults($event)" name="category" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="service">Service</option>
                    <option value="laundry">Laundry</option>
                    <option value="massage">Massage</option>
                    <option value="spa">Spa</option>
                    <option value="gym">Gym</option>
                    <option value="shuttle">Airport Shuttle</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Price *</label>
                  <input [(ngModel)]="formData.price" name="price" type="number" min="0" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Pricing Type</label>
                  <select [(ngModel)]="formData.pricingType" name="pricingType" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="per-request">Per Request</option>
                    <option value="per-hour">Per Hour</option>
                    <option value="per-session">Per Session</option>
                    <option value="per-day">Per Day</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Icon</label>
                  <input [(ngModel)]="formData.icon" name="icon" type="text" maxlength="2" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Duration</label>
                  <input [(ngModel)]="formData.duration" name="duration" type="text" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Availability</label>
                  <input [(ngModel)]="formData.availability" name="availability" type="text" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Description *</label>
                <textarea [(ngModel)]="formData.description" name="description" rows="3" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Service Details</label>
                <textarea [(ngModel)]="formData.serviceDetails" name="serviceDetails" rows="3" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Service Image</label>
                <div class="flex items-center gap-4">
                  @if (formData.image) {
                    <img [src]="formData.image" alt="Service image" class="w-24 h-24 rounded-xl object-cover border border-slate-200" />
                  } @else {
                    <div class="w-24 h-24 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">🖼️</div>
                  }

                  <div class="flex-1 space-y-2">
                    <input type="file" #serviceImageInput accept="image/*" (change)="onImageSelected($event)" class="hidden" />
                    <button type="button" (click)="serviceImageInput.click()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition">
                      Upload Image
                    </button>
                    @if (formData.image) {
                      <button type="button" (click)="removeImage()" class="ml-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition">
                        Remove
                      </button>
                    }
                    @if (isUploadingImage()) {
                      <p class="text-sm text-blue-600">Uploading image...</p>
                    }
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label class="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input [(ngModel)]="formData.available" name="available" type="checkbox" />
                  Available for request
                </label>
                <label class="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input [(ngModel)]="formData.isActive" name="isActive" type="checkbox" />
                  Visible to customers
                </label>
                <label class="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input [(ngModel)]="formData.requiresScheduling" name="requiresScheduling" type="checkbox" />
                  Requires scheduling
                </label>
              </div>
            </form>

            <div class="flex justify-end gap-3 mt-8">
              <button (click)="closeModal()" class="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition">Cancel</button>
              <button (click)="saveService()" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition">Save</button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class HotelServicesComponent implements OnInit {
  isLoading = signal(false);
  errorMessage = signal('');
  requestErrorMessage = signal('');
  showModal = signal(false);
  services = signal<HotelAmenityService[]>([]);
  filteredServices = signal<HotelAmenityService[]>([]);
  serviceRequests = signal<HotelServiceRequest[]>([]);
  serviceStaff = signal<StaffOption[]>([]);
  linkedTasks = signal<LinkedTask[]>([]);
  editingService = signal<HotelAmenityService | null>(null);
  isUploadingImage = signal(false);
  currentRequestPage = 1;
  readonly requestItemsPerPage = 10;

  searchQuery = '';
  selectedCategory = '';
  selectedStatus = '';

  formData: HotelAmenityServiceForm = this.getEmptyForm();

  constructor(
    private hotelService: HotelService,
    private imageUploadService: ImageUploadService
  ) {}

  ngOnInit(): void {
    this.loadServices();
    this.loadServiceRequests();
    this.loadAssignableStaff();
    this.loadLinkedTasks();
  }

  loadServices(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.hotelService.getAmenityServices(1, 100, undefined, true).subscribe({
      next: (response) => {
        this.services.set(response.data || []);
        this.filterServices();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading hotel services:', error);
        this.errorMessage.set('Failed to load stay services.');
        this.isLoading.set(false);
      }
    });
  }

  loadServiceRequests(): void {
    this.requestErrorMessage.set('');

    this.hotelService.getHotelBookings(1, 200).subscribe({
      next: (response: any) => {
        const bookings = Array.isArray(response?.data) ? response.data : [];
        const requests: HotelServiceRequest[] = bookings.flatMap((booking: any) => {
          const guestName = booking?.guest?.name || booking?.customerName || 'Unknown Guest';
          const roomType = booking?.room?.roomType || booking?.roomType || 'Room';
          const roomNumber = booking?.room?.roomNumber || booking?.roomNumber || 'TBA';
          const roomLabel = `${roomType} (${roomNumber})`;

          return (booking?.hotelServiceOrders || []).map((order: any) => ({
            orderId: order._id,
            bookingId: booking._id,
            guestName,
            roomLabel,
            serviceName: order.name,
            category: order.category,
            amount: order.totalPrice || 0,
            quantity: order.quantity || 1,
            requestedAt: order.requestedAt,
            status: order.status || 'pending',
            notes: order.notes || ''
          }));
        });

        requests.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
        this.serviceRequests.set(requests);
        this.currentRequestPage = 1;
      },
      error: (error) => {
        console.error('Error loading service requests:', error);
        this.requestErrorMessage.set('Failed to load guest service requests.');
        this.serviceRequests.set([]);
      }
    });
  }

  filterServices(): void {
    let items = this.services();

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      items = items.filter((service) =>
        service.name.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        service.serviceDetails?.toLowerCase().includes(query)
      );
    }

    if (this.selectedCategory) {
      items = items.filter((service) => service.category === this.selectedCategory);
    }

    if (this.selectedStatus === 'active') {
      items = items.filter((service) => service.isActive !== false);
    } else if (this.selectedStatus === 'inactive') {
      items = items.filter((service) => service.isActive === false);
    }

    this.filteredServices.set(items);
  }

  openAddModal(): void {
    this.editingService.set(null);
    this.formData = this.getEmptyForm();
    this.showModal.set(true);
  }

  editService(service: HotelAmenityService): void {
    this.editingService.set(service);
    this.formData = {
      category: service.category,
      name: service.name,
      description: service.description,
      serviceDetails: service.serviceDetails || '',
      price: service.price,
      pricingType: service.pricingType || 'per-request',
      duration: service.duration || 'On request',
      availability: service.availability || 'Available daily',
      icon: service.icon || '✨',
      image: service.image || '',
      requiresScheduling: service.requiresScheduling || false,
      available: service.available !== false,
      isActive: service.isActive !== false,
      sortOrder: service.sortOrder || 0,
      _id: service._id
    };
    this.showModal.set(true);
  }

  applyCategoryDefaults(category: HotelServiceCategory): void {
    const defaults: Record<HotelServiceCategory, Partial<HotelAmenityServiceForm>> = {
      service: {
        icon: '✨',
        availability: 'Available daily',
        duration: 'On request',
        requiresScheduling: false
      },
      laundry: {
        icon: '🧺',
        availability: 'Available daily',
        duration: 'Same day when available',
        requiresScheduling: false
      },
      massage: {
        icon: '💆',
        availability: 'By appointment',
        duration: '60 min',
        requiresScheduling: true
      },
      spa: {
        icon: '🧖',
        availability: 'By appointment',
        duration: '90 min',
        requiresScheduling: true
      },
      gym: {
        icon: '🏋️',
        availability: 'Open daily',
        duration: 'Day access',
        requiresScheduling: false
      },
      shuttle: {
        icon: '🚐',
        availability: 'Pre-scheduled daily',
        duration: 'Based on transfer window',
        requiresScheduling: true
      }
    };

    const nextDefaults = defaults[category];
    if (!nextDefaults) {
      return;
    }

    this.formData = {
      ...this.formData,
      category,
      icon: this.shouldReplaceField(this.formData.icon, ['✨', '🧺', '💆', '🧖', '🏋️', '🚐']) ? nextDefaults.icon || this.formData.icon : this.formData.icon,
      availability: this.shouldReplaceField(this.formData.availability, ['Available daily', 'By appointment', 'Open daily', 'Pre-scheduled daily']) ? nextDefaults.availability || this.formData.availability : this.formData.availability,
      duration: this.shouldReplaceField(this.formData.duration, ['On request', 'Same day when available', '60 min', '90 min', 'Day access', 'Based on transfer window']) ? nextDefaults.duration || this.formData.duration : this.formData.duration,
      requiresScheduling: nextDefaults.requiresScheduling ?? this.formData.requiresScheduling
    };
  }

  saveService(): void {
    if (!this.formData.name || !this.formData.description || this.formData.price === undefined || this.formData.price < 0) {
      this.errorMessage.set('Name, description, and a valid price are required.');
      return;
    }

    const request = this.editingService()?._id
      ? this.hotelService.updateAmenityService(this.editingService()!._id!, this.formData)
      : this.hotelService.createAmenityService(this.formData);

    request.subscribe({
      next: () => {
        this.closeModal();
        this.loadServices();
      },
      error: (error) => {
        console.error('Error saving hotel service:', error);
        this.errorMessage.set('Failed to save stay service.');
      }
    });
  }

  toggleServiceStatus(service: HotelAmenityService): void {
    if (!service._id) return;

    this.hotelService.updateAmenityService(service._id, { isActive: service.isActive === false }).subscribe({
      next: () => this.loadServices(),
      error: (error) => {
        console.error('Error toggling hotel service status:', error);
        this.errorMessage.set('Failed to update service visibility.');
      }
    });
  }

  deleteService(serviceId: string): void {
    if (!confirm('Are you sure you want to delete this stay service?')) return;

    this.hotelService.deleteAmenityService(serviceId).subscribe({
      next: () => this.loadServices(),
      error: (error) => {
        console.error('Error deleting hotel service:', error);
        this.errorMessage.set('Failed to delete stay service.');
      }
    });
  }

  updateRequestStatus(request: HotelServiceRequest, status: HotelServiceRequest['status']): void {
    this.hotelService.updateHotelServiceOrderStatus(request.bookingId, request.orderId, status).subscribe({
      next: () => {
        this.serviceRequests.update((requests) =>
          requests.map((item) => item.orderId === request.orderId ? { ...item, status } : item)
        );
        this.loadLinkedTasks();
      },
      error: (error) => {
        console.error('Error updating service request status:', error);
        this.requestErrorMessage.set('Failed to update request status.');
        this.loadServiceRequests();
      }
    });
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingService.set(null);
    this.formData = this.getEmptyForm();
  }

  loadAssignableStaff(): void {
    this.hotelService.getStaff(1, 200, 'active').subscribe({
      next: (response: any) => {
        this.serviceStaff.set(response.status === 'success' && Array.isArray(response.data) ? response.data : []);
      },
      error: () => this.serviceStaff.set([])
    });
  }

  loadLinkedTasks(): void {
    this.hotelService.getRoomTasks(1, 200).subscribe({
      next: (response: any) => {
        const tasks = response.status === 'success' && Array.isArray(response.data) ? response.data : [];
        this.linkedTasks.set(tasks.filter((task: any) => task.sourceType === 'hotel-service-order'));
      },
      error: () => this.linkedTasks.set([])
    });
  }

  paginatedServiceRequests(): HotelServiceRequest[] {
    const start = (this.currentRequestPage - 1) * this.requestItemsPerPage;
    return this.serviceRequests().slice(start, start + this.requestItemsPerPage);
  }

  requestTotalPages(): number {
    return Math.max(1, Math.ceil(this.serviceRequests().length / this.requestItemsPerPage));
  }

  goToRequestPage(page: number): void {
    if (page < 1 || page > this.requestTotalPages()) return;
    this.currentRequestPage = page;
  }

  requestPageStartIndex(): number {
    return (this.currentRequestPage - 1) * this.requestItemsPerPage;
  }

  requestPageEndIndex(): number {
    return Math.min(this.requestPageStartIndex() + this.requestItemsPerPage, this.serviceRequests().length);
  }

  linkedTask(request: HotelServiceRequest): LinkedTask | null {
    return this.linkedTasks().find((task) => task.sourceId === request.orderId) || null;
  }

  linkedTaskAssignedStaffId(request: HotelServiceRequest): string {
    const task = this.linkedTask(request);
    const assigned = task?.assignedStaff;
    if (!assigned) return '';
    return typeof assigned === 'string' ? assigned : assigned._id || '';
  }

  assignableServiceStaff(category?: HotelServiceCategory): StaffOption[] {
    return this.serviceStaff().filter((staff) => {
      const position = staff.position || '';
      const department = staff.department || '';

      if (category === 'laundry') {
        return ['housekeeping', 'housekeeper', 'receptionist', 'bellboy', 'manager'].includes(position) ||
          ['housekeeping', 'front-office', 'admin'].includes(department);
      }

      if (category === 'service' || category === 'massage' || category === 'spa' || category === 'gym' || category === 'shuttle') {
        return ['receptionist', 'bellboy', 'manager'].includes(position) ||
          ['front-office', 'admin'].includes(department);
      }

      return ['receptionist', 'bellboy', 'manager'].includes(position) ||
        ['front-office', 'admin'].includes(department);
    });
  }

  assignRequestTask(request: HotelServiceRequest, staffId: string): void {
    this.hotelService.upsertSourceTask({
      sourceType: 'hotel-service-order',
      sourceId: request.orderId,
      taskType: 'hotel-service-request',
      title: `${request.serviceName} for ${request.roomLabel}`,
      description: `Guest: ${request.guestName}. Quantity: ${request.quantity}.`,
      priority: request.status === 'pending' ? 'medium' : 'high',
      assignedStaffId: staffId || undefined
    }).subscribe({
      next: () => this.loadLinkedTasks(),
      error: (error: any) => {
        console.error('Error assigning hotel service task:', error);
        this.requestErrorMessage.set(error.error?.message || 'Failed to assign guest service task.');
      }
    });
  }

  formatTaskLabel(value: string): string {
    return value.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.isUploadingImage.set(true);

    const hotelId = localStorage.getItem('hotelId') || 'hotel';
    const uploadPath = `hotel-services/${hotelId}/${this.formData.name || 'new-service'}`;

    this.imageUploadService.uploadImage(file, uploadPath).subscribe({
      next: (imageUrl: string) => {
        this.formData.image = imageUrl;
        this.isUploadingImage.set(false);
      },
      error: (error) => {
        console.error('Error uploading hotel service image:', error);
        this.errorMessage.set('Failed to upload service image.');
        this.isUploadingImage.set(false);
      }
    });

    input.value = '';
  }

  removeImage(): void {
    this.formData.image = '';
  }

  getActiveCount(): number {
    return this.services().filter((service) => service.isActive !== false).length;
  }

  getAveragePrice(): number {
    if (!this.services().length) return 0;
    const total = this.services().reduce((sum, service) => sum + (service.price || 0), 0);
    return Math.round(total / this.services().length);
  }

  getCategories(): string[] {
    return [...new Set(this.services().map((service) => service.category))];
  }

  countRequestsByStatus(status: HotelServiceRequest['status']): number {
    return this.serviceRequests().filter((request) => request.status === status).length;
  }

  formatDateTime(value: string): string {
    return new Date(value).toLocaleString();
  }

  getRequestStatusLabel(status: HotelServiceRequest['status']): string {
    const labels: Record<HotelServiceRequest['status'], string> = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      'in-progress': 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };

    return labels[status];
  }

  getRequestStatusBadgeClass(status: HotelServiceRequest['status']): string {
    const classes: Record<HotelServiceRequest['status'], string> = {
      pending: 'inline-flex px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold',
      confirmed: 'inline-flex px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold',
      'in-progress': 'inline-flex px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold',
      completed: 'inline-flex px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold',
      cancelled: 'inline-flex px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold'
    };

    return classes[status];
  }

  getAvailableActions(status: HotelServiceRequest['status']): Array<{ label: string; status: HotelServiceRequest['status']; className: string }> {
    const actions: Record<HotelServiceRequest['status'], Array<{ label: string; status: HotelServiceRequest['status']; className: string }>> = {
      pending: [
        { label: 'Confirm', status: 'confirmed', className: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
        { label: 'Cancel', status: 'cancelled', className: 'bg-red-100 text-red-700 hover:bg-red-200' }
      ],
      confirmed: [
        { label: 'Start', status: 'in-progress', className: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
        { label: 'Cancel', status: 'cancelled', className: 'bg-red-100 text-red-700 hover:bg-red-200' }
      ],
      'in-progress': [
        { label: 'Complete', status: 'completed', className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' },
        { label: 'Cancel', status: 'cancelled', className: 'bg-red-100 text-red-700 hover:bg-red-200' }
      ],
      completed: [],
      cancelled: []
    };

    return actions[status];
  }

  private getEmptyForm(): HotelAmenityServiceForm {
    return {
      category: 'service',
      name: '',
      description: '',
      serviceDetails: '',
      price: 0,
      pricingType: 'per-request',
      duration: 'On request',
      availability: 'Available daily',
      icon: '✨',
      image: '',
      requiresScheduling: false,
      available: true,
      isActive: true,
      sortOrder: 0
    };
  }

  private shouldReplaceField(value: string | undefined, placeholders: string[]): boolean {
    return !value || placeholders.includes(value);
  }
}
