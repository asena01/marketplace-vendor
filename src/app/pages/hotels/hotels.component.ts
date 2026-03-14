import { Component, OnInit, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from '../../components/header/header.component';
import { MARKETPLACE_SERVICES } from '../../shared/data/marketplace-data';
import { CurrencyService } from '../../services/currency.service';
import { PaymentService } from '../../services/payment.service';
import { HotelService } from '../../services/hotel.service';
import { apiConfig } from '../../config/api-config';

interface Room {
  id: string;
  type: string;
  bedType: string;
  capacity: number;
  price: number;
  originalPrice: number;
  amenities: string[];
  maxGuests: number;
  rating: number;
  reviews: number;
  icon: string;
}

interface GroupedRoom {
  type: string;
  rooms: Room[];
  availableCount: number;
}

interface Hotel {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  icon?: string;
  type: string;
  price: number;
  rooms: Room[];
  amenities: string[];
  images: Array<{ url: string; thumbnail: string; alt: string }> | string[]; // API images or fallback emojis
  discount?: number;
  description?: string;
  imageUrl?: string;
  thumbnail?: string;
}

interface Booking {
  hotelId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  roomCount: number;
  totalPrice: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

interface FilterOptions {
  priceRange: [number, number];
  minRating: number;
  selectedAmenities: string[];
  selectedPropertyTypes: string[];
}

@Component({
  selector: 'app-hotels',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FormsModule, HttpClientModule],
  templateUrl: './hotels.component.html',
  styleUrl: './hotels.component.css'
})
export class HotelsComponent implements OnInit {
  hotelsService = MARKETPLACE_SERVICES.find(s => s.id === 'hotels')!;
  categories = this.hotelsService.categories || [];

  // Search & Filter Signals
  searchLocation = signal<string>('');
  checkInDate = signal<string>('');
  checkOutDate = signal<string>('');
  guests = signal<number>(1);
  rooms = signal<number>(1);
  showFilterSidebar = signal<boolean>(false);

  // Loading states
  isLoadingHotels = signal<boolean>(false);
  hotelError = signal<string>('');
  
  // Filter Signals
  priceRange = signal<[number, number]>([0, 1000]);
  minRating = signal<number>(0);
  selectedAmenities = signal<string[]>([]);
  selectedPropertyTypes = signal<string[]>([]);
  
  // Hotel List & State
  hotels = signal<Hotel[]>([]);
  expandedHotelIds = signal<Set<string>>(new Set());
  favorites = signal<Set<string>>(new Set());
  
  // Carousel State
  carouselIndices = signal<Map<string, number>>(new Map());
  
  // Booking Modal Signals
  showBookingForm = signal<boolean>(false);
  selectedHotel = signal<Hotel | null>(null);
  selectedRoom = signal<Room | null>(null);
  isLoadingBooking = signal<boolean>(false);
  bookingSuccess = signal<boolean>(false);
  bookingError = signal<string>('');
  
  // Booking form signals
  customerName = signal<string>('');
  customerEmail = signal<string>('');
  customerPhone = signal<string>('');
  specialRequests = signal<string>('');

  // Payment Signals
  selectedPaymentMethod = signal<string>('');
  isProcessingPayment = signal<boolean>(false);
  paymentError = signal<string>('');
  paymentSuccess = signal<boolean>(false);
  transactionId = signal<string>('');

  // Card Payment
  cardNumber = signal<string>('');
  cardholderName = signal<string>('');
  expiryMonth = signal<string>('');
  expiryYear = signal<string>('');
  cvv = signal<string>('');

  // Bank Transfer
  bankName = signal<string>('');
  accountNumber = signal<string>('');
  accountName = signal<string>('');
  bankCode = signal<string>('');

  // Mobile Money
  mobileMoneyProvider = signal<string>('');
  mobileMoneyPhone = signal<string>('');

  // Digital Wallet
  walletId = signal<string>('');

  // Review Modal
  showReviewModal = signal<boolean>(false);
  selectedHotelForReview = signal<Hotel | null>(null);
  reviewRating = signal<number>(0);
  reviewText = signal<string>('');
  
  // Pagination
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(6);

  // Computed values
  filteredHotels = computed(() => {
    let filtered = [...this.hotels()];
    
    // Price filter
    const [minPrice, maxPrice] = this.priceRange();
    filtered = filtered.filter(h => h.price >= minPrice && h.price <= maxPrice);
    
    // Rating filter
    filtered = filtered.filter(h => h.rating >= this.minRating());
    
    // Amenities filter
    const selectedAmenities = this.selectedAmenities();
    if (selectedAmenities.length > 0) {
      filtered = filtered.filter(h =>
        selectedAmenities.some(a => h.amenities.includes(a))
      );
    }
    
    // Property type filter
    const selectedTypes = this.selectedPropertyTypes();
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(h => selectedTypes.includes(h.type));
    }
    
    return filtered;
  });

  paginatedHotels = computed(() => {
    const filtered = this.filteredHotels();
    const page = this.currentPage();
    const perPage = this.itemsPerPage();
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredHotels().length / this.itemsPerPage());
  });

  uniqueAmenities = computed(() => {
    const amenities = new Set<string>();
    this.hotels().forEach(h => {
      h.amenities.forEach(a => amenities.add(a));
    });
    return Array.from(amenities).sort();
  });

  uniquePropertyTypes = computed(() => {
    const types = new Set<string>();
    this.hotels().forEach(h => types.add(h.type));
    return Array.from(types).sort();
  });

  maxPrice = computed(() => {
    const prices = this.hotels().map(h => h.price);
    return Math.max(...prices, 1000);
  });

  Math = Math; // Expose Math to template

  constructor(
    public currencyService: CurrencyService,
    public paymentService: PaymentService,
    private hotelService: HotelService
  ) {
    // Prevent body scroll when modal is open
    effect(() => {
      const isBooking = this.showBookingForm();
      const isReview = this.showReviewModal();
      if (isBooking || isReview) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }
    });

    // Auto-rotate carousel images
    effect(() => {
      const interval = setInterval(() => {
        this.hotels().forEach(hotel => {
          if (hotel.images && Array.isArray(hotel.images) && hotel.images.length > 1) {
            const currentIndex = this.getCarouselIndex(hotel.id);
            const nextIndex = (currentIndex + 1) % hotel.images.length;
            this.setCarouselIndex(hotel.id, nextIndex);
          }
        });
      }, 5000); // Auto-rotate every 5 seconds

      return () => clearInterval(interval);
    });
  }

  ngOnInit(): void {
    this.loadHotelsFromAPI();
  }

  loadHotelsFromAPI(): void {
    this.isLoadingHotels.set(true);
    this.hotelError.set('');

    console.log('🔄 Loading hotels from API...');

    // Load from API
    this.hotelService.getPublicHotels(1, 50).subscribe({
      next: (apiResponse) => {
        console.log('📡 API Response received:', apiResponse);
        if (apiResponse.data && apiResponse.data.length > 0) {
          console.log('✅ API returned', apiResponse.data.length, 'hotels');
          // Process API response and convert images
          const apiHotels: Hotel[] = apiResponse.data.map((hotel: any) => ({
            id: hotel._id || hotel.id,
            name: hotel.name,
            location: hotel.location || hotel.address || '',
            rating: hotel.rating || 4.0,
            reviews: hotel.reviews || hotel.reviewCount || 0,
            icon: hotel.icon || 'hotel',
            type: hotel.type || hotel.hotelType || 'Hotels',
            price: hotel.basePrice || hotel.price || 0,
            discount: hotel.discount || 0,
            amenities: hotel.amenities || [],
            description: hotel.description || '',
            imageUrl: hotel.imageUrl || hotel.image || '',
            thumbnail: hotel.thumbnail || '',
            // Convert image URLs to array
            images: hotel.images && hotel.images.length > 0
              ? hotel.images.map((img: any) => typeof img === 'string'
                  ? { url: img, thumbnail: hotel.thumbnail || img, alt: hotel.name }
                  : img)
              : [],
            rooms: hotel.rooms && hotel.rooms.length > 0
              ? hotel.rooms.map((room: any) => ({
                  id: room._id || room.id,
                  type: room.type || room.roomType || 'Standard Room',
                  bedType: room.bedType || 'Double',
                  capacity: room.capacity || room.maxGuests || 2,
                  price: room.price || 0,
                  originalPrice: room.originalPrice || room.price || 0,
                  maxGuests: room.maxGuests || room.capacity || 2,
                  amenities: room.amenities || [],
                  rating: room.rating || 4.0,
                  reviews: room.reviews || room.reviewCount || 0,
                  icon: room.icon || 'bed'
                }))
              : []
          }));

          console.log('✅ DISPLAYING HOTELS FROM API:', apiHotels);
          this.hotels.set(apiHotels);
        } else {
          console.log('⚠️ API returned no data. Loading test hotels...');
          this.loadTestHotels();
        }
        this.isLoadingHotels.set(false);
      },
      error: (error) => {
        console.error('❌ API CALL FAILED:', error);
        console.log('📦 Loading test hotels instead...');
        this.loadTestHotels();
      }
    });
  }

  /**
   * Load sample test hotels for UI testing
   */
  private loadTestHotels(): void {
    const testHotels: Hotel[] = [
      {
        id: 'hotel-1',
        name: 'Luxury Grand Palace',
        location: 'Downtown Manhattan, New York',
        rating: 4.9,
        reviews: 342,
        icon: '🏛️',
        type: 'Luxury Hotels',
        price: 350,
        discount: 10,
        amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Spa', 'Parking'],
        description: 'Experience ultimate luxury with world-class amenities and impeccable service',
        images: ['🏛️', '🛏️', '🏊', '🍽️'],
        rooms: [
          {
            id: 'room-1-1',
            type: 'Deluxe Room',
            bedType: 'King Size',
            capacity: 2,
            price: 350,
            originalPrice: 389,
            maxGuests: 2,
            amenities: ['AC', 'TV', 'WiFi', 'Mini Bar'],
            rating: 4.9,
            reviews: 156,
            icon: '🛏️'
          },
          {
            id: 'room-1-2',
            type: 'Suite',
            bedType: 'King Size',
            capacity: 4,
            price: 550,
            originalPrice: 610,
            maxGuests: 4,
            amenities: ['AC', 'Jacuzzi', 'WiFi', 'Living Area'],
            rating: 4.9,
            reviews: 89,
            icon: '🛏️'
          },
          {
            id: 'room-1-3',
            type: 'Presidential Suite',
            bedType: 'Multiple Kings',
            capacity: 6,
            price: 1200,
            originalPrice: 1330,
            maxGuests: 6,
            amenities: ['AC', 'Jacuzzi', 'WiFi', 'Dining Room', 'Private Pool'],
            rating: 5.0,
            reviews: 34,
            icon: '👑'
          }
        ]
      },
      {
        id: 'hotel-2',
        name: 'Beachside Paradise Resort',
        location: 'Miami Beach, Florida',
        rating: 4.7,
        reviews: 287,
        icon: '🏖️',
        type: 'Beach Resorts',
        price: 250,
        discount: 15,
        amenities: ['WiFi', 'Beach Access', 'Water Sports', 'Restaurant', 'Bar', 'Parking'],
        description: 'Relax by pristine beaches with all-inclusive amenities and stunning ocean views',
        images: ['🏖️', '🌊', '🏄', '🍹'],
        rooms: [
          {
            id: 'room-2-1',
            type: 'Ocean View Room',
            bedType: 'Queen Size',
            capacity: 2,
            price: 250,
            originalPrice: 294,
            maxGuests: 2,
            amenities: ['AC', 'TV', 'WiFi', 'Balcony'],
            rating: 4.7,
            reviews: 134,
            icon: '🌅'
          },
          {
            id: 'room-2-2',
            type: 'Beachfront Villa',
            bedType: 'King Size',
            capacity: 4,
            price: 450,
            originalPrice: 529,
            maxGuests: 4,
            amenities: ['AC', 'Outdoor Shower', 'WiFi', 'Private Beach'],
            rating: 4.8,
            reviews: 92,
            icon: '🏝️'
          }
        ]
      },
      {
        id: 'hotel-3',
        name: 'Mountain Retreat Lodge',
        location: 'Aspen, Colorado',
        rating: 4.8,
        reviews: 215,
        icon: '🏔️',
        type: 'Mountain Lodges',
        price: 280,
        discount: 0,
        amenities: ['WiFi', 'Fireplace', 'Spa', 'Hiking Trails', 'Restaurant', 'Parking'],
        description: 'Escape to pristine mountain peaks with cozy lodges and natural hot springs',
        images: ['🏔️', '❄️', '🔥', '🥾'],
        rooms: [
          {
            id: 'room-3-1',
            type: 'Cozy Mountain Room',
            bedType: 'Queen Size',
            capacity: 2,
            price: 280,
            originalPrice: 280,
            maxGuests: 2,
            amenities: ['Fireplace', 'WiFi', 'Mountain View', 'Heating'],
            rating: 4.8,
            reviews: 78,
            icon: '🔥'
          },
          {
            id: 'room-3-2',
            type: 'Mountain Suite',
            bedType: 'King Size',
            capacity: 4,
            price: 480,
            originalPrice: 480,
            maxGuests: 4,
            amenities: ['Fireplace', 'Hot Tub', 'WiFi', 'Kitchenette'],
            rating: 4.9,
            reviews: 56,
            icon: '🌲'
          }
        ]
      },
      {
        id: 'hotel-4',
        name: 'Urban Boutique Hotel',
        location: 'Brooklyn, New York',
        rating: 4.6,
        reviews: 198,
        icon: '🏙️',
        type: 'Boutique Hotels',
        price: 180,
        discount: 20,
        amenities: ['WiFi', 'Rooftop Bar', 'Gym', 'Restaurant', 'Parking'],
        description: 'Modern design meets urban convenience in the heart of the city',
        images: ['🏙️', '🍷', '💪', '🍽️'],
        rooms: [
          {
            id: 'room-4-1',
            type: 'Standard Room',
            bedType: 'Double',
            capacity: 2,
            price: 180,
            originalPrice: 225,
            maxGuests: 2,
            amenities: ['AC', 'TV', 'WiFi', 'Desk'],
            rating: 4.6,
            reviews: 102,
            icon: '📱'
          },
          {
            id: 'room-4-2',
            type: 'Premium Room',
            bedType: 'King Size',
            capacity: 3,
            price: 320,
            originalPrice: 400,
            maxGuests: 3,
            amenities: ['AC', 'Smart TV', 'WiFi', 'Work Area'],
            rating: 4.7,
            reviews: 67,
            icon: '💻'
          }
        ]
      },
      {
        id: 'hotel-5',
        name: 'City Center Inn',
        location: 'Chicago, Illinois',
        rating: 4.5,
        reviews: 167,
        icon: '🏢',
        type: 'Business Hotels',
        price: 150,
        discount: 25,
        amenities: ['WiFi', 'Business Center', 'Gym', 'Café', 'Meeting Rooms'],
        description: 'Perfect for business travelers with modern facilities and excellent connectivity',
        images: ['🏢', '💼', '📞', '☕'],
        rooms: [
          {
            id: 'room-5-1',
            type: 'Business Room',
            bedType: 'Queen Size',
            capacity: 1,
            price: 150,
            originalPrice: 200,
            maxGuests: 1,
            amenities: ['AC', 'Work Desk', 'WiFi', 'Phone'],
            rating: 4.5,
            reviews: 89,
            icon: '💼'
          },
          {
            id: 'room-5-2',
            type: 'Executive Room',
            bedType: 'King Size',
            capacity: 2,
            price: 280,
            originalPrice: 373,
            maxGuests: 2,
            amenities: ['AC', 'Executive Desk', 'WiFi', 'Lounge Access'],
            rating: 4.6,
            reviews: 78,
            icon: '👔'
          }
        ]
      },
      {
        id: 'hotel-6',
        name: 'Tropical Paradise Island',
        location: 'Maldives',
        rating: 4.9,
        reviews: 512,
        icon: '🏝️',
        type: 'Island Resorts',
        price: 800,
        discount: 5,
        amenities: ['All-Inclusive', 'Water Sports', 'Snorkeling', 'Overwater Bungalows', 'Restaurant', 'Spa'],
        description: 'Ultimate tropical escape with overwater bungalows and pristine reefs',
        images: ['🏝️', '🤿', '🐠', '🌴'],
        rooms: [
          {
            id: 'room-6-1',
            type: 'Beach Bungalow',
            bedType: 'King Size',
            capacity: 2,
            price: 800,
            originalPrice: 842,
            maxGuests: 2,
            amenities: ['AC', 'Private Beach', 'Outdoor Shower', 'WiFi'],
            rating: 4.9,
            reviews: 234,
            icon: '🌴'
          },
          {
            id: 'room-6-2',
            type: 'Overwater Bungalow',
            bedType: 'King Size',
            capacity: 2,
            price: 1200,
            originalPrice: 1260,
            maxGuests: 2,
            amenities: ['AC', 'Glass Floor', 'Private Deck', 'WiFi'],
            rating: 5.0,
            reviews: 278,
            icon: '💎'
          }
        ]
      }
    ];

    this.hotels.set(testHotels);
    console.log('✅ Test hotels loaded:', testHotels.length);
  }

  search(): void {
    if (!this.checkInDate() || !this.checkOutDate() || !this.searchLocation()) {
      alert('Please fill in all search fields');
      return;
    }

    // Reset pagination on new search
    this.currentPage.set(1);

    const location = this.searchLocation().toLowerCase();

    console.log('🔍 Searching hotels with filters:', {
      location,
      checkIn: this.checkInDate(),
      checkOut: this.checkOutDate(),
      guests: this.guests(),
      priceRange: this.priceRange(),
      minRating: this.minRating(),
      amenities: this.selectedAmenities(),
      propertyTypes: this.selectedPropertyTypes()
    });

    // Filter dummy data based on search criteria
    const searchResults = this.hotels().filter((hotel) => {
      // Location filter - case insensitive substring match
      const locationMatch = hotel.location.toLowerCase().includes(location);

      // Price filter
      const priceMatch = hotel.price >= this.priceRange()[0] && hotel.price <= this.priceRange()[1];

      // Rating filter
      const ratingMatch = hotel.rating >= this.minRating();

      // Amenities filter - at least one amenity must match if amenities selected
      const amenitiesMatch = this.selectedAmenities().length === 0 ||
        this.selectedAmenities().some(a => hotel.amenities.includes(a));

      // Property type filter
      const typeMatch = this.selectedPropertyTypes().length === 0 ||
        this.selectedPropertyTypes().includes(hotel.type);

      return locationMatch && priceMatch && ratingMatch && amenitiesMatch && typeMatch;
    });

    if (searchResults.length > 0) {
      console.log('✅ Found', searchResults.length, 'hotels matching search');
      this.hotelError.set('');
    } else {
      this.hotelError.set('No hotels found matching your search criteria. Try adjusting your filters.');
      console.log('⚠️ No hotels found for search');
    }

    // Note: The filtered hotels are already applied via computed filteredHotels()
    // which uses the filter signals, so the display updates automatically

    setTimeout(() => {
      document.getElementById('featured-hotels')?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  }

  toggleExpanded(hotelId: string): void {
    const expanded = new Set(this.expandedHotelIds());
    if (expanded.has(hotelId)) {
      expanded.delete(hotelId);
    } else {
      expanded.add(hotelId);
    }
    this.expandedHotelIds.set(expanded);
  }

  isExpanded(hotelId: string): boolean {
    return this.expandedHotelIds().has(hotelId);
  }

  toggleFavorite(hotelId: string): void {
    const favs = new Set(this.favorites());
    if (favs.has(hotelId)) {
      favs.delete(hotelId);
    } else {
      favs.add(hotelId);
    }
    this.favorites.set(favs);
  }

  isFavorite(hotelId: string): boolean {
    return this.favorites().has(hotelId);
  }

  getGroupedRooms(hotel: Hotel): GroupedRoom[] {
    const grouped = new Map<string, Room[]>();
    
    hotel.rooms.forEach(room => {
      if (!grouped.has(room.type)) {
        grouped.set(room.type, []);
      }
      grouped.get(room.type)!.push(room);
    });

    return Array.from(grouped.entries()).map(([type, rooms]) => ({
      type,
      rooms,
      availableCount: rooms.length
    }));
  }

  getCarouselIndex(hotelId: string): number {
    return this.carouselIndices().get(hotelId) || 0;
  }

  setCarouselIndex(hotelId: string, index: number): void {
    const newIndices = new Map(this.carouselIndices());
    newIndices.set(hotelId, index);
    this.carouselIndices.set(newIndices);
  }

  previousImage(hotelId: string): void {
    const currentIndex = this.getCarouselIndex(hotelId);
    const hotel = this.hotels().find(h => h.id === hotelId);
    if (hotel && hotel.images && Array.isArray(hotel.images) && hotel.images.length > 0) {
      const prevIndex = (currentIndex - 1 + hotel.images.length) % hotel.images.length;
      this.setCarouselIndex(hotelId, prevIndex);
    }
  }

  nextImage(hotelId: string): void {
    const currentIndex = this.getCarouselIndex(hotelId);
    const hotel = this.hotels().find(h => h.id === hotelId);
    if (hotel && hotel.images && Array.isArray(hotel.images) && hotel.images.length > 0) {
      const nextIndex = (currentIndex + 1) % hotel.images.length;
      this.setCarouselIndex(hotelId, nextIndex);
    }
  }

  getCurrentImage(hotel: Hotel): string {
    const index = this.getCarouselIndex(hotel.id);
    if (!hotel.images || hotel.images.length === 0) {
      return hotel.icon || '🏨';
    }

    const currentImage = hotel.images[index];
    // If it's an object with URL (from API)
    if (typeof currentImage === 'object' && 'url' in currentImage) {
      return currentImage.url;
    }
    // If it's a string (emoji or URL)
    return currentImage as string;
  }

  selectRoom(room: Room, hotel: Hotel): void {
    this.selectedHotel.set(hotel);
    this.selectedRoom.set(room);
    this.showBookingForm.set(true);
  }

  closeBooking(): void {
    this.showBookingForm.set(false);
    this.selectedHotel.set(null);
    this.selectedRoom.set(null);
    this.resetBookingForm();
  }

  calculateStayDays(): number {
    if (!this.checkInDate() || !this.checkOutDate()) return 0;
    const checkIn = new Date(this.checkInDate());
    const checkOut = new Date(this.checkOutDate());
    const days = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(1, days);
  }

  calculateTotalPrice(): number {
    if (!this.selectedRoom()) return 0;
    const stayDays = this.calculateStayDays();
    const roomCount = this.rooms();
    return this.selectedRoom()!.price * stayDays * roomCount;
  }

  submitBooking(): void {
    if (!this.customerName() || !this.customerEmail() || !this.customerPhone()) {
      this.bookingError.set('Please fill in all required fields');
      return;
    }

    if (!this.selectedHotel() || !this.selectedRoom()) {
      this.bookingError.set('Please select a room');
      return;
    }

    this.isLoadingBooking.set(true);
    this.bookingError.set('');

    const booking: Booking = {
      hotelId: this.selectedHotel()!.id,
      roomId: this.selectedRoom()!.id,
      checkIn: this.checkInDate(),
      checkOut: this.checkOutDate(),
      guests: this.guests(),
      roomCount: this.rooms(),
      totalPrice: this.calculateTotalPrice(),
      customerName: this.customerName(),
      customerEmail: this.customerEmail(),
      customerPhone: this.customerPhone()
    };

    setTimeout(() => {
      console.log('Booking submitted:', booking);
      this.bookingSuccess.set(true);

      setTimeout(() => {
        alert(`✅ Booking Confirmed!\n\nHotel: ${this.selectedHotel()!.name}\nRoom: ${this.selectedRoom()!.type}\nTotal: ${this.formatPrice(booking.totalPrice)}\n\nConfirmation email sent to ${this.customerEmail()}`);
        this.closeBooking();
        this.bookingSuccess.set(false);
      }, 1500);

      this.isLoadingBooking.set(false);
    }, 2000);
  }

  resetBookingForm(): void {
    this.customerName.set('');
    this.customerEmail.set('');
    this.customerPhone.set('');
    this.specialRequests.set('');
    this.bookingError.set('');
    this.bookingSuccess.set(false);
    this.resetPaymentForm();
  }

  resetPaymentForm(): void {
    this.selectedPaymentMethod.set('');
    this.cardNumber.set('');
    this.cardholderName.set('');
    this.expiryMonth.set('');
    this.expiryYear.set('');
    this.cvv.set('');
    this.bankName.set('');
    this.accountNumber.set('');
    this.accountName.set('');
    this.bankCode.set('');
    this.mobileMoneyProvider.set('');
    this.mobileMoneyPhone.set('');
    this.walletId.set('');
    this.paymentError.set('');
    this.paymentSuccess.set(false);
    this.transactionId.set('');
  }

  getPaymentMethods(): Array<{ id: string; name: string; icon: string; description: string }> {
    return [
      { id: 'credit-card', name: 'Credit Card', icon: '💳', description: 'Visa, Mastercard' },
      { id: 'debit-card', name: 'Debit Card', icon: '💳', description: 'ATM Card' },
      { id: 'bank-transfer', name: 'Bank Transfer', icon: '🏦', description: 'Direct transfer' },
      { id: 'mobile-money', name: 'Mobile Money', icon: '📱', description: 'Phone payment' },
      { id: 'wallet', name: 'Digital Wallet', icon: '👛', description: 'Online wallet' }
    ];
  }

  validatePaymentDetails(): boolean {
    const method = this.selectedPaymentMethod();

    if (!method) {
      this.paymentError.set('Please select a payment method');
      return false;
    }

    if (method === 'credit-card' || method === 'debit-card') {
      if (!this.cardNumber() || !this.cardholderName() || !this.expiryMonth() || !this.expiryYear() || !this.cvv()) {
        this.paymentError.set('Please fill in all card details');
        return false;
      }
      if (this.cardNumber().replace(/\s/g, '').length < 13) {
        this.paymentError.set('Invalid card number');
        return false;
      }
      if (this.cvv().length < 3 || this.cvv().length > 4) {
        this.paymentError.set('Invalid CVV');
        return false;
      }
    } else if (method === 'bank-transfer') {
      if (!this.bankName() || !this.accountNumber() || !this.accountName()) {
        this.paymentError.set('Please fill in all bank details');
        return false;
      }
    } else if (method === 'mobile-money') {
      if (!this.mobileMoneyProvider() || !this.mobileMoneyPhone()) {
        this.paymentError.set('Please fill in mobile money details');
        return false;
      }
      if (this.mobileMoneyPhone().length < 10) {
        this.paymentError.set('Invalid phone number');
        return false;
      }
    } else if (method === 'wallet') {
      if (!this.walletId()) {
        this.paymentError.set('Please enter wallet ID');
        return false;
      }
    }

    return true;
  }

  submitPayment(): void {
    if (!this.validatePaymentDetails()) {
      return;
    }

    if (!this.selectedHotel() || !this.selectedRoom()) {
      this.paymentError.set('Booking details missing');
      return;
    }

    this.isProcessingPayment.set(true);
    this.paymentError.set('');

    const paymentRequest = {
      orderId: `HOTEL-${Date.now()}`,
      amount: this.calculateTotalPrice(),
      currency: this.currencyService.currencyCode(),
      paymentMethod: this.selectedPaymentMethod(),
      cardDetails: this.selectedPaymentMethod() === 'credit-card' || this.selectedPaymentMethod() === 'debit-card' ? {
        cardNumber: this.cardNumber(),
        cardholderName: this.cardholderName(),
        expiryMonth: this.expiryMonth(),
        expiryYear: this.expiryYear(),
        cvv: this.cvv()
      } : undefined,
      bankDetails: this.selectedPaymentMethod() === 'bank-transfer' ? {
        bankName: this.bankName(),
        accountNumber: this.accountNumber(),
        accountName: this.accountName(),
        bankCode: this.bankCode()
      } : undefined,
      mobileMoneyDetails: this.selectedPaymentMethod() === 'mobile-money' ? {
        provider: this.mobileMoneyProvider(),
        phoneNumber: this.mobileMoneyPhone()
      } : undefined,
      walletDetails: this.selectedPaymentMethod() === 'wallet' ? {
        walletId: this.walletId()
      } : undefined
    };

    // Use PaymentService to process payment
    this.paymentService.processPayment(paymentRequest).subscribe({
      next: (apiResponse: any) => {
        const paymentResponse = apiResponse.data;
        if (paymentResponse && paymentResponse.status === 'approved') {
          this.transactionId.set(paymentResponse.transactionId);
          this.paymentSuccess.set(true);

          setTimeout(() => {
            alert(`✅ Payment Successful!\n\nTransaction ID: ${paymentResponse.transactionId}\nHotel: ${this.selectedHotel()!.name}\nTotal: ${this.formatPrice(this.calculateTotalPrice())}\n\nConfirmation email sent to ${this.customerEmail()}`);
            this.closeBooking();
            this.paymentSuccess.set(false);
          }, 1500);
        } else if (paymentResponse) {
          this.paymentError.set(`Payment ${paymentResponse.status}: ${paymentResponse.message}`);
        } else {
          this.paymentError.set('Payment processing failed. Please try again.');
        }
        this.isProcessingPayment.set(false);
      },
      error: () => {
        this.paymentError.set('Payment processing failed. Please try again.');
        this.isProcessingPayment.set(false);
      }
    });
  }

  openReviewModal(hotel: Hotel): void {
    this.selectedHotelForReview.set(hotel);
    this.showReviewModal.set(true);
  }

  closeReviewModal(): void {
    this.showReviewModal.set(false);
    this.selectedHotelForReview.set(null);
    this.reviewRating.set(0);
    this.reviewText.set('');
  }

  submitReview(): void {
    if (this.reviewRating() === 0 || !this.reviewText().trim()) {
      alert('Please provide a rating and review text');
      return;
    }

    console.log('Review submitted:', {
      hotelId: this.selectedHotelForReview()?.id,
      rating: this.reviewRating(),
      text: this.reviewText()
    });

    alert('Thank you for your review!');
    this.closeReviewModal();
  }

  toggleAmenity(amenity: string): void {
    const selected = this.selectedAmenities();
    const index = selected.indexOf(amenity);
    if (index > -1) {
      selected.splice(index, 1);
    } else {
      selected.push(amenity);
    }
    this.selectedAmenities.set([...selected]);
    this.currentPage.set(1);
  }

  togglePropertyType(type: string): void {
    const selected = this.selectedPropertyTypes();
    const index = selected.indexOf(type);
    if (index > -1) {
      selected.splice(index, 1);
    } else {
      selected.push(type);
    }
    this.selectedPropertyTypes.set([...selected]);
    this.currentPage.set(1);
  }

  clearFilters(): void {
    this.priceRange.set([0, this.maxPrice()]);
    this.minRating.set(0);
    this.selectedAmenities.set([]);
    this.selectedPropertyTypes.set([]);
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    document.getElementById('featured-hotels')?.scrollIntoView({ behavior: 'smooth' });
  }

  formatPrice(amount: number): string {
    return this.currencyService.formatPrice(amount);
  }

  getMinDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  /**
   * Build a complete image URL from a relative or absolute path
   */
  buildImageUrl(imagePath: string | undefined): string {
    if (!imagePath) return '';
    return apiConfig.buildImageUrl(imagePath);
  }
}
