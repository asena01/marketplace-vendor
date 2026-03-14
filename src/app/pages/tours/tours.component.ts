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
    this.tourService.getFeaturedTours(12).subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data?.length > 0) {
          // Transform API response to match component interface
          const transformedTours = response.data.map((tour: any) => ({
            ...tour,
            id: tour._id || tour.id,
            image: tour.image || tour.icon || '🗺️'
          }));
          this.tours.set(transformedTours);
          console.log('✅ Featured tours loaded from API:', transformedTours.length);
        } else {
          console.log('⚠️ API returned no data. Loading test tours...');
          this.loadTestTours();
        }
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('❌ Error loading featured tours from API:', error);
        console.log('📦 Loading test tours instead...');
        this.loadTestTours();
      }
    });
  }

  /**
   * Load sample test tours for UI testing
   */
  private loadTestTours(): void {
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
        description: 'Experience the wonder of Machu Picchu with expert guides and comfortable accommodations',
        operatorName: 'Adventure Peru Tours',
        operatorPhone: '+51-1-234-5678',
        operatorEmail: 'info@adventureperu.com',
        location: {
          city: 'Cusco',
          country: 'Peru',
          coordinates: { latitude: -13.1631, longitude: -72.5450 }
        },
        languages: ['English', 'Spanish'],
        amenities: ['WiFi', 'Meals', 'Transport', 'Insurance'],
        itinerary: [
          { day: 1, title: 'Arrival in Cusco', description: 'Arrive and acclimatize', activities: ['Hotel check-in', 'City tour'] },
          { day: 2, title: 'Sacred Valley', description: 'Explore local markets', activities: ['Market visit', 'Local lunch'] },
          { day: 3, title: 'Machu Picchu Day', description: 'Visit the ruins', activities: ['Train ride', 'Guided tour', 'Photography'] }
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
        description: 'Chase the magical northern lights across Iceland\'s stunning landscapes',
        operatorName: 'Nordic Experience',
        operatorPhone: '+354-1-999-8888',
        operatorEmail: 'tours@nordicexp.is',
        location: {
          city: 'Reykjavik',
          country: 'Iceland',
          coordinates: { latitude: 64.1466, longitude: -21.9426 }
        },
        languages: ['English', 'Icelandic'],
        amenities: ['WiFi', 'Breakfast', '4x4 vehicle', 'Hot springs access'],
        itinerary: [
          { day: 1, title: 'Arrival', description: 'Settle in to base camp', activities: ['Hotel tour', 'Equipment prep'] },
          { day: 2, title: 'Blue Lagoon', description: 'Relax in geothermal waters', activities: ['Hot spring bath', 'Spa time'] }
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
        description: 'Immerse yourself in Tokyo\'s blend of ancient traditions and modern culture',
        operatorName: 'Japan Wanderers',
        operatorPhone: '+81-3-1234-5678',
        operatorEmail: 'hello@japanwanders.jp',
        location: {
          city: 'Tokyo',
          country: 'Japan',
          coordinates: { latitude: 35.6762, longitude: 139.6503 }
        },
        languages: ['English', 'Japanese'],
        amenities: ['WiFi', 'Meals', 'JR Pass', 'Translation services']
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
        description: 'Experience luxury and adventure in the heart of the Emirates',
        operatorName: 'Dubai Elite Tours',
        operatorPhone: '+971-4-000-1111',
        operatorEmail: 'book@dubaielijour.ae',
        location: {
          city: 'Dubai',
          country: 'UAE',
          coordinates: { latitude: 25.2048, longitude: 55.2708 }
        },
        languages: ['English', 'Arabic'],
        amenities: ['5-star accommodation', 'All meals', 'Luxury transport']
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
        description: 'Island-hop through Thailand\'s stunning archipelago with crystal-clear waters',
        operatorName: 'Southeast Asia Adventures',
        operatorPhone: '+66-2-123-4567',
        operatorEmail: 'info@seaadventures.th',
        location: {
          city: 'Phuket',
          country: 'Thailand',
          coordinates: { latitude: 7.8804, longitude: 98.3923 }
        },
        languages: ['English', 'Thai'],
        amenities: ['Beach resort', 'All meals', 'Boat tours', 'Water sports']
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
        description: 'Challenge yourself with world-class hiking through Patagonia\'s untouched landscapes',
        operatorName: 'Patagonia Quest',
        operatorPhone: '+54-2902-491234',
        operatorEmail: 'expeditions@patagoniaquest.ar',
        location: {
          city: 'El Chalten',
          country: 'Argentina',
          coordinates: { latitude: -49.3314, longitude: -72.8853 }
        },
        languages: ['English', 'Spanish'],
        amenities: ['Camping', 'Expert guides', 'Equipment provided', 'Insurance included']
      }
    ];

    this.tours.set(testTours);
    console.log('✅ Test tours loaded:', testTours.length);
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
