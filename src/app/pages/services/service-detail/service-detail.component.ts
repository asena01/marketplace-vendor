import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header.component';
import { ServiceService, ServiceFeatures } from '../../../services/service.service';
import { ServiceBookingModalComponent } from '../../../components/service-booking-modal/service-booking-modal.component';

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [CommonModule, HeaderComponent, ServiceBookingModalComponent],
  templateUrl: './service-detail.component.html',
  styleUrl: './service-detail.component.css'
})
export class ServiceDetailComponent implements OnInit {
  service = signal<ServiceFeatures | null>(null);
  isLoading = signal(false);
  showBookingModal = signal(false);
  numberOfUnits = signal(1);

  constructor(
    private route: ActivatedRoute,
    private serviceService: ServiceService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.loadService(params['id']);
      }
    });
  }

  loadService(id: string): void {
    this.isLoading.set(true);
    this.serviceService.getServiceById(id).subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data) {
          const serviceData = response.data;
          const transformedService: ServiceFeatures = {
            ...serviceData,
            id: serviceData._id || serviceData.id
          };
          this.service.set(transformedService);
        } else {
          // Try to find in test data if API fails
          this.loadFromTestData(id);
        }
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading service from API:', error);
        // Try to find in test data
        this.loadFromTestData(id);
      }
    });
  }

  /**
   * Load service from test data (fallback)
   */
  private loadFromTestData(id: string): void {
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
        features: ['Professional Stylists', 'Premium Products', 'Same-day Booking', 'Experienced Team', 'Custom Designs'],
        certifications: ['Certified Hair Stylist', 'Color Specialist', 'Salon Management'],
        cancellationPolicy: 'Free cancellation up to 24 hours before appointment',
        refundPolicy: 'Full refund if unsatisfied with the service',
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
        features: ['Eco-friendly Products', 'Insured Team', 'Flexible Schedule', 'Deep Cleaning', 'Pet Friendly'],
        certifications: ['Green Cleaning Certified', 'OSHA Compliant', 'Bonded & Insured'],
        cancellationPolicy: 'Free cancellation up to 48 hours before service',
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
        features: ['24/7 Emergency Service', 'Licensed Plumbers', '1-Hour Response Time', 'All Repairs Guaranteed', 'Transparent Pricing'],
        certifications: ['Licensed Master Plumber', 'Bonded & Insured', '15+ Years Experience'],
        cancellationPolicy: 'Service call fee applies if cancelled after dispatch',
        refundPolicy: 'Satisfaction guaranteed or service credit',
        insuranceIncluded: true,
        isVerified: true,
        isActive: true
      }
    ];

    const foundService = testServices.find(s => s.id === id || s._id === id);
    if (foundService) {
      this.service.set(foundService);
      console.log('✅ Service loaded from test data:', foundService.name);
    } else {
      console.error('❌ Service not found in test data:', id);
    }
    this.isLoading.set(false);
  }

  bookNow(): void {
    this.showBookingModal.set(true);
  }

  closeBookingModal(): void {
    this.showBookingModal.set(false);
  }

  handlePaymentSuccess(bookingData: any): void {
    console.log('Booking successful:', bookingData);
    this.showBookingModal.set(false);
    // Show success message and redirect
    alert('Service booked successfully! Confirmation details have been sent to your email.');
  }
}
