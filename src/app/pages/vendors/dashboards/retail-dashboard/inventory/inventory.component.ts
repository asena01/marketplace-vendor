import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ProductService } from '../../../../../services/product.service';

interface InventoryItem {
  _id?: string;
  name: string;
  sku?: string;
  category: string;
  price: number;
  stock: number;
  reorderLevel?: number;
  lastRestockDate?: string;
  supplier?: string;
}

@Component({
  selector: 'app-retail-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="p-8 space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Inventory Management</h1>
          <p class="text-slate-600 mt-1">Monitor stock levels and manage inventory</p>
        </div>
        <button
          (click)="exportInventory()"
          class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition flex items-center gap-2"
        >
          <mat-icon class="text-lg">download</mat-icon>
          <span>Export</span>
        </button>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="bg-blue-50 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg">
          <p class="font-semibold flex items-center gap-2">
            <mat-icon class="text-lg animate-spin">refresh</mat-icon>
            Loading inventory data...
          </p>
        </div>
      }

      <!-- Error State -->
      @if (errorMessage()) {
        <div class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <mat-icon class="text-lg">error</mat-icon>
          <p class="font-semibold">{{ errorMessage() }}</p>
        </div>
      }

      <!-- Inventory Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-green-500">
          <p class="text-slate-600 text-sm font-medium">Total Items</p>
          <p class="text-2xl font-bold text-slate-900">{{ inventoryItems().length }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-red-500">
          <p class="text-slate-600 text-sm font-medium">Low Stock</p>
          <p class="text-2xl font-bold text-red-600">{{ lowStockCount() }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-orange-500">
          <p class="text-slate-600 text-sm font-medium">Out of Stock</p>
          <p class="text-2xl font-bold text-orange-600">{{ outOfStockCount() }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-blue-500">
          <p class="text-slate-600 text-sm font-medium">Total Value</p>
          <p class="text-2xl font-bold text-blue-600"><span>$</span>{{ totalValue() }}</p>
        </div>
      </div>

      <!-- Search & Filter -->
      <div class="bg-white rounded-lg p-6 shadow-md space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Search</label>
            <input
              type="text"
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event); filterInventory()"
              placeholder="Search by name or SKU..."
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Category</label>
            <input
              type="text"
              [ngModel]="filterCategory"
              (ngModelChange)="filterCategory = $event; filterInventory()"
              placeholder="Filter by category..."
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Stock Status</label>
            <select
              [ngModel]="filterStatus"
              (ngModelChange)="filterStatus = $event; filterInventory()"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Items</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
              <option value="in">In Stock</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Inventory Table -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-100 border-b border-slate-200">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Product Name</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">SKU</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Category</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Price</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Stock Level</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Total Value</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              @if (filteredInventory().length === 0) {
                <tr>
                  <td colspan="8" class="px-6 py-8 text-center text-slate-600">
                    No inventory items found
                  </td>
                </tr>
              } @else {
                @for (item of filteredInventory(); track item._id) {
                  <tr class="border-b border-slate-200 hover:bg-slate-50 transition">
                    <td class="px-6 py-4 font-medium text-slate-900">{{ item.name }}</td>
                    <td class="px-6 py-4 text-slate-600 text-sm">{{ item.sku || '-' }}</td>
                    <td class="px-6 py-4 text-slate-600">{{ item.category }}</td>
                    <td class="px-6 py-4 font-medium text-slate-900"><span>$</span>{{ item.price.toFixed(2) }}</td>
                    <td class="px-6 py-4">
                      <span
                        [ngClass]="{
                          'text-emerald-600 font-semibold': item.stock > 20,
                          'text-orange-600 font-semibold': item.stock > 0 && item.stock <= 20,
                          'text-red-600 font-semibold': item.stock === 0
                        }"
                      >
                        {{ item.stock }} units
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <span
                        [ngClass]="{
                          'bg-emerald-100 text-emerald-700': item.stock > 20,
                          'bg-orange-100 text-orange-700': item.stock > 0 && item.stock <= 20,
                          'bg-red-100 text-red-700': item.stock === 0
                        }"
                        class="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit"
                      >
                        @if (item.stock > 20) {
                          <mat-icon class="text-xs">check_circle</mat-icon>
                          <span>In Stock</span>
                        } @else if (item.stock > 0) {
                          <mat-icon class="text-xs">warning</mat-icon>
                          <span>Low Stock</span>
                        } @else {
                          <mat-icon class="text-xs">error</mat-icon>
                          <span>Out of Stock</span>
                        }
                      </span>
                    </td>
                    <td class="px-6 py-4 font-medium text-slate-900"><span>$</span>{{ (item.price * item.stock) }}</td>
                    <td class="px-6 py-4 space-x-2 flex items-center">
                      <button
                        (click)="updateStock(item)"
                        class="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 transition"
                        title="Update stock"
                      >
                        <mat-icon class="text-base">edit</mat-icon>
                        <span>Update</span>
                      </button>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Low Stock Alert -->
      @if (lowStockItems().length > 0) {
        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
          <div class="flex gap-3 mb-4">
            <mat-icon class="text-yellow-600 text-2xl">warning</mat-icon>
            <div>
              <h3 class="font-bold text-slate-900">Low Stock Alert</h3>
              <p class="text-slate-600 text-sm">{{ lowStockItems().length }} items are running low</p>
            </div>
          </div>
          <div class="space-y-2">
            @for (item of lowStockItems(); track item._id) {
              <div class="flex justify-between items-center bg-white p-3 rounded">
                <div>
                  <p class="font-medium text-slate-900">{{ item.name }}</p>
                  <p class="text-sm text-slate-600">{{ item.stock }} units remaining</p>
                </div>
                <button
                  (click)="updateStock(item)"
                  class="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm font-medium transition flex items-center gap-1"
                >
                  <mat-icon class="text-sm">add</mat-icon>
                  <span>Restock</span>
                </button>
              </div>
            }
          </div>
        </div>
      }

      <!-- Update Stock Modal -->
      @if (showUpdateModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 class="text-2xl font-bold text-slate-900 mb-6">Update Stock</h2>
            @if (selectedItem()) {
              <form (ngSubmit)="saveStockUpdate()" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Product</label>
                  <input
                    type="text"
                    [value]="selectedItem()?.name"
                    disabled
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-600"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Current Stock</label>
                  <input
                    type="number"
                    [ngModel]="currentStockValue"
                    (ngModelChange)="currentStockValue = $event"
                    name="stock"
                    placeholder="Enter new stock quantity"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div class="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    (click)="closeUpdateModal()"
                    class="px-6 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                  >
                    Update Stock
                  </button>
                </div>
              </form>
            }
          </div>
        </div>
      }

      <!-- Messages -->
      @if (successMessage()) {
        <div class="fixed bottom-4 right-4 bg-emerald-100 border border-emerald-400 text-emerald-700 px-6 py-4 rounded-lg shadow-lg flex items-center gap-2">
          <mat-icon class="text-lg">check_circle</mat-icon>
          <span>{{ successMessage() }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class RetailInventoryComponent implements OnInit {
  inventoryItems = signal<InventoryItem[]>([]);
  filteredInventory = signal<InventoryItem[]>([]);
  searchQuery = signal('');
  filterCategory = '';
  filterStatus = '';
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  showUpdateModal = signal(false);
  selectedItem = signal<InventoryItem | null>(null);
  currentStockValue: number = 0;

  // Computed signals
  lowStockCount = computed(() =>
    this.inventoryItems().filter(item => (item?.stock || 0) > 0 && (item?.stock || 0) <= 20).length
  );
  outOfStockCount = computed(() =>
    this.inventoryItems().filter(item => (item?.stock || 0) === 0).length
  );
  totalValue = computed(() =>
    this.inventoryItems().reduce((sum, item) => sum + ((item?.price || 0) * (item?.stock || 0)), 0).toLocaleString()
  );
  lowStockItems = computed(() =>
    this.inventoryItems().filter(item => (item?.stock || 0) > 0 && (item?.stock || 0) <= 20).slice(0, 5)
  );

  private storeId: string = '';

  constructor(private productService: ProductService) {
    this.storeId = localStorage.getItem('storeId') || '';
  }

  ngOnInit(): void {
    if (!this.storeId) {
      this.errorMessage.set('Store ID not found. Please login again.');
      return;
    }
    this.loadInventory();
  }

  loadInventory(): void {
    this.isLoading.set(true);
    this.productService.getVendorProducts(this.storeId, 1, 100).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.inventoryItems.set(response.data);
          this.filterInventory();
        } else {
          this.inventoryItems.set([]);
        }
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading inventory:', error);
        this.errorMessage.set('Failed to load inventory data');
        this.isLoading.set(false);
      }
    });
  }

  filterInventory(): void {
    let filtered = this.inventoryItems();

    if (this.searchQuery()?.trim()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(item =>
        item?.name?.toLowerCase().includes(query) ||
        (item?.sku && item.sku.toLowerCase().includes(query))
      );
    }

    if (this.filterCategory?.trim()) {
      filtered = filtered.filter(item =>
        item?.category?.toLowerCase().includes(this.filterCategory.toLowerCase())
      );
    }

    if (this.filterStatus === 'low') {
      filtered = filtered.filter(item => (item?.stock || 0) > 0 && (item?.stock || 0) <= 20);
    } else if (this.filterStatus === 'out') {
      filtered = filtered.filter(item => (item?.stock || 0) === 0);
    } else if (this.filterStatus === 'in') {
      filtered = filtered.filter(item => (item?.stock || 0) > 20);
    }

    this.filteredInventory.set(filtered);
  }

  updateStock(item: InventoryItem): void {
    this.selectedItem.set(item);
    this.currentStockValue = item.stock;
    this.showUpdateModal.set(true);
  }

  closeUpdateModal(): void {
    this.showUpdateModal.set(false);
    this.selectedItem.set(null);
    this.currentStockValue = 0;
  }

  saveStockUpdate(): void {
    const item = this.selectedItem();
    if (!item || !item._id) return;

    this.isLoading.set(true);
    this.productService.updateProduct(item._id, { stock: this.currentStockValue }).subscribe({
      next: (response: any) => {
        if (response.success) {
          const index = this.inventoryItems().findIndex(p => p._id === item._id);
          if (index !== -1) {
            const updated = [...this.inventoryItems()];
            updated[index] = { ...updated[index], stock: this.currentStockValue };
            this.inventoryItems.set(updated);
            this.filterInventory();
          }
          this.successMessage.set('Stock updated successfully!');
          setTimeout(() => this.successMessage.set(''), 3000);
          this.closeUpdateModal();
        }
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error updating stock:', error);
        this.errorMessage.set('Failed to update stock');
        this.isLoading.set(false);
      }
    });
  }

  exportInventory(): void {
    const csv = this.generateCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private generateCSV(): string {
    const headers = ['Product Name', 'SKU', 'Category', 'Price', 'Stock Level', 'Total Value'];
    const rows = this.inventoryItems().map(item => [
      item?.name || '',
      item?.sku || '',
      item?.category || '',
      item?.price || 0,
      item?.stock || 0,
      ((item?.price || 0) * (item?.stock || 0))
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  }
}
