import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { ServiceService, ServiceFeatures } from '../../services/service.service';
import { MARKETPLACE_SERVICES } from '../../shared/data/marketplace-data';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, HeaderComponent, RouterLink],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent implements OnInit {
  servicesService = MARKETPLACE_SERVICES.find(s => s.id === 'services')!;
  categories = this.servicesService.categories || [];

  services = signal<ServiceFeatures[]>([]);
  isLoading = signal(false);
  selectedCategory = signal<string>('');
  searchQuery = signal<string>('');

  featuredServices = computed(() => this.services());

  constructor(private serviceService: ServiceService) {}

  ngOnInit(): void {
    this.loadFeaturedServices();
  }

  loadFeaturedServices(): void {
    this.isLoading.set(true);
    this.serviceService.getFeaturedServices(6).subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data?.length > 0) {
          const transformedServices = response.data.map((service: any) => ({
            ...service,
            id: service._id || service.id,
            price: service.basePrice ? `$${service.basePrice}` : 'Contact for price'
          }));
          this.services.set(transformedServices);
        } else {
          this.services.set([]);
        }
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading featured services from API:', error);
        this.services.set([]);
        this.isLoading.set(false);
      }
    });
  }

  filterByCategory(categoryId: string): void {
    this.selectedCategory.set(categoryId);
    if (categoryId) {
      this.serviceService.getServicesByCategory(categoryId).subscribe({
        next: (response: any) => {
          if (response.status === 'success' && response.data) {
            const transformedServices = response.data.map((service: any) => ({
              ...service,
              id: service._id || service.id
            }));
            this.services.set(transformedServices);
          }
        },
        error: (error: any) => {
          console.error('Error filtering services:', error);
        }
      });
    } else {
      this.loadFeaturedServices();
    }
  }

  searchServices(): void {
    const query = this.searchQuery();
    if (query.trim()) {
      this.serviceService.searchServices(query).subscribe({
        next: (response: any) => {
          if (response.status === 'success' && response.data) {
            const transformedServices = response.data.map((service: any) => ({
              ...service,
              id: service._id || service.id
            }));
            this.services.set(transformedServices);
          }
        },
        error: (error: any) => {
          console.error('Error searching services:', error);
        }
      });
    } else {
      this.loadFeaturedServices();
    }
  }
}
