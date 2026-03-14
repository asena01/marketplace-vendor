import { Component, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ProductService } from '../../../../../services/product.service';
import { AngularFireUploadService } from '../../../../../services/angular-fire-upload.service';
import { getVendorTypeConfig, VendorTypeConfig, ProductFieldConfig } from '../../../../../shared/config/vendor-type.config';

interface Product {
  _id?: string;
  name: string;
  category: string;
  description: string;
  price: number;
  discountPrice?: number;
  originalPrice?: number;
  currency?: string;
  sku?: string;
  stock: number;
  images?: string[];
  thumbnail?: string;
  rating?: {
    average: number;
    count: number;
    reviews?: any[];
  };
  sold?: number;
  discount?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  features?: string[];
  vendorId?: string;
  vendorName?: string;
  tags?: string[];
  size?: string[];
  color?: string[];

  // Furniture specific
  dimensions?: {
    width: number;
    height: number;
    depth: number;
    unit: string;
  };
  weight?: {
    value: number;
    unit: string;
  };
  material?: string[];
  finish?: string;
  warranty?: {
    duration: number;
    type: string;
  };
  shipping?: {
    available: boolean;
    estimatedDays: number;
    shippingCost: number;
    freeShippingAbove: number;
  };
  assembly?: {
    required: boolean;
    assemblyTime: string;
    instructions: string;
  };

  // Gym Equipment specific
  specifications?: {
    type: string;
    material: string[];
    weight: {
      value: number;
      unit: string;
    };
    dimensions: {
      width: number;
      height: number;
      depth: number;
      unit: string;
    };
    capacity: {
      value: number;
      unit: string;
    };
    resistance: string;
    resistanceLevels: number;
    color: string[];
    warranty: {
      duration: number;
      coverage: string;
    };
  };
  targetMuscles?: string[];
  fitnessLevel?: string;

  // Pets & Supplies specific
  quantity?: {
    value: number;
    unit: string;
  };
  petSpecification?: {
    petType: string;
    suitableFor: string[];
    ageRange: {
      min: number;
      max: number;
      unit: string;
    };
    ingredients: string[];
    nutritionalInfo: {
      protein: string;
      fat: string;
      fiber: string;
      moisture: string;
    };
    allergienFree: string[];
    organic: boolean;
  };
  brand?: string;
  manufacturer?: string;
  service?: string;
  vendorType?: string;
}

@Component({
  selector: 'app-retail-products',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="p-8 space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Products Management</h1>
          <p class="text-slate-600 mt-1">Add, edit, and manage retail products</p>
        </div>
        <button
          (click)="openAddProductModal()"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition flex items-center gap-2"
        >
          <mat-icon class="text-lg">add</mat-icon>
          <span>Add Product</span>
        </button>
      </div>

      <!-- Search & Filter Bar -->
      <div class="bg-white rounded-lg p-6 shadow-md space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Search</label>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (change)="filterProducts()"
              placeholder="Search products..."
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Category</label>
            <input
              type="text"
              [(ngModel)]="selectedCategory"
              (change)="filterProducts()"
              placeholder="Filter by category..."
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Min Price</label>
            <input
              type="number"
              [(ngModel)]="minPrice"
              (change)="filterProducts()"
              placeholder="0"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Max Price</label>
            <input
              type="number"
              [(ngModel)]="maxPrice"
              (change)="filterProducts()"
              placeholder="9999"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <!-- Statistics -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div class="bg-white rounded-lg p-4 shadow-md">
          <p class="text-slate-600 text-sm font-medium">Total Products</p>
          <p class="text-2xl font-bold text-slate-900">{{ filteredProducts().length }}</p>
        </div>
        <div class="bg-emerald-50 rounded-lg p-4 shadow-md border-l-4 border-emerald-500">
          <p class="text-slate-600 text-sm font-medium">In Stock</p>
          <p class="text-2xl font-bold text-emerald-600">{{ countInStock() }}</p>
        </div>
        <div class="bg-red-50 rounded-lg p-4 shadow-md border-l-4 border-red-500">
          <p class="text-slate-600 text-sm font-medium">Out of Stock</p>
          <p class="text-2xl font-bold text-red-600">{{ countOutOfStock() }}</p>
        </div>
        <div class="bg-blue-50 rounded-lg p-4 shadow-md border-l-4 border-blue-500">
          <p class="text-slate-600 text-sm font-medium">Featured</p>
          <p class="text-2xl font-bold text-blue-600">{{ countFeatured() }}</p>
        </div>
        <div class="bg-orange-50 rounded-lg p-4 shadow-md border-l-4 border-orange-500">
          <p class="text-slate-600 text-sm font-medium">Total Value</p>
          <p class="text-2xl font-bold text-orange-600"><span class="currency-prefix">$</span>{{ getTotalInventoryValue().toFixed(0) }}</p>
        </div>
      </div>

      <!-- Products Table -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-100 border-b border-slate-200">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Product Name</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Category</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Price</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Stock</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Sold</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              @if (filteredProducts().length === 0) {
                <tr>
                  <td colspan="7" class="px-6 py-8 text-center text-slate-600">
                    No products found
                  </td>
                </tr>
              } @else {
                @for (product of filteredProducts(); track product._id) {
                  <tr class="border-b border-slate-200 hover:bg-slate-50 transition">
                    <td class="px-6 py-4 font-medium text-slate-900">
                      {{ product.name }}
                      @if (product.isFeatured) {
                        <span class="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-semibold">Featured</span>
                      }
                    </td>
                    <td class="px-6 py-4 text-slate-600">{{ product.category }}</td>
                    <td class="px-6 py-4 font-medium text-slate-900">
                      <span class="currency-prefix">$</span>{{ product.price.toFixed(2) }}
                    </td>
                    <td class="px-6 py-4">
                      <span
                        [ngClass]="{
                          'text-emerald-600 font-semibold': product.stock > 20,
                          'text-orange-600 font-semibold': product.stock > 0 && product.stock <= 20,
                          'text-red-600 font-semibold': product.stock === 0
                        }"
                      >
                        {{ product.stock }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-slate-600">{{ product.sold || 0 }}</td>
                    <td class="px-6 py-4">
                      <span
                        [ngClass]="{
                          'bg-emerald-100 text-emerald-700': product.stock > 0,
                          'bg-red-100 text-red-700': product.stock === 0
                        }"
                        class="px-3 py-1 rounded-full text-xs font-medium"
                      >
                        {{ product.stock > 0 ? 'In Stock' : 'Out of Stock' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 space-x-2 flex items-center">
                      <button
                        (click)="editProduct(product)"
                        class="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 transition"
                        title="Edit product"
                      >
                        <mat-icon class="text-base">edit</mat-icon>
                        <span>Edit</span>
                      </button>
                      <button
                        (click)="deleteProduct(product._id)"
                        class="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1 transition"
                        title="Delete product"
                      >
                        <mat-icon class="text-base">delete</mat-icon>
                        <span>Delete</span>
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
      @if (showProductModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h2 class="text-2xl font-bold text-slate-900 mb-6">
              {{ isEditing() ? 'Edit Product' : 'Add New Product' }}
            </h2>

            <form (ngSubmit)="saveProduct()" class="space-y-6">
              <!-- Validation Error Banner -->
              @if (validationError()) {
                <div class="bg-red-50 border border-red-300 rounded-lg p-4 flex gap-3">
                  <mat-icon class="text-red-600 flex-shrink-0">error</mat-icon>
                  <div>
                    <p class="text-sm font-medium text-red-700">{{ validationError() }}</p>
                  </div>
                </div>
              }

              <!-- Dynamic Form Fields Based on Vendor Type Configuration -->
              @for (groupName of getFormGroupNames(); track groupName) {
                <div class="space-y-4">
                  @if (groupName !== 'Basic Information') {
                    <h3 class="font-semibold text-slate-900 text-lg border-b border-slate-200 pb-2">{{ groupName }}</h3>
                  }

                  <div [ngClass]="groupName === 'Basic Information' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'">
                    @for (field of formFieldGroups[groupName]; track field.name) {
                      @if (field.type === 'text') {
                        <!-- Text Input -->
                        <div>
                          <label class="block text-sm font-medium text-slate-700 mb-2">
                            {{ field.label }}
                            @if (field.required) { <span class="text-red-500">*</span> }
                          </label>
                          <input
                            type="text"
                            [ngModel]="getFieldValue(field.name)"
                            (ngModelChange)="setFieldValue(field.name, $event)"
                            [name]="field.name"
                            [placeholder]="getSafePlaceholder(field)"
                            [required]="field.required"
                            class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      } @else if (field.type === 'number') {
                        <!-- Number Input -->
                        <div>
                          <label class="block text-sm font-medium text-slate-700 mb-2">
                            {{ field.label }}
                            @if (field.required) { <span class="text-red-500">*</span> }
                          </label>
                          <input
                            type="number"
                            [ngModel]="getFieldValue(field.name)"
                            (ngModelChange)="setFieldValue(field.name, $event)"
                            [name]="field.name"
                            [placeholder]="getSafePlaceholder(field)"
                            [required]="field.required"
                            step="0.01"
                            class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      } @else if (field.type === 'textarea') {
                        <!-- Textarea -->
                        <div [ngClass]="groupName === 'Basic Information' ? 'md:col-span-2' : ''">
                          <label class="block text-sm font-medium text-slate-700 mb-2">
                            {{ field.label }}
                            @if (field.required) { <span class="text-red-500">*</span> }
                          </label>
                          <textarea
                            [ngModel]="getFieldValue(field.name)"
                            (ngModelChange)="setFieldValue(field.name, $event)"
                            [name]="field.name"
                            [placeholder]="getSafePlaceholder(field)"
                            [required]="field.required"
                            rows="3"
                            class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          ></textarea>
                        </div>
                      } @else if (field.type === 'select') {
                        <!-- Select Dropdown -->
                        <div>
                          <label class="block text-sm font-medium text-slate-700 mb-2">
                            {{ field.label }}
                            @if (field.required) { <span class="text-red-500">*</span> }
                          </label>
                          <select
                            [ngModel]="getFieldValue(field.name)"
                            (ngModelChange)="setFieldValue(field.name, $event)"
                            [name]="field.name"
                            [required]="field.required"
                            class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">-- Select {{ field.label }} --</option>
                            @if (field.name === 'category') {
                              @for (cat of productCategories; track cat) {
                                <option [value]="cat">{{ formatCategoryName(cat) }}</option>
                              }
                            } @else if (field.options) {
                              @for (opt of field.options; track opt) {
                                <option [value]="opt">{{ opt }}</option>
                              }
                            }
                          </select>
                        </div>
                      } @else if (field.type === 'checkbox') {
                        <!-- Checkbox -->
                        <div class="flex items-center">
                          <input
                            type="checkbox"
                            [ngModel]="getFieldValue(field.name)"
                            (ngModelChange)="setFieldValue(field.name, $event)"
                            [name]="field.name"
                            [id]="field.name"
                            class="w-4 h-4 text-blue-600 rounded"
                          />
                          <label [for]="field.name" class="ml-2 text-sm font-medium text-slate-700">{{ field.label }}</label>
                        </div>
                      } @else if (field.type === 'multiselect') {
                        <!-- Multi-Select Toggle Buttons (Professional Horizontal Layout) -->
                        <div>
                          <label class="block text-sm font-medium text-slate-700 mb-3">
                            {{ field.label }}
                            @if (field.required) { <span class="text-red-500">*</span> }
                          </label>
                          <div class="flex flex-wrap gap-2">
                            @if (field.options) {
                              @for (option of field.options; track option) {
                                <button
                                  type="button"
                                  (click)="toggleOption(field.name, option)"
                                  [class.selected]="isOptionSelected(field.name, option)"
                                  class="px-4 py-2 rounded-full font-medium text-sm transition-all border-2"
                                  [ngClass]="isOptionSelected(field.name, option)
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400'"
                                >
                                  {{ option }}
                                </button>
                              }
                            }
                          </div>
                        </div>
                      } @else if (field.type === 'array') {
                        <!-- Array Input (comma-separated) -->
                        <div>
                          <label class="block text-sm font-medium text-slate-700 mb-2">
                            {{ field.label }}
                            @if (field.required) { <span class="text-red-500">*</span> }
                          </label>
                          <input
                            type="text"
                            [ngModel]="getArrayFieldValue(field.name)"
                            (ngModelChange)="setArrayFieldValue(field.name, $event)"
                            [name]="field.name"
                            [placeholder]="getSafePlaceholder(field) + ' (comma-separated)'"
                            [required]="field.required"
                            class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <p class="text-xs text-slate-500 mt-1">Enter values separated by commas</p>
                        </div>
                      }
                    }
                  </div>
                </div>
              }

              <!-- Image Upload Section (Hidden Input) -->
              <input
                #imageInput
                type="file"
                multiple
                accept="image/*"
                (change)="onImageSelected($event)"
                style="display: none"
                class="hidden"
              />

              <!-- Upload Progress with Debug Steps -->
              @if (isUploadingImages()) {
                <div class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div class="flex items-center gap-3 mb-3">
                    <div class="animate-spin">
                      <mat-icon class="text-blue-600">hourglass_empty</mat-icon>
                    </div>
                    <span class="text-slate-700 font-medium">Uploading images...</span>
                    <button
                      type="button"
                      (click)="stopUpload()"
                      class="ml-auto text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Force Stop
                    </button>
                  </div>

                  <!-- Upload Steps Display -->
                  <div class="bg-white border border-blue-200 rounded-lg p-3 max-h-48 overflow-y-auto">
                    <p class="text-xs font-semibold text-blue-700 mb-2">📋 Upload Progress:</p>
                    @for (step of uploadSteps(); track step) {
                      <div class="text-xs text-slate-700 py-1 border-b border-blue-100 last:border-b-0">
                        {{ step }}
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- Uploaded Images List -->
              @if (newProduct.images && newProduct.images.length > 0) {
                <div class="mt-4">
                  <label class="block text-sm font-medium text-slate-700 mb-3">📸 Uploaded Images ({{ newProduct.images.length }})</label>
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    @for (image of newProduct.images; track image) {
                      <div class="relative group">
                        <img
                          [src]="image"
                          alt="Product image"
                          class="w-full h-24 object-cover rounded-lg border-2 border-slate-300 group-hover:opacity-75 transition"
                        />
                        @if (!image.startsWith('data:')) {
                          <span class="absolute top-1 right-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full">✓ Uploaded</span>
                        }
                        <button
                          type="button"
                          (click)="removeImage(image)"
                          class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition rounded-lg"
                        >
                          <mat-icon>delete</mat-icon>
                        </button>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- Add Images Button -->
              <div class="mt-6 flex gap-3">
                <button
                  type="button"
                  (click)="triggerFileInput()"
                  class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                >
                  <mat-icon>add_photo_alternate</mat-icon>
                  <span>Add Images</span>
                </button>
              </div>

              <!-- Featured & Active -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    [(ngModel)]="newProduct.isFeatured"
                    name="isFeatured"
                    id="isFeatured"
                    class="w-4 h-4 text-blue-600 rounded"
                  />
                  <label for="isFeatured" class="ml-2 text-sm font-medium text-slate-700">Mark as Featured</label>
                </div>

                <div class="flex items-center">
                  <input
                    type="checkbox"
                    [(ngModel)]="newProduct.isActive"
                    name="isActive"
                    id="isActive"
                    class="w-4 h-4 text-blue-600 rounded"
                  />
                  <label for="isActive" class="ml-2 text-sm font-medium text-slate-700">Active</label>
                </div>
              </div>

              <!-- Debug Info (for diagnosing save issues) -->
              @if (debugInfo()) {
                <div class="bg-blue-50 border border-blue-300 rounded-lg p-4">
                  <p class="text-xs font-semibold text-blue-700 mb-2">🔍 DEBUG INFO:</p>
                  <p class="text-xs text-blue-600 whitespace-pre-wrap font-mono">{{ debugInfo() }}</p>
                </div>
              }

              <!-- Modal Actions -->
              <div class="flex justify-end gap-3">
                <button
                  type="button"
                  (click)="closeProductModal()"
                  class="px-6 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                >
                  {{ isEditing() ? 'Update Product' : 'Add Product' }}
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
export class RetailProductsComponent implements OnInit {
  // Product categories from backend model
  allProductCategories = [
    'adult-wear',
    'children-wear',
    'jewelry',
    'supermarket',
    'furniture',
    'hair',
    'pets',
    'gym',
    'restaurants',
    'fast-food',
    'groceries',
    'hotels',
    'apartments',
    'rooms',
    'tours',
    'boat-cruise',
    'activities',
  ];

  // Category mapping by vendorType
  private categoryByVendorType: { [key: string]: string[] } = {
    'retail': ['adult-wear', 'children-wear', 'jewelry', 'supermarket'],
    'clothing-store': ['adult-wear', 'children-wear'],
    'jewelry': ['jewelry'],
    'supermarket': ['supermarket', 'groceries'],
    'furniture': ['furniture'],
    'hair-salon': ['hair'],
    'hair': ['hair'],
    'pet-store': ['pets'],
    'pets': ['pets'],
    'gym': ['gym'],
    'gym-equipment': ['gym'],
    'restaurant': ['restaurants', 'fast-food', 'groceries'],
    'hotel': ['hotels', 'apartments', 'rooms'],
    'service': ['activities', 'tours'],
    'tour-operator': ['tours', 'boat-cruise', 'activities'],
    'car-rental': ['activities'],
    'salon-spa': ['hair', 'activities'],
    'event-center': ['activities'],
    'delivery': ['supermarket', 'groceries'],
    'general': ['adult-wear', 'children-wear', 'jewelry', 'supermarket', 'furniture', 'hair', 'pets', 'gym', 'restaurants', 'fast-food', 'groceries', 'hotels', 'apartments', 'rooms', 'tours', 'boat-cruise', 'activities'],
  };

  get productCategories(): string[] {
    const vendorType = this.getVendorType();
    return this.categoryByVendorType[vendorType] || this.allProductCategories;
  }

  products = signal<Product[]>([]);
  filteredProducts = signal<Product[]>([]);
  showProductModal = signal(false);
  isEditing = signal(false);
  searchQuery: string = '';
  selectedCategory: string = '';
  minPrice: number = 0;
  maxPrice: number = 9999;
  successMessage = signal('');
  errorMessage = signal('');
  isLoading = signal(false);
  isUploadingImages = signal(false);
  validationError = signal('');
  uploadProgress = signal(''); // For UI debugging
  uploadSteps = signal<string[]>([]); // Show upload steps
  debugInfo = signal(''); // Show debug info when saving

  // Vendor-type specific config
  vendorConfig: VendorTypeConfig | null = null;
  formFieldGroups: { [key: string]: ProductFieldConfig[] } = {};

  newProduct: Product = this.getEmptyProduct();
  private storeId: string = '';
  private previewImageCount: number = 0; // Track how many preview images we're uploading

  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;

  constructor(
    private productService: ProductService,
    private imageUploadService: AngularFireUploadService
  ) {
    // Use userId as the vendor ID - it's the unique identifier for this vendor
    const userId = localStorage.getItem('userId') || '';
    this.storeId = userId;
    console.log('👤 User ID (Vendor ID):', this.storeId);
    console.log('🔑 LocalStorage keys:', {
      userId: localStorage.getItem('userId'),
      vendorType: localStorage.getItem('vendorType'),
      storeId: localStorage.getItem('storeId'),
      hotelId: localStorage.getItem('hotelId'),
      restaurantId: localStorage.getItem('restaurantId')
    });
  }

  /**
   * Format category name for display (e.g., 'adult-wear' -> 'Adult Wear')
   */
  formatCategoryName(category: string): string {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Get safe placeholder text - fallback to field label if placeholder is undefined
   */
  getSafePlaceholder(field: ProductFieldConfig): string {
    if (field.placeholder) return field.placeholder;
    // Generate placeholder from field label: "Product Name" -> "Enter Product Name"
    return `Enter ${field.label}`;
  }

  /**
   * Get vendor type from localStorage or determine based on store type
   */
  getVendorType(): string {
    return localStorage.getItem('vendorType') || 'retail';
  }

  /**
   * Map vendor type to service category
   */
  getServiceForVendorType(vendorType: string): string {
    const serviceMap: { [key: string]: string } = {
      'retail': 'shopping',
      'clothing-store': 'shopping',
      'jewelry': 'shopping',
      'supermarket': 'shopping',
      'furniture': 'furniture',
      'hair-salon': 'hair',
      'hair': 'hair',
      'pet-store': 'pets',
      'pets': 'pets',
      'gym': 'gym',
      'gym-equipment': 'gym',
      'restaurant': 'food',
      'hotel': 'hotels',
      'service': 'services',
      'tour-operator': 'tours',
      'car-rental': 'services',
      'salon-spa': 'services',
      'event-center': 'services',
      'delivery': 'shopping',
      'general': 'shopping',
    };
    return serviceMap[vendorType] || 'shopping';
  }

  ngOnInit() {
    // Use userId as the vendor ID
    this.storeId = localStorage.getItem('userId') || '';
    console.log('🔄 ngOnInit - Vendor ID (userId):', this.storeId);
    if (!this.storeId) {
      console.error('❌ User ID not found in localStorage');
      this.errorMessage.set('User ID not found. Please login again.');
      return;
    }

    // Load vendor-type specific configuration
    const vendorType = this.getVendorType();
    console.log('🏬 Vendor Type:', vendorType);
    this.vendorConfig = getVendorTypeConfig(vendorType);
    if (this.vendorConfig) {
      this.organizeFormFieldsByGroup();
    }

    this.loadProducts();
  }

  /**
   * Organize form fields by their group property for better UI organization
   */
  private organizeFormFieldsByGroup(): void {
    if (!this.vendorConfig) return;

    this.formFieldGroups = {};

    this.vendorConfig.productFields.forEach(field => {
      const groupName = field.group || 'Basic Information';
      if (!this.formFieldGroups[groupName]) {
        this.formFieldGroups[groupName] = [];
      }
      this.formFieldGroups[groupName].push(field);
    });
  }

  /**
   * Get ordered group names for form rendering
   */
  getFormGroupNames(): string[] {
    // Ensure Basic Information comes first
    const groups = Object.keys(this.formFieldGroups);
    groups.sort((a, b) => {
      if (a === 'Basic Information') return -1;
      if (b === 'Basic Information') return 1;
      return a.localeCompare(b);
    });
    return groups;
  }

  /**
   * Get field value from newProduct using dynamic property name
   * Returns empty string if value is undefined or null
   */
  getFieldValue(fieldName: string): any {
    const value = (this.newProduct as any)[fieldName];
    // Return empty string for undefined/null to prevent "undefined" showing in inputs
    return value === undefined || value === null ? '' : value;
  }

  /**
   * Set field value in newProduct using dynamic property name
   */
  setFieldValue(fieldName: string, value: any): void {
    (this.newProduct as any)[fieldName] = value;
  }

  /**
   * Get array field value as comma-separated string
   */
  getArrayFieldValue(fieldName: string): string {
    const value = (this.newProduct as any)[fieldName];
    if (!value) return '';
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return value;
  }

  /**
   * Set array field value from comma-separated string
   */
  setArrayFieldValue(fieldName: string, value: string): void {
    if (!value || value.trim().length === 0) {
      (this.newProduct as any)[fieldName] = [];
    } else {
      // Split by comma and trim whitespace
      (this.newProduct as any)[fieldName] = value.split(',').map((item: string) => item.trim());
    }
  }

  /**
   * Check if an option is selected in a multiselect field
   */
  isOptionSelected(fieldName: string, option: string): boolean {
    const value = (this.newProduct as any)[fieldName];
    if (!Array.isArray(value)) return false;
    return value.includes(option);
  }

  /**
   * Toggle an option in a multiselect field
   */
  toggleOption(fieldName: string, option: string): void {
    const currentValue = (this.newProduct as any)[fieldName];
    if (!Array.isArray(currentValue)) {
      (this.newProduct as any)[fieldName] = [option];
      console.log(`✅ ${fieldName} initialized and set to:`, [option]);
      return;
    }

    if (currentValue.includes(option)) {
      // Remove option
      (this.newProduct as any)[fieldName] = currentValue.filter((item: string) => item !== option);
      console.log(`➖ Removed ${option} from ${fieldName}:`, (this.newProduct as any)[fieldName]);
    } else {
      // Add option
      (this.newProduct as any)[fieldName] = [...currentValue, option];
      console.log(`➕ Added ${option} to ${fieldName}:`, (this.newProduct as any)[fieldName]);
    }
  }

  loadProducts() {
    this.isLoading.set(true);
    // Load vendor-specific products
    this.productService.getVendorProducts(this.storeId, 1, 100).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        if (response.success && response.data) {
          this.products.set(response.data);
          this.filterProducts();
        } else {
          // Fallback to empty array if no data
          this.products.set([]);
          this.filterProducts();
        }
      },
      error: (error: any) => {
        this.isLoading.set(false);
        console.error('Error loading products:', error);
        this.errorMessage.set('Failed to load products. Please try again later.');
        // Keep existing products in case of error
        this.filterProducts();
      }
    });
  }

  filterProducts() {
    let filtered = [...this.products()];

    // Filter by search query
    if (this.searchQuery && this.searchQuery.trim().length > 0) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p => {
        const nameMatch = p.name && p.name.toLowerCase().includes(query);
        const descMatch = p.description && p.description.toLowerCase().includes(query);
        return nameMatch || descMatch;
      });
    }

    // Filter by category
    if (this.selectedCategory && this.selectedCategory.trim().length > 0) {
      const catLower = this.selectedCategory.toLowerCase();
      filtered = filtered.filter(p => p.category && p.category.toLowerCase().includes(catLower));
    }

    // Filter by price range
    filtered = filtered.filter(p => {
      const price = p.price || 0;
      return price >= this.minPrice && price <= this.maxPrice;
    });

    this.filteredProducts.set(filtered);
  }

  countInStock(): number {
    return this.products().filter(p => (p?.stock || 0) > 0).length;
  }

  countOutOfStock(): number {
    return this.products().filter(p => (p?.stock || 0) === 0).length;
  }

  countFeatured(): number {
    return this.products().filter(p => p?.isFeatured).length;
  }

  getTotalInventoryValue(): number {
    return this.products().reduce((sum, p) => sum + ((p?.price || 0) * (p?.stock || 0)), 0);
  }

  openAddProductModal() {
    this.isEditing.set(false);
    this.newProduct = this.getEmptyProduct();
    this.showProductModal.set(true);
  }

  editProduct(product: Product) {
    this.isEditing.set(true);
    this.newProduct = { ...product };

    // Ensure variant arrays are initialized
    if (!Array.isArray(this.newProduct.size)) {
      this.newProduct.size = [];
    }
    if (!Array.isArray(this.newProduct.color)) {
      this.newProduct.color = [];
    }
    if (!Array.isArray(this.newProduct.images)) {
      this.newProduct.images = [];
    }
    if (!Array.isArray(this.newProduct.features)) {
      this.newProduct.features = [];
    }

    this.showProductModal.set(true);
  }

  closeProductModal() {
    this.showProductModal.set(false);
    this.newProduct = this.getEmptyProduct();
    this.isEditing.set(false);
    this.validationError.set('');
  }

  saveProduct() {
    // Clear previous validation errors
    this.validationError.set('');

    // IMPORTANT: Check if images are still uploading
    if (this.isUploadingImages()) {
      this.validationError.set('Please wait for images to finish uploading before saving.');
      return;
    }

    // Validate required fields based on vendor-type configuration
    if (this.vendorConfig && this.vendorConfig.productFields.length > 0) {
      for (const field of this.vendorConfig.productFields) {
        if (field.required) {
          const value = (this.newProduct as any)[field.name];

          if (!value && value !== 0) {
            this.validationError.set(`${field.label} is required`);
            return;
          }

          // Special validation for number fields
          if (field.type === 'number' && typeof value === 'number') {
            if (field.name === 'price' && value <= 0) {
              this.validationError.set('Price must be greater than 0');
              return;
            }
            if (field.name === 'stock' && value < 0) {
              this.validationError.set('Stock quantity must be non-negative');
              return;
            }
          }
        }
      }
    }

    // Validate that originalPrice is greater than price (if both are set)
    const price = this.newProduct.price || 0;
    const originalPrice = this.newProduct.originalPrice || 0;
    if (originalPrice > 0 && originalPrice <= price) {
      this.validationError.set('Original Price must be greater than the current Price');
      return;
    }

    // Check if there are still preview data URLs (upload didn't complete)
    const hasPreviewImages = this.newProduct.images?.some(url => url.startsWith('data:')) || false;
    const hasRealImages = this.newProduct.images?.some(url => !url.startsWith('data:')) || false;

    console.log('🔍 Image validation:');
    console.log('  - Has preview images:', hasPreviewImages);
    console.log('  - Has real Firebase images:', hasRealImages);
    console.log('  - Total images:', this.newProduct.images?.length);

    if (hasPreviewImages) {
      this.validationError.set('⏳ Images are still uploading. Please wait for the upload to complete before saving.');
      return;
    }

    // Ensure service and vendorType are set from localStorage
    const vendorType = this.getVendorType();
    this.newProduct.service = this.getServiceForVendorType(vendorType);
    this.newProduct.vendorType = vendorType;
    this.newProduct.vendorId = this.storeId; // Ensure vendorId is set

    // IMPORTANT: Filter out preview data URLs before sending to backend
    // Only send Firebase download URLs, not large data:image/base64 strings
    const productToSend = { ...this.newProduct };

    console.log('💾 Preparing to save product:');
    console.log('  - Name:', productToSend.name);
    console.log('  - Size variants:', productToSend.size);
    console.log('  - Color variants:', productToSend.color);
    console.log('  - Images:', productToSend.images);

    // Remove all data URLs (previews), keep only real Firebase URLs
    if (productToSend.images && productToSend.images.length > 0) {
      const beforeCount = productToSend.images.length;
      productToSend.images = productToSend.images.filter(url => !url.startsWith('data:'));
      console.log(`  - Filtered images: ${beforeCount} → ${productToSend.images.length}`);
    }

    // Also ensure thumbnail is a Firebase URL, not a data URL
    if (productToSend.thumbnail && productToSend.thumbnail.startsWith('data:')) {
      console.log('  - Thumbnail was data URL, removing');
      productToSend.thumbnail = undefined;
    }

    // Build debug message showing what we're sending
    let debugMsg = `📦 SAVING PRODUCT:\nName: ${productToSend.name}\n`;
    debugMsg += `Size: ${productToSend.size?.length || 0} selected\n`;
    debugMsg += `Color: ${productToSend.color?.length || 0} selected\n`;
    debugMsg += `Images: ${productToSend.images?.length || 0}\n`;

    if (productToSend.size && productToSend.size.length > 0) {
      debugMsg += `  Sizes: ${productToSend.size.join(', ')}\n`;
    }
    if (productToSend.color && productToSend.color.length > 0) {
      debugMsg += `  Colors: ${productToSend.color.join(', ')}\n`;
    }

    console.log('📦 Final product to send:', productToSend);
    this.debugInfo.set(debugMsg);

    if (this.isEditing() && this.newProduct._id) {
      // Update existing product via API
      this.isLoading.set(true);
      this.productService.updateProduct(this.newProduct._id, productToSend as any).subscribe({
        next: (response: any) => {
          this.isLoading.set(false);
          if (response.success) {
            const index = this.products().findIndex(p => p._id === this.newProduct._id);
            if (index !== -1) {
              const updated = [...this.products()];
              updated[index] = response.data || this.newProduct;
              this.products.set(updated);
            }
            this.successMessage.set('Product updated successfully!');
            this.validationError.set('');
          } else {
            this.errorMessage.set('Failed to update product');
          }
          this.filterProducts();
          this.closeProductModal();
          setTimeout(() => {
            this.successMessage.set('');
            this.errorMessage.set('');
          }, 3000);
        },
        error: (error: any) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.error?.message || 'Failed to update product');
          console.error('Error updating product:', error);
        }
      });
    } else {
      // Create new product via API
      this.isLoading.set(true);
      console.log('📤 Sending product to API:', productToSend);
      this.productService.createProduct(productToSend as any).subscribe({
        next: (response: any) => {
          this.isLoading.set(false);
          console.log('✅ Backend response:', response);
          console.log('✅ Response data:', response.data);
          if (response.data) {
            console.log('✅ Saved sizes:', response.data.size);
            console.log('✅ Saved colors:', response.data.color);
            console.log('✅ Saved images:', response.data.images);
            console.log('✅ Saved thumbnail:', response.data.thumbnail);
          }
          if (response.success && response.data) {
            console.log('✅ Product created successfully with ID:', response.data._id);
            this.products.set([...this.products(), response.data]);
            this.successMessage.set('Product added successfully!');
            this.validationError.set('');
            this.debugInfo.set(''); // Clear debug info on success
          } else {
            console.warn('⚠️ Backend returned success=false or no data:', response);
            this.errorMessage.set('Failed to add product: ' + (response.message || 'Unknown error'));
          }
          this.filterProducts();
          this.closeProductModal();
          setTimeout(() => {
            this.successMessage.set('');
            this.errorMessage.set('');
          }, 3000);
        },
        error: (error: any) => {
          this.isLoading.set(false);
          console.error('❌ API Error adding product:', error);
          console.error('❌ Error details:', error.error);
          this.errorMessage.set(error.error?.message || 'Failed to add product');
        }
      });
    }
  }

  deleteProduct(productId?: string) {
    if (!productId) return;

    if (confirm('Are you sure you want to delete this product?')) {
      this.isLoading.set(true);
      this.productService.deleteProduct(productId).subscribe({
        next: (response: any) => {
          this.isLoading.set(false);
          if (response.success) {
            this.products.set(this.products().filter(p => p._id !== productId));
            this.filterProducts();
            this.successMessage.set('Product deleted successfully!');
            setTimeout(() => this.successMessage.set(''), 3000);
          } else {
            this.errorMessage.set('Failed to delete product');
          }
        },
        error: (error: any) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.error?.message || 'Failed to delete product');
          console.error('Error deleting product:', error);
        }
      });
    }
  }

  private getEmptyProduct(): Product {
    return {
      name: '',
      category: '',
      description: '',
      price: 0,
      originalPrice: 0,
      stock: 0,
      sold: 0,
      isFeatured: false,
      isActive: true,
      service: this.getServiceForVendorType(this.getVendorType()),
      vendorType: this.getVendorType(),
      // Initialize variant arrays
      images: [],
      color: [],
      size: [],
      features: [],
      tags: [],
      // Add other common fields
      discount: 0,
      sku: '',
      rating: { average: 0, count: 0 }
    };
  }

  /**
   * Handle image selection and upload
   */
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files: File[] = Array.from(input.files || []);
    this.addUploadStep(`📸 Image selected - ${files.length} file(s)`);

    if (!files.length) {
      this.addUploadStep('⚠️ No files selected');
      return;
    }

    // Clear previous preview images (if any) and initialize preview
    this.previewImageCount = files.length;
    this.newProduct.images = [];
    const previewImages: string[] = [];

    // Display image previews to the user
    this.addUploadStep('🖼️ Loading preview images...');
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const dataUrl = e.target?.result as string;
        previewImages.push(dataUrl);

        // Update the product's images
        this.newProduct.images?.push(dataUrl);

        // Set the first preview as the thumbnail (if not already set)
        if (!this.newProduct.thumbnail) {
          this.newProduct.thumbnail = dataUrl;
        }
      };
      reader.readAsDataURL(file);
    });

    this.addUploadStep('🚀 Starting Firebase upload...');
    this.isUploadingImages.set(true);

    // Set Firebase Storage upload path
    const uploadPath = `products/${this.storeId}/${this.newProduct._id || 'new'}`;
    this.addUploadStep('📤 Upload path: ' + uploadPath);
    this.addUploadStep('📋 Files to upload: ' + files.length);

    // Implement timeout for upload safety
    const timeoutHandle = setTimeout(() => {
      if (this.isUploadingImages()) {
        this.addUploadStep('⏱️ Upload timeout - auto-stopping spinner');
        this.addUploadStep('💡 File may still be uploading in background');
        this.isUploadingImages.set(false);
        console.error('❌ Upload timeout after 45 seconds');
      }
    }, 45000); // 45 seconds

    // Use the image upload service to upload multiple images
    this.imageUploadService.uploadMultipleImages(files, uploadPath).subscribe({
      next: (imageUrls: string[]) => {
        clearTimeout(timeoutHandle);

        this.addUploadStep(`🎉 Upload complete! Received ${imageUrls.length} URLs`);
        if (!imageUrls.length) {
          this.addUploadStep('❌ ERROR: Firebase did not return any URLs!');
          console.error('❌ Firebase returned empty URL array!');
          this.isUploadingImages.set(false);
          this.errorMessage.set('Upload failed: Firebase returned no image URLs');
          return;
        }

        console.log('🎉 Upload successful. Image URLs:', imageUrls);

        // Replace `dataUrls` with Firebase URLs
        this.newProduct.images = imageUrls;
        this.addUploadStep(`✅ Images updated with Firebase URLs: ${imageUrls.length} total`);

        // Set the first image as thumbnail (if not already set or is a data URL)
        if (!this.newProduct.thumbnail || this.newProduct.thumbnail.startsWith('data:')) {
          this.newProduct.thumbnail = imageUrls[0];
          this.addUploadStep('📌 Thumbnail set to first image');
        }

        // Reset the upload state and show success message
        this.isUploadingImages.set(false);
        this.successMessage.set(`✅ ${imageUrls.length} image(s) uploaded successfully!`);
        this.uploadSteps.set([]);
        input.value = ''; // Clear the input so the same file can be uploaded again

        // Clear success messages after 3 seconds
        setTimeout(() => {
          this.successMessage.set('');
        }, 3000);
      },
      error: (error: any) => {
        clearTimeout(timeoutHandle);
        const errorMsg = error?.message || 'Unknown error occurred';
        console.error('❌ Upload failed:', errorMsg);

        // Display error and provide suggestions for common errors
        this.addUploadStep('❌ Upload failed. Error: ' + errorMsg);
        if (errorMsg.includes('Security Rules')) {
          this.addUploadStep('💡 Fix: Check Firebase Storage Security Rules');
        } else if (errorMsg.includes('bucket-not-found')) {
          this.addUploadStep('💡 Fix: Verify that your storageBucket is correct in environment');
        } else if (errorMsg.includes('timeout')) {
          this.addUploadStep('💡 Fix: Check your internet connection and Firebase status');
        }

        this.isUploadingImages.set(false);
        this.errorMessage.set(errorMsg);
        input.value = ''; // Keep input clear to allow retry uploads
      },
      complete: () => {
        clearTimeout(timeoutHandle);
        this.addUploadStep('✅ Upload complete callback');
      },
    });
  }

  /**
   * Add a step to the upload progress display
   */
  addUploadStep(step: string) {
    const current = this.uploadSteps();
    this.uploadSteps.set([...current, step]);
    // Keep only last 10 steps
    if (current.length > 10) {
      this.uploadSteps.set(current.slice(-10));
    }
  }

  /**
   * Force stop the upload spinner (manual override for stuck uploads)
   */
  stopUpload() {
    this.addUploadStep('🛑 User clicked Force Stop');
    this.isUploadingImages.set(false);
    this.uploadProgress.set('');
    this.errorMessage.set('Upload stopped by user');
    setTimeout(() => {
      this.uploadSteps.set([]);
      this.errorMessage.set('');
    }, 2000);
  }

  /**
   * Remove image from list
   */
  removeImage(imageUrl: string) {
    if (!this.newProduct.images) return;

    this.newProduct.images = this.newProduct.images.filter(img => img !== imageUrl);

    // If removed image was thumbnail, set new thumbnail
    if (this.newProduct.thumbnail === imageUrl) {
      this.newProduct.thumbnail = this.newProduct.images.length > 0 ? this.newProduct.images[0] : undefined;
    }
  }

  /**
   * Remove thumbnail
   */
  removeThumbnail() {
    this.newProduct.thumbnail = undefined;
  }

  /**
   * Trigger the file input click
   */
  triggerFileInput() {
    console.log('🖱️ File input click triggered');
    if (this.imageInput && this.imageInput.nativeElement) {
      this.imageInput.nativeElement.click();
      console.log('✅ File input clicked successfully');
    } else {
      console.error('❌ File input reference not found');
    }
  }

}
