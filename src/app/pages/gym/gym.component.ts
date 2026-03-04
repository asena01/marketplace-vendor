import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../components/header/header.component';
import { GymEquipmentService, GymEquipment } from '../../services/gym-equipment.service';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-gym',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './gym.component.html',
  styleUrl: './gym.component.css'
})
export class GymComponent implements OnInit {
  // Data
  categories = signal<any[]>([]);
  fitnessLevels = signal<string[]>([]);
  targetMuscles = signal<string[]>([]);
  equipment = signal<GymEquipment[]>([]);
  cart = signal<any[]>([]);
  
  // State
  selectedCategory = signal<string>('');
  selectedFitnessLevel = signal<string>('');
  selectedTargetMuscle = signal<string>('');
  searchQuery = signal<string>('');
  minPrice = signal<number>(0);
  maxPrice = signal<number>(5000);
  isLoading = signal(false);
  currentPage = signal(1);
  showCart = signal(false);
  showCheckout = signal(false);

  // Checkout form fields
  customerName = signal<string>('');
  customerEmail = signal<string>('');
  customerPhone = signal<string>('');
  customerAddress = signal<string>('');

  // Payment state
  isProcessingPayment = signal(false);
  paymentError = signal<string>('');

  // Computed values
  filteredEquipment = computed(() => {
    let items = this.equipment();
    
    if (this.selectedCategory()) {
      items = items.filter(e => e.category === this.selectedCategory());
    }

    if (this.selectedFitnessLevel()) {
      items = items.filter(e => e.specifications?.fitnessLevel === this.selectedFitnessLevel());
    }

    if (this.selectedTargetMuscle()) {
      items = items.filter(e => e.targetMuscles?.includes(this.selectedTargetMuscle()));
    }
    
    if (this.searchQuery()) {
      const q = this.searchQuery().toLowerCase();
      items = items.filter(e => e.name.toLowerCase().includes(q));
    }
    
    items = items.filter(e => e.price >= this.minPrice() && e.price <= this.maxPrice());
    
    return items;
  });

  cartTotal = computed(() => {
    return this.cart().reduce((sum, item) => sum + (item.price * item.quantity), 0);
  });

  cartItemCount = computed(() => {
    return this.cart().reduce((sum, item) => sum + item.quantity, 0);
  });

  cartTax = computed(() => {
    return Math.round(this.cartTotal() * 0.1 * 100) / 100;
  });

  cartGrandTotal = computed(() => {
    return Math.round((this.cartTotal() + this.cartTax()) * 100) / 100;
  });

  constructor(
    private gymService: GymEquipmentService,
    private paymentService: PaymentService
  ) {
    this.categories.set(this.gymService.getCategories());
    this.fitnessLevels.set(this.gymService.getFitnessLevels());
    this.targetMuscles.set(this.gymService.getTargetMuscles());
  }

  ngOnInit(): void {
    this.loadEquipment();
  }

  loadEquipment(): void {
    this.isLoading.set(true);
    const filters: any = {};
    if (this.selectedCategory()) filters.category = this.selectedCategory();
    if (this.selectedFitnessLevel()) filters.fitnessLevel = this.selectedFitnessLevel();
    if (this.searchQuery()) filters.search = this.searchQuery();

    this.gymService.getAllEquipment(this.currentPage(), 12, filters).subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data) {
          const data = Array.isArray(response.data) ? response.data : [response.data];
          this.equipment.set(data.map((e: any) => ({
            ...e,
            id: e._id || e.id
          })));
        }
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading equipment:', error);
        this.isLoading.set(false);
      }
    });
  }

  filterByCategory(category: string): void {
    this.selectedCategory.set(this.selectedCategory() === category ? '' : category);
    this.currentPage.set(1);
    this.loadEquipment();
  }

  filterByFitnessLevel(level: string): void {
    this.selectedFitnessLevel.set(this.selectedFitnessLevel() === level ? '' : level);
    this.currentPage.set(1);
    this.loadEquipment();
  }

  filterByTargetMuscle(muscle: string): void {
    this.selectedTargetMuscle.set(this.selectedTargetMuscle() === muscle ? '' : muscle);
    this.currentPage.set(1);
    this.loadEquipment();
  }

  search(): void {
    this.currentPage.set(1);
    this.loadEquipment();
  }

  addToCart(item: GymEquipment): void {
    const existingItem = this.cart().find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.cart.update(cart => [...cart, {
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.thumbnail || item.images?.[0],
        quantity: 1,
        category: item.category,
        targetMuscles: item.targetMuscles,
        specification: item.specifications
      }]);
    }
  }

  removeFromCart(itemId: string): void {
    this.cart.update(cart => cart.filter(item => item.id !== itemId));
  }

  updateQuantity(itemId: string, quantity: number): void {
    const item = this.cart().find(i => i.id === itemId);
    if (item && quantity > 0) {
      item.quantity = quantity;
    }
  }

  checkout(): void {
    // Validate form
    if (!this.customerName() || !this.customerEmail() || !this.customerPhone() || !this.customerAddress()) {
      this.paymentError.set('Please fill in all customer information fields');
      return;
    }

    if (!this.validateEmail(this.customerEmail())) {
      this.paymentError.set('Please enter a valid email address');
      return;
    }

    if (this.cart().length === 0) {
      this.paymentError.set('Your cart is empty');
      return;
    }

    this.isProcessingPayment.set(true);
    this.paymentError.set('');

    const checkoutData = {
      items: this.cart().map(item => ({
        ...item,
        serviceType: 'gym-equipment'
      })),
      customerEmail: this.customerEmail(),
      customerName: this.customerName(),
      customerPhone: this.customerPhone(),
      customerAddress: this.customerAddress(),
      subtotal: Math.round(this.cartTotal() * 100) / 100,
      tax: this.cartTax(),
      total: this.cartGrandTotal()
    };

    this.paymentService.createCheckoutSession(checkoutData).subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data?.sessionId) {
          // Redirect to Stripe checkout
          this.paymentService.redirectToCheckout(response.data.sessionId)
            .catch(error => {
              this.paymentError.set(error.message || 'Failed to redirect to checkout');
              this.isProcessingPayment.set(false);
            });
        } else {
          this.paymentError.set(response.message || 'Failed to create checkout session');
          this.isProcessingPayment.set(false);
        }
      },
      error: (error: any) => {
        this.paymentError.set(error.error?.message || 'Payment error occurred');
        this.isProcessingPayment.set(false);
      }
    });
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  getPriceRange(): string {
    return `$${this.minPrice()} - $${this.maxPrice()}`;
  }

  getFitnessLevelLabel(level: string): string {
    const labels: { [key: string]: string } = {
      'beginner': '🟢 Beginner',
      'intermediate': '🟡 Intermediate',
      'advanced': '🔴 Advanced',
      'all-levels': '⭐ All Levels'
    };
    return labels[level] || level;
  }

  getMuscleIcon(muscle: string): string {
    const icons: { [key: string]: string } = {
      'chest': '💪',
      'back': '🔙',
      'biceps': '💪',
      'triceps': '💪',
      'shoulders': '🤸',
      'legs': '🦵',
      'core': '⭕',
      'glutes': '🍑',
      'cardio': '❤️'
    };
    return icons[muscle] || '🏋️';
  }
}
