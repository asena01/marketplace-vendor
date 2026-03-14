import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { DeliveryService, Driver } from '../../../../../services/delivery.service';
import { NotificationService } from '../../../../../services/notification.service';

@Component({
  selector: 'app-drivers',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule],
  template: `
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Driver Management</h1>
          <p class="text-slate-600 mt-2">Manage delivery drivers and their assignments</p>
        </div>
        <button 
          (click)="openAddDriverForm()"
          class="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
        >
          <mat-icon>add</mat-icon>
          <span>Add Driver</span>
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Total Drivers</p>
          <p class="text-3xl font-bold text-slate-900">{{ drivers().length }}</p>
          <p class="mt-2 text-sm text-slate-500">All time</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-emerald-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Active Drivers</p>
          <p class="text-3xl font-bold text-emerald-600">{{ getActiveDrivers() }}</p>
          <p class="mt-2 text-sm text-emerald-600">Available now</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-orange-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Avg Rating</p>
          <p class="text-3xl font-bold text-slate-900">{{ getAverageRating() }}/5.0</p>
          <p class="mt-2 text-sm text-orange-600">Based on deliveries</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-purple-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Total Deliveries</p>
          <p class="text-3xl font-bold text-slate-900">{{ getTotalDeliveries() }}</p>
          <p class="mt-2 text-sm text-purple-600">Completed</p>
        </div>
      </div>

      <!-- Add/Edit Driver Form -->
      @if (showForm()) {
        <div class="bg-white rounded-lg p-6 shadow-md border border-slate-200">
          <h2 class="text-xl font-bold text-slate-900 mb-4">
            {{ editingDriver() ? 'Edit Driver' : 'Add New Driver' }}
          </h2>
          <form [formGroup]="driverForm" (ngSubmit)="submitForm()" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Driver Name *</label>
                <input 
                  type="text" 
                  formControlName="name"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Enter driver name"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Phone Number *</label>
                <input 
                  type="tel" 
                  formControlName="phone"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Enter phone number"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input 
                  type="email" 
                  formControlName="email"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Enter email"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Vehicle Type *</label>
                <select 
                  formControlName="vehicleType"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select vehicle type</option>
                  <option value="bike">Bike</option>
                  <option value="car">Car</option>
                  <option value="truck">Truck</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Vehicle Number</label>
                <input 
                  type="text" 
                  formControlName="vehicleNumber"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="e.g., DL-01-AB-1234"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <select 
                  formControlName="isActive"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option [value]="true">Active</option>
                  <option [value]="false">Inactive</option>
                </select>
              </div>
            </div>
            <div class="flex gap-3 justify-end">
              <button 
                type="button"
                (click)="closeForm()"
                class="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                [disabled]="isSaving()"
                class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {{ isSaving() ? 'Saving...' : 'Save Driver' }}
              </button>
            </div>
          </form>
        </div>
      }

      <!-- Drivers List -->
      <div class="space-y-4">
        @if (drivers().length === 0) {
          <div class="bg-white rounded-lg p-12 shadow-md text-center">
            <p class="text-slate-600 text-lg">No drivers yet. Add one to get started.</p>
          </div>
        }
        @for (driver of drivers(); track driver._id) {
          <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500">
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-lg font-bold text-slate-900">{{ driver.name }}</h3>
                  <span [ngClass]="{
                    'bg-emerald-100 text-emerald-700': driver.isActive,
                    'bg-slate-100 text-slate-700': !driver.isActive
                  }" class="px-3 py-1 rounded-full text-xs font-medium">
                    {{ driver.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <span class="text-slate-600 text-sm">Phone</span>
                    <p class="font-medium text-slate-900">{{ driver.phone }}</p>
                  </div>
                  <div>
                    <span class="text-slate-600 text-sm">Vehicle</span>
                    <p class="font-medium text-slate-900">{{ driver.vehicleType | titlecase }} {{ driver.vehicleNumber ? '• ' + driver.vehicleNumber : '' }}</p>
                  </div>
                  <div>
                    <span class="text-slate-600 text-sm">Rating</span>
                    <p class="font-medium text-slate-900">⭐ {{ driver.rating }}/5.0 ({{ driver.totalDeliveries }} deliveries)</p>
                  </div>
                </div>
              </div>
              <div class="flex gap-2">
                <button 
                  (click)="editDriver(driver)"
                  class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit driver"
                >
                  <mat-icon>edit</mat-icon>
                </button>
                <button 
                  (click)="deleteDriver(driver._id!)"
                  class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete driver"
                >
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: []
})
export class DriversComponent implements OnInit {
  drivers = signal<Driver[]>([]);
  showForm = signal(false);
  editingDriver = signal<Driver | null>(null);
  isSaving = signal(false);
  isLoading = signal(false);
  driverForm: FormGroup;

  private restaurantId: string = '';

  constructor(
    private deliveryService: DeliveryService,
    private notificationService: NotificationService,
    private fb: FormBuilder
  ) {
    this.driverForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.minLength(10)]],
      email: ['', Validators.email],
      vehicleType: ['', Validators.required],
      vehicleNumber: [''],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.restaurantId = localStorage.getItem('restaurantId') || '';
    // Ensure delivery service has correct restaurant ID
    if (this.restaurantId) {
      this.deliveryService.setRestaurantId(this.restaurantId);
    }
    this.loadDrivers();
  }

  loadDrivers(): void {
    this.isLoading.set(true);
    this.deliveryService.getDrivers().subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        if (response.status === 'success' && response.data) {
          this.drivers.set(response.data);
        }
      },
      error: (error: any) => {
        this.isLoading.set(false);
        console.error('Error loading drivers:', error);
        this.notificationService.error('Error', 'Failed to load drivers');
      }
    });
  }

  openAddDriverForm(): void {
    this.editingDriver.set(null);
    this.driverForm.reset({ isActive: true });
    this.showForm.set(true);
  }

  editDriver(driver: Driver): void {
    this.editingDriver.set(driver);
    this.driverForm.patchValue(driver);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingDriver.set(null);
    this.driverForm.reset({ isActive: true });
  }

  submitForm(): void {
    if (!this.driverForm.valid) {
      this.notificationService.warning('Validation Error', 'Please fill in all required fields');
      return;
    }

    this.isSaving.set(true);
    const formData = this.driverForm.value;

    if (this.editingDriver()) {
      // Update existing driver
      this.deliveryService.updateDriver(this.editingDriver()!._id!, formData).subscribe({
        next: (response: any) => {
          this.isSaving.set(false);
          if (response.status === 'success') {
            this.notificationService.success('Success', 'Driver updated successfully');
            this.loadDrivers();
            this.closeForm();
          }
        },
        error: (error: any) => {
          this.isSaving.set(false);
          this.notificationService.error('Error', 'Failed to update driver');
        }
      });
    } else {
      // Create new driver
      this.deliveryService.createDriver(formData).subscribe({
        next: (response: any) => {
          this.isSaving.set(false);
          if (response.status === 'success') {
            this.notificationService.success('Success', 'Driver added successfully');
            this.loadDrivers();
            this.closeForm();
          }
        },
        error: (error: any) => {
          this.isSaving.set(false);
          this.notificationService.error('Error', 'Failed to add driver');
        }
      });
    }
  }

  deleteDriver(driverId: string): void {
    if (!confirm('Are you sure you want to delete this driver?')) {
      return;
    }

    this.deliveryService.deleteDriver(driverId).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.notificationService.success('Success', 'Driver deleted successfully');
          this.loadDrivers();
        }
      },
      error: (error: any) => {
        this.notificationService.error('Error', 'Failed to delete driver');
      }
    });
  }

  getActiveDrivers(): number {
    return this.drivers().filter(d => d.isActive).length;
  }

  getAverageRating(): string {
    if (this.drivers().length === 0) return '0.0';
    const sum = this.drivers().reduce((acc, d) => acc + d.rating, 0);
    return (sum / this.drivers().length).toFixed(1);
  }

  getTotalDeliveries(): number {
    return this.drivers().reduce((acc, d) => acc + d.totalDeliveries, 0);
  }
}
