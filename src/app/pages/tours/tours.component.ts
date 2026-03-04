import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { TourService, Tour } from '../../services/tour.service';
import { MARKETPLACE_SERVICES } from '../../shared/data/marketplace-data';

@Component({
  selector: 'app-tours',
  standalone: true,
  imports: [CommonModule, HeaderComponent, RouterLink],
  templateUrl: './tours.component.html',
  styleUrl: './tours.component.css'
})
export class ToursComponent implements OnInit {
  marketplaceService = MARKETPLACE_SERVICES.find(s => s.id === 'tours')!;

  tours = signal<Tour[]>([]);
  isLoading = signal(false);

  featuredTours = computed(() => this.tours());
  categories = this.marketplaceService.categories || [];

  constructor(private tourService: TourService) {}

  ngOnInit(): void {
    this.loadFeaturedTours();
  }

  loadFeaturedTours(): void {
    this.isLoading.set(true);
    this.tourService.getFeaturedTours(4).subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data?.length > 0) {
          // Transform API response to match component interface
          const transformedTours = response.data.map((tour: any) => ({
            ...tour,
            id: tour._id || tour.id,
            price: typeof tour.price === 'number' ? `$${tour.price}` : tour.price,
            image: tour.image || '🗺️'
          }));
          this.tours.set(transformedTours);
        } else {
          // Show empty state - no dummy data fallback
          this.tours.set([]);
        }
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading featured tours from API:', error);
        // Show empty state on error
        this.tours.set([]);
        this.isLoading.set(false);
      }
    });
  }

  scrollToTours(): void {
    setTimeout(() => {
      const toursSection = document.querySelector('[data-section="featured-tours"]');
      if (toursSection) {
        toursSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }
}
