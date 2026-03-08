import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../../../../services/hotel.service';

interface Staff {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  position: 'manager' | 'receptionist' | 'housekeeper' | 'chef' | 'waiter' | 'maintenance';
  department: string;
  salary: number;
  hireDate: string;
  status: 'active' | 'inactive' | 'on-leave';
  shiftType?: 'morning' | 'evening' | 'night';
  createdAt?: string;
}

@Component({
  selector: 'app-hotel-staff',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8 space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Staff Management</h1>
          <p class="text-slate-600 mt-1">Manage hotel staff and team members</p>
        </div>
        <button
          (click)="openAddStaffModal()"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
        >
          ➕ Add Staff Member
        </button>
      </div>

      <!-- Search & Filter Bar -->
      <div class="bg-white rounded-lg p-6 shadow-md">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Search by Name</label>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (change)="filterStaff()"
              placeholder="Search staff..."
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Position</label>
            <select
              [(ngModel)]="selectedPosition"
              (change)="filterStaff()"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Positions</option>
              <option value="manager">Manager</option>
              <option value="receptionist">Receptionist</option>
              <option value="housekeeper">Housekeeper</option>
              <option value="chef">Chef</option>
              <option value="waiter">Waiter</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              [(ngModel)]="selectedStatus"
              (change)="filterStaff()"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on-leave">On Leave</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg p-4 shadow-md">
          <p class="text-slate-600 text-sm font-medium">Total Staff</p>
          <p class="text-2xl font-bold text-slate-900">{{ filteredStaff().length }}</p>
        </div>
        <div class="bg-emerald-50 rounded-lg p-4 shadow-md border-l-4 border-emerald-500">
          <p class="text-slate-600 text-sm font-medium">Active</p>
          <p class="text-2xl font-bold text-emerald-600">{{ countByStatus('active') }}</p>
        </div>
        <div class="bg-yellow-50 rounded-lg p-4 shadow-md border-l-4 border-yellow-500">
          <p class="text-slate-600 text-sm font-medium">On Leave</p>
          <p class="text-2xl font-bold text-yellow-600">{{ countByStatus('on-leave') }}</p>
        </div>
        <div class="bg-red-50 rounded-lg p-4 shadow-md border-l-4 border-red-500">
          <p class="text-slate-600 text-sm font-medium">Inactive</p>
          <p class="text-2xl font-bold text-red-600">{{ countByStatus('inactive') }}</p>
        </div>
      </div>

      <!-- Staff Table -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-100 border-b border-slate-200">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Name</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Email</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Position</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Department</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              @if (filteredStaff().length === 0) {
                <tr>
                  <td colspan="6" class="px-6 py-8 text-center text-slate-600">
                    No staff members found
                  </td>
                </tr>
              } @else {
                @for (member of filteredStaff(); track member._id) {
                  <tr class="border-b border-slate-200 hover:bg-slate-50 transition">
                    <td class="px-6 py-4 font-medium text-slate-900">{{ member.name }}</td>
                    <td class="px-6 py-4 text-slate-600">{{ member.email }}</td>
                    <td class="px-6 py-4 text-slate-600">{{ member.position | titlecase }}</td>
                    <td class="px-6 py-4 text-slate-600">{{ member.department }}</td>
                    <td class="px-6 py-4">
                      <span
                        [ngClass]="{
                          'bg-emerald-100 text-emerald-700': member.status === 'active',
                          'bg-yellow-100 text-yellow-700': member.status === 'on-leave',
                          'bg-red-100 text-red-700': member.status === 'inactive'
                        }"
                        class="px-3 py-1 rounded-full text-xs font-medium"
                      >
                        {{ member.status | titlecase }}
                      </span>
                    </td>
                    <td class="px-6 py-4 space-x-2">
                      <button
                        (click)="editStaff(member)"
                        class="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        Edit
                      </button>
                      <button
                        (click)="deleteStaff(member._id)"
                        class="text-red-600 hover:text-red-700 font-medium text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add/Edit Staff Modal -->
      @if (showStaffModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 class="text-2xl font-bold text-slate-900 mb-6">
              {{ isEditing() ? 'Edit Staff Member' : 'Add New Staff Member' }}
            </h2>

            <form (ngSubmit)="saveStaff()" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Name -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    [(ngModel)]="newStaff.name"
                    name="name"
                    placeholder="e.g., John Doe"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <!-- Email -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Email *</label>
                  <input
                    type="email"
                    [(ngModel)]="newStaff.email"
                    name="email"
                    placeholder="john&#64;example.com"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <!-- Phone -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    [(ngModel)]="newStaff.phone"
                    name="phone"
                    placeholder="+1234567890"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <!-- Position -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Position *</label>
                  <select
                    [(ngModel)]="newStaff.position"
                    name="position"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="manager">Manager</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="housekeeper">Housekeeper</option>
                    <option value="chef">Chef</option>
                    <option value="waiter">Waiter</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                <!-- Department -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Department *</label>
                  <input
                    type="text"
                    [(ngModel)]="newStaff.department"
                    name="department"
                    placeholder="e.g., Front Desk"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <!-- Salary -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Monthly Salary *</label>
                  <input
                    type="number"
                    [(ngModel)]="newStaff.salary"
                    name="salary"
                    placeholder="e.g., 2000"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <!-- Hire Date -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Hire Date *</label>
                  <input
                    type="date"
                    [(ngModel)]="newStaff.hireDate"
                    name="hireDate"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <!-- Status -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Status *</label>
                  <select
                    [(ngModel)]="newStaff.status"
                    name="status"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on-leave">On Leave</option>
                  </select>
                </div>
              </div>

              <!-- Modal Actions -->
              <div class="flex justify-end gap-3">
                <button
                  type="button"
                  (click)="closeStaffModal()"
                  class="px-6 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                >
                  {{ isEditing() ? 'Update Staff' : 'Add Staff' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Messages -->
      @if (successMessage()) {
        <div class="fixed bottom-4 right-4 bg-emerald-100 border border-emerald-400 text-emerald-700 px-6 py-4 rounded-lg shadow-lg">
          {{ successMessage() }}
        </div>
      }
      @if (errorMessage()) {
        <div class="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-lg">
          {{ errorMessage() }}
        </div>
      }
    </div>
  `
})
export class HotelStaffComponent implements OnInit {
  staff = signal<Staff[]>([]);
  filteredStaff = signal<Staff[]>([]);
  showStaffModal = signal(false);
  isEditing = signal(false);
  searchQuery = signal('');
  selectedPosition = signal('');
  selectedStatus = signal('');
  successMessage = signal('');
  errorMessage = signal('');
  isLoading = signal(false);

  newStaff: Staff = this.getEmptyStaff();

  constructor(private hotelService: HotelService) {}

  ngOnInit() {
    this.loadStaff();
  }

  loadStaff() {
    this.isLoading.set(true);
    this.hotelService.getStaff().subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        if (response.status === 'success' && response.data) {
          this.staff.set(response.data);
          this.filterStaff();
        } else {
          // Fallback to empty array if no data
          this.staff.set([]);
          this.filterStaff();
        }
      },
      error: (error: any) => {
        this.isLoading.set(false);
        console.error('Error loading staff:', error);
        this.errorMessage.set('Failed to load staff. Please try again later.');
        // Keep existing staff in case of error
        this.filterStaff();
      }
    });
  }

  filterStaff() {
    let filtered = this.staff();

    if (this.searchQuery()) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(this.searchQuery().toLowerCase())
      );
    }

    if (this.selectedPosition()) {
      filtered = filtered.filter(s => s.position === this.selectedPosition());
    }

    if (this.selectedStatus()) {
      filtered = filtered.filter(s => s.status === this.selectedStatus());
    }

    this.filteredStaff.set(filtered);
  }

  countByStatus(status: string): number {
    return this.staff().filter(s => s.status === status).length;
  }

  openAddStaffModal() {
    this.isEditing.set(false);
    this.newStaff = this.getEmptyStaff();
    this.showStaffModal.set(true);
  }

  editStaff(member: Staff) {
    this.isEditing.set(true);
    this.newStaff = { ...member };
    this.showStaffModal.set(true);
  }

  closeStaffModal() {
    this.showStaffModal.set(false);
    this.newStaff = this.getEmptyStaff();
    this.isEditing.set(false);
  }

  saveStaff() {
    if (!this.newStaff.name || !this.newStaff.email || !this.newStaff.position) {
      this.errorMessage.set('Please fill in all required fields');
      setTimeout(() => this.errorMessage.set(''), 3000);
      return;
    }

    if (this.isEditing() && this.newStaff._id) {
      // Update existing staff member via API
      this.isLoading.set(true);
      this.hotelService.updateStaff(this.newStaff._id, this.newStaff).subscribe({
        next: (response: any) => {
          this.isLoading.set(false);
          if (response.status === 'success') {
            const index = this.staff().findIndex(s => s._id === this.newStaff._id);
            if (index !== -1) {
              const updated = [...this.staff()];
              updated[index] = response.data || this.newStaff;
              this.staff.set(updated);
            }
            this.successMessage.set('Staff member updated successfully!');
          } else {
            this.errorMessage.set('Failed to update staff member');
          }
          this.filterStaff();
          this.closeStaffModal();
          setTimeout(() => {
            this.successMessage.set('');
            this.errorMessage.set('');
          }, 3000);
        },
        error: (error: any) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.error?.message || 'Failed to update staff member');
          console.error('Error updating staff member:', error);
        }
      });
    } else {
      // Create new staff member via API
      this.isLoading.set(true);
      this.hotelService.createStaff(this.newStaff).subscribe({
        next: (response: any) => {
          this.isLoading.set(false);
          if (response.status === 'success' && response.data) {
            this.staff.set([...this.staff(), response.data]);
            this.successMessage.set('Staff member added successfully!');
          } else {
            this.errorMessage.set('Failed to add staff member');
          }
          this.filterStaff();
          this.closeStaffModal();
          setTimeout(() => {
            this.successMessage.set('');
            this.errorMessage.set('');
          }, 3000);
        },
        error: (error: any) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.error?.message || 'Failed to add staff member');
          console.error('Error adding staff member:', error);
        }
      });
    }
  }

  deleteStaff(staffId?: string) {
    if (!staffId) return;

    if (confirm('Are you sure you want to remove this staff member?')) {
      this.isLoading.set(true);
      this.hotelService.deleteStaff(staffId).subscribe({
        next: (response: any) => {
          this.isLoading.set(false);
          if (response.status === 'success') {
            this.staff.set(this.staff().filter(s => s._id !== staffId));
            this.filterStaff();
            this.successMessage.set('Staff member deleted successfully!');
            setTimeout(() => this.successMessage.set(''), 3000);
          } else {
            this.errorMessage.set('Failed to delete staff member');
          }
        },
        error: (error: any) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.error?.message || 'Failed to delete staff member');
          console.error('Error deleting staff member:', error);
        }
      });
    }
  }

  private getEmptyStaff(): Staff {
    return {
      name: '',
      email: '',
      phone: '',
      position: 'receptionist',
      department: '',
      salary: 0,
      hireDate: new Date().toISOString().split('T')[0],
      status: 'active'
    };
  }
}
