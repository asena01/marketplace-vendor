import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TourService } from '../../../../../services/tour.service';
import { ImageUploadService } from '../../../../../services/image-upload.service';

@Component({
  selector: 'app-tours',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8 space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-slate-900">Tours Management</h1>
        <button
          (click)="openCreateModal()"
          class="bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 px-6 rounded-lg transition"
        >
          + New Tour
        </button>
      </div>

      @if (isLoading()) {
        <div class="bg-blue-50 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">Loading tours...</p>
        </div>
      }

      @if (successMessage()) {
        <div class="bg-emerald-50 border border-emerald-300 text-emerald-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">{{ successMessage() }}</p>
        </div>
      }

      @if (errorMessage()) {
        <div class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">{{ errorMessage() }}</p>
        </div>
      }

      @if (tours().length === 0) {
        <div class="bg-white rounded-lg p-12 shadow-md text-center">
          <p class="text-slate-600 font-semibold text-lg">No tours created yet</p>
          <p class="text-slate-500 mt-2">Click "New Tour" to create your first tour package</p>
        </div>
      } @else {
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Image</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Tour Name</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Destination</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Duration</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Price</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Capacity</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                @for (tour of tours(); track tour._id) {
                  <tr class="hover:bg-slate-50">
                    <td class="px-6 py-4">
                      @if (tour.image) {
                        <img [src]="tour.image" alt="{{ tour.name }}" class="w-12 h-12 object-cover rounded-lg border border-slate-300" />
                      } @else {
                        <div class="w-12 h-12 bg-slate-100 rounded-lg border border-slate-300 flex items-center justify-center text-slate-400">
                          <span class="text-xs">No image</span>
                        </div>
                      }
                    </td>
                    <td class="px-6 py-4">
                      <span class="font-medium text-slate-900">{{ tour.name }}</span>
                    </td>
                    <td class="px-6 py-4 text-slate-600">{{ tour.destination || '-' }}</td>
                    <td class="px-6 py-4 text-slate-600">{{ formatDuration(tour.duration) }}</td>
                    <td class="px-6 py-4 text-slate-900 font-medium">{{ tour.price | currency }}</td>
                    <td class="px-6 py-4 text-slate-600">{{ tour.currentParticipants || 0 }}/{{ tour.maxParticipants || 0 }}</td>
                    <td class="px-6 py-4">
                      @if (tour.isActive) {
                        <span class="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">Active</span>
                      } @else {
                        <span class="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">Inactive</span>
                      }
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex gap-2">
                        <button
                          (click)="openEditModal(tour)"
                          class="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          Edit
                        </button>
                        <button
                          (click)="confirmDelete(tour._id, tour.name)"
                          class="text-red-600 hover:text-red-700 font-medium text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      @if (showModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <h2 class="text-2xl font-bold text-slate-900 mb-6">
              {{ isEditing() ? 'Edit Tour' : 'Create New Tour' }}
            </h2>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Tour Name *</label>
                <input
                  [(ngModel)]="tourForm.name"
                  type="text"
                  placeholder="e.g., Paris City Explorer"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Destination *</label>
                  <input
                    [(ngModel)]="tourForm.destination"
                    type="text"
                    placeholder="e.g., Paris, France"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Duration (hours) *</label>
                  <input
                    [(ngModel)]="tourForm.duration"
                    type="number"
                    placeholder="e.g., 24, 48, 72"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                  />
                  <p class="text-xs text-slate-500 mt-1">Tour duration in hours. For example: 24 hours, 48 hours, etc.</p>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Price per Person *</label>
                  <input
                    [(ngModel)]="tourForm.price"
                    type="number"
                    placeholder="e.g., 1500"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Max Participants *</label>
                  <input
                    [(ngModel)]="tourForm.maxParticipants"
                    type="number"
                    placeholder="e.g., 20"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  [(ngModel)]="tourForm.description"
                  rows="4"
                  placeholder="Tour details and highlights..."
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Upload Tour Images</label>

                @if (isUploadingImages()) {
                  <div class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div class="flex items-center gap-2 mb-3">
                      <div class="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      <span class="font-medium text-blue-900">Uploading images...</span>
                    </div>

                    <!-- Upload Progress Steps -->
                    @if (uploadSteps().length > 0) {
                      <div class="space-y-1">
                        @for (step of uploadSteps(); track $index) {
                          <div class="text-sm text-blue-800">{{ step }}</div>
                        }
                      </div>
                    }
                  </div>
                }

                <div
                  class="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-pink-500 transition"
                  (dragover)="onDragOver($event)"
                  (dragleave)="onDragLeave($event)"
                  (drop)="onDrop($event)"
                  [class.border-pink-500]="isDragging()"
                  [class.bg-pink-50]="isDragging()"
                  [class.opacity-50]="isUploadingImages()"
                  [class.pointer-events-none]="isUploadingImages()"
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    #imageInput
                    (change)="onImageSelected($event)"
                    [disabled]="isUploadingImages()"
                    class="hidden"
                  />
                  <div (click)="imageInput.click()" [class.cursor-not-allowed]="isUploadingImages()">
                    <p class="text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
                    <p class="text-xs text-slate-500 mt-1">PNG, JPG, GIF up to 10MB each</p>
                  </div>
                </div>

                @if (uploadedImages().length > 0) {
                  <div class="mt-4 space-y-2">
                    <p class="text-sm font-medium text-slate-700">Uploaded Images ({{ uploadedImages().length }})</p>
                    <div class="grid grid-cols-3 gap-3">
                      @for (img of uploadedImages(); track $index) {
                        <div class="relative">
                          <img [src]="img.preview" alt="Preview" class="w-full h-24 object-cover rounded-lg border border-slate-300" />
                          <button
                            type="button"
                            (click)="removeImage($index)"
                            [disabled]="isUploadingImages()"
                            class="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold transition disabled:opacity-50"
                          >
                            ×
                          </button>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Difficulty Level *</label>
                <select
                  [(ngModel)]="tourForm.difficulty"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                >
                  <option value="">Select difficulty</option>
                  <option value="Easy">Easy</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Tour Highlights</label>
                <textarea
                  [(ngModel)]="highlightsText"
                  rows="4"
                  placeholder="Enter each highlight on a new line&#10;Example:&#10;Eiffel Tower visit&#10;Seine River cruise&#10;French cuisine dinner"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                ></textarea>
                <p class="text-xs text-slate-500 mt-1">One highlight per line</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">What's Included</label>
                <textarea
                  [(ngModel)]="includesText"
                  rows="4"
                  placeholder="Enter each item on a new line&#10;Example:&#10;3 nights hotel accommodation&#10;Daily breakfast&#10;Airport transfers&#10;Guided city tour"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                ></textarea>
                <p class="text-xs text-slate-500 mt-1">One item per line</p>
              </div>

              <div class="flex items-center gap-2">
                <input
                  [(ngModel)]="tourForm.isActive"
                  type="checkbox"
                  id="isActive"
                  class="w-4 h-4"
                />
                <label for="isActive" class="text-sm font-medium text-slate-700">Active Tour</label>
              </div>
            </div>

            @if (formError()) {
              <div class="mt-4 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
                <p class="font-semibold text-sm">{{ formError() }}</p>
              </div>
            }

            <div class="flex gap-3 mt-8">
              <button
                (click)="closeModal()"
                class="flex-1 px-4 py-2 border border-slate-300 text-slate-900 font-medium rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                (click)="saveTour()"
                class="flex-1 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition"
              >
                {{ isEditing() ? 'Update Tour' : 'Create Tour' }}
              </button>
            </div>
          </div>
        </div>
      }

      @if (showDeleteConfirm()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-8 max-w-sm w-full mx-4">
            <h3 class="text-lg font-bold text-slate-900 mb-4">Delete Tour</h3>
            <p class="text-slate-600 mb-6">
              Are you sure you want to delete <strong>{{ deleteConfirmName() }}</strong>? This action cannot be undone.
            </p>
            <div class="flex gap-3">
              <button
                (click)="showDeleteConfirm.set(false)"
                class="flex-1 px-4 py-2 border border-slate-300 text-slate-900 font-medium rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                (click)="deleteTour()"
                class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: []
})
export class ToursDashboardToursComponent implements OnInit {
  tours = signal<any[]>([]);
  showModal = signal(false);
  showDeleteConfirm = signal(false);
  isEditing = signal(false);
  isLoading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');
  formError = signal('');
  deleteConfirmName = signal('');
  deleteConfirmId = signal('');
  uploadedImages = signal<any[]>([]);
  isDragging = signal(false);
  isUploadingImages = signal(false);
  uploadProgress = signal('');
  uploadSteps = signal<string[]>([]);

  tourForm: {
    name: string;
    destination: string;
    duration: number | string;
    price: number;
    maxParticipants: number;
    description: string;
    difficulty: string;
    isActive: boolean;
    image: string;
    images: string[];
    highlights: string[];
    includes: string[];
  } = {
    name: '',
    destination: '',
    duration: 0,
    price: 0,
    maxParticipants: 0,
    description: '',
    difficulty: '',
    isActive: true,
    image: '',
    images: [],
    highlights: [],
    includes: []
  };

  // For textarea inputs (one item per line)
  highlightsText = '';
  includesText = '';

  editingTourId = '';
  private vendorId: string = '';

  constructor(
    private tourService: TourService,
    private imageUploadService: ImageUploadService
  ) {
    // Get vendor ID from localStorage (set during login)
    const agencyId = localStorage.getItem('agencyId');
    const userId = localStorage.getItem('userId');
    this.vendorId = agencyId || userId || '';
    console.log('🏗️ Tours Component Constructor:');
    console.log('   agencyId from localStorage:', agencyId);
    console.log('   userId from localStorage:', userId);
    console.log('   vendorId set to:', this.vendorId);
  }

  ngOnInit(): void {
    console.log('🎫 ngOnInit called - vendorId:', this.vendorId);
    this.loadTours();
  }

  loadTours(): void {
    console.log('🎫 loadTours() called - vendorId:', this.vendorId);

    if (!this.vendorId) {
      console.error('❌ CRITICAL: vendorId is empty in loadTours()');
      console.log('   agencyId:', localStorage.getItem('agencyId'));
      console.log('   userId:', localStorage.getItem('userId'));
      console.log('   All localStorage keys:', Object.keys(localStorage));
      this.errorMessage.set('Vendor ID not found. Please log in again.');
      return;
    }
    this.isLoading.set(true);
    this.tourService.getVendorTours(this.vendorId, 1, 100).subscribe({
      next: (response: any) => {
        if (response.status === 'success' && Array.isArray(response.data)) {
          // Filter tours to only show those created by this vendor
          const vendorTours = response.data.filter((tour: any) =>
            tour.tourOperator === this.vendorId ||
            tour.operatorEmail === localStorage.getItem('email')
          );
          console.log('🎫 All tours:', response.data.length);
          console.log('🎫 Vendor tours:', vendorTours.length);
          console.log('🎫 Vendor ID:', this.vendorId);
          this.tours.set(vendorTours.length > 0 ? vendorTours : response.data);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading tours:', error);
        this.errorMessage.set('Failed to load tours');
        this.isLoading.set(false);
        setTimeout(() => this.errorMessage.set(''), 3000);
      }
    });
  }

  openCreateModal(): void {
    this.resetForm();
    this.uploadSteps.set([]);
    this.uploadProgress.set('');
    this.isUploadingImages.set(false);
    this.isEditing.set(false);
    this.editingTourId = '';
    this.showModal.set(true);
  }

  openEditModal(tour: any): void {
    this.tourForm = {
      name: tour.name,
      destination: tour.destination || '',
      duration: tour.duration || 0,
      price: tour.price || 0,
      maxParticipants: tour.maxParticipants || 0,
      description: tour.description || '',
      difficulty: tour.difficulty || '',
      isActive: tour.isActive !== false,
      image: tour.image || '',
      images: tour.images || [],
      highlights: tour.highlights || [],
      includes: tour.includes || []
    };

    // Load highlights and includes for display
    this.highlightsText = (tour.highlights || []).join('\n');
    this.includesText = (tour.includes || []).join('\n');

    // Load existing images for preview
    if (tour.images && Array.isArray(tour.images) && tour.images.length > 0) {
      const existingImages = tour.images.map((img: string, index: number) => ({
        name: `image-${index + 1}`,
        preview: img,
        file: img
      }));
      this.uploadedImages.set(existingImages);
    } else {
      this.uploadedImages.set([]);
    }

    this.editingTourId = tour._id;
    this.isEditing.set(true);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.resetForm();
  }

  resetForm(): void {
    this.tourForm = {
      name: '',
      destination: '',
      duration: 0,
      price: 0,
      maxParticipants: 0,
      description: '',
      difficulty: '',
      isActive: true,
      image: '',
      images: [],
      highlights: [],
      includes: []
    };
    this.highlightsText = '';
    this.includesText = '';
    this.uploadedImages.set([]);
    this.uploadSteps.set([]);
    this.uploadProgress.set('');
    this.isUploadingImages.set(false);
    this.formError.set('');
  }

  /**
   * Add upload step to progress tracking
   */
  private addUploadStep(step: string): void {
    const steps = this.uploadSteps();
    this.uploadSteps.set([...steps, step]);
    this.uploadProgress.set(step);
    console.log('📋 Upload step:', step);
  }

  /**
   * Handle image file selection using ImageUploadService
   */
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files: File[] = Array.from(input.files || []);

    if (!files.length) {
      this.addUploadStep('⚠️ No files selected');
      return;
    }

    this.addUploadStep(`📸 Images selected - ${files.length} file(s)`);

    // Validate files
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    for (const file of files) {
      if (file.size > maxSize) {
        this.formError.set(`File "${file.name}" is too large. Max size is 10MB.`);
        this.addUploadStep(`❌ File too large: ${file.name}`);
        return;
      }

      if (!validTypes.includes(file.type)) {
        this.formError.set(`File "${file.name}" is not a valid image format.`);
        this.addUploadStep(`❌ Invalid format: ${file.name}`);
        return;
      }
    }

    this.isUploadingImages.set(true);
    this.addUploadStep('🚀 Starting image upload...');

    // Generate upload path
    const uploadPath = `tours/${this.vendorId}`;
    this.addUploadStep(`📤 Upload path: ${uploadPath}`);

    // Use ImageUploadService to upload multiple images
    this.imageUploadService.uploadMultipleImages(files, uploadPath).subscribe({
      next: (imageUrls: string[]) => {
        this.addUploadStep(`🎉 Upload complete! Received ${imageUrls.length} URLs`);

        if (!imageUrls.length) {
          this.formError.set('Upload failed: No image URLs returned');
          this.isUploadingImages.set(false);
          return;
        }

        // Create image objects with previews
        const newImages = imageUrls.map((url, index) => ({
          name: `image-${index + 1}`,
          preview: url,
          file: url
        }));

        // Add to uploaded images
        const currentImages = this.uploadedImages();
        this.uploadedImages.set([...currentImages, ...newImages]);

        // Update tour form images array
        this.tourForm.images = this.uploadedImages().map(img => img.file);

        // Set first image as primary if not already set
        if (!this.tourForm.image || this.tourForm.image === '') {
          this.tourForm.image = imageUrls[0];
        }

        this.isUploadingImages.set(false);
        this.formError.set('');
        this.addUploadStep(`✅ ${imageUrls.length} image(s) uploaded successfully`);

        console.log(`✅ Images uploaded: ${imageUrls.length} total`);
      },
      error: (error: any) => {
        this.isUploadingImages.set(false);
        const errorMsg = error?.message || 'Unknown error';
        this.formError.set(`Upload failed: ${errorMsg}`);
        this.addUploadStep(`❌ Upload failed: ${errorMsg}`);
        console.error('❌ Image upload error:', error);
      }
    });

    // Clear input so same file can be selected again
    input.value = '';
  }

  /**
   * Remove uploaded image by index
   */
  removeImage(index: number): void {
    const currentImages = this.uploadedImages();
    const updatedImages = currentImages.filter((_, i) => i !== index);
    this.uploadedImages.set(updatedImages);

    // Update tour form images array
    this.tourForm.images = updatedImages.map(img => img.file);

    // Update primary image
    if (updatedImages.length > 0) {
      this.tourForm.image = updatedImages[0].file;
    } else {
      this.tourForm.image = '';
    }

    console.log(`🗑️ Image removed. Remaining images: ${updatedImages.length}`);
  }

  /**
   * Handle drag over event
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  /**
   * Handle drag leave event
   */
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  /**
   * Handle drop event
   */
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files) {
      // Create a synthetic event to reuse onImageSelected
      const syntheticEvent = {
        target: {
          files: files
        }
      } as any;
      this.onImageSelected(syntheticEvent);
    }
  }

  saveTour(): void {
    this.formError.set('');

    if (!this.tourForm.name || !this.tourForm.destination || !this.tourForm.duration || !this.tourForm.price || !this.tourForm.maxParticipants) {
      this.formError.set('Please fill in all required fields (name, destination, duration, price, capacity)');
      return;
    }

    // Validate difficulty level
    if (!this.tourForm.difficulty || !['Easy', 'Moderate', 'Hard'].includes(this.tourForm.difficulty)) {
      this.formError.set('Please select a valid difficulty level (Easy, Moderate, or Hard)');
      return;
    }

    // DEBUG: Check localStorage values
    console.log('🔍 DEBUG - localStorage values:');
    console.log('  agencyId:', localStorage.getItem('agencyId'));
    console.log('  userId:', localStorage.getItem('userId'));
    console.log('  vendorId (component):', this.vendorId);

    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    let userEmail = localStorage.getItem('email') || '';
    let userName = localStorage.getItem('businessName') || 'Tour Operator';
    let userPhone = localStorage.getItem('phone') || '';

    // Try to parse user object if available
    if (userData) {
      try {
        const user = JSON.parse(userData);
        userEmail = user.email || userEmail;
        userName = user.businessName || user.name || userName;
        userPhone = user.phone || userPhone;
      } catch (e) {
        console.warn('Could not parse user data from localStorage');
      }
    }

    // Check if vendorId is empty and show warning
    if (!this.vendorId) {
      const storageDebug = {
        agencyId: localStorage.getItem('agencyId'),
        userId: localStorage.getItem('userId'),
        vendorType: localStorage.getItem('vendorType'),
        email: localStorage.getItem('email'),
        businessName: localStorage.getItem('businessName')
      };
      console.error('❌ CRITICAL: vendorId is empty! Required fields will be missing.');
      console.error('   Storage values:', storageDebug);
      console.error('   All localStorage keys:', Object.keys(localStorage));
      this.formError.set(
        'Error: Vendor ID not found. ' +
        (storageDebug.vendorType === 'tour-operator'
          ? 'Please refresh the page and try again.'
          : 'Please log out and log in again as a tour operator (vendorType must be "tour-operator").')
      );
      return;
    }

    // Parse highlights from textarea (one per line)
    const highlights = this.highlightsText
      .split('\n')
      .map(h => h.trim())
      .filter(h => h.length > 0);

    // Parse includes from textarea (one per line)
    const includes = this.includesText
      .split('\n')
      .map(i => i.trim())
      .filter(i => i.length > 0);

    const tourData: any = {
      ...this.tourForm,
      duration: this.tourForm.duration.toString(),
      groupSize: 'group',
      highlights: highlights,
      includes: includes,
      rating: 0,
      reviews: 0,
      currentParticipants: 0,
      image: this.tourForm.image || null,
      images: this.tourForm.images || [],
      tourOperator: this.vendorId,
      operatorName: userName,
      operatorPhone: userPhone,
      operatorEmail: userEmail,
      isActive: true
    };

    console.log('📝 Creating tour with data:', tourData);
    console.log(`📸 Tour images: ${tourData.images.length} image(s) uploaded`);
    console.log(`⭐ Highlights: ${tourData.highlights.length}, Includes: ${tourData.includes.length}`);

    if (this.isEditing()) {
      this.tourService.updateTour(this.editingTourId, tourData).subscribe({
        next: (response: any) => {
          console.log('📝 Update response:', response);
          // Check if response indicates success
          if (response.status === 'error' || response.message?.toLowerCase().includes('error')) {
            this.formError.set('Failed to update tour: ' + (response.message || 'Unknown error'));
            return;
          }
          this.successMessage.set('Tour updated successfully');
          this.closeModal();
          this.loadTours();
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: (error) => {
          console.error('Error updating tour:', error);
          this.formError.set('Failed to update tour: ' + (error.error?.message || error.message || 'Unknown error'));
        }
      });
    } else {
      this.tourService.createTour(tourData).subscribe({
        next: (response: any) => {
          console.log('📝 Create response:', response);
          // Check if response indicates success
          if (response.status === 'error' || response.message?.toLowerCase().includes('error')) {
            this.formError.set('Failed to create tour: ' + (response.message || 'Unknown error'));
            console.error('❌ Tour creation failed:', response);
            return;
          }
          this.successMessage.set('Tour created successfully');
          this.closeModal();
          // Reload tours after creation
          setTimeout(() => this.loadTours(), 500);
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: (error) => {
          console.error('❌ Error creating tour:', error);
          this.formError.set('Failed to create tour: ' + (error.error?.message || error.message || 'Unknown error'));
        }
      });
    }
  }

  confirmDelete(id: string, name: string): void {
    this.deleteConfirmId.set(id);
    this.deleteConfirmName.set(name);
    this.showDeleteConfirm.set(true);
  }

  deleteTour(): void {
    this.tourService.deleteTour(this.deleteConfirmId()).subscribe({
      next: () => {
        this.successMessage.set('Tour deleted successfully');
        this.showDeleteConfirm.set(false);
        this.loadTours();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        console.error('Error deleting tour:', error);
        this.errorMessage.set('Failed to delete tour');
        this.showDeleteConfirm.set(false);
        setTimeout(() => this.errorMessage.set(''), 3000);
      }
    });
  }

  /**
   * Convert hours to minutes for itinerary creation
   * @param hours Duration in hours
   * @returns Duration in minutes
   */
  convertHoursToMinutes(hours: string | number): number {
    const h = typeof hours === 'string' ? parseInt(hours, 10) : hours;
    return h * 60;
  }

  /**
   * Format duration display (hours)
   * @param duration Duration in hours
   * @returns Formatted string
   */
  formatDuration(duration: string | number): string {
    if (!duration) return '-';
    const h = typeof duration === 'string' ? parseInt(duration, 10) : duration;
    const days = Math.floor(h / 24);
    const remainingHours = h % 24;

    if (days > 0 && remainingHours > 0) {
      return `${days}d ${remainingHours}h`;
    } else if (days > 0) {
      return `${days}d`;
    } else {
      return `${h}h`;
    }
  }
}
