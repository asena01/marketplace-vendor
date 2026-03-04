import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../components/header/header.component';
import { FurnitureService, Furniture } from '../../services/furniture.service';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-furniture',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './furniture.component.html',
  styleUrl: './furniture.component.css'
})
export class FurnitureComponent implements OnInit {
  // Data
  categories = signal<any[]>([]);
  furniture = signal<Furniture[]>([]);
  cart = signal<any[]>([]);
  
  // State
  selectedCategory = signal<string>('');
  searchQuery = signal<string>('');
  minPrice = signal<number>(0);
  maxPrice = signal<number>(10000);
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
  filteredFurniture = computed(() => {
    let items = this.furniture();
    
    if (this.selectedCategory()) {
      items = items.filter(f => f.category === this.selectedCategory());
    }
    
    if (this.searchQuery()) {
      const q = this.searchQuery().toLowerCase();
      items = items.filter(f => f.name.toLowerCase().includes(q));
    }
    
    items = items.filter(f => f.price >= this.minPrice() && f.price <= this.maxPrice());
    
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
    private furnitureService: FurnitureService,
    private paymentService: PaymentService
  ) {
    this.categories.set(this.furnitureService.getCategories());
  }

  ngOnInit(): void {
    this.loadFurniture();
  }

  loadFurniture(): void {
    this.isLoading.set(true);
    const filters: any = {};
    if (this.selectedCategory()) filters.category = this.selectedCategory();
    if (this.searchQuery()) filters.search = this.searchQuery();

    this.furnitureService.getAllFurniture(this.currentPage(), 12, filters).subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data) {
          const data = Array.isArray(response.data) ? response.data : [response.data];
          this.furniture.set(data.map((f: any) => ({
            ...f,
            id: f._id || f.id
          })));
        }
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading furniture:', error);
        this.isLoading.set(false);
      }
    });
  }

  filterByCategory(category: string): void {
    this.selectedCategory.set(this.selectedCategory() === category ? '' : category);
    this.currentPage.set(1);
    this.loadFurniture();
  }

  search(): void {
    this.currentPage.set(1);
    this.loadFurniture();
  }

  addToCart(furniture: Furniture): void {
    const existingItem = this.cart().find(item => item.id === furniture.id);
    
    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.cart.update(cart => [...cart, {
        id: furniture.id,
        name: furniture.name,
        price: furniture.price,
        image: furniture.thumbnail || furniture.images?.[0],
        quantity: 1,
        category: furniture.category
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
        serviceType: 'furniture'
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
}
