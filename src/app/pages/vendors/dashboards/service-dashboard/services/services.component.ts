import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiceService } from '../../../../../services/service.service';
import { AngularFireUploadService } from '../../../../../services/angular-fire-upload.service';

@Component({
  selector: 'app-service-services',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-slate-900">🛠️ Services</h1>
        <button
          (click)="openNewServiceModal()"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
        >
          + Add Service
        </button>
      </div>

      @if (isLoading()) {
        <div class="text-center py-12">
          <div class="inline-block animate-spin text-4xl mb-4">⏳</div>
          <p class="text-gray-600">Loading services...</p>
        </div>
      } @else if (services().length === 0) {
        <div class="text-center py-12 bg-white rounded-lg">
          <p class="text-gray-600 text-lg">No services listed yet</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (service of services(); track service._id) {
            <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <div class="text-4xl mb-3">{{ service.icon }}</div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">{{ service.name }}</h3>
              <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ service.description }}</p>

              <div class="space-y-2 mb-4 text-sm text-gray-600">
                <p>💰 Base Price: ₦{{ service.basePrice?.toLocaleString() }}</p>
                <p>⏱️ Duration: {{ service.duration }}</p>
                <p>📍 Area: {{ service.serviceArea }}</p>
                <p>⭐ Rating: {{ service.rating }}/5</p>
              </div>

              @if (service.features && service.features.length > 0) {
                <div class="mb-4 pb-4 border-b border-gray-200">
                  <p class="text-xs font-semibold text-gray-700 mb-2">Features:</p>
                  <div class="flex flex-wrap gap-1">
                    @for (feature of service.features.slice(0, 3); track feature) {
                      <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{{ feature }}</span>
                    }
                  </div>
                </div>
              }

              <div class="flex gap-2">
                <button
                  (click)="editService(service)"
                  class="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg transition font-medium"
                >
                  Edit
                </button>
                <button
                  (click)="deleteService(service._id!)"
                  class="flex-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg transition font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- New/Edit Service Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div class="p-6 border-b border-gray-200">
              <h2 class="text-2xl font-bold text-gray-900">{{ isEditing() ? 'Edit' : 'Add' }} Service</h2>
            </div>

            <div class="p-6 space-y-4">
              <!-- Service Image Upload -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Service Photo</label>
                <div class="flex items-center gap-4">
                  @if (currentForm.serviceImage) {
                    <img [src]="currentForm.serviceImage" alt="Service" class="w-24 h-24 rounded-lg object-cover">
                  } @else {
                    <div class="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400">
                      🖼️
                    </div>
                  }
                  <div class="flex-1">
                    <input
                      type="file"
                      #serviceImageInput
                      accept="image/*"
                      (change)="onServiceImageSelected($event)"
                      class="hidden"
                    />
                    <button
                      (click)="serviceImageInput.click()"
                      [disabled]="isUploadingImage()"
                      class="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition disabled:opacity-50"
                    >
                      {{ isUploadingImage() ? 'Uploading...' : 'Choose Photo' }}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Service Name *</label>
                <input
                  type="text"
                  [(ngModel)]="currentForm.name"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
                <textarea
                  [(ngModel)]="currentForm.description"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                ></textarea>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Base Price *</label>
                  <input
                    type="number"
                    [(ngModel)]="currentForm.basePrice"
                    min="0"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Duration *</label>
                  <input
                    type="text"
                    [(ngModel)]="currentForm.duration"
                    placeholder="e.g., 1 hour"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Service Area *</label>
                  <input
                    type="text"
                    [(ngModel)]="currentForm.serviceArea"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    [(ngModel)]="currentForm.category"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Service Icon (Emoji)</label>
                  <input
                    type="text"
                    [(ngModel)]="currentForm.icon"
                    placeholder="e.g., ✂️, 💆, 🧖"
                    maxlength="2"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Availability</label>
                  <select
                    [(ngModel)]="currentForm.isAvailable"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  >
                    <option [ngValue]="true">Available</option>
                    <option [ngValue]="false">Unavailable</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Features (comma-separated)</label>
                <textarea
                  [(ngModel)]="currentForm.featuresText"
                  rows="2"
                  placeholder="e.g., Professional stylists, Free consultation, Eco-friendly products"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                ></textarea>
                <p class="text-xs text-gray-500 mt-1">Enter features separated by commas</p>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  [(ngModel)]="currentForm.tagsText"
                  placeholder="e.g., premium, fast, certified, experienced"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
                <p class="text-xs text-gray-500 mt-1">Enter tags separated by commas</p>
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
                (click)="saveService()"
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
export class ServiceServicesComponent implements OnInit {
  isLoading = signal(false);
  isSaving = signal(false);
  showModal = signal(false);
  isEditing = signal(false);
  isUploadingImage = signal(false);

  services = signal<any[]>([]);

  currentForm: any = {
    name: '',
    description: '',
    basePrice: 0,
    duration: '',
    serviceArea: '',
    category: '',
    serviceImage: '',
    icon: '🛠️',
    isAvailable: true,
    featuresText: '',
    features: [],
    tagsText: '',
    tags: []
  };

  providerId: string = '';

  constructor(
    private serviceService: ServiceService,
    private uploadService: AngularFireUploadService
  ) {}

  ngOnInit(): void {
    this.providerId = localStorage.getItem('userId') || '';
    this.loadServices();
  }

  loadServices(): void {
    this.isLoading.set(true);
    this.serviceService.getProviderServices(this.providerId, 1, 50).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.services.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading services:', error);
        this.isLoading.set(false);
      }
    });
  }

  openNewServiceModal(): void {
    this.isEditing.set(false);
    this.currentForm = {
      _id: undefined,
      name: '',
      description: '',
      basePrice: 0,
      duration: '',
      serviceArea: '',
      category: '',
      serviceImage: '',
      icon: '🛠️',
      isAvailable: true,
      featuresText: '',
      features: [],
      tagsText: '',
      tags: []
    };
    this.showModal.set(true);
  }

  onServiceImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.isUploadingImage.set(true);

      const uploadPath = `services/${this.providerId}`;
      this.uploadService.uploadImage(file, uploadPath).subscribe({
        next: (url: string) => {
          this.currentForm.serviceImage = url;
          this.isUploadingImage.set(false);
          console.log('✅ Service image uploaded:', url);
        },
        error: (error: any) => {
          this.isUploadingImage.set(false);
          console.error('❌ Error uploading service image:', error);
          alert('Failed to upload image. Please try again.');
        }
      });
    }
  }

  editService(service: any): void {
    this.isEditing.set(true);
    this.currentForm = {
      ...service,
      featuresText: (service.features || []).join(', '),
      tagsText: (service.tags || []).join(', ')
    };
    this.showModal.set(true);
  }

  saveService(): void {
    if (!this.validateForm()) return;

    this.isSaving.set(true);

    // Convert text fields to arrays
    const features = this.currentForm.featuresText
      .split(',')
      .map((f: string) => f.trim())
      .filter((f: string) => f.length > 0);

    const tags = this.currentForm.tagsText
      .split(',')
      .map((t: string) => t.trim())
      .filter((t: string) => t.length > 0);

    const data = {
      ...this.currentForm,
      features,
      tags,
      serviceProvider: this.providerId
    };

    // Remove text fields from data
    delete data.featuresText;
    delete data.tagsText;

    if (this.isEditing() && this.currentForm._id) {
      this.serviceService.updateService(this.currentForm._id, data).subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.loadServices();
            this.closeModal();
          }
          this.isSaving.set(false);
        },
        error: (error) => {
          console.error('Error saving service:', error);
          this.isSaving.set(false);
        }
      });
    } else {
      this.serviceService.createService(data).subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.loadServices();
            this.closeModal();
          }
          this.isSaving.set(false);
        },
        error: (error) => {
          console.error('Error creating service:', error);
          this.isSaving.set(false);
        }
      });
    }
  }

  deleteService(serviceId: string): void {
    if (confirm('Are you sure you want to delete this service?')) {
      this.serviceService.deleteService(serviceId).subscribe({
        next: () => {
          this.loadServices();
        },
        error: (error) => {
          console.error('Error deleting service:', error);
        }
      });
    }
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  private validateForm(): boolean {
    if (!this.currentForm.name || !this.currentForm.description || this.currentForm.basePrice == null || !this.currentForm.duration || !this.currentForm.serviceArea) {
      alert('Please fill in all required fields');
      return false;
    }
    return true;
  }
}
