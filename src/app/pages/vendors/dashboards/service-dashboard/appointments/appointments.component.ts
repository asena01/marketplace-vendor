import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiceProviderService, Appointment } from '../../../../../services/service-provider.service';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-service-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-slate-900">📅 Appointments</h1>
        <button 
          (click)="openNewAppointmentModal()"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
        >
          + New Appointment
        </button>
      </div>

      <!-- Filters -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <select 
          [(ngModel)]="filterStatus"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input 
          type="date" 
          [(ngModel)]="filterDate"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
        />
        <input 
          type="text" 
          [(ngModel)]="searchQuery"
          placeholder="Search by customer name..."
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
        />
      </div>

      @if (isLoading()) {
        <div class="text-center py-12">
          <div class="inline-block animate-spin text-4xl mb-4">⏳</div>
          <p class="text-gray-600">Loading appointments...</p>
        </div>
      } @else if (filteredAppointments().length === 0) {
        <div class="text-center py-12 bg-white rounded-lg">
          <p class="text-gray-600 text-lg">No appointments found</p>
        </div>
      } @else {
        <div class="space-y-4">
          @for (appointment of filteredAppointments(); track appointment._id) {
            <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <h3 class="text-xl font-bold text-gray-900">{{ appointment.serviceName }}</h3>
                  <p class="text-gray-600 mt-1">👤 {{ appointment.customerName }} • 📱 {{ appointment.customerPhone }}</p>
                  <p class="text-gray-600">📅 {{ appointment.appointmentDate | date: 'MMM dd, yyyy' }} • ⏰ {{ appointment.startTime }} - {{ appointment.endTime }}</p>
                  @if (appointment.staffName) {
                    <p class="text-gray-600 text-sm mt-2">👨‍💼 Assigned to: {{ appointment.staffName }}</p>
                  }
                  @if (appointment.notes) {
                    <p class="text-gray-500 text-sm mt-2 italic">📝 {{ appointment.notes }}</p>
                  }
                </div>
                <div class="flex items-center gap-4">
                  <span [class]="'px-4 py-2 rounded-full text-sm font-semibold ' + getStatusColor(appointment.status)">
                    {{ appointment.status | titlecase }}
                  </span>
                  <div class="flex gap-2">
                    <button 
                      (click)="editAppointment(appointment)"
                      class="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg transition"
                    >
                      Edit
                    </button>
                    <button 
                      (click)="deleteAppointment(appointment._id!)"
                      class="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- New/Edit Appointment Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div class="p-6 border-b border-gray-200">
              <h2 class="text-2xl font-bold text-gray-900">{{ isEditing() ? 'Edit' : 'New' }} Appointment</h2>
            </div>

            <div class="p-6 space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Customer Name *</label>
                  <input 
                    type="text" 
                    [(ngModel)]="currentForm.customerName"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                  <input 
                    type="email" 
                    [(ngModel)]="currentForm.customerEmail"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Phone *</label>
                  <input 
                    type="tel" 
                    [(ngModel)]="currentForm.customerPhone"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Service *</label>
                  <input 
                    type="text" 
                    [(ngModel)]="currentForm.serviceName"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Date *</label>
                  <input 
                    type="date" 
                    [(ngModel)]="currentForm.appointmentDate"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Start Time *</label>
                  <input 
                    type="time" 
                    [(ngModel)]="currentForm.startTime"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">End Time *</label>
                  <input 
                    type="time" 
                    [(ngModel)]="currentForm.endTime"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                  <select 
                    [(ngModel)]="currentForm.status"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Staff Member</label>
                  <input 
                    type="text" 
                    [(ngModel)]="currentForm.staffName"
                    placeholder="Optional"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
                <textarea 
                  [(ngModel)]="currentForm.notes"
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
                (click)="saveAppointment()"
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
export class ServiceAppointmentsComponent implements OnInit {
  isLoading = signal(false);
  isSaving = signal(false);
  showModal = signal(false);
  isEditing = signal(false);
  
  appointments = signal<Appointment[]>([]);
  filterStatus = '';
  filterDate = '';
  searchQuery = '';

  // Regular property for form data (not a signal)
  currentForm: any = {
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    serviceName: '',
    appointmentDate: '',
    startTime: '',
    endTime: '',
    status: 'pending',
    notes: ''
  };

  filteredAppointments = computed(() => {
    let result = this.appointments();
    
    if (this.filterStatus) {
      result = result.filter(a => a.status === this.filterStatus);
    }
    
    if (this.filterDate) {
      result = result.filter(a => a.appointmentDate === this.filterDate);
    }
    
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(a => a.customerName.toLowerCase().includes(query));
    }
    
    return result;
  });

  providerId: string = '';

  constructor(
    private serviceProviderService: ServiceProviderService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.providerId = localStorage.getItem('userId') || '';
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.isLoading.set(true);
    this.serviceProviderService.getProviderAppointments(this.providerId, 1, 50).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.appointments.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.isLoading.set(false);
      }
    });
  }

  openNewAppointmentModal(): void {
    this.isEditing.set(false);
    this.currentForm = {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      serviceName: '',
      appointmentDate: '',
      startTime: '',
      endTime: '',
      status: 'pending',
      notes: ''
    };
    this.showModal.set(true);
  }

  editAppointment(appointment: Appointment): void {
    this.isEditing.set(true);
    this.currentForm = { ...appointment };
    this.showModal.set(true);
  }

  saveAppointment(): void {
    if (!this.validateForm()) return;
    
    this.isSaving.set(true);
    const data = { ...this.currentForm, providerId: this.providerId };

    if (this.isEditing() && this.currentForm._id) {
      this.serviceProviderService.updateAppointment(this.currentForm._id, data).subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.loadAppointments();
            this.closeModal();
          }
          this.isSaving.set(false);
        },
        error: (error) => {
          console.error('Error saving appointment:', error);
          this.isSaving.set(false);
        }
      });
    } else {
      this.serviceProviderService.createAppointment(data).subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.loadAppointments();
            this.closeModal();
          }
          this.isSaving.set(false);
        },
        error: (error) => {
          console.error('Error creating appointment:', error);
          this.isSaving.set(false);
        }
      });
    }
  }

  deleteAppointment(appointmentId: string): void {
    if (confirm('Are you sure you want to delete this appointment?')) {
      this.serviceProviderService.deleteAppointment(appointmentId).subscribe({
        next: () => {
          this.loadAppointments();
        },
        error: (error) => {
          console.error('Error deleting appointment:', error);
        }
      });
    }
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  private validateForm(): boolean {
    if (!this.currentForm.customerName || !this.currentForm.customerEmail || !this.currentForm.customerPhone) {
      alert('Please fill in all required fields');
      return false;
    }
    return true;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  }
}
