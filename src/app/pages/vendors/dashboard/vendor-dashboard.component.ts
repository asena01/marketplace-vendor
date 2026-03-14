import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface VendorType {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  link: string;
}

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-8">
      <!-- Welcome Section -->
      <div class="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white shadow-lg">
        <h1 class="text-3xl font-bold mb-2">Vendor Dashboard</h1>
        <p class="text-primary-100">Select your vendor type to access specialized business management tools.</p>
      </div>

      <!-- Vendor Type Selection Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <a
          *ngFor="let vendor of vendorTypes"
          [routerLink]="vendor.link"
          class="group bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-all hover:scale-105 cursor-pointer border-l-4"
          [ngClass]="'border-' + vendor.color + '-500'"
        >
          <div class="flex items-start justify-between mb-4">
            <div
              class="w-12 h-12 rounded-lg flex items-center justify-center"
              [ngClass]="'bg-' + vendor.color + '-100'"
            >
              <svg [innerHTML]="getVendorIcon(vendor.id)" [ngClass]="'text-' + vendor.color + '-600'" class="w-6 h-6" />
            </div>
          </div>
          <h3 class="text-lg font-bold text-slate-900 mb-2">{{ vendor.name }}</h3>
          <p class="text-slate-600 text-sm mb-4">{{ vendor.description }}</p>
          <div class="flex items-center text-primary-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
            View Dashboard
            <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </a>
      </div>

      <!-- Quick Stats -->
      <div class="bg-white rounded-lg p-6 shadow-md">
        <h2 class="text-lg font-bold text-slate-900 mb-6">Platform Overview</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="text-center">
            <p class="text-3xl font-bold text-slate-900">5</p>
            <p class="text-slate-600 text-sm">Vendor Types</p>
          </div>
          <div class="text-center">
            <p class="text-3xl font-bold text-slate-900">1000+</p>
            <p class="text-slate-600 text-sm">Active Vendors</p>
          </div>
          <div class="text-center">
            <p class="text-3xl font-bold text-slate-900">$5.2M</p>
            <p class="text-slate-600 text-sm">Total Revenue</p>
          </div>
          <div class="text-center">
            <p class="text-3xl font-bold text-slate-900">98%</p>
            <p class="text-slate-600 text-sm">Uptime</p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class VendorDashboardComponent implements OnInit {
  vendorTypes: VendorType[] = [];

  ngOnInit() {
    this.vendorTypes = [
      {
        id: 'hotel',
        name: 'Hotel Management',
        description: 'Manage bookings, rooms, guests, and amenities for your hotel business.',
        icon: 'hotel',
        color: 'blue',
        link: '/hotel-dashboard',
      },
      {
        id: 'restaurant',
        name: 'Restaurant Management',
        description: 'Track orders, inventory, menus, and customer reservations.',
        icon: 'restaurant',
        color: 'orange',
        link: '/restaurant-dashboard',
      },
      {
        id: 'retail',
        name: 'Retail Management',
        description: 'Manage inventory, sales, and customer interactions in your store.',
        icon: 'retail',
        color: 'green',
        link: '/retail-dashboard',
      },
      {
        id: 'service',
        name: 'Service Provider',
        description: 'Schedule appointments, manage staff, and track service delivery.',
        icon: 'service',
        color: 'purple',
        link: '/service-dashboard',
      },
      {
        id: 'tours',
        name: 'Tours & Travel',
        description: 'Manage tour packages, bookings, guides, and itineraries.',
        icon: 'tours',
        color: 'pink',
        link: '/tours-dashboard',
      },
    ];
  }

  getVendorIcon(iconType: string): string {
    const icons: { [key: string]: string } = {
      hotel: `<path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2zm-3-9h-2v2h2v-2zm0-4h-2v2h2V8zm-6 0H8v2h2V8zm0 4H8v2h2v-2zm6-10h-1V3h-2v1H9V3H7v1H5a2 2 0 00-2 2v2h16V5a2 2 0 00-2-2z" fill="currentColor"/>`,
      restaurant: `<path d="M6.867 19h10.266c.427-1.066 1.734-2.174 2.867-2.174V2c-1.866 0-3 1.134-3 2.667V6c0 1.866-.733 3.5-2.667 3.5h-.4c-1.934 0-2.667-1.634-2.667-3.5V4.667C4 3.134 2.866 2 1 2v14.826c1.133 0 2.44 1.108 2.867 2.174zM0 20h20v1H0z" fill="currentColor"/>`,
      retail: `<path d="M7 4V3h10v1h3.9c.4 0 .7.3.7.8l1.1 13.4c.1.4-.1.8-.5.9H2.8c-.4-.1-.6-.5-.5-.9L3.4 4.8C3.5 4.3 3.8 4 4.2 4H7zm4.5 7c-1.4 0-2.5 1.1-2.5 2.5S10.1 16 11.5 16s2.5-1.1 2.5-2.5-1.1-2.5-2.5-2.5z" fill="currentColor"/>`,
      service: `<path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" fill="currentColor"/>`,
      tours: `<path d="M20.56 3.91l-2.08 2.05c-.78-.45-1.69-.7-2.66-.7-2.9 0-5.26 2.46-5.26 5.5 0 2.65 2.01 4.84 4.66 5.39V20h2.34v-4.85c2.65-.55 4.66-2.74 4.66-5.39 0-.98-.25-1.89-.7-2.68l2.05-2.07-2.01-2.05zM15.82 11.5c-1.35 0-2.45-1.14-2.45-2.55s1.1-2.55 2.45-2.55 2.45 1.14 2.45 2.55-1.1 2.55-2.45 2.55zM3 12.5h2v2H3z" fill="currentColor"/>`,
    };
    return icons[iconType] || '';
  }
}
