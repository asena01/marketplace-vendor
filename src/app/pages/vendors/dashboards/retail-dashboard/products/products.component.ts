import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../../../services/product.service';

interface Product {
  _id?: string;
  name: string;
  category: string;
  description: string;
  price: number;
  originalPrice: number;
  sku?: string;
  stock: number;
  images?: string[];
  thumbnail?: string;
  rating?: number;
  sold?: number;
  discount?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  createdAt?: string;
}

@Component({
  selector: 'app-retail-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
        >
          ➕ Add Product
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
                    <td class="px-6 py-4 space-x-2">
                      <button
                        (click)="editProduct(product)"
                        class="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        Edit
                      </button>
                      <button
                        (click)="deleteProduct(product._id)"
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
      @if (showProductModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h2 class="text-2xl font-bold text-slate-900 mb-6">
              {{ isEditing() ? 'Edit Product' : 'Add New Product' }}
            </h2>

            <form (ngSubmit)="saveProduct()" class="space-y-6">
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

                <!-- Category -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Category *</label>
                  <input
                    type="text"
                    [(ngModel)]="newProduct.category"
                    name="category"
                    placeholder="e.g., Clothing"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
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
  products = signal<Product[]>([]);
  filteredProducts = signal<Product[]>([]);
  showProductModal = signal(false);
  isEditing = signal(false);
  searchQuery = signal('');
  selectedCategory = signal('');
  minPrice: number = 0;
  maxPrice: number = 9999;
  successMessage = signal('');
  errorMessage = signal('');
  isLoading = signal(false);

  newProduct: Product = this.getEmptyProduct();

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading.set(true);
    this.productService.getProducts().subscribe({
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

    if (this.searchQuery()) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(this.searchQuery().toLowerCase()) ||
        p.description.toLowerCase().includes(this.searchQuery().toLowerCase())
      );
    }

    if (this.selectedCategory()) {
      filtered = filtered.filter(p =>
        p.category.toLowerCase().includes(this.selectedCategory().toLowerCase())
      );
    }

    filtered = filtered.filter(p => p.price >= this.minPrice && p.price <= this.maxPrice);

    this.filteredProducts.set(filtered);
  }

  countInStock(): number {
    return this.products().filter(p => p.stock > 0).length;
  }

  countOutOfStock(): number {
    return this.products().filter(p => p.stock === 0).length;
  }

  countFeatured(): number {
    return this.products().filter(p => p.isFeatured).length;
  }

  getTotalInventoryValue(): number {
    return this.products().reduce((sum, p) => sum + (p.price * p.stock), 0);
  }

  openAddProductModal() {
    this.isEditing.set(false);
    this.newProduct = this.getEmptyProduct();
    this.showProductModal.set(true);
  }

  editProduct(product: Product) {
    this.isEditing.set(true);
    this.newProduct = { ...product };
    this.showProductModal.set(true);
  }

  closeProductModal() {
    this.showProductModal.set(false);
    this.newProduct = this.getEmptyProduct();
    this.isEditing.set(false);
  }

  saveProduct() {
    if (!this.newProduct.name || !this.newProduct.category || !this.newProduct.price || this.newProduct.stock === undefined) {
      this.errorMessage.set('Please fill in all required fields');
      setTimeout(() => this.errorMessage.set(''), 3000);
      return;
    }

    if (this.isEditing() && this.newProduct._id) {
      // Update existing product via API
      this.isLoading.set(true);
      this.productService.updateProduct(this.newProduct._id, this.newProduct).subscribe({
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
      this.productService.createProduct(this.newProduct).subscribe({
        next: (response: any) => {
          this.isLoading.set(false);
          if (response.success && response.data) {
            this.products.set([...this.products(), response.data]);
            this.successMessage.set('Product added successfully!');
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
      isActive: true
    };
  }
}
