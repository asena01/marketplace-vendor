import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin, catchError, of } from 'rxjs';
import { HeaderComponent } from '../../components/header/header.component';
import { ServiceService, ServiceFeatures } from '../../services/service.service';
import { VendorService, VendorProfile } from '../../services/vendor.service';
import { ReviewService } from '../../services/review.service';
import { MARKETPLACE_SERVICES } from '../../shared/data/marketplace-data';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, RouterLink],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent implements OnInit {
  servicesService = MARKETPLACE_SERVICES.find(s => s.id === 'services')!;
  categories = this.servicesService.categories || [];

  // Core service data
  services = signal<ServiceFeatures[]>([]);
  enrichedServices = signal<any[]>([]);
  isLoading = signal(false);

  // Filters
  selectedCategory = signal<string>('');
  searchQuery = signal<string>('');
  selectedCity = signal<string>('');
  minPrice = signal<number>(0);
  maxPrice = signal<number>(10000);
  selectedSort = signal<'rating' | 'price-low' | 'price-high' | 'newest'>('rating');

  // Pagination
  currentPage = signal(1);
  pageSize = signal(12);
  totalServices = signal(0);

  // Computed values
  filteredAndSortedServices = computed(() => {
    let result = [...this.enrichedServices()];

    // Sort
    switch (this.selectedSort()) {
      case 'price-low':
        result.sort((a, b) => (a.basePrice || 0) - (b.basePrice || 0));
        break;
      case 'price-high':
        result.sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0));
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }

    return result;
  });

  paginatedServices = computed(() => {
    const all = this.filteredAndSortedServices();
    const start = (this.currentPage() - 1) * this.pageSize();
    return all.slice(start, start + this.pageSize());
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredAndSortedServices().length / this.pageSize());
  });

  uniqueCities = computed(() => {
    const cities = new Set<string>();
    this.services().forEach(s => {
      if (s.location?.city) cities.add(s.location.city);
    });
    return Array.from(cities).sort();
  });

  constructor(
    private serviceService: ServiceService,
    private vendorService: VendorService,
    private reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    this.loadAllServices();
  }

  /**
   * Load all services with pagination
   */
  loadAllServices(page: number = 1): void {
    this.isLoading.set(true);
    this.currentPage.set(page);

    const filters: any = {};
    if (this.selectedCategory()) {
      filters.category = this.selectedCategory();
    }
    if (this.selectedCity()) {
      filters.city = this.selectedCity();
    }
    if (this.minPrice()) {
      filters.minPrice = this.minPrice();
    }
    if (this.maxPrice()) {
      filters.maxPrice = this.maxPrice();
    }

    this.serviceService.getAllServices(page, this.pageSize(), filters).subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data?.length > 0) {
          const transformed = response.data.map((service: any) => ({
            ...service,
            id: service._id || service.id
          }));
          this.services.set(transformed);
          this.totalServices.set(response.pagination?.total || transformed.length);
          this.enrichServicesWithVendorAndReviewData(transformed);
        } else {
          console.log('📦 No services from API, loading test data...');
          this.loadTestServices();
        }
      },
      error: (error: any) => {
        console.error('Error loading services:', error);
        console.log('📦 Error loading from API, loading test data...');
        this.loadTestServices();
      }
    });
  }

  /**
   * Load test services for UI testing
   */
  private loadTestServices(): void {
    const testServices: ServiceFeatures[] = [
      {
        id: 'svc-1',
        _id: 'svc-1',
        name: 'Professional Hair Styling',
        description: 'Expert hair cutting, coloring, and styling services for all hair types',
        category: 'Beauty & Hair',
        icon: '💇',
        serviceProvider: 'vendor-1',
        providerName: 'Beauty Studio Pro',
        providerPhone: '+1-555-0101',
        providerEmail: 'info@beautystudio.com',
        basePrice: 45,
        pricePerUnit: 15,
        priceUnit: 'hour',
        duration: '1-2 hours',
        serviceArea: 'Downtown & Suburbs',
        location: {
          city: 'New York',
          area: 'Manhattan',
          zipCode: '10001',
          country: 'USA'
        },
        rating: 4.8,
        reviews: 156,
        features: ['Professional Stylists', 'Premium Products', 'Same-day Booking'],
        certifications: ['Certified Hair Stylist', 'Color Specialist'],
        cancellationPolicy: 'Free cancellation up to 24 hours',
        refundPolicy: 'Full refund if unsatisfied',
        insuranceIncluded: true,
        isVerified: true,
        isActive: true
      },
      {
        id: 'svc-2',
        _id: 'svc-2',
        name: 'Home Cleaning Service',
        description: 'Thorough home cleaning with eco-friendly products and professional team',
        category: 'Cleaning',
        icon: '🧹',
        serviceProvider: 'vendor-2',
        providerName: 'Clean & Shine',
        providerPhone: '+1-555-0102',
        providerEmail: 'service@cleanshine.com',
        basePrice: 80,
        pricePerUnit: 25,
        priceUnit: 'hour',
        duration: '2-3 hours',
        serviceArea: 'City-wide',
        location: {
          city: 'Los Angeles',
          area: 'West LA',
          zipCode: '90001',
          country: 'USA'
        },
        rating: 4.7,
        reviews: 234,
        features: ['Eco-friendly', 'Insured Team', 'Flexible Schedule'],
        certifications: ['Green Cleaning Certified'],
        cancellationPolicy: 'Free cancellation up to 48 hours',
        refundPolicy: 'Full refund for unsatisfactory work',
        insuranceIncluded: true,
        isVerified: true,
        isActive: true
      },
      {
        id: 'svc-3',
        _id: 'svc-3',
        name: 'Plumbing Repairs',
        description: 'Emergency and routine plumbing services with fast response time',
        category: 'Home Repair',
        icon: '🔧',
        serviceProvider: 'vendor-3',
        providerName: 'Pro Plumbers',
        providerPhone: '+1-555-0103',
        providerEmail: 'emergency@proplumbers.com',
        basePrice: 120,
        pricePerUnit: 60,
        priceUnit: 'hour',
        duration: '1-2 hours',
        serviceArea: 'Metropolitan Area',
        location: {
          city: 'Chicago',
          area: 'Downtown',
          zipCode: '60601',
          country: 'USA'
        },
        rating: 4.9,
        reviews: 189,
        features: ['24/7 Emergency', 'Licensed Plumbers', '1-Hour Response'],
        certifications: ['Licensed Master Plumber', 'Bonded & Insured'],
        cancellationPolicy: 'Service call fee if cancelled after dispatch',
        refundPolicy: 'Satisfaction guaranteed or service credit',
        insuranceIncluded: true,
        isVerified: true,
        isActive: true
      }
    ];

    this.services.set(testServices);
    this.enrichedServices.set(testServices);
    this.totalServices.set(testServices.length);
    this.isLoading.set(false);
    console.log('✅ Test services loaded:', testServices.length);
  }

  /**
   * Enrich services with vendor profile and review data
   */
  private enrichServicesWithVendorAndReviewData(services: ServiceFeatures[]): void {
    if (!services.length) {
      this.enrichedServices.set([]);
      this.isLoading.set(false);
      return;
    }

    // Create requests for vendor profiles and reviews for each service
    const enrichmentRequests = services.map((service) => {
      const vendorRequest = service.serviceProvider
        ? this.vendorService.getVendorProfile(service.serviceProvider)
        : null;

      const reviewRequest = service.id
        ? this.reviewService.getProductRating(service.id)
        : null;

      return { service, vendorRequest, reviewRequest };
    });

    // Collect all parallel requests
    const allRequests = enrichmentRequests
      .filter(r => r.vendorRequest && r.reviewRequest)
      .map(r => forkJoin({
        vendor: r.vendorRequest!,
        reviews: r.reviewRequest!
      }).pipe(
        // Catch errors for individual requests
        catchError(error => {
          console.warn('Error enriching service:', error);
          return of(null);
        })
      ));

    if (allRequests.length === 0) {
      this.enrichedServices.set(services);
      this.isLoading.set(false);
      return;
    }

    // Execute all parallel requests
    forkJoin(allRequests).subscribe({
      next: (enrichedData: any[]) => {
        const enriched = services.map((service, index) => {
          const enrichment = enrichedData[index];
          return {
            ...service,
            vendorProfile: enrichment?.vendor?.data || null,
            reviewStats: enrichment?.reviews?.data || { rating: service.rating, reviewCount: service.reviews },
            vendorVerified: enrichment?.vendor?.data?.isVerified || false,
            vendorRating: enrichment?.vendor?.data?.stats?.averageRating || service.rating,
            vendorReviews: enrichment?.vendor?.data?.stats?.totalReviews || service.reviews
          };
        });
        this.enrichedServices.set(enriched);
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error enriching services:', error);
        // Fallback to services without enrichment
        this.enrichedServices.set(services);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Filter by category
   */
  filterByCategory(categoryId: string): void {
    this.selectedCategory.set(categoryId);
    this.currentPage.set(1);
    this.loadAllServices();
  }

  /**
   * Filter by city
   */
  filterByCity(city: string): void {
    this.selectedCity.set(city);
    this.currentPage.set(1);
    this.loadAllServices();
  }

  /**
   * Filter by price range
   */
  updatePriceRange(min: number, max: number): void {
    this.minPrice.set(min);
    this.maxPrice.set(max);
    this.currentPage.set(1);
    this.loadAllServices();
  }

  /**
   * Search services
   */
  searchServices(): void {
    const query = this.searchQuery();
    this.currentPage.set(1);

    if (query.trim()) {
      this.isLoading.set(true);
      const category = this.selectedCategory() || undefined;
      const minPrice = this.minPrice() || undefined;
      const maxPrice = this.maxPrice() || undefined;

      this.serviceService.searchServices(query, category, minPrice, maxPrice).subscribe({
        next: (response: any) => {
          if (response.status === 'success' && response.data?.length > 0) {
            const transformed = response.data.map((service: any) => ({
              ...service,
              id: service._id || service.id
            }));
            this.services.set(transformed);
            this.enrichServicesWithVendorAndReviewData(transformed);
          } else {
            this.services.set([]);
            this.enrichedServices.set([]);
            this.isLoading.set(false);
          }
        },
        error: (error: any) => {
          console.error('Error searching services:', error);
          this.services.set([]);
          this.enrichedServices.set([]);
          this.isLoading.set(false);
        }
      });
    } else {
      this.loadAllServices();
    }
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.selectedCategory.set('');
    this.selectedCity.set('');
    this.searchQuery.set('');
    this.minPrice.set(0);
    this.maxPrice.set(10000);
    this.currentPage.set(1);
    this.loadAllServices();
  }

  /**
   * Go to specific page
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.loadAllServices(page);
    }
  }

  /**
   * Get rating color class
   */
  getRatingColor(rating: number): string {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-blue-600';
    if (rating >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  }
}
