import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { FoodService } from '../../../../../services/food.service';
import { ImageUploadService } from '../../../../../services/image-upload.service';

interface MenuItem {
  _id?: string;
  name: string;
  category: 'appetizers' | 'main-course' | 'desserts' | 'beverages' | 'specials';
  description: string;
  price: number;
  prepTime: number;
  image?: string;
  isAvailable: boolean;
  isSpecial?: boolean;
  createdAt?: string;
}

@Component({
  selector: 'app-restaurant-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="p-8 space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Menu Management</h1>
          <p class="text-slate-600 mt-1">Add, edit, and manage restaurant menu items</p>
        </div>
        <button
          (click)="openAddMenuModal()"
          class="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition"
        >
          ➕ Add Menu Item
        </button>
      </div>

      <!-- Search & Filter Bar -->
      <div class="bg-white rounded-lg p-6 shadow-md space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Search</label>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (change)="filterMenuItems()"
              placeholder="Search menu items..."
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Category</label>
            <select
              [(ngModel)]="selectedCategory"
              (change)="filterMenuItems()"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Categories</option>
              <option value="appetizers">Appetizers</option>
              <option value="main-course">Main Course</option>
              <option value="desserts">Desserts</option>
              <option value="beverages">Beverages</option>
              <option value="specials">Specials</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Availability</label>
            <select
              [(ngModel)]="selectedAvailability"
              (change)="filterMenuItems()"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Statistics -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg p-4 shadow-md">
          <p class="text-slate-600 text-sm font-medium">Total Items</p>
          <p class="text-2xl font-bold text-slate-900">{{ filteredMenuItems().length }}</p>
        </div>
        <div class="bg-emerald-50 rounded-lg p-4 shadow-md border-l-4 border-emerald-500">
          <p class="text-slate-600 text-sm font-medium">Available</p>
          <p class="text-2xl font-bold text-emerald-600">{{ countByAvailability(true) }}</p>
        </div>
        <div class="bg-red-50 rounded-lg p-4 shadow-md border-l-4 border-red-500">
          <p class="text-slate-600 text-sm font-medium">Unavailable</p>
          <p class="text-2xl font-bold text-red-600">{{ countByAvailability(false) }}</p>
        </div>
        <div class="bg-orange-50 rounded-lg p-4 shadow-md border-l-4 border-orange-500">
          <p class="text-slate-600 text-sm font-medium">Special Items</p>
          <p class="text-2xl font-bold text-orange-600">{{ countSpecialItems() }}</p>
        </div>
      </div>

      <!-- Menu Items Table -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-100 border-b border-slate-200">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Item Name</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Category</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Price</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Prep Time</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              @if (filteredMenuItems().length === 0) {
                <tr>
                  <td colspan="6" class="px-6 py-8 text-center text-slate-600">
                    No menu items found
                  </td>
                </tr>
              } @else {
                @for (item of filteredMenuItems(); track item._id) {
                  <tr class="border-b border-slate-200 hover:bg-slate-50 transition">
                    <td class="px-6 py-4 font-medium text-slate-900">
                      {{ item.name }}
                      @if (item.isSpecial) {
                        <span class="ml-2 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-semibold">Special</span>
                      }
                    </td>
                    <td class="px-6 py-4 text-slate-600">{{ item.category | titlecase }}</td>
                    <td class="px-6 py-4 font-medium text-slate-900">
                      <span class="currency-prefix">$</span>{{ item.price.toFixed(2) }}
                    </td>
                    <td class="px-6 py-4 text-slate-600">{{ item.prepTime }} min</td>
                    <td class="px-6 py-4">
                      <span
                        [ngClass]="{
                          'bg-emerald-100 text-emerald-700': item.isAvailable,
                          'bg-red-100 text-red-700': !item.isAvailable
                        }"
                        class="px-3 py-1 rounded-full text-xs font-medium"
                      >
                        {{ item.isAvailable ? 'Available' : 'Unavailable' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 space-x-2">
                      <button
                        (click)="editMenuItem(item)"
                        class="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        Edit
                      </button>
                      <button
                        (click)="deleteMenuItem(item._id)"
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

      <!-- Add/Edit Modal -->
      @if (showMenuModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 class="text-2xl font-bold text-slate-900 mb-6">
              {{ isEditing() ? 'Edit Menu Item' : 'Add New Menu Item' }}
            </h2>

            <form (ngSubmit)="saveMenuItem()" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Item Name -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Item Name *</label>
                  <input
                    type="text"
                    [(ngModel)]="newMenuItem.name"
                    name="name"
                    placeholder="e.g., Grilled Chicken"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <!-- Category -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Category *</label>
                  <select
                    [(ngModel)]="newMenuItem.category"
                    name="category"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="appetizers">Appetizers</option>
                    <option value="main-course">Main Course</option>
                    <option value="desserts">Desserts</option>
                    <option value="beverages">Beverages</option>
                    <option value="specials">Specials</option>
                  </select>
                </div>

                <!-- Price -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Price *</label>
                  <input
                    type="number"
                    [(ngModel)]="newMenuItem.price"
                    name="price"
                    placeholder="e.g., 25.99"
                    step="0.01"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <!-- Prep Time -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Prep Time (minutes) *</label>
                  <input
                    type="number"
                    [(ngModel)]="newMenuItem.prepTime"
                    name="prepTime"
                    placeholder="e.g., 20"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  [(ngModel)]="newMenuItem.description"
                  name="description"
                  placeholder="Describe the menu item, ingredients, etc..."
                  rows="3"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                ></textarea>
              </div>

              <!-- Image Upload -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Menu Item Image</label>
                <div class="border-2 border-dashed border-orange-300 rounded-lg p-6 text-center bg-orange-50 hover:bg-orange-100 transition cursor-pointer"
                     (click)="imageInput.click()">
                  <input
                    #imageInput
                    type="file"
                    accept="image/*"
                    (change)="onMenuImageSelected($event)"
                    style="display: none"
                  />
                  <mat-icon class="text-4xl text-orange-400 mb-2 block">image</mat-icon>
                  <p class="text-slate-700 font-medium">Click or drag image here</p>
                  <p class="text-slate-500 text-sm">Supported formats: JPG, PNG, GIF</p>
                </div>

                <!-- Image Preview -->
                @if (newMenuItem.image) {
                  <div class="mt-4">
                    <label class="block text-sm font-medium text-slate-700 mb-2">Image Preview</label>
                    <div class="relative inline-block">
                      <img
                        [src]="newMenuItem.image"
                        alt="Menu item"
                        class="w-40 h-32 object-cover rounded-lg border-2 border-orange-300"
                      />
                      <button
                        type="button"
                        (click)="removeMenuImage()"
                        class="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 transform translate-x-2 -translate-y-2 hover:bg-red-600"
                      >
                        <mat-icon class="text-sm">close</mat-icon>
                      </button>
                    </div>
                  </div>
                }

                <!-- Upload Progress -->
                @if (isUploadingMenuImage()) {
                  <div class="mt-4">
                    <div class="flex items-center gap-3">
                      <div class="animate-spin">
                        <mat-icon class="text-orange-600">hourglass_empty</mat-icon>
                      </div>
                      <span class="text-slate-700">Uploading image...</span>
                    </div>
                  </div>
                }
              </div>

              <!-- Availability & Special -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    [(ngModel)]="newMenuItem.isAvailable"
                    name="isAvailable"
                    id="isAvailable"
                    class="w-4 h-4 text-orange-600 rounded"
                  />
                  <label for="isAvailable" class="ml-2 text-sm font-medium text-slate-700">Available</label>
                </div>

                <div class="flex items-center">
                  <input
                    type="checkbox"
                    [(ngModel)]="newMenuItem.isSpecial"
                    name="isSpecial"
                    id="isSpecial"
                    class="w-4 h-4 text-orange-600 rounded"
                  />
                  <label for="isSpecial" class="ml-2 text-sm font-medium text-slate-700">Mark as Special</label>
                </div>
              </div>

              <!-- Modal Actions -->
              <div class="flex justify-end gap-3">
                <button
                  type="button"
                  (click)="closeMenuModal()"
                  class="px-6 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition"
                >
                  {{ isEditing() ? 'Update Item' : 'Add Item' }}
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
  `,
  styles: [`
    .currency-prefix {
      margin-right: 2px;
    }
  `]
})
export class RestaurantMenuComponent implements OnInit {
  menuItems = signal<MenuItem[]>([]);
  filteredMenuItems = signal<MenuItem[]>([]);
  showMenuModal = signal(false);
  isEditing = signal(false);
  searchQuery = signal('');
  selectedCategory = signal('');
  selectedAvailability = signal('');
  successMessage = signal('');
  errorMessage = signal('');
  isLoading = signal(false);

  restaurantId = signal<string>('');
  isUploadingMenuImage = signal(false);

  newMenuItem: MenuItem = this.getEmptyMenuItem();

  constructor(
    private foodService: FoodService,
    private imageUploadService: ImageUploadService
  ) {}

  ngOnInit() {
    // Get restaurant ID from localStorage (set during login)
    const restaurantId = localStorage.getItem('restaurantId');
    if (restaurantId) {
      this.restaurantId.set(restaurantId);
      this.loadMenuItems();
    } else {
      this.errorMessage.set('Restaurant ID not found. Please log in again.');
    }
  }

  loadMenuItems() {
    const restaurantId = this.restaurantId();
    if (!restaurantId) {
      this.errorMessage.set('Restaurant ID not found');
      return;
    }

    this.isLoading.set(true);
    this.foodService.getRestaurantMenus(restaurantId).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        if (response.status === 'success' && response.data) {
          this.menuItems.set(response.data);
          this.filterMenuItems();
        } else {
          // Fallback to empty array if no data
          this.menuItems.set([]);
          this.filterMenuItems();
        }
      },
      error: (error: any) => {
        this.isLoading.set(false);
        console.error('Error loading menu items:', error);
        this.errorMessage.set('Failed to load menu items. Please try again later.');
        // Keep existing menu items in case of error
        this.filterMenuItems();
      }
    });
    this.filterMenuItems();
  }

  filterMenuItems() {
    let filtered = this.menuItems();

    if (this.searchQuery()) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(this.searchQuery().toLowerCase()) ||
        item.description.toLowerCase().includes(this.searchQuery().toLowerCase())
      );
    }

    if (this.selectedCategory()) {
      filtered = filtered.filter(item => item.category === this.selectedCategory());
    }

    if (this.selectedAvailability()) {
      const isAvailable = this.selectedAvailability() === 'available';
      filtered = filtered.filter(item => item.isAvailable === isAvailable);
    }

    this.filteredMenuItems.set(filtered);
  }

  countByAvailability(available: boolean): number {
    return this.menuItems().filter(item => item.isAvailable === available).length;
  }

  countSpecialItems(): number {
    return this.menuItems().filter(item => item.isSpecial).length;
  }

  openAddMenuModal() {
    this.isEditing.set(false);
    this.newMenuItem = this.getEmptyMenuItem();
    this.showMenuModal.set(true);
  }

  editMenuItem(item: MenuItem) {
    this.isEditing.set(true);
    this.newMenuItem = { ...item };
    this.showMenuModal.set(true);
  }

  closeMenuModal() {
    this.showMenuModal.set(false);
    this.newMenuItem = this.getEmptyMenuItem();
    this.isEditing.set(false);
  }

  saveMenuItem() {
    if (!this.newMenuItem.name || !this.newMenuItem.category || !this.newMenuItem.price) {
      this.errorMessage.set('Please fill in all required fields');
      setTimeout(() => this.errorMessage.set(''), 3000);
      return;
    }

    const restaurantId = this.restaurantId();
    if (!restaurantId) {
      this.errorMessage.set('Restaurant ID not found');
      return;
    }

    if (this.isEditing() && this.newMenuItem._id) {
      // Update existing menu item via API
      this.isLoading.set(true);
      this.foodService.updateMenuItem(restaurantId, this.newMenuItem._id, this.newMenuItem).subscribe({
        next: (response: any) => {
          this.isLoading.set(false);
          if (response.status === 'success') {
            const index = this.menuItems().findIndex(m => m._id === this.newMenuItem._id);
            if (index !== -1) {
              const updated = [...this.menuItems()];
              updated[index] = response.data || this.newMenuItem;
              this.menuItems.set(updated);
            }
            this.successMessage.set('Menu item updated successfully!');
          } else {
            this.errorMessage.set('Failed to update menu item');
          }
          this.filterMenuItems();
          this.closeMenuModal();
          setTimeout(() => {
            this.successMessage.set('');
            this.errorMessage.set('');
          }, 3000);
        },
        error: (error: any) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.error?.message || 'Failed to update menu item');
          console.error('Error updating menu item:', error);
        }
      });
    } else {
      // Create new menu item via API
      this.isLoading.set(true);
      this.foodService.addMenuItem(restaurantId, this.newMenuItem).subscribe({
        next: (response: any) => {
          this.isLoading.set(false);
          if (response.status === 'success' && response.data) {
            this.menuItems.set([...this.menuItems(), response.data]);
            this.successMessage.set('Menu item added successfully!');
          } else {
            this.errorMessage.set('Failed to add menu item');
          }
          this.filterMenuItems();
          this.closeMenuModal();
          setTimeout(() => {
            this.successMessage.set('');
            this.errorMessage.set('');
          }, 3000);
        },
        error: (error: any) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.error?.message || 'Failed to add menu item');
          console.error('Error adding menu item:', error);
        }
      });
    }
  }

  deleteMenuItem(itemId?: string) {
    if (!itemId) return;

    const restaurantId = this.restaurantId();
    if (!restaurantId) {
      this.errorMessage.set('Restaurant ID not found');
      return;
    }

    if (confirm('Are you sure you want to delete this menu item?')) {
      this.isLoading.set(true);
      this.foodService.deleteMenuItem(restaurantId, itemId).subscribe({
        next: (response: any) => {
          this.isLoading.set(false);
          if (response.status === 'success') {
            this.menuItems.set(this.menuItems().filter(m => m._id !== itemId));
            this.filterMenuItems();
            this.successMessage.set('Menu item deleted successfully!');
            setTimeout(() => this.successMessage.set(''), 3000);
          } else {
            this.errorMessage.set('Failed to delete menu item');
          }
        },
        error: (error: any) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.error?.message || 'Failed to delete menu item');
          console.error('Error deleting menu item:', error);
        }
      });
    }
  }

  onMenuImageSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    this.isUploadingMenuImage.set(true);
    const uploadPath = `menu-items/${this.newMenuItem._id || 'new'}`;

    this.imageUploadService.uploadImage(file, uploadPath).subscribe({
      next: (imageUrl: string) => {
        this.newMenuItem.image = imageUrl;
        this.isUploadingMenuImage.set(false);
        this.successMessage.set('Image uploaded successfully!');
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error: any) => {
        this.isUploadingMenuImage.set(false);
        this.errorMessage.set('Failed to upload image. Please try again.');
        console.error('Image upload error:', error);
      }
    });
  }

  removeMenuImage() {
    this.newMenuItem.image = undefined;
  }

  private getEmptyMenuItem(): MenuItem {
    return {
      name: '',
      category: 'main-course',
      description: '',
      price: 0,
      prepTime: 15,
      isAvailable: true,
      isSpecial: false
    };
  }
}
