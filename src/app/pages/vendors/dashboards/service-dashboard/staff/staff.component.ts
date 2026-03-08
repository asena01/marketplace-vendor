import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiceProviderService, ServiceStaff } from '../../../../../services/service-provider.service';

@Component({
  selector: 'app-service-staff',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-slate-900">👔 Staff Members</h1>
        <button 
          (click)="openNewStaffModal()"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
        >
          + Add Staff Member
        </button>
      </div>

      <!-- Filter -->
      <div class="mb-6">
        <select 
          [(ngModel)]="filterStatus"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="on-leave">On Leave</option>
        </select>
      </div>

      @if (isLoading()) {
        <div class="text-center py-12">
          <div class="inline-block animate-spin text-4xl mb-4">⏳</div>
          <p class="text-gray-600">Loading staff...</p>
        </div>
      } @else if (filteredStaff().length === 0) {
        <div class="text-center py-12 bg-white rounded-lg">
          <p class="text-gray-600 text-lg">No staff members found</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (staff of filteredStaff(); track staff._id) {
            <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h3 class="text-xl font-bold text-gray-900">{{ staff.name }}</h3>
                  <p class="text-gray-600 text-sm">{{ staff.specialization }}</p>
                </div>
                <span [class]="'px-3 py-1 rounded-full text-xs font-semibold ' + getStatusColor(staff.status)">
                  {{ staff.status | titlecase }}
                </span>
              </div>

              <div class="space-y-2 mb-4 text-sm text-gray-600">
                <p>📧 {{ staff.email }}</p>
                <p>📱 {{ staff.phone }}</p>
                <p>⭐ Rating: {{ staff.rating }}/5 ({{ staff.reviews }} reviews)</p>
                <p>👨‍💼 Experience: {{ staff.experience }} years</p>
              </div>

              @if (staff.certifications && staff.certifications.length > 0) {
                <div class="mb-4 pb-4 border-b border-gray-200">
                  <p class="text-xs font-semibold text-gray-700 mb-2">Certifications:</p>
                  <div class="flex flex-wrap gap-1">
                    @for (cert of staff.certifications; track cert) {
                      <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{{ cert }}</span>
                    }
                  </div>
                </div>
              }

              <div class="flex gap-2">
                <button 
                  (click)="editStaff(staff)"
                  class="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg transition font-medium"
                >
                  Edit
                </button>
                <button 
                  (click)="deleteStaff(staff._id!)"
                  class="flex-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg transition font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- New/Edit Staff Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div class="p-6 border-b border-gray-200">
              <h2 class="text-2xl font-bold text-gray-900">{{ isEditing() ? 'Edit' : 'Add' }} Staff Member</h2>
            </div>

            <div class="p-6 space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
                  <input 
                    type="text" 
                    [(ngModel)]="currentForm.name"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                  <input 
                    type="email" 
                    [(ngModel)]="currentForm.email"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Phone *</label>
                  <input 
                    type="tel" 
                    [(ngModel)]="currentForm.phone"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Specialization *</label>
                  <input 
                    type="text" 
                    [(ngModel)]="currentForm.specialization"
                    placeholder="e.g., Haircut, Massage"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Experience (years)</label>
                  <input 
                    type="number" 
                    [(ngModel)]="currentForm.experience"
                    min="0"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                  <select 
                    [(ngModel)]="currentForm.status"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on-leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Bio</label>
                <textarea 
                  [(ngModel)]="currentForm.bio"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                ></textarea>
              </div>
            </div>

            <div class="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button 
                (click)="closeModal()"
                class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button 
                (click)="saveStaff()"
                [disabled]="isSaving()"
                class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
              >
                {{ isSaving() ? 'Saving...' : 'Save' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ServiceStaffComponent implements OnInit {
  isLoading = signal(false);
  isSaving = signal(false);
  showModal = signal(false);
  isEditing = signal(false);
  
  staff = signal<ServiceStaff[]>([]);
  filterStatus = '';
  
  // Regular property for form data (not a signal)
  currentForm: any = {
    name: '',
    email: '',
    phone: '',
    specialization: '',
    experience: 0,
    status: 'active',
    bio: ''
  };

  filteredStaff = computed(() => {
    let result = this.staff();
    if (this.filterStatus) {
      result = result.filter(s => s.status === this.filterStatus as any);
    }
    return result;
  });

  providerId: string = '';

  constructor(private serviceProviderService: ServiceProviderService) {}

  ngOnInit(): void {
    this.providerId = localStorage.getItem('userId') || '';
    this.loadStaff();
  }

  loadStaff(): void {
    this.isLoading.set(true);
    this.serviceProviderService.getProviderStaff(this.providerId, 1, 50).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.staff.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading staff:', error);
        this.isLoading.set(false);
      }
    });
  }

  openNewStaffModal(): void {
    this.isEditing.set(false);
    this.currentForm = {
      name: '',
      email: '',
      phone: '',
      specialization: '',
      experience: 0,
      status: 'active',
      bio: ''
    };
    this.showModal.set(true);
  }

  editStaff(staffMember: ServiceStaff): void {
    this.isEditing.set(true);
    this.currentForm = { ...staffMember };
    this.showModal.set(true);
  }

  saveStaff(): void {
    if (!this.validateForm()) return;
    
    this.isSaving.set(true);
    const data = { ...this.currentForm, providerId: this.providerId };

    if (this.isEditing() && this.currentForm._id) {
      this.serviceProviderService.updateStaff(this.currentForm._id, data).subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.loadStaff();
            this.closeModal();
          }
          this.isSaving.set(false);
        },
        error: (error) => {
          console.error('Error saving staff:', error);
          this.isSaving.set(false);
        }
      });
    } else {
      this.serviceProviderService.createStaff(data).subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.loadStaff();
            this.closeModal();
          }
          this.isSaving.set(false);
        },
        error: (error) => {
          console.error('Error creating staff:', error);
          this.isSaving.set(false);
        }
      });
    }
  }

  deleteStaff(staffId: string): void {
    if (confirm('Are you sure you want to delete this staff member?')) {
      this.serviceProviderService.deleteStaff(staffId).subscribe({
        next: () => {
          this.loadStaff();
        },
        error: (error) => {
          console.error('Error deleting staff:', error);
        }
      });
    }
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  private validateForm(): boolean {
    if (!this.currentForm.name || !this.currentForm.email || !this.currentForm.phone || !this.currentForm.specialization) {
      alert('Please fill in all required fields');
      return false;
    }
    return true;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'on-leave':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-red-100 text-red-700';
    }
  }
}
