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
            image: response.data.image || response.data.icon || '🗺️'
          };
          this.tour.set(tour);
          console.log('✅ Tour loaded from API:', tour.name);
        } else {
          console.log('⚠️ API returned no data. Trying test data...');
          this.loadFromTestData(id);
        }
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('❌ Error loading tour from API:', error);
        console.log('📦 Loading from test data instead...');
        this.loadFromTestData(id);
      }
    });
  }

  /**
   * Load tour from test data (fallback)
   */
  private loadFromTestData(id: string): void {
    const testTours: Tour[] = [
      {
        id: 'tour-1',
        _id: 'tour-1',
        name: 'Machu Picchu Adventure',
        destination: 'Peru',
        price: 1299,
        duration: '5 days',
        difficulty: 'Moderate',
        groupSize: '2-12 people',
        highlights: ['Ancient ruins', 'Mountain views', 'Local culture', 'Sacred Valley'],
        includes: ['Accommodation', 'Guide', 'Meals', 'Transport'],
        image: '⛰️',
        rating: 4.9,
        reviews: 342,
        maxParticipants: 12,
        currentParticipants: 8,
        description: 'Experience the wonder of Machu Picchu with expert guides and comfortable accommodations. This 5-day adventure takes you through the heart of the Andes, visiting ancient ruins and experiencing authentic Peruvian culture.',
        operatorName: 'Adventure Peru Tours',
        operatorPhone: '+51-1-234-5678',
        operatorEmail: 'info@adventureperu.com',
        location: {
          city: 'Cusco',
          country: 'Peru',
          coordinates: { latitude: -13.1631, longitude: -72.5450 }
        },
        languages: ['English', 'Spanish'],
        amenities: ['WiFi', 'Meals', 'Transport', 'Insurance', 'Professional guides'],
        itinerary: [
          { day: 1, title: 'Arrival in Cusco', description: 'Arrive and acclimatize to altitude', activities: ['Hotel check-in', 'City orientation tour', 'Welcome dinner'] },
          { day: 2, title: 'Sacred Valley Tour', description: 'Explore traditional markets and villages', activities: ['Market visit', 'Local lunch', 'Textile workshops'] },
          { day: 3, title: 'Machu Picchu Day', description: 'Main event - visit the ancient ruins', activities: ['Train ride to Aguas Calientes', 'Guided tour of ruins', 'Sunset photography'] },
          { day: 4, title: 'Hiking & Culture', description: 'Alternative routes and local experiences', activities: ['Inca Trail hiking', 'Local community visit', 'Traditional ceremony'] },
          { day: 5, title: 'Return to Cusco', description: 'Travel back and farewell', activities: ['Train return journey', 'Farewell dinner', 'Departure'] }
        ]
      },
      {
        id: 'tour-2',
        _id: 'tour-2',
        name: 'Iceland Northern Lights',
        destination: 'Iceland',
        price: 1599,
        duration: '7 days',
        difficulty: 'Easy',
        groupSize: '4-10 people',
        highlights: ['Northern lights', 'Hot springs', 'Waterfalls', 'Glaciers'],
        includes: ['Accommodation', 'Guide', 'Breakfast', 'Vehicle rental'],
        image: '🌌',
        rating: 4.8,
        reviews: 289,
        maxParticipants: 10,
        currentParticipants: 6,
        description: 'Chase the magical northern lights across Iceland\'s stunning landscapes. This winter adventure combines comfort with nature, featuring luxury accommodations and expert guides who know where to find the aurora.',
        operatorName: 'Nordic Experience',
        operatorPhone: '+354-1-999-8888',
        operatorEmail: 'tours@nordicexp.is',
        location: {
          city: 'Reykjavik',
          country: 'Iceland',
          coordinates: { latitude: 64.1466, longitude: -21.9426 }
        },
        languages: ['English', 'Icelandic'],
        amenities: ['WiFi', 'Breakfast', '4x4 vehicle', 'Hot springs access', 'Professional photographers'],
        itinerary: [
          { day: 1, title: 'Arrival in Reykjavik', description: 'Settle into comfort', activities: ['Hotel check-in', 'Equipment fitting', 'Welcome briefing'] },
          { day: 2, title: 'Blue Lagoon Spa', description: 'Relax in geothermal waters', activities: ['Hot spring bath', 'Spa treatments', 'Evening light search'] }
        ]
      },
      {
        id: 'tour-3',
        _id: 'tour-3',
        name: 'Tokyo Cultural Experience',
        destination: 'Japan',
        price: 1899,
        duration: '6 days',
        difficulty: 'Easy',
        groupSize: '3-8 people',
        highlights: ['Temples', 'Traditional tea ceremony', 'Street food', 'Anime culture'],
        includes: ['Accommodation', 'Meals', 'JR Pass', 'Guide'],
        image: '🗾',
        rating: 4.7,
        reviews: 156,
        maxParticipants: 8,
        currentParticipants: 5,
        description: 'Immerse yourself in Tokyo\'s blend of ancient traditions and modern culture. From serene temples to neon-lit streets, experience the full spectrum of Japan\'s capital city.',
        operatorName: 'Japan Wanderers',
        operatorPhone: '+81-3-1234-5678',
        operatorEmail: 'hello@japanwanders.jp',
        location: {
          city: 'Tokyo',
          country: 'Japan',
          coordinates: { latitude: 35.6762, longitude: 139.6503 }
        },
        languages: ['English', 'Japanese'],
        amenities: ['WiFi', 'Meals', 'JR Pass', 'Translation services', 'Cultural guides']
      },
      {
        id: 'tour-4',
        _id: 'tour-4',
        name: 'Dubai Luxury Escape',
        destination: 'UAE',
        price: 999,
        duration: '4 days',
        difficulty: 'Easy',
        groupSize: '2-6 people',
        highlights: ['Shopping', 'Desert safari', 'Skyscraper views', 'Beaches'],
        includes: ['5-star hotel', 'Meals', 'Transport', 'Excursions'],
        image: '🏙️',
        rating: 4.6,
        reviews: 412,
        maxParticipants: 6,
        currentParticipants: 4,
        description: 'Experience luxury and adventure in the heart of the Emirates. From world-class shopping to desert safaris, Dubai offers something for everyone.',
        operatorName: 'Dubai Elite Tours',
        operatorPhone: '+971-4-000-1111',
        operatorEmail: 'book@dubaielixtours.ae',
        location: {
          city: 'Dubai',
          country: 'UAE',
          coordinates: { latitude: 25.2048, longitude: 55.2708 }
        },
        languages: ['English', 'Arabic'],
        amenities: ['5-star accommodation', 'All meals', 'Luxury transport', 'VIP access']
      },
      {
        id: 'tour-5',
        _id: 'tour-5',
        name: 'Thai Island Hopping',
        destination: 'Thailand',
        price: 899,
        duration: '5 days',
        difficulty: 'Easy',
        groupSize: '4-15 people',
        highlights: ['Tropical beaches', 'Snorkeling', 'Island villages', 'Sunset cruise'],
        includes: ['Accommodation', 'Meals', 'Boat tours', 'Snorkeling gear'],
        image: '🏝️',
        rating: 4.8,
        reviews: 523,
        maxParticipants: 15,
        currentParticipants: 11,
        description: 'Island-hop through Thailand\'s stunning archipelago with crystal-clear waters. Perfect for relaxation and adventure combined.',
        operatorName: 'Southeast Asia Adventures',
        operatorPhone: '+66-2-123-4567',
        operatorEmail: 'info@seaadventures.th',
        location: {
          city: 'Phuket',
          country: 'Thailand',
          coordinates: { latitude: 7.8804, longitude: 98.3923 }
        },
        languages: ['English', 'Thai'],
        amenities: ['Beach resort', 'All meals', 'Boat tours', 'Water sports', 'Snorkeling equipment']
      },
      {
        id: 'tour-6',
        _id: 'tour-6',
        name: 'Patagonia Hiking Expedition',
        destination: 'Argentina',
        price: 2299,
        duration: '8 days',
        difficulty: 'Hard',
        groupSize: '2-8 people',
        highlights: ['Mountain peaks', 'Glaciers', 'Pristine wilderness', 'Wildlife'],
        includes: ['Camping', 'All meals', 'Equipment', 'Expert guide'],
        image: '🏔️',
        rating: 4.9,
        reviews: 187,
        maxParticipants: 8,
        currentParticipants: 6,
        description: 'Challenge yourself with world-class hiking through Patagonia\'s untouched landscapes. For experienced hikers seeking adventure.',
        operatorName: 'Patagonia Quest',
        operatorPhone: '+54-2902-491234',
        operatorEmail: 'expeditions@patagoniaquest.ar',
        location: {
          city: 'El Chalten',
          country: 'Argentina',
          coordinates: { latitude: -49.3314, longitude: -72.8853 }
        },
        languages: ['English', 'Spanish'],
        amenities: ['Camping', 'Expert guides', 'Equipment provided', 'Insurance included', 'Professional photographers']
      }
    ];

    const foundTour = testTours.find(t => t.id === id || t._id === id);
    if (foundTour) {
      this.tour.set(foundTour);
      console.log('✅ Tour loaded from test data:', foundTour.name);
    } else {
      console.error('❌ Tour not found in test data:', id);
      this.tour.set(null);
    }
    this.isLoading.set(false);
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
