import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header.component';
import { TourPaymentModalComponent } from '../../../components/tour-payment-modal/tour-payment-modal.component';
import { TourService, Tour } from '../../../services/tour.service';

@Component({
  selector: 'app-tour-detail',
  standalone: true,
  imports: [CommonModule, HeaderComponent, RouterLink, TourPaymentModalComponent],
  templateUrl: './tour-detail.component.html',
  styleUrl: './tour-detail.component.css'
})
export class TourDetailComponent implements OnInit {
  tour = signal<Tour | null>(null);
  isLoading = signal(false);
  showPaymentModal = signal(false);
  numberOfParticipants = signal(1);

  constructor(
    private route: ActivatedRoute,
    private tourService: TourService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: any) => {
      const tourId: string = params['id'];
      if (tourId) {
        this.loadTour(tourId);
      }
    });
  }

  loadTour(id: string): void {
    this.isLoading.set(true);
    this.tourService.getTourById(id).subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data) {
          // Transform API response
          const tour: any = {
            ...response.data,
            id: response.data._id || response.data.id,
            price: typeof response.data.price === 'number'
              ? `$${response.data.price}`
              : response.data.price,
            image: response.data.image || '🗺️'
          };
          this.tour.set(tour);
        } else {
          this.tour.set(null);
        }
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading tour:', error);
        this.tour.set(null);
        this.isLoading.set(false);
      }
    });
  }

  bookNow(): void {
    this.showPaymentModal.set(true);
  }

  closePaymentModal(): void {
    this.showPaymentModal.set(false);
  }

  handlePaymentSuccess(bookingData: any): void {
    console.log('Payment successful:', bookingData);
    // You can navigate to a booking confirmation page or show a message
  }
}
