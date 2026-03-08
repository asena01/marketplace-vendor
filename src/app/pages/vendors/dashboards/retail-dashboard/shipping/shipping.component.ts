import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

interface ShippingMethod {
  _id?: string;
  name: string;
  type: 'standard' | 'express' | 'overnight' | 'local_pickup';
  baseCost: number;
  estimatedDays: string;
  isActive: boolean;
  coverage: string[];
}

interface ShippingOrder {
  _id?: string;
  orderId: string;
  customerName: string;
  destination: string;
  shippingMethod: string;
  status: 'pending' | 'shipped' | 'in_transit' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  shippingCost: number;
  estimatedDelivery: string;
  actualDelivery?: string;
}

@Component({
  selector: 'app-retail-shipping',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="p-8 space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Shipping & Delivery</h1>
          <p class="text-slate-600 mt-1">Manage shipping methods and track deliveries</p>
        </div>
      </div>

      <!-- Info Message -->
      <div class="bg-blue-50 border border-blue-300 text-blue-700 px-6 py-4 rounded-lg">
        <p class="font-semibold flex items-center gap-2">
          <mat-icon class="text-lg">info</mat-icon>
          Use "Delivery Integrations" tab in the main menu to manage delivery services
        </p>
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 border-b border-slate-200">
        <button
          (click)="activeTab = 'methods'"
          [ngClass]="{'border-b-2 border-blue-600 text-blue-600 font-semibold': activeTab === 'methods'}"
          class="px-4 py-3 text-slate-600 hover:text-slate-900 transition flex items-center gap-2"
        >
          <mat-icon class="text-lg">local_shipping</mat-icon>
          <span>Shipping Methods</span>
        </button>
        <button
          (click)="activeTab = 'orders'"
          [ngClass]="{'border-b-2 border-blue-600 text-blue-600 font-semibold': activeTab === 'orders'}"
          class="px-4 py-3 text-slate-600 hover:text-slate-900 transition flex items-center gap-2"
        >
          <mat-icon class="text-lg">package</mat-icon>
          <span>Shipments</span>
        </button>
      </div>

      <!-- Shipping Methods Tab -->
      @if (activeTab === 'methods') {
        <div class="bg-white rounded-lg shadow-md p-12 text-center">
          <mat-icon class="text-slate-300 text-6xl block mx-auto mb-4">local_shipping</mat-icon>
          <p class="text-slate-600 font-semibold text-lg">No custom shipping methods</p>
          <p class="text-slate-500 text-sm mt-2">Configure delivery services through Delivery Integrations</p>
        </div>
      }

      <!-- Shipments Tab -->
      @if (activeTab === 'orders') {
        <div class="bg-white rounded-lg shadow-md p-12 text-center">
          <mat-icon class="text-slate-300 text-6xl block mx-auto mb-4">package</mat-icon>
          <p class="text-slate-600 font-semibold text-lg">No shipments yet</p>
          <p class="text-slate-500 text-sm mt-2">Shipments will appear here when you create orders with integrated delivery services</p>
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
export class RetailShippingComponent implements OnInit {
  activeTab: 'methods' | 'orders' = 'methods';

  ngOnInit(): void {}
}
