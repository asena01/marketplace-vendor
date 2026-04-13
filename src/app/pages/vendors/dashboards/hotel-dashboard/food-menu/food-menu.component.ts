import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../../../../services/hotel.service';
import { ImageUploadService } from '../../../../../services/image-upload.service';

interface MenuItem {
  _id?: string;
  name: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'beverages' | 'desserts' | 'appetizers';
  price: number;
  availability: 'all-day' | 'breakfast' | 'lunch' | 'dinner';
  description?: string;
  preparationTime: number; // in minutes
  dietary?: string[];
  roomServiceEligible: boolean;
  image?: string;
  isActive: boolean;
}

@Component({
  selector: 'app-hotel-food-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8 space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">📖 Food Menu Management</h1>
          <p class="text-slate-600 mt-1">Create and manage hotel food items and menus</p>
        </div>
        <button
          (click)="openAddMenuItemModal()"
          class="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition"
        >
          ➕ Add Menu Item
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-emerald-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Total Items</p>
          <p class="text-2xl font-bold text-slate-900">{{ menuItems().length }}</p>
        </div>

        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-blue-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Active Items</p>
          <p class="text-2xl font-bold text-blue-600">{{ getActiveCount() }}</p>
        </div>

        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-orange-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Avg. Price</p>
          <p class="text-2xl font-bold text-orange-600">₦{{ getAveragePrice() | number }}</p>
        </div>

        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-purple-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Categories</p>
          <p class="text-2xl font-bold text-purple-600">{{ getCategories().length }}</p>
        </div>
      </div>

      <!-- Filters & Search -->
      <div class="bg-white rounded-lg p-6 shadow-md space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Search</label>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (change)="filterMenuItems()"
              placeholder="Search menu item..."
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Category</label>
            <select
              [(ngModel)]="selectedCategory"
              (change)="filterMenuItems()"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="breakfast">🥞 Breakfast</option>
              <option value="lunch">🍽️ Lunch</option>
              <option value="dinner">🍖 Dinner</option>
              <option value="beverages">☕ Beverages</option>
              <option value="desserts">🍰 Desserts</option>
              <option value="appetizers">🍤 Appetizers</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              [(ngModel)]="selectedStatus"
              (change)="filterMenuItems()"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">✅ Active</option>
              <option value="inactive">❌ Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading & Error States -->
      @if (isLoading()) {
        <div class="bg-blue-50 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">Loading menu items...</p>
        </div>
      }

      @if (errorMessage()) {
        <div class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">{{ errorMessage() }}</p>
        </div>
      }

      <!-- Menu Items Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @if (filteredMenuItems().length === 0) {
          <div class="col-span-full bg-white rounded-lg p-12 text-center shadow-md">
            <p class="text-slate-600 font-medium text-lg">No menu items found</p>
            <p class="text-sm text-slate-500 mt-2">Add menu items to get started with your hotel food service</p>
          </div>
        } @else {
          @for (item of filteredMenuItems(); track item._id) {
            <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
              <!-- Item Image -->
              @if (item.image) {
                <div class="relative w-full h-40 bg-slate-100 overflow-hidden">
                  <img [src]="item.image" [alt]="item.name" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                </div>
              }

              <!-- Item Header -->
              <div class="bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 text-white">
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="text-lg font-bold">{{ item.name }}</h3>
                    <p class="text-emerald-100 text-sm">{{ item.category | titlecase }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-2xl font-bold">₦{{ item.price | number }}</p>
                    <span [class]="item.isActive ? 'text-emerald-200 text-sm font-semibold' : 'text-red-200 text-sm font-semibold'">
                      {{ item.isActive ? '✅ Active' : '❌ Inactive' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Item Details -->
              <div class="p-4 space-y-3">
                @if (item.description) {
                  <p class="text-sm text-slate-600">{{ item.description }}</p>
                }

                <!-- Info Badges -->
                <div class="flex flex-wrap gap-2">
                  <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    ⏱️ {{ item.preparationTime }}min
                  </span>
                  <span class="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                    {{ item.availability | titlecase }}
                  </span>
                  @if (item.roomServiceEligible) {
                    <span class="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
                      🚪 Room Service
                    </span>
                  }
                </div>

                <!-- Dietary Info -->
                @if (item.dietary && item.dietary.length > 0) {
                  <div class="pt-2 border-t border-slate-200">
                    <p class="text-xs font-semibold text-slate-700 mb-1">Dietary:</p>
                    <div class="flex flex-wrap gap-1">
                      @for (diet of item.dietary; track diet) {
                        <span class="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">{{ diet }}</span>
                      }
                    </div>
                  </div>
                }
              </div>

              <!-- Actions -->
              <div class="px-4 py-3 bg-slate-50 border-t border-slate-200 flex gap-2">
                <button
                  (click)="editMenuItem(item)"
                  class="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded font-medium text-sm hover:bg-blue-200 transition"
                >
                  ✏️ Edit
                </button>
                <button
                  (click)="toggleItemStatus(item)"
                  [class]="item.isActive ? 'flex-1 px-3 py-2 bg-red-100 text-red-700 rounded font-medium text-sm hover:bg-red-200 transition' : 'flex-1 px-3 py-2 bg-emerald-100 text-emerald-700 rounded font-medium text-sm hover:bg-emerald-200 transition'"
                >
                  {{ item.isActive ? '❌ Deactivate' : '✅ Activate' }}
                </button>
                <button
                  (click)="deleteMenuItem(item._id!)"
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
                {{ editingItem() ? 'Edit Menu Item' : 'Add New Menu Item' }}
              </h2>
              <button
                (click)="closeModal()"
                class="text-slate-600 hover:text-slate-900 text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            <form class="space-y-4">
              <!-- Name -->
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Item Name *</label>
                <input
                  type="text"
                  [(ngModel)]="formData.name"
                  name="name"
                  placeholder="e.g., Grilled Salmon"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <!-- Category & Price -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Category *</label>
                  <select
                    [(ngModel)]="formData.category"
                    name="category"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="beverages">Beverages</option>
                    <option value="desserts">Desserts</option>
                    <option value="appetizers">Appetizers</option>
                  </select>
                </div>
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
              </div>

              <!-- Availability & Preparation Time -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Availability *</label>
                  <select
                    [(ngModel)]="formData.availability"
                    name="availability"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all-day">All Day</option>
                    <option value="breakfast">Breakfast Only</option>
                    <option value="lunch">Lunch Only</option>
                    <option value="dinner">Dinner Only</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Prep Time (min) *</label>
                  <input
                    type="number"
                    [(ngModel)]="formData.preparationTime"
                    name="preparationTime"
                    placeholder="15"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                <textarea
                  [(ngModel)]="formData.description"
                  name="description"
                  placeholder="Describe the menu item..."
                  rows="2"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <!-- Image Upload -->
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Menu Item Image</label>

                <div class="flex items-center gap-6">
                  <!-- Image Preview -->
                  <div class="flex-shrink-0">
                    @if (formData.image) {
                      <div class="relative group">
                        <img [src]="formData.image" alt="Menu item preview" class="w-24 h-24 rounded-lg object-cover border-2 border-slate-300 shadow-sm" />
                        <button
                          type="button"
                          (click)="removeImage()"
                          [disabled]="isUploadingImages()"
                          class="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition rounded-lg disabled:opacity-50"
                        >
                          <span class="text-2xl">✕</span>
                        </button>
                      </div>
                    } @else {
                      <div class="w-24 h-24 rounded-lg bg-slate-100 flex items-center justify-center text-4xl border-2 border-dashed border-slate-300">
                        🍽️
                      </div>
                    }
                  </div>

                  <!-- Upload Area -->
                  <div class="flex-1">
                    <div
                      class="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition relative"
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
                        <p class="text-xs text-slate-500 mt-1">PNG, JPG up to 10MB</p>
                      </div>

                      @if (isUploadingImages()) {
                        <div class="absolute inset-0 bg-white/60 flex items-center justify-center rounded-lg">
                          <div class="flex items-center gap-2">
                            <div class="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                            <span class="text-sm font-bold text-blue-600">Uploading...</span>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              </div>

              <!-- Room Service & Active -->
              <div class="flex gap-4">
                <label class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    [(ngModel)]="formData.roomServiceEligible"
                    name="roomServiceEligible"
                    class="w-4 h-4"
                  />
                  <span class="text-sm font-medium text-slate-700">Available for Room Service</span>
                </label>
                <label class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    [(ngModel)]="formData.isActive"
                    name="isActive"
                    class="w-4 h-4"
                  />
                  <span class="text-sm font-medium text-slate-700">Active</span>
                </label>
              </div>

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
                  (click)="saveMenuItem()"
                  class="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition"
                >
                  {{ editingItem() ? 'Update Item' : 'Add Item' }}
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
export class HotelFoodMenuComponent implements OnInit {
  isLoading = signal(false);
  errorMessage = signal('');
  showModal = signal(false);
  searchQuery = signal('');
  selectedCategory = signal('');
  selectedStatus = signal('');
  editingItem = signal<MenuItem | null>(null);
  isUploadingImages = signal(false);
  isDragging = signal(false);

  menuItems = signal<MenuItem[]>([]);
  filteredMenuItems = signal<MenuItem[]>([]);

  formData: MenuItem = {
    name: '',
    category: 'breakfast',
    price: 0,
    availability: 'all-day',
    description: '',
    preparationTime: 15,
    dietary: [],
    roomServiceEligible: true,
    isActive: true,
    image: ''
  };

  private hotelId: string = '';

  constructor(
    private hotelService: HotelService,
    private imageUploadService: ImageUploadService
  ) {}

  ngOnInit(): void {
    this.hotelId = localStorage.getItem('hotelId') || localStorage.getItem('userId') || '';
    this.loadMenuItems();
  }

  loadMenuItems(): void {
    const hotelId = localStorage.getItem('hotelId');
    if (!hotelId) {
      console.warn('⚠️ No hotelId found in localStorage');
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.hotelService.getRoomServiceItems(1, 100).subscribe({
      next: (response: any) => {
        if (response.status === 'success' && Array.isArray(response.data)) {
          this.menuItems.set(response.data);
          this.filterMenuItems();
          console.log('✅ Menu items loaded:', response.data);
        } else {
          this.menuItems.set([]);
          this.filterMenuItems();
        }
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading menu items:', error);
        this.errorMessage.set('Failed to load menu items. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  filterMenuItems(): void {
    let filtered = this.menuItems();

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

    if (this.selectedStatus()) {
      if (this.selectedStatus() === 'active') {
        filtered = filtered.filter(item => item.isActive);
      } else if (this.selectedStatus() === 'inactive') {
        filtered = filtered.filter(item => !item.isActive);
      }
    }

    this.filteredMenuItems.set(filtered);
  }

  openAddMenuItemModal(): void {
    this.editingItem.set(null);
    this.formData = {
      name: '',
      category: 'breakfast',
      price: 0,
      availability: 'all-day',
      description: '',
      preparationTime: 15,
      dietary: [],
      roomServiceEligible: true,
      isActive: true,
      image: ''
    };
    this.showModal.set(true);
  }

  editMenuItem(item: MenuItem): void {
    this.editingItem.set(item);
    // Use JSON parse/stringify for a deep copy to avoid direct mutation of the list
    this.formData = JSON.parse(JSON.stringify(item));
    // Ensure image field is initialized
    if (!this.formData.image) {
      this.formData.image = '';
    }
    this.showModal.set(true);
  }

  saveMenuItem(): void {
    if (!this.formData.name || !this.formData.price) {
      this.errorMessage.set('Please fill in all required fields');
      return;
    }

    if (this.editingItem()) {
      // Update existing item
      this.hotelService.updateRoomServiceItem(this.editingItem()!._id!, this.formData).subscribe({
        next: (response: any) => {
          if (response.status === 'success') {
            this.loadMenuItems();
            this.closeModal();
            console.log('✅ Menu item updated');
          }
        },
        error: (error: any) => {
          console.error('Error updating menu item:', error);
          this.errorMessage.set('Failed to update menu item');
        }
      });
    } else {
      // Create new item
      this.hotelService.createRoomServiceItem(this.formData).subscribe({
        next: (response: any) => {
          if (response.status === 'success') {
            this.loadMenuItems();
            this.closeModal();
            console.log('✅ Menu item created');
          }
        },
        error: (error: any) => {
          console.error('Error creating menu item:', error);
          this.errorMessage.set('Failed to create menu item');
        }
      });
    }
  }

  toggleItemStatus(item: MenuItem): void {
    if (!item._id) return;

    const updatedItem = { ...item, isActive: !item.isActive };
    this.hotelService.updateRoomServiceItem(item._id, updatedItem).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.loadMenuItems();
          console.log('✅ Item status updated');
        }
      },
      error: (error: any) => {
        console.error('Error updating item status:', error);
        this.errorMessage.set('Failed to update item status');
      }
    });
  }

  deleteMenuItem(itemId: string): void {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    this.hotelService.deleteRoomServiceItem(itemId).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.loadMenuItems();
          console.log('✅ Menu item deleted');
        }
      },
      error: (error: any) => {
        console.error('Error deleting menu item:', error);
        this.errorMessage.set('Failed to delete menu item');
      }
    });
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingItem.set(null);
  }

  getActiveCount(): number {
    return this.menuItems().filter(item => item.isActive).length;
  }

  getAveragePrice(): number {
    if (this.menuItems().length === 0) return 0;
    const total = this.menuItems().reduce((sum, item) => sum + item.price, 0);
    return Math.round(total / this.menuItems().length);
  }

  getCategories(): string[] {
    return [...new Set(this.menuItems().map(item => item.category))];
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

    const uploadPath = `menu-items/${this.hotelId}/${this.formData.name || 'new'}`;

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

        console.log(`✅ Menu item image uploaded successfully`);
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
    console.log('🗑️ Menu item image removed');
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
