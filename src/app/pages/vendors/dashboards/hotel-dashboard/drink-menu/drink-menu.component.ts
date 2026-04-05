import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../../../../services/hotel.service';
import { ImageUploadService } from '../../../../../services/image-upload.service';

interface DrinkItem {
  _id?: string;
  name: string;
  category: 'hot-beverages' | 'cold-beverages' | 'alcoholic' | 'mocktails' | 'juices';
  price: number;
  description?: string;
  preparationTime: number;
  ingredients?: string[];
  isActive: boolean;
  temperature?: 'hot' | 'cold' | 'room-temp';
  image?: string;
}

@Component({
  selector: 'app-hotel-drink-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8 space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">🍹 Drinks Menu</h1>
          <p class="text-slate-600 mt-1">Create and manage beverage offerings</p>
        </div>
        <button
          (click)="openAddDrinkModal()"
          class="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg font-medium transition"
        >
          ➕ Add Drink
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-cyan-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Total Drinks</p>
          <p class="text-2xl font-bold text-slate-900">{{ drinkItems().length }}</p>
        </div>

        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-blue-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Active</p>
          <p class="text-2xl font-bold text-blue-600">{{ getActiveCount() }}</p>
        </div>

        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-purple-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Avg. Price</p>
          <p class="text-2xl font-bold text-purple-600">₦{{ getAveragePrice() | number }}</p>
        </div>

        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-cyan-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Categories</p>
          <p class="text-2xl font-bold text-cyan-600">{{ getCategories().length }}</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg p-6 shadow-md space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Search</label>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (change)="filterDrinkItems()"
              placeholder="Search drink..."
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Category</label>
            <select
              [(ngModel)]="selectedCategory"
              (change)="filterDrinkItems()"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="hot-beverages">☕ Hot Beverages</option>
              <option value="cold-beverages">🧊 Cold Beverages</option>
              <option value="alcoholic">🍻 Alcoholic</option>
              <option value="mocktails">🍹 Mocktails</option>
              <option value="juices">🥤 Juices</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading & Error States -->
      @if (isLoading()) {
        <div class="bg-blue-50 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">Loading drinks...</p>
        </div>
      }

      @if (errorMessage()) {
        <div class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">{{ errorMessage() }}</p>
        </div>
      }

      <!-- Drinks Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @if (filteredDrinkItems().length === 0) {
          <div class="col-span-full bg-white rounded-lg p-12 text-center shadow-md">
            <p class="text-slate-600 font-medium text-lg">No drinks found</p>
            <p class="text-sm text-slate-500 mt-2">Add drinks to your beverage menu</p>
          </div>
        } @else {
          @for (item of filteredDrinkItems(); track item._id) {
            <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
              <!-- Drink Image -->
              @if (item.image) {
                <div class="relative w-full h-40 bg-slate-100 overflow-hidden">
                  <img [src]="item.image" [alt]="item.name" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                </div>
              }

              <!-- Drink Header -->
              <div class="bg-gradient-to-r from-cyan-500 to-blue-600 p-4 text-white">
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="text-lg font-bold">{{ item.name }}</h3>
                    <p class="text-cyan-100 text-sm">{{ item.category | titlecase }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-2xl font-bold">₦{{ item.price | number }}</p>
                    <span [class]="item.isActive ? 'text-cyan-200 text-sm font-semibold' : 'text-red-200 text-sm font-semibold'">
                      {{ item.isActive ? '✅ Active' : '❌ Inactive' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Drink Details -->
              <div class="p-4 space-y-3">
                @if (item.description) {
                  <p class="text-sm text-slate-600">{{ item.description }}</p>
                }

                <!-- Info Badges -->
                <div class="flex flex-wrap gap-2">
                  <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    ⏱️ {{ item.preparationTime }}min
                  </span>
                  @if (item.temperature) {
                    <span class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                      {{ item.temperature === 'hot' ? '🔥' : item.temperature === 'cold' ? '❄️' : '🌡️' }} {{ item.temperature | titlecase }}
                    </span>
                  }
                </div>

                <!-- Ingredients -->
                @if (item.ingredients && item.ingredients.length > 0) {
                  <div class="pt-2 border-t border-slate-200">
                    <p class="text-xs font-semibold text-slate-700 mb-2">Ingredients:</p>
                    <div class="flex flex-wrap gap-1">
                      @for (ingredient of item.ingredients.slice(0, 3); track ingredient) {
                        <span class="px-2 py-1 bg-cyan-100 text-cyan-700 rounded text-xs">{{ ingredient }}</span>
                      }
                      @if (item.ingredients.length > 3) {
                        <span class="px-2 py-1 bg-cyan-100 text-cyan-700 rounded text-xs">+{{ item.ingredients.length - 3 }}</span>
                      }
                    </div>
                  </div>
                }
              </div>

              <!-- Actions -->
              <div class="px-4 py-3 bg-slate-50 border-t border-slate-200 flex gap-2">
                <button
                  (click)="editDrink(item)"
                  class="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded font-medium text-sm hover:bg-blue-200 transition"
                >
                  ✏️ Edit
                </button>
                <button
                  (click)="toggleDrinkStatus(item)"
                  [class]="item.isActive ? 'flex-1 px-3 py-2 bg-red-100 text-red-700 rounded font-medium text-sm hover:bg-red-200 transition' : 'flex-1 px-3 py-2 bg-emerald-100 text-emerald-700 rounded font-medium text-sm hover:bg-emerald-200 transition'"
                >
                  {{ item.isActive ? '❌ Deactivate' : '✅ Activate' }}
                </button>
                <button
                  (click)="deleteDrink(item._id!)"
                  class="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded font-medium text-sm hover:bg-red-200 transition"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          }
        }
      </div>

      <!-- Add/Edit Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-slate-900">
                {{ editingDrink() ? 'Edit Drink' : 'Add New Drink' }}
              </h2>
              <button
                (click)="closeModal()"
                class="text-slate-600 hover:text-slate-900 text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            <form class="space-y-4">
              <!-- Name & Category -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Name *</label>
                  <input
                    type="text"
                    [(ngModel)]="formData.name"
                    name="name"
                    placeholder="e.g., Espresso"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Category *</label>
                  <select
                    [(ngModel)]="formData.category"
                    name="category"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="hot-beverages">Hot Beverages</option>
                    <option value="cold-beverages">Cold Beverages</option>
                    <option value="alcoholic">Alcoholic</option>
                    <option value="mocktails">Mocktails</option>
                    <option value="juices">Juices</option>
                  </select>
                </div>
              </div>

              <!-- Price & Temp -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Price (₦) *</label>
                  <input
                    type="number"
                    [(ngModel)]="formData.price"
                    name="price"
                    placeholder="0.00"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Temperature *</label>
                  <select
                    [(ngModel)]="formData.temperature"
                    name="temperature"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="hot">🔥 Hot</option>
                    <option value="cold">❄️ Cold</option>
                    <option value="room-temp">🌡️ Room Temp</option>
                  </select>
                </div>
              </div>

              <!-- Prep Time -->
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Prep Time (min) *</label>
                <input
                  type="number"
                  [(ngModel)]="formData.preparationTime"
                  name="preparationTime"
                  placeholder="5"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                <textarea
                  [(ngModel)]="formData.description"
                  name="description"
                  placeholder="Describe the drink..."
                  rows="2"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <!-- Image Upload -->
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Drink Image</label>

                @if (isUploadingImages()) {
                  <div class="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div class="flex items-center gap-2">
                      <div class="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      <span class="text-sm font-medium text-blue-900">Uploading image...</span>
                    </div>
                  </div>
                }

                <div
                  class="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition"
                  (dragover)="$event.preventDefault(); isDragging.set(true)"
                  (dragleave)="isDragging.set(false)"
                  (drop)="onDropImage($event)"
                  [class.border-blue-500]="isDragging()"
                  [class.bg-blue-50]="isDragging()"
                  [class.opacity-50]="isUploadingImages()"
                  [class.pointer-events-none]="isUploadingImages()"
                >
                  <input
                    #imageInput
                    type="file"
                    accept="image/*"
                    (change)="onImageSelected($event)"
                    [disabled]="isUploadingImages()"
                    style="display: none"
                    class="hidden"
                  />
                  <div (click)="imageInput.click()" [class.cursor-not-allowed]="isUploadingImages()">
                    <p class="text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
                    <p class="text-xs text-slate-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>

                @if (formData.image) {
                  <div class="mt-3">
                    <label class="block text-sm font-medium text-slate-700 mb-2">Image Preview</label>
                    <div class="relative inline-block">
                      <img [src]="formData.image" alt="Drink image" class="h-24 w-24 object-cover rounded-lg border-2 border-slate-300" />
                      <button
                        type="button"
                        (click)="removeImage()"
                        [disabled]="isUploadingImages()"
                        class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 hover:opacity-100 transition rounded-lg disabled:opacity-50"
                      >
                        <span class="text-2xl">×</span>
                      </button>
                    </div>
                  </div>
                }
              </div>

              <!-- Active -->
              <label class="flex items-center gap-2">
                <input
                  type="checkbox"
                  [(ngModel)]="formData.isActive"
                  name="isActive"
                  class="w-4 h-4"
                />
                <span class="text-sm font-medium text-slate-700">Active</span>
              </label>

              <!-- Actions -->
              <div class="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  (click)="closeModal()"
                  class="px-4 py-2 bg-slate-200 text-slate-900 rounded-lg font-medium hover:bg-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  (click)="saveDrink()"
                  class="px-4 py-2 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 transition"
                >
                  {{ editingDrink() ? 'Update Drink' : 'Add Drink' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: []
})
export class HotelDrinkMenuComponent implements OnInit {
  isLoading = signal(false);
  errorMessage = signal('');
  showModal = signal(false);
  searchQuery = signal('');
  selectedCategory = signal('');
  editingDrink = signal<DrinkItem | null>(null);
  isUploadingImages = signal(false);
  isDragging = signal(false);

  private hotelId: string = '';

  drinkItems = signal<DrinkItem[]>([]);
  filteredDrinkItems = signal<DrinkItem[]>([]);

  formData: DrinkItem = {
    name: '',
    category: 'hot-beverages',
    price: 0,
    description: '',
    preparationTime: 5,
    temperature: 'hot',
    isActive: true
  };

  constructor(
    private hotelService: HotelService,
    private imageUploadService: ImageUploadService
  ) {}

  ngOnInit(): void {
    this.hotelId = localStorage.getItem('hotelId') || localStorage.getItem('userId') || '';
    this.loadDrinkItems();
  }

  loadDrinkItems(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.hotelService.getRoomServiceItems(1, 100).subscribe({
      next: (response: any) => {
        if (response.status === 'success' && Array.isArray(response.data)) {
          // Filter items that are beverages (drinks)
          const beverageItems = response.data.filter((item: any) => item.category === 'beverage');
          this.drinkItems.set(beverageItems);
          this.filterDrinkItems();
          console.log('✅ Drink items loaded:', beverageItems);
        } else {
          this.drinkItems.set([]);
          this.filterDrinkItems();
        }
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading drink items:', error);
        this.errorMessage.set('Failed to load drinks. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  filterDrinkItems(): void {
    let filtered = this.drinkItems();

    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      );
    }

    if (this.selectedCategory()) {
      filtered = filtered.filter(item => item.category === this.selectedCategory());
    }

    this.filteredDrinkItems.set(filtered);
  }

  openAddDrinkModal(): void {
    this.editingDrink.set(null);
    this.formData = {
      name: '',
      category: 'hot-beverages',
      price: 0,
      description: '',
      preparationTime: 5,
      temperature: 'hot',
      isActive: true,
      image: ''
    };
    this.showModal.set(true);
  }

  editDrink(item: DrinkItem): void {
    this.editingDrink.set(item);
    this.formData = { ...item };
    // Ensure image field is initialized
    if (!this.formData.image) {
      this.formData.image = '';
    }
    this.showModal.set(true);
  }

  saveDrink(): void {
    if (!this.formData.name || !this.formData.price) {
      this.errorMessage.set('Please fill in all required fields');
      return;
    }

    // Ensure category is 'beverage' for drinks
    const drinkData = { ...this.formData, category: 'beverage' };

    if (this.editingDrink() && this.editingDrink()?._id) {
      // Update existing drink via API
      this.isLoading.set(true);
      this.hotelService.updateRoomServiceItem(this.editingDrink()!._id!, drinkData).subscribe({
        next: (response: any) => {
          this.isLoading.set(false);
          if (response.status === 'success') {
            this.loadDrinkItems();
            this.errorMessage.set('');
          } else {
            this.errorMessage.set('Failed to update drink');
          }
          this.closeModal();
        },
        error: (error: any) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.error?.message || 'Failed to update drink');
          console.error('Error updating drink:', error);
        }
      });
    } else {
      // Create new drink via API
      this.isLoading.set(true);
      this.hotelService.createRoomServiceItem(drinkData).subscribe({
        next: (response: any) => {
          this.isLoading.set(false);
          if (response.status === 'success') {
            this.loadDrinkItems();
            this.errorMessage.set('');
          } else {
            this.errorMessage.set('Failed to create drink');
          }
          this.closeModal();
        },
        error: (error: any) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.error?.message || 'Failed to create drink');
          console.error('Error creating drink:', error);
        }
      });
    }
  }

  toggleDrinkStatus(item: DrinkItem): void {
    const updatedDrink = { ...item, isActive: !item.isActive };
    this.isLoading.set(true);
    this.hotelService.updateRoomServiceItem(item._id!, updatedDrink).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.loadDrinkItems();
      },
      error: (error: any) => {
        this.isLoading.set(false);
        console.error('Error updating drink status:', error);
      }
    });
  }

  deleteDrink(itemId: string): void {
    if (!confirm('Are you sure you want to delete this drink?')) return;
    this.isLoading.set(true);
    this.hotelService.deleteRoomServiceItem(itemId).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.loadDrinkItems();
      },
      error: (error: any) => {
        this.isLoading.set(false);
        this.errorMessage.set('Failed to delete drink');
        console.error('Error deleting drink:', error);
      }
    });
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingDrink.set(null);
  }

  getActiveCount(): number {
    return this.drinkItems().filter(item => item.isActive).length;
  }

  getAveragePrice(): number {
    if (this.drinkItems().length === 0) return 0;
    const total = this.drinkItems().reduce((sum, item) => sum + item.price, 0);
    return Math.round(total / this.drinkItems().length);
  }

  getCategories(): string[] {
    return [...new Set(this.drinkItems().map(item => item.category))];
  }

  // IMAGE UPLOAD METHODS
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (file.size > maxSize) {
      this.errorMessage.set(`File is too large. Max size is 10MB.`);
      return;
    }

    if (!validTypes.includes(file.type)) {
      this.errorMessage.set(`File is not a valid image format.`);
      return;
    }

    this.isUploadingImages.set(true);

    // Generate upload path
    const uploadPath = `drinks/${this.hotelId}/${this.formData.name || 'new'}`;

    // Use ImageUploadService to upload image
    this.imageUploadService.uploadImage(file, uploadPath).subscribe({
      next: (imageUrl: string) => {
        if (!imageUrl) {
          this.errorMessage.set('Upload failed: No image URL returned');
          this.isUploadingImages.set(false);
          return;
        }

        this.formData.image = imageUrl;
        this.isUploadingImages.set(false);
        this.errorMessage.set('');

        console.log(`✅ Drink image uploaded successfully`);
      },
      error: (error: any) => {
        this.isUploadingImages.set(false);
        const errorMsg = error?.message || 'Unknown error';
        this.errorMessage.set(`Upload failed: ${errorMsg}`);
        console.error('❌ Image upload error:', error);
      }
    });

    // Clear input
    input.value = '';
  }

  removeImage(): void {
    this.formData.image = '';
    console.log('🗑️ Drink image removed');
  }

  onDropImage(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      // Create a synthetic event
      const syntheticEvent = {
        target: {
          files: [file]
        }
      } as any;
      this.onImageSelected(syntheticEvent);
    }
  }
}
