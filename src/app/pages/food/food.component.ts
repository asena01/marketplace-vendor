import { Component, OnInit, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../../components/header/header.component';
import { MARKETPLACE_SERVICES } from '../../shared/data/marketplace-data';
import { CurrencyService } from '../../services/currency.service';
import { PaymentService } from '../../services/payment.service';
import { FoodService, Restaurant, MenuItem, CartItem as FoodCartItem } from '../../services/food.service';
import { DeliveryService, DeliveryServiceDefinition } from '../../services/delivery.service';
import { apiConfig } from '../../config/api-config';

interface CartItem {
  id: string;
  restaurantId: string;
  restaurantName: string;
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

interface Order {
  id: string;
  restaurantId: string;
  restaurantName: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'on_the_way' | 'delivered';
  estimatedDelivery: number;
  currentLocation?: string;
  driverName?: string;
  driverPhone?: string;
  driverRating?: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  paymentMethod: string;
  createdAt: Date;
}

@Component({
  selector: 'app-food',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FormsModule, HttpClientModule, MatIconModule],
  templateUrl: './food.component.html',
  styleUrl: './food.component.css'
})
export class FoodComponent implements OnInit {
  Object = Object; // Expose Object to template
  categories: any[] = [];

  // Get categories from MARKETPLACE_SERVICES if available
  private initCategories(): void {
    const marketplaceService = MARKETPLACE_SERVICES.find(s => s.id === 'food');
    this.categories = marketplaceService?.categories || [];
  }

  // Search & Filter Signals
  searchLocation = signal<string>('');
  searchRestaurant = signal<string>('');
  selectedRestaurantId = signal<string>('');
  selectedCategory = signal<string>('all');

  // Cart Signals
  cartItems = signal<CartItem[]>([]);
  showCart = signal<boolean>(false);
  deliveryAddress = signal<string>('');
  customerName = signal<string>('');
  customerPhone = signal<string>('');

  // Checkout Signals
  showCheckout = signal<boolean>(false);
  selectedPaymentMethod = signal<string>('');
  isProcessingOrder = signal<boolean>(false);
  orderError = signal<string>('');

  // Validation Error Signals
  validationErrors = signal<{
    customerName?: boolean;
    customerPhone?: boolean;
    deliveryAddress?: boolean;
  }>({});

  // Order Tracking Signals
  currentOrder = signal<Order | null>(null);
  showTracking = signal<boolean>(false);
  orderStatus = signal<string>('');

  // Payment Signals
  cardNumber = signal<string>('');
  cardholderName = signal<string>('');
  expiryMonth = signal<string>('');
  expiryYear = signal<string>('');
  cvv = signal<string>('');
  bankName = signal<string>('');
  accountNumber = signal<string>('');
  accountName = signal<string>('');
  bankCode = signal<string>('');
  mobileMoneyProvider = signal<string>('');
  mobileMoneyPhone = signal<string>('');
  walletId = signal<string>('');

  // Delivery related signals
  deliveryServices = signal<DeliveryServiceDefinition[]>([]);
  selectedDeliveryService = signal<DeliveryServiceDefinition | null>(null);
  estimatedDistance = signal<number>(0);
  deliveryPrice = signal<number>(0);
  showDeliveryOptions = signal<boolean>(false);

  // Restaurant List
  restaurants = signal<Restaurant[]>([]);

  // Computed values
  filteredRestaurants = computed(() => {
    let filtered = this.restaurants();

    const searchTerm = this.searchRestaurant().toLowerCase();
    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(searchTerm) ||
        r.cuisine.toLowerCase().includes(searchTerm)
      );
    }

    if (this.searchLocation()) {
      filtered = filtered.filter(r =>
        r.address.toLowerCase().includes(this.searchLocation().toLowerCase())
      );
    }

    return filtered;
  });

  selectedRestaurant = computed(() => {
    return this.restaurants().find(r => r.id === this.selectedRestaurantId());
  });

  menuItems = computed(() => {
    const restaurant = this.selectedRestaurant();
    if (!restaurant || !restaurant.menus) return [];

    const items = restaurant.menus || [];
    const category = this.selectedCategory();

    if (category === 'all') return items;
    return items.filter(item => item.category === category);
  });

  menuCategories = computed(() => {
    const restaurant = this.selectedRestaurant();
    if (!restaurant || !restaurant.menus) return [];

    const categories = new Set(restaurant.menus.map(m => m.category));
    return Array.from(categories).sort();
  });

  cartTotal = computed(() => {
    return this.cartItems().reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
  });

  cartCount = computed(() => {
    return this.cartItems().reduce((sum, item) => sum + item.quantity, 0);
  });

  constructor(
    public currencyService: CurrencyService,
    public paymentService: PaymentService,
    private foodService: FoodService,
    private deliveryService: DeliveryService
  ) {
    // Prevent body scroll when modal is open
    effect(() => {
      const isOpen = this.showCart() || this.showCheckout() || this.showTracking();
      document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    });

    // Load menus when a restaurant is selected
    effect(() => {
      const restaurantId = this.selectedRestaurantId();
      if (restaurantId) {
        this.loadMenusForRestaurant(restaurantId);
      }
    });

    // Update order status every 3 seconds when tracking
    let trackingInterval: any = null;
    effect(() => {
      const isTracking = this.showTracking();

      if (isTracking) {
        if (trackingInterval) clearInterval(trackingInterval);
        trackingInterval = setInterval(() => {
          this.updateOrderStatus();
        }, 3000);
      } else {
        if (trackingInterval) {
          clearInterval(trackingInterval);
          trackingInterval = null;
        }
      }
    });
  }

  ngOnInit(): void {
    this.loadRestaurants();
  }

  loadRestaurants(): void {
    this.initCategories();

    // Load restaurants from API
    this.foodService.getRestaurants(1, 100).subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data && response.data.length > 0) {
          // Transform API data to include id field if not present
          const transformedData = response.data.map((r: any) => ({
            ...r,
            id: r._id || r.id,
            isOpen: r.isOpen !== undefined ? r.isOpen : true,
            menus: r.menus || []
          }));
          this.restaurants.set(transformedData);
          console.log('✅ Restaurants loaded from API:', response.data.length);
        } else {
          console.warn('No restaurants data from API');
          this.restaurants.set([]);
        }
      },
      error: (error: any) => {
        console.error('❌ Error loading restaurants from API:', error);
        console.log('📦 Showing empty state - no restaurants available');
        this.restaurants.set([]);
      }
    });
  }

  /**
   * Load menus for a specific restaurant from the backend
   */
  loadMenusForRestaurant(restaurantId: string): void {
    console.log(`📋 Loading menus for restaurant: ${restaurantId}`);

    this.foodService.getRestaurantMenus(restaurantId).subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data) {
          console.log(`✅ Loaded ${response.data.length} menu items for restaurant`);

          // Update the restaurant's menus in the restaurants array
          const updatedRestaurants = this.restaurants().map(r => {
            if (r.id === restaurantId || r._id === restaurantId) {
              return {
                ...r,
                menus: response.data || []
              };
            }
            return r;
          });
          this.restaurants.set(updatedRestaurants);
        } else {
          console.warn('No menus found for this restaurant');
          // Set empty menus array
          const updatedRestaurants = this.restaurants().map(r => {
            if (r.id === restaurantId || r._id === restaurantId) {
              return {
                ...r,
                menus: []
              };
            }
            return r;
          });
          this.restaurants.set(updatedRestaurants);
        }
      },
      error: (error: any) => {
        console.error('❌ Error loading menus:', error);
        // Set empty menus array on error
        const updatedRestaurants = this.restaurants().map(r => {
          if (r.id === restaurantId || r._id === restaurantId) {
            return {
              ...r,
              menus: []
            };
          }
          return r;
        });
        this.restaurants.set(updatedRestaurants);
      }
    });
  }

  // Fallback method with dummy data for when API is unavailable (kept for reference, not used)
  private loadFallbackRestaurants(): void {
    const dummyRestaurants: any[] = [
      {
        _id: 'rest-1',
        id: 'rest-1',
        name: 'Pizza Palace',
        cuisine: 'Italian',
        rating: 4.8,
        reviews: 1240,
        deliveryTime: 25,
        deliveryFee: 2.99,
        minOrder: 15,
        icon: '🍕',
        address: 'Downtown, Main St',
        phone: '+1-555-0101',
        hours: '11:00 AM - 11:00 PM',
        isOpen: true,
        menus: [
          { id: 'item-1', name: 'Margherita Pizza', description: 'Fresh basil, mozzarella, tomato sauce', price: 14.99, image: '🍕', category: 'Pizza', rating: 4.9, prepTime: 15 },
          { id: 'item-2', name: 'Pepperoni Pizza', description: 'Classic pepperoni with extra cheese', price: 15.99, image: '🍕', category: 'Pizza', rating: 4.8, prepTime: 15 },
          { id: 'item-3', name: 'Vegetarian Pizza', description: 'Bell peppers, onions, mushrooms, olives', price: 14.99, image: '🍕', category: 'Pizza', rating: 4.7, prepTime: 15 },
          { id: 'item-4', name: 'Caesar Salad', description: 'Fresh romaine, parmesan, croutons', price: 9.99, image: '🥗', category: 'Salads', rating: 4.6, prepTime: 5 },
          { id: 'item-5', name: 'Garlic Breadsticks', description: 'Warm garlic breadsticks with marinara', price: 5.99, image: '🍞', category: 'Sides', rating: 4.8, prepTime: 8 },
          { id: 'item-6', name: 'Coca Cola', description: 'Classic cola drink', price: 2.49, image: '🥤', category: 'Drinks', rating: 4.7, prepTime: 1 },
          { id: 'item-7', name: 'Lemonade', description: 'Fresh squeezed lemonade', price: 3.49, image: '🍋', category: 'Drinks', rating: 4.8, prepTime: 1 },
          { id: 'item-8', name: 'Iced Tea', description: 'Chilled iced tea', price: 2.99, image: '🧋', category: 'Drinks', rating: 4.6, prepTime: 1 },
        ]
      },
      {
        _id: 'rest-2',
        id: 'rest-2',
        name: 'Burger House',
        cuisine: 'American',
        rating: 4.7,
        reviews: 980,
        deliveryTime: 20,
        deliveryFee: 2.49,
        minOrder: 12,
        icon: '🍔',
        address: 'Central Ave',
        phone: '+1-555-0102',
        hours: '10:00 AM - 10:00 PM',
        isOpen: true,
        menus: [
          { id: 'item-11', name: 'Classic Cheeseburger', description: 'Beef patty, American cheese, pickles, onions', price: 10.99, image: '🍔', category: 'Burgers', rating: 4.8, prepTime: 10 },
          { id: 'item-12', name: 'Double Deluxe Burger', description: 'Two beef patties, double cheese, bacon', price: 13.99, image: '🍔', category: 'Burgers', rating: 4.9, prepTime: 12 },
          { id: 'item-13', name: 'Crispy Fries', description: 'Golden crispy fries with sea salt', price: 4.99, image: '🍟', category: 'Sides', rating: 4.7, prepTime: 8 },
          { id: 'item-14', name: 'Milkshake - Vanilla', description: 'Creamy vanilla milkshake', price: 6.99, image: '🥤', category: 'Drinks', rating: 4.8, prepTime: 5 },
          { id: 'item-15', name: 'Milkshake - Chocolate', description: 'Rich chocolate milkshake', price: 6.99, image: '🥛', category: 'Drinks', rating: 4.9, prepTime: 5 },
          { id: 'item-16', name: 'Milkshake - Strawberry', description: 'Fresh strawberry milkshake', price: 6.99, image: '🍓', category: 'Drinks', rating: 4.8, prepTime: 5 },
          { id: 'item-17', name: 'Orange Juice', description: 'Fresh orange juice', price: 3.99, image: '🧃', category: 'Drinks', rating: 4.7, prepTime: 2 },
        ]
      },
      {
        _id: 'rest-3',
        id: 'rest-3',
        name: 'Sushi Bar',
        cuisine: 'Japanese',
        rating: 4.9,
        reviews: 1450,
        deliveryTime: 30,
        deliveryFee: 3.99,
        minOrder: 20,
        icon: '🍣',
        address: 'Uptown District',
        phone: '+1-555-0103',
        hours: '12:00 PM - 10:00 PM',
        isOpen: true,
        menus: [
          { id: 'item-21', name: 'California Roll', description: 'Crab, avocado, cucumber', price: 12.99, image: '🍣', category: 'Rolls', rating: 4.8, prepTime: 10 },
          { id: 'item-22', name: 'Spicy Tuna Roll', description: 'Spicy tuna with sriracha mayo', price: 13.99, image: '🍣', category: 'Rolls', rating: 4.9, prepTime: 10 },
          { id: 'item-23', name: 'Salmon Nigiri (6pcs)', description: 'Fresh salmon on seasoned rice', price: 11.99, image: '🍣', category: 'Nigiri', rating: 4.7, prepTime: 8 },
          { id: 'item-24', name: 'Edamame', description: 'Steamed soybeans with sea salt', price: 5.99, image: '🫘', category: 'Appetizers', rating: 4.6, prepTime: 5 },
          { id: 'item-25', name: 'Sake', description: 'Traditional Japanese rice wine', price: 8.99, image: '🍶', category: 'Drinks', rating: 4.9, prepTime: 1 },
          { id: 'item-26', name: 'Mango Lassi', description: 'Sweet mango yogurt drink', price: 4.99, image: '🥭', category: 'Drinks', rating: 4.8, prepTime: 2 },
          { id: 'item-27', name: 'Green Tea', description: 'Hot or cold green tea', price: 3.49, image: '🫖', category: 'Drinks', rating: 4.7, prepTime: 3 },
        ]
      },
      {
        _id: 'rest-4',
        id: 'rest-4',
        name: 'Taco Fiesta',
        cuisine: 'Mexican',
        rating: 4.8,
        reviews: 890,
        deliveryTime: 22,
        deliveryFee: 2.99,
        minOrder: 14,
        icon: '🌮',
        address: 'South Side',
        phone: '+1-555-0104',
        hours: '11:00 AM - 11:00 PM',
        isOpen: true,
        menus: [
          { id: 'item-31', name: 'Carne Asada Tacos (3)', description: 'Grilled beef, onions, cilantro', price: 10.99, image: '🌮', category: 'Tacos', rating: 4.8, prepTime: 12 },
          { id: 'item-32', name: 'Fish Tacos (3)', description: 'Fried fish, cabbage slaw, chipotle mayo', price: 11.99, image: '🌮', category: 'Tacos', rating: 4.9, prepTime: 12 },
          { id: 'item-33', name: 'Burrito Supreme', description: 'Chicken, rice, beans, cheese, sour cream', price: 12.99, image: '🌯', category: 'Burritos', rating: 4.7, prepTime: 10 },
          { id: 'item-34', name: 'Chips & Guacamole', description: 'Fresh tortilla chips with homemade guacamole', price: 6.99, image: '🥑', category: 'Appetizers', rating: 4.8, prepTime: 5 },
          { id: 'item-35', name: 'Horchata', description: 'Sweet rice milk drink', price: 3.99, image: '🥛', category: 'Drinks', rating: 4.9, prepTime: 1 },
          { id: 'item-36', name: 'Mexican Coca Cola', description: 'Cold cola with cane sugar', price: 3.49, image: '🥤', category: 'Drinks', rating: 4.8, prepTime: 1 },
          { id: 'item-37', name: 'Agua Fresca', description: 'Watermelon refresher drink', price: 3.99, image: '🍉', category: 'Drinks', rating: 4.7, prepTime: 2 },
        ]
      },
      {
        _id: 'rest-5',
        id: 'rest-5',
        name: 'Curry House',
        cuisine: 'Indian',
        rating: 4.7,
        reviews: 756,
        deliveryTime: 28,
        deliveryFee: 3.49,
        minOrder: 16,
        icon: '🍛',
        address: 'East Market',
        phone: '+1-555-0105',
        hours: '11:30 AM - 10:00 PM',
        isOpen: true,
        menus: [
          { id: 'item-41', name: 'Chicken Tikka Masala', description: 'Tender chicken in creamy tomato sauce', price: 13.99, image: '🍛', category: 'Curries', rating: 4.9, prepTime: 20 },
          { id: 'item-42', name: 'Vegetable Biryani', description: 'Fragrant basmati rice with vegetables', price: 12.99, image: '🍚', category: 'Rice Dishes', rating: 4.8, prepTime: 18 },
          { id: 'item-43', name: 'Naan Bread', description: 'Soft traditional Indian bread', price: 3.99, image: '🍞', category: 'Breads', rating: 4.7, prepTime: 8 },
          { id: 'item-44', name: 'Samosa (3pcs)', description: 'Crispy pastry with potato and peas', price: 5.99, image: '🥟', category: 'Appetizers', rating: 4.8, prepTime: 10 },
          { id: 'item-45', name: 'Mango Lassi', description: 'Sweet mango yogurt drink', price: 4.99, image: '🥭', category: 'Drinks', rating: 4.9, prepTime: 2 },
          { id: 'item-46', name: 'Masala Chai', description: 'Spiced Indian tea', price: 2.99, image: '🫖', category: 'Drinks', rating: 4.8, prepTime: 3 },
          { id: 'item-47', name: 'Nimbu Pani', description: 'Lemon and ginger drink', price: 3.49, image: '🍋', category: 'Drinks', rating: 4.7, prepTime: 1 },
        ]
      },
      {
        _id: 'rest-6',
        id: 'rest-6',
        name: 'Salad Fresh',
        cuisine: 'Healthy',
        rating: 4.8,
        reviews: 645,
        deliveryTime: 18,
        deliveryFee: 1.99,
        minOrder: 10,
        icon: '🥗',
        address: 'Health District',
        phone: '+1-555-0106',
        hours: '10:00 AM - 9:00 PM',
        isOpen: true,
        menus: [
          { id: 'item-51', name: 'Quinoa Power Bowl', description: 'Quinoa, kale, roasted vegetables, tahini', price: 11.99, image: '🥗', category: 'Bowls', rating: 4.9, prepTime: 8 },
          { id: 'item-52', name: 'Greek Salad', description: 'Feta, olives, tomato, cucumber', price: 10.99, image: '🥗', category: 'Salads', rating: 4.8, prepTime: 5 },
          { id: 'item-53', name: 'Smoothie - Berry Blast', description: 'Mixed berries, yogurt, honey', price: 7.99, image: '🥤', category: 'Drinks', rating: 4.7, prepTime: 3 },
          { id: 'item-54', name: 'Acai Bowl', description: 'Acai, granola, coconut, berries', price: 10.99, image: '🍇', category: 'Bowls', rating: 4.8, prepTime: 8 },
          { id: 'item-55', name: 'Smoothie - Green Machine', description: 'Spinach, banana, apple, ginger', price: 7.99, image: '🥬', category: 'Drinks', rating: 4.9, prepTime: 3 },
          { id: 'item-56', name: 'Freshly Squeezed Juice', description: 'Orange, carrot, ginger blend', price: 5.99, image: '🧃', category: 'Drinks', rating: 4.8, prepTime: 4 },
          { id: 'item-57', name: 'Coconut Water', description: 'Natural coconut water', price: 4.49, image: '🥥', category: 'Drinks', rating: 4.6, prepTime: 1 },
        ]
      },
    ];

    this.restaurants.set(dummyRestaurants);
  }

  selectRestaurant(restaurantId: string | undefined): void {
    if (restaurantId) {
      this.selectedRestaurantId.set(restaurantId);
      this.selectedCategory.set('all');
    }
  }

  addToCart(menuItem: MenuItem): void {
    const restaurantId = this.selectedRestaurantId();
    const restaurant = this.restaurants().find(r => (r.id || r._id) === restaurantId);

    console.log('🛒 addToCart called', {
      selectedRestaurantId: restaurantId,
      restaurant: restaurant?.name,
      menuItem: menuItem.name
    });

    if (!restaurant) {
      console.error('❌ No restaurant selected');
      alert('Please select a restaurant first');
      return;
    }

    console.log('✅ Adding to cart:', { menuItem: menuItem.name, restaurant: restaurant.name });

    const resId = restaurant.id || restaurant._id || 'rest-1';
    const existingItem = this.cartItems().find(
      item => item.menuItem.id === menuItem.id && item.restaurantId === resId
    );

    if (existingItem) {
      console.log('📦 Item exists, incrementing quantity');
      const updatedItems = this.cartItems().map(item =>
        item.menuItem.id === menuItem.id && item.restaurantId === resId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      this.cartItems.set(updatedItems);
    } else {
      console.log('➕ Adding new item to cart');
      const newItem: CartItem = {
        id: `${resId}-${menuItem.id}`,
        restaurantId: resId,
        restaurantName: restaurant.name,
        menuItem,
        quantity: 1
      };
      this.cartItems.set([...this.cartItems(), newItem]);
    }

    console.log('🛍️ Cart updated. Items count:', this.cartItems().length);
    console.log('📊 Full cart:', this.cartItems());

    // Show cart after adding item
    this.showCart.set(true);
    console.log('🔓 Cart sidebar opened');
  }

  updateQuantity(id: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(id);
      return;
    }

    const updatedItems = this.cartItems().map(item =>
      item.id === id ? { ...item, quantity } : item
    );
    this.cartItems.set(updatedItems);
  }

  removeFromCart(id: string): void {
    this.cartItems.set(this.cartItems().filter(item => item.id !== id));
  }

  clearCart(): void {
    this.cartItems.set([]);
  }

  openCheckout(): void {
    if (this.cartItems().length === 0) {
      alert('Your cart is empty');
      return;
    }

    // Load customer data from localStorage if not already filled
    this.loadCustomerData();

    // Check for validation errors
    const errors: { customerName?: boolean; customerPhone?: boolean; deliveryAddress?: boolean } = {};
    let hasErrors = false;

    if (!this.deliveryAddress()) {
      errors.deliveryAddress = true;
      hasErrors = true;
    }
    if (!this.customerName()) {
      errors.customerName = true;
      hasErrors = true;
    }
    if (!this.customerPhone()) {
      errors.customerPhone = true;
      hasErrors = true;
    }

    if (hasErrors) {
      this.validationErrors.set(errors);
      return;
    }

    // Clear errors and proceed to checkout
    this.validationErrors.set({});
    this.showCart.set(false);
    this.showCheckout.set(true);

    // Load delivery services and select default
    this.loadDeliveryServices();

    // Auto-fill test card details for testing
    this.autoFillTestCardDetails();
  }

  /**
   * Load customer data from localStorage and pre-fill checkout form
   */
  loadCustomerData(): void {
    // Try to load user data from localStorage
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);

        // Pre-fill customer name if not already filled
        if (!this.customerName() && user.name) {
          this.customerName.set(user.name);
          console.log('✅ Pre-filled customer name:', user.name);
        }

        // Pre-fill customer phone if not already filled
        if (!this.customerPhone() && user.phone) {
          this.customerPhone.set(user.phone);
          console.log('✅ Pre-filled customer phone:', user.phone);
        }

        // Pre-fill delivery address if not already filled
        if (!this.deliveryAddress() && user.address) {
          this.deliveryAddress.set(user.address);
          console.log('✅ Pre-filled delivery address:', user.address);
        }
      } catch (e) {
        console.warn('⚠️ Could not parse user data from localStorage:', e);
      }
    } else {
      // Fallback to individual localStorage items
      const name = localStorage.getItem('userName');
      if (!this.customerName() && name) {
        this.customerName.set(name);
        console.log('✅ Pre-filled customer name from userName:', name);
      }

      const email = localStorage.getItem('userEmail');
      if (!this.customerPhone() && email) {
        // Use email as fallback for phone
        this.customerPhone.set(email);
        console.log('✅ Pre-filled customer phone with email (fallback):', email);
      }
    }

    // Also check for stored delivery address
    const storedAddress = localStorage.getItem('deliveryAddress');
    if (!this.deliveryAddress() && storedAddress) {
      this.deliveryAddress.set(storedAddress);
      console.log('✅ Pre-filled delivery address from localStorage:', storedAddress);
    }
  }

  /**
   * Auto-fill test card details for testing checkout
   */
  private autoFillTestCardDetails(): void {
    // Test Visa card (valid Luhn number for testing)
    this.cardNumber.set('4532015112830366');
    this.cardholderName.set('Test User');
    this.expiryMonth.set('12');
    this.expiryYear.set('2027');
    this.cvv.set('123');
    console.log('✅ Test card auto-filled: 4532015112830366');
  }

  closeCheckout(): void {
    this.showCheckout.set(false);
  }

  clearFieldError(field: 'customerName' | 'customerPhone' | 'deliveryAddress'): void {
    const errors = { ...this.validationErrors() };
    delete errors[field];
    this.validationErrors.set(errors);
  }

  validatePaymentDetails(): boolean {
    const method = this.selectedPaymentMethod();

    if (!method) {
      this.orderError.set('Please select a payment method');
      return false;
    }

    if (method === 'credit-card' || method === 'debit-card') {
      if (!this.cardNumber() || !this.cardholderName() || !this.expiryMonth() || !this.expiryYear() || !this.cvv()) {
        this.orderError.set('Please fill in all card details');
        return false;
      }
    } else if (method === 'bank-transfer') {
      if (!this.bankName() || !this.accountNumber() || !this.accountName()) {
        this.orderError.set('Please fill in all bank details');
        return false;
      }
    } else if (method === 'mobile-money') {
      if (!this.mobileMoneyProvider() || !this.mobileMoneyPhone()) {
        this.orderError.set('Please fill in mobile money details');
        return false;
      }
    } else if (method === 'wallet') {
      if (!this.walletId()) {
        this.orderError.set('Please enter wallet ID');
        return false;
      }
    }

    return true;
  }

  // ============================================
  // DELIVERY METHODS FOR RESTAURANTS
  // ============================================

  loadDeliveryServices(): void {
    const services = this.deliveryService.getAvailableServices('restaurant');
    this.deliveryServices.set(services);
    console.log('✅ Loaded', services.length, 'delivery services for restaurant');

    // Auto-select first delivery service if none is selected
    if (services.length > 0 && !this.selectedDeliveryService()) {
      this.selectDeliveryService(services[0]);
      console.log('✅ Auto-selected delivery service:', services[0].name);
    }
  }

  selectDeliveryService(service: DeliveryServiceDefinition): void {
    this.selectedDeliveryService.set(service);
    this.calculateDeliveryPrice();
  }

  calculateDeliveryPrice(): void {
    const service = this.selectedDeliveryService();
    if (!service) {
      return;
    }

    const weight = this.cartItems().length * 0.5; // Food average 0.5kg per item
    const distance = this.estimatedDistance() || 10;
    const price = this.deliveryService.calculatePrice(service, distance, weight);
    this.deliveryPrice.set(price);
  }

  formatDeliveryTime(service: DeliveryServiceDefinition | null): string {
    if (!service) return 'N/A';
    const minutes = service.estimatedDeliveryTime.standard;
    if (minutes < 60) {
      return `${minutes} mins`;
    } else if (minutes < 1440) {
      const hours = Math.ceil(minutes / 60);
      return `${hours}h`;
    } else {
      const days = Math.ceil(minutes / 1440);
      return `${days} day${days > 1 ? 's' : ''}`;
    }
  }

  openDeliveryOptions(): void {
    this.showDeliveryOptions.set(true);
    if (this.deliveryServices().length === 0) {
      this.loadDeliveryServices();
    }
  }

  closeDeliveryOptions(): void {
    this.showDeliveryOptions.set(false);
  }

  placeOrder(): void {
    if (!this.validatePaymentDetails()) {
      return;
    }

    if (this.cartItems().length === 0) {
      this.orderError.set('Your cart is empty');
      return;
    }

    // Save delivery address and customer data to localStorage for next order
    const address = this.deliveryAddress();
    if (address) {
      localStorage.setItem('deliveryAddress', address);
      console.log('💾 Saved delivery address to localStorage');
    }

    this.isProcessingOrder.set(true);
    this.orderError.set('');

    const restaurant = this.selectedRestaurant();
    if (!restaurant) return;

    // Validate delivery info
    if (!this.selectedDeliveryService()) {
      this.orderError.set('Please select a delivery service');
      this.isProcessingOrder.set(false);
      return;
    }

    const subtotal = this.cartTotal();
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = subtotal + tax + restaurant.deliveryFee;

    const deliveryFee = this.deliveryPrice() > 0 ? this.deliveryPrice() : restaurant.deliveryFee;
    const orderTotal = subtotal + tax + deliveryFee;

    // Get customer ID from localStorage
    const customerId = localStorage.getItem('userId');

    const orderData = {
      customerId: customerId, // Link order to customer
      items: this.cartItems().map(item => ({
        menuItemId: item.menuItem.id,
        name: item.menuItem.name,
        price: item.menuItem.price,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions
      })),
      subtotal,
      deliveryFee: deliveryFee,
      deliveryService: this.selectedDeliveryService()?.name,
      deliveryDistance: this.estimatedDistance() || 10,
      tax,
      total: orderTotal,
      paymentMethod: this.selectedPaymentMethod(),
      customerName: this.customerName(),
      customerPhone: this.customerPhone(),
      customerAddress: this.deliveryAddress()
    };

    console.log('📝 Order data with customerId:', { customerId, ordertotal: orderTotal });

    // Send order to backend
    const restaurantId = restaurant._id || restaurant.id || 'rest-1';
    this.foodService.createOrder(restaurantId, orderData).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          console.log('✅ Order created successfully:', response.data);

          const newOrder: Order = {
            id: response.data?._id || response.data?.orderId || `ORDER-${Date.now()}`,
            restaurantId: restaurant.id || 'rest-1',
            restaurantName: restaurant.name,
            items: this.cartItems(),
            subtotal,
            deliveryFee: deliveryFee,
            tax,
            total: orderTotal,
            status: 'pending',
            estimatedDelivery: restaurant.deliveryTime,
            customerName: this.customerName(),
            customerPhone: this.customerPhone(),
            customerAddress: this.deliveryAddress(),
            paymentMethod: this.selectedPaymentMethod(),
            createdAt: new Date()
          };

          this.currentOrder.set(newOrder);
          this.showCheckout.set(false);
          this.showTracking.set(true);
          this.startOrderTracking();
          this.isProcessingOrder.set(false);
          this.clearCart();
          this.resetCheckoutForm();
        } else {
          console.error('❌ Failed to create order');
          this.orderError.set('Failed to create order. Please try again.');
          this.isProcessingOrder.set(false);
        }
      },
      error: (error: any) => {
        console.error('❌ Error creating order:', error);
        this.orderError.set('Error creating order. Please try again.');
        this.isProcessingOrder.set(false);
      }
    });
  }

  /**
   * Start tracking order status (will poll backend for real updates)
   * For now, orders stay in pending status until restaurant confirms
   */
  startOrderTracking(): void {
    if (!this.currentOrder()) return;

    const order = this.currentOrder();
    if (order) {
      console.log('📍 Order tracking started. Waiting for restaurant to confirm...');
      // In a real app, this would poll the backend for order status updates
      // For now, the order stays at "pending" until the restaurant dashboard confirms it
    }
  }

  /**
   * Update order status from backend (called periodically to check for updates)
   * This would be called to poll the backend for real order status changes
   */
  updateOrderStatus(): void {
    const order = this.currentOrder();
    if (!order) return;

    // In a real implementation, this would fetch order status from backend
    // Example: GET /restaurants/:restaurantId/orders/:orderId
    // For now, just log that we're waiting for updates
    console.log('⏳ Checking for order updates from restaurant...');
  }

  getOrderStatusIcon(status: string): string {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'confirmed':
        return '✅';
      case 'preparing':
        return '👨‍🍳';
      case 'ready':
        return '📦';
      case 'on_the_way':
        return '🚗';
      case 'delivered':
        return '✨';
      default:
        return '📍';
    }
  }

  getOrderStatusText(status: string): string {
    switch (status) {
      case 'pending':
        return 'Order Placed';
      case 'confirmed':
        return 'Confirmed';
      case 'preparing':
        return 'Preparing Your Food';
      case 'ready':
        return 'Ready for Pickup';
      case 'on_the_way':
        return 'On the Way';
      case 'delivered':
        return 'Delivered';
      default:
        return 'Processing';
    }
  }

  closeTracking(): void {
    this.showTracking.set(false);
    this.currentOrder.set(null);
  }

  resetCheckoutForm(): void {
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
    this.orderError.set('');
  }

  formatPrice(amount: number): string {
    return this.currencyService.formatPrice(amount);
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

  /**
   * Build a complete image URL from a relative or absolute path
   */
  buildImageUrl(imagePath: string | undefined): string {
    if (!imagePath) return '';
    return apiConfig.buildImageUrl(imagePath);
  }
}
