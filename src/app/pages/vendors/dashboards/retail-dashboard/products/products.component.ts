import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ProductService } from '../../../../../services/product.service';
import { AngularFireUploadService } from '../../../../../services/angular-fire-upload.service';

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
  color?: string[];
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

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Product Name -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Product Name *</label>
                  <input
                    type="text"
                    [(ngModel)]="newProduct.name"
                    name="name"
                    placeholder="e.g., Blue T-Shirt"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <!-- Category Dropdown -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Category *</label>
                  <select
                    [(ngModel)]="newProduct.category"
                    name="category"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">-- Select a Category --</option>
                    @for (cat of productCategories; track cat) {
                      <option [value]="cat">{{ formatCategoryName(cat) }}</option>
                    }
                  </select>
                </div>

                <!-- Price -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Price *</label>
                  <input
                    type="number"
                    [(ngModel)]="newProduct.price"
                    name="price"
                    placeholder="e.g., 29.99"
                    step="0.01"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <!-- Original Price -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Original Price</label>
                  <input
                    type="number"
                    [(ngModel)]="newProduct.originalPrice"
                    name="originalPrice"
                    placeholder="e.g., 39.99"
                    step="0.01"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <!-- Stock -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Stock Quantity *</label>
                  <input
                    type="number"
                    [(ngModel)]="newProduct.stock"
                    name="stock"
                    placeholder="e.g., 50"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <!-- SKU -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">SKU</label>
                  <input
                    type="text"
                    [(ngModel)]="newProduct.sku"
                    name="sku"
                    placeholder="e.g., TSH-BLU-001"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  [(ngModel)]="newProduct.description"
                  name="description"
                  placeholder="Product description, materials, care instructions..."
                  rows="3"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <!-- Category-Specific Fields -->
              @if (isFurnitureCategory()) {
                <!-- Furniture Fields -->
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
                  <h3 class="font-semibold text-slate-900">Furniture Details</h3>

                  <!-- Material -->
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">Material (comma-separated)</label>
                    <input
                      type="text"
                      [(ngModel)]="furnitureData.material"
                      name="material"
                      placeholder="e.g., wood, fabric, metal"
                      class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <!-- Color -->
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">Colors (comma-separated)</label>
                    <input
                      type="text"
                      [(ngModel)]="furnitureData.color"
                      name="color"
                      placeholder="e.g., black, brown, white"
                      class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <!-- Dimensions -->
                  <div class="grid grid-cols-3 gap-3">
                    <div>
                      <label class="block text-sm font-medium text-slate-700 mb-2">Width (cm)</label>
                      <input
                        type="number"
                        [(ngModel)]="furnitureData.width"
                        name="width"
                        class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-700 mb-2">Height (cm)</label>
                      <input
                        type="number"
                        [(ngModel)]="furnitureData.height"
                        name="height"
                        class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-700 mb-2">Depth (cm)</label>
                      <input
                        type="number"
                        [(ngModel)]="furnitureData.depth"
                        name="depth"
                        class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <!-- Weight -->
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      [(ngModel)]="furnitureData.weight"
                      name="weight"
                      class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <!-- Finish -->
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">Finish</label>
                    <input
                      type="text"
                      [(ngModel)]="furnitureData.finish"
                      name="finish"
                      placeholder="e.g., matte, glossy"
                      class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              }

              @if (isGymEquipmentCategory()) {
                <!-- Gym Equipment Fields -->
                <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-4">
                  <h3 class="font-semibold text-slate-900">Equipment Specifications</h3>

                  <!-- Equipment Type -->
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">Equipment Type</label>
                    <select
                      [(ngModel)]="gymData.specType"
                      name="specType"
                      class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Type</option>
                      <option value="free-weight">Free Weight</option>
                      <option value="machine">Machine</option>
                      <option value="cardio">Cardio</option>
                      <option value="accessory">Accessory</option>
                    </select>
                  </div>

                  <!-- Material -->
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">Materials (comma-separated)</label>
                    <input
                      type="text"
                      [(ngModel)]="gymData.material"
                      name="gymMaterial"
                      placeholder="e.g., steel, rubber, plastic"
                      class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <!-- Weight Capacity -->
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">Weight Capacity (kg)</label>
                    <input
                      type="number"
                      [(ngModel)]="gymData.capacity"
                      name="capacity"
                      class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <!-- Resistance Type -->
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">Resistance Type</label>
                    <select
                      [(ngModel)]="gymData.resistance"
                      name="resistance"
                      class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Type</option>
                      <option value="adjustable">Adjustable</option>
                      <option value="fixed">Fixed</option>
                    </select>
                  </div>

                  <!-- Target Muscles -->
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">Target Muscles (comma-separated)</label>
                    <input
                      type="text"
                      [(ngModel)]="gymData.targetMuscles"
                      name="targetMuscles"
                      placeholder="e.g., biceps, chest, legs"
                      class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <!-- Fitness Level -->
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">Fitness Level</label>
                    <select
                      [(ngModel)]="newProduct.fitnessLevel"
                      name="fitnessLevel"
                      class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Level</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="all-levels">All Levels</option>
                    </select>
                  </div>
                </div>
              }

              @if (isPetCategory()) {
                <!-- Pets & Supplies Fields -->
                <div class="bg-pink-50 border border-pink-200 rounded-lg p-4 space-y-4">
                  <h3 class="font-semibold text-slate-900">Pet Product Details</h3>

                  <!-- Pet Type -->
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">Pet Type</label>
                    <select
                      [(ngModel)]="petData.petType"
                      name="petType"
                      class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Pet Type</option>
                      <option value="dog">Dog</option>
                      <option value="cat">Cat</option>
                      <option value="bird">Bird</option>
                      <option value="rabbit">Rabbit</option>
                      <option value="fish">Fish</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <!-- Suitable For -->
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">Suitable For (comma-separated)</label>
                    <input
                      type="text"
                      [(ngModel)]="petData.suitableFor"
                      name="suitableFor"
                      placeholder="e.g., small dogs, puppies, senior cats"
                      class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <!-- Brand -->
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">Brand</label>
                    <input
                      type="text"
                      [(ngModel)]="newProduct.brand"
                      name="brand"
                      placeholder="Product brand"
                      class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <!-- Organic -->
                  <div class="flex items-center">
                    <input
                      type="checkbox"
                      [(ngModel)]="petData.organic"
                      name="organic"
                      id="organic"
                      class="w-4 h-4 text-pink-600 rounded"
                    />
                    <label for="organic" class="ml-2 text-sm font-medium text-slate-700">Organic</label>
                  </div>
                </div>
              }

              <!-- Image Upload Section -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Product Images</label>
                <div class="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center bg-slate-50 hover:bg-slate-100 transition cursor-pointer"
                     (click)="imageInput.click()">
                  <input
                    #imageInput
                    type="file"
                    multiple
                    accept="image/*"
                    (change)="onImageSelected($event)"
                    style="display: none"
                  />
                  <mat-icon class="text-4xl text-slate-400 mb-2 block">image</mat-icon>
                  <p class="text-slate-700 font-medium">Click or drag images here</p>
                  <p class="text-slate-500 text-sm">Supported formats: JPG, PNG, GIF</p>
                </div>

                <!-- Thumbnail Preview -->
                @if (newProduct.thumbnail) {
                  <div class="mt-4">
                    <label class="block text-sm font-medium text-slate-700 mb-2">Thumbnail Preview</label>
                    <div class="relative inline-block">
                      <img
                        [src]="newProduct.thumbnail"
                        alt="Thumbnail"
                        class="w-32 h-32 object-cover rounded-lg border border-slate-300"
                      />
                      <button
                        type="button"
                        (click)="removeThumbnail()"
                        class="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 transform translate-x-2 -translate-y-2 hover:bg-red-600"
                      >
                        <mat-icon class="text-sm">close</mat-icon>
                      </button>
                    </div>
                  </div>
                }

                <!-- Uploaded Images List -->
                @if (newProduct.images && newProduct.images.length > 0) {
                  <div class="mt-4">
                    <label class="block text-sm font-medium text-slate-700 mb-2">Uploaded Images</label>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                      @for (image of newProduct.images; track image) {
                        <div class="relative group">
                          <img
                            [src]="image"
                            alt="Product image"
                            class="w-full h-24 object-cover rounded-lg border border-slate-300 group-hover:opacity-75 transition"
                          />
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

                <!-- Upload Progress -->
                @if (isUploadingImages()) {
                  <div class="mt-4">
                    <div class="flex items-center gap-3">
                      <div class="animate-spin">
                        <mat-icon class="text-blue-600">hourglass_empty</mat-icon>
                      </div>
                      <span class="text-slate-700">Uploading images...</span>
                    </div>
                  </div>
                }
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

  newProduct: Product = this.getEmptyProduct();
  private storeId: string = '';

  // Category-specific data objects
  furnitureData = {
    material: '',
    color: '',
    width: 0,
    height: 0,
    depth: 0,
    weight: 0,
    finish: ''
  };

  gymData = {
    specType: '',
    material: '',
    capacity: 0,
    resistance: '',
    targetMuscles: ''
  };

  petData = {
    petType: '',
    suitableFor: '',
    organic: false
  };

  constructor(
    private productService: ProductService,
    private imageUploadService: AngularFireUploadService
  ) {
    this.storeId = localStorage.getItem('storeId') || '';
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
    this.storeId = localStorage.getItem('storeId') || '';
    if (!this.storeId) {
      console.warn('Store ID not found in localStorage');
      this.errorMessage.set('Store ID not found. Please login again.');
      return;
    }
    this.loadProducts();
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
    let filtered = this.products();

    if (this.searchQuery?.trim()) {
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    if (this.selectedCategory?.trim()) {
      filtered = filtered.filter(p =>
        p.category?.toLowerCase().includes(this.selectedCategory.toLowerCase())
      );
    }

    filtered = filtered.filter(p => (p.price || 0) >= this.minPrice && (p.price || 0) <= this.maxPrice);

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

    // Reset category-specific data
    this.furnitureData = {
      material: '', color: '', width: 0, height: 0, depth: 0, weight: 0, finish: ''
    };
    this.gymData = {
      specType: '', material: '', capacity: 0, resistance: '', targetMuscles: ''
    };
    this.petData = {
      petType: '', suitableFor: '', organic: false
    };

    this.showProductModal.set(true);
  }

  editProduct(product: Product) {
    this.isEditing.set(true);
    this.newProduct = { ...product };

    // Load category-specific data
    if (this.isFurnitureCategory()) {
      this.furnitureData = {
        material: product.material?.join(', ') || '',
        color: product.color?.join(', ') || '',
        width: product.dimensions?.width || 0,
        height: product.dimensions?.height || 0,
        depth: product.dimensions?.depth || 0,
        weight: product.weight?.value || 0,
        finish: product.finish || ''
      };
    } else if (this.isGymEquipmentCategory()) {
      this.gymData = {
        specType: product.specifications?.type || '',
        material: product.specifications?.material?.join(', ') || '',
        capacity: product.specifications?.capacity?.value || 0,
        resistance: product.specifications?.resistance || '',
        targetMuscles: product.targetMuscles?.join(', ') || ''
      };
    } else if (this.isPetCategory()) {
      this.petData = {
        petType: product.petSpecification?.petType || '',
        suitableFor: product.petSpecification?.suitableFor?.join(', ') || '',
        organic: product.petSpecification?.organic || false
      };
    }

    this.showProductModal.set(true);
  }

  closeProductModal() {
    this.showProductModal.set(false);
    this.newProduct = this.getEmptyProduct();
    this.isEditing.set(false);
    this.validationError.set('');

    // Reset category-specific data
    this.furnitureData = {
      material: '', color: '', width: 0, height: 0, depth: 0, weight: 0, finish: ''
    };
    this.gymData = {
      specType: '', material: '', capacity: 0, resistance: '', targetMuscles: ''
    };
    this.petData = {
      petType: '', suitableFor: '', organic: false
    };
  }

  saveProduct() {
    // Clear previous validation errors
    this.validationError.set('');

    // Validate required fields
    if (!this.newProduct.name) {
      this.validationError.set('Product name is required');
      return;
    }
    if (!this.newProduct.category) {
      this.validationError.set('Please select a category');
      return;
    }
    if (!this.newProduct.price || this.newProduct.price <= 0) {
      this.validationError.set('Price must be greater than 0');
      return;
    }
    if (this.newProduct.stock === undefined || this.newProduct.stock < 0) {
      this.validationError.set('Stock quantity is required and must be non-negative');
      return;
    }

    // Update product with category-specific data
    this.updateProductWithCategoryData();

    // Ensure service and vendorType are set from localStorage
    const vendorType = this.getVendorType();
    this.newProduct.service = this.getServiceForVendorType(vendorType);
    this.newProduct.vendorType = vendorType;

    if (this.isEditing() && this.newProduct._id) {
      // Update existing product via API
      this.isLoading.set(true);
      this.productService.updateProduct(this.newProduct._id, this.newProduct as any).subscribe({
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
      this.productService.createProduct(this.newProduct as any).subscribe({
        next: (response: any) => {
          this.isLoading.set(false);
          if (response.success && response.data) {
            this.products.set([...this.products(), response.data]);
            this.successMessage.set('Product added successfully!');
            this.validationError.set('');
          } else {
            this.errorMessage.set('Failed to add product');
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
          this.errorMessage.set(error.error?.message || 'Failed to add product');
          console.error('Error adding product:', error);
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
      vendorType: this.getVendorType()
    };
  }

  /**
   * Handle image selection and upload
   */
  onImageSelected(event: any) {
    const files: File[] = Array.from(event.target.files || []);
    if (!files.length) return;

    this.isUploadingImages.set(true);

    // Upload images to Firebase Storage
    const uploadPath = `products/${this.newProduct._id || 'new'}`;

    this.imageUploadService.uploadMultipleImages(files, uploadPath).subscribe({
      next: (imageUrls: string[]) => {
        if (!this.newProduct.images) {
          this.newProduct.images = [];
        }

        // Add new images to existing ones
        this.newProduct.images = [...this.newProduct.images, ...imageUrls];

        // Set first image as thumbnail if not set
        if (!this.newProduct.thumbnail && imageUrls.length > 0) {
          this.newProduct.thumbnail = imageUrls[0];
        }

        this.isUploadingImages.set(false);
        this.successMessage.set(`${imageUrls.length} image(s) uploaded successfully!`);
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error: any) => {
        this.isUploadingImages.set(false);
        this.errorMessage.set('Failed to upload images. Please try again.');
        console.error('Image upload error:', error);
      }
    });
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
   * Detect category and populate specific form fields
   */
  isFurnitureCategory(): boolean {
    const cat = this.newProduct.category.toLowerCase();
    return cat.includes('living-room') || cat.includes('bedroom') || cat.includes('kitchen') ||
           cat.includes('office') || cat.includes('outdoor') || cat.includes('decor') || cat === 'furniture';
  }

  isGymEquipmentCategory(): boolean {
    const cat = this.newProduct.category.toLowerCase();
    return cat.includes('dumbbell') || cat.includes('cardio') || cat.includes('barbell') ||
           cat.includes('resistance') || cat.includes('bench') || cat.includes('rack') ||
           cat.includes('machine') || cat.includes('accessory') || cat === 'gym-equipment' || cat === 'gym equipment';
  }

  isPetCategory(): boolean {
    const cat = this.newProduct.category.toLowerCase();
    return cat.includes('dog') || cat.includes('cat') || cat.includes('pet') ||
           cat.includes('bird') || cat.includes('rabbit') || cat.includes('hamster') ||
           cat.includes('fish') || cat === 'pets' || cat === 'pet-supplies' || cat === 'pet supplies';
  }

  /**
   * Update product with category-specific data when saving
   */
  private updateProductWithCategoryData(): void {
    if (this.isFurnitureCategory()) {
      this.newProduct.material = this.furnitureData.material ? this.furnitureData.material.split(',').map(m => m.trim()) : [];
      this.newProduct.color = this.furnitureData.color ? this.furnitureData.color.split(',').map(c => c.trim()) : [];
      this.newProduct.finish = this.furnitureData.finish;
      this.newProduct.dimensions = {
        width: this.furnitureData.width,
        height: this.furnitureData.height,
        depth: this.furnitureData.depth,
        unit: 'cm'
      };
      this.newProduct.weight = {
        value: this.furnitureData.weight,
        unit: 'kg'
      };
    } else if (this.isGymEquipmentCategory()) {
      this.newProduct.specifications = {
        type: this.gymData.specType,
        material: this.gymData.material ? this.gymData.material.split(',').map(m => m.trim()) : [],
        weight: { value: 0, unit: 'kg' },
        dimensions: { width: 0, height: 0, depth: 0, unit: 'cm' },
        capacity: { value: this.gymData.capacity, unit: 'kg' },
        resistance: this.gymData.resistance,
        resistanceLevels: 0,
        color: [],
        warranty: { duration: 0, coverage: '' }
      };
      this.newProduct.targetMuscles = this.gymData.targetMuscles ? this.gymData.targetMuscles.split(',').map(m => m.trim()) : [];
    } else if (this.isPetCategory()) {
      this.newProduct.petSpecification = {
        petType: this.petData.petType,
        suitableFor: this.petData.suitableFor ? this.petData.suitableFor.split(',').map(s => s.trim()) : [],
        ageRange: { min: 0, max: 0, unit: 'months' },
        ingredients: [],
        nutritionalInfo: { protein: '', fat: '', fiber: '', moisture: '' },
        allergienFree: [],
        organic: this.petData.organic
      };
    }
  }
}
