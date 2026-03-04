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
        }
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading service:', error);
        this.isLoading.set(false);
      }
    });
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
