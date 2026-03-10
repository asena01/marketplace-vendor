import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { LoginOverlayComponent } from '../../components/auth-overlay/login-overlay.component';
import { SignupOverlayComponent } from '../../components/auth-overlay/signup-overlay.component';
import { AuthModalService } from '../../services/auth-modal.service';
import { MARKETPLACE_SERVICES } from '../../shared/data/marketplace-data';
import { Service } from '../../shared/models/marketplace.model';

interface TrendingItem {
  id: number;
  name: string;
  price: string;
  icon: string; // updated from 'image' to 'icon' for Material Icons
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, LoginOverlayComponent, SignupOverlayComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  services: Service[] = MARKETPLACE_SERVICES;

  constructor(public authModalService: AuthModalService) {}

  // Main services (Services and Delivery)
  mainServices = [
    this.services.find(s => s.id === 'services'),
    // this.services.find(s => s.id === 'delivery')
  ].filter(s => s !== undefined) as Service[];

  // Specialized services (all other services)
  specializedServices = this.services.filter(s => s.id !== 'services' && s.id !== 'delivery');

  // Trending products with Material Icons
  trendingProducts: TrendingItem[] = [
    { id: 1, name: 'Wireless Headphones', price: '$49.99', icon: 'headphones' },
    { id: 2, name: 'Smart Watch', price: '$199.99', icon: 'watch' },
    { id: 3, name: 'Phone Case', price: '$12.99', icon: 'phone_iphone' },
    { id: 4, name: 'USB-C Cable', price: '$9.99', icon: 'usb' },
  ];

  popularLocations = [
    { name: 'New York', count: '2,450+ listings' },
    { name: 'Los Angeles', count: '1,890+ listings' },
    { name: 'Chicago', count: '1,240+ listings' },
    { name: 'Houston', count: '980+ listings' },
  ];

  getAllCategories() {
    const allCategories: any[] = [];
    this.services.forEach(service => {
      if (service.categories) {
        allCategories.push(...service.categories);
      }
    });

    // Ensure each category has a default Material Icon
    return allCategories.slice(0, 12).map(cat => ({
      ...cat,
      icon: cat.icon || 'category'
    }));
  }

  getCategoryRoute(category: any): any {
    const categoryToServiceMap: { [key: string]: string } = {
      'adult-wear': '/shopping',
      'children-wear': '/shopping',
      'jewelry': '/shopping',
      'supermarket': '/shopping',
      'hotels': '/hotels',
      'apartments': '/hotels',
      'rooms': '/hotels',
      'restaurants': '/food',
      'fast-food': '/food',
      'groceries': '/food',
      'health-beauty': '/services',
      'car-rental': '/services',
      'events': '/services',
      'marketplace': '/services',
      'tours': '/tours',
      'boat-cruise': '/tours',
      'activities': '/tours',
    };

    const route = categoryToServiceMap[category.id] || '/shopping';
    return [route, { queryParams: { category: category.id } }];
  }
}