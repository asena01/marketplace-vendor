import { Component, signal, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../components/header/header.component';
import { MARKETPLACE_SERVICES } from '../../shared/data/marketplace-data';
import { ProductService, Product as ApiProduct } from '../../services/product.service';
import { ReviewService, ProductReview } from '../../services/review.service';
import { PaymentService, PaymentMethod, PaymentRequest, PaymentResponse } from '../../services/payment.service';
import { CurrencyService } from '../../services/currency.service';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  category: string;
  icon?: string;
  images: string[]; // Multiple product images or URLs
  rating: number;
  reviews: number;
  sold: number;
  discount: number;
  inStock: boolean;
  isFreeShipping: boolean;
  description?: string;
  thumbnail?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

@Component({
  selector: 'app-shopping',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FormsModule],
  templateUrl: './shopping.component.html',
  styleUrl: './shopping.component.css'
})
export class ShoppingComponent implements OnInit {
  shoppingService = MARKETPLACE_SERVICES.find(s => s.id === 'shopping')!;
  categories = this.shoppingService.categories || [];

  // Signals for state management
  searchQuery = signal<string>('');
  selectedCategory = signal<string>('all');
  sortBy = signal<string>('popular');
  showCart = signal<boolean>(false);
  wishlist = signal<string[]>([]);
  cart = signal<CartItem[]>([]);
  showQuickView = signal<boolean>(false);
  quickViewProduct = signal<Product | null>(null);
  selectedImageIndex = signal<number>(0);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');
  showReviewForm = signal<boolean>(false);
  productReviews = signal<ProductReview[]>([]);
  reviewRating = signal<number>(5);
  reviewTitle = signal<string>('');
  reviewComment = signal<string>('');
  submittingReview = signal<boolean>(false);

  // Payment related signals
  showPaymentModal = signal<boolean>(false);
  paymentMethods = signal<PaymentMethod[]>([]);
  selectedPaymentMethod = signal<string>('');
  isProcessingPayment = signal<boolean>(false);
  paymentError = signal<string>('');
  paymentSuccess = signal<boolean>(false);
  transactionId = signal<string>('');

  // Card details for credit card payment
  cardNumber = signal<string>('');
  cardholderName = signal<string>('');
  expiryMonth = signal<string>('');
  expiryYear = signal<string>('');
  cvv = signal<string>('');

  // Bank transfer details
  bankName = signal<string>('');
  accountNumber = signal<string>('');
  accountName = signal<string>('');
  bankCode = signal<string>('');

  // Mobile money details
  mobileMoneyProvider = signal<string>('');
  phoneNumber = signal<string>('');

  constructor(
    private productService: ProductService,
    private reviewService: ReviewService,
    private paymentService: PaymentService,
    public currencyService: CurrencyService
  ) {
    // Prevent body scroll when cart is open
    effect(() => {
      const isCartOpen = this.showCart();
      if (isCartOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  // Products from backend
  allProducts = signal<Product[]>([]);

  // Load products from backend
  loadProducts(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.productService.getProducts(1, 50).subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.length > 0) {
          const products = response.data.map((apiProduct: ApiProduct) => this.convertApiProductToProduct(apiProduct));
          this.allProducts.set(products);
          console.log('✅ Loaded', products.length, 'products from API');
        } else {
          console.log('⚠️ API returned no products, loading sample data');
          this.loadSampleProducts();
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load products from API:', error);
        // Fallback to sample data
        this.loadSampleProducts();
        this.isLoading.set(false);
        console.log('✅ Loaded', this.allProducts().length, 'sample products (fallback)');
      }
    });
  }

  // Convert API product to frontend product format
  private convertApiProductToProduct(apiProduct: ApiProduct): Product {
    return {
      id: apiProduct._id || apiProduct.id || '',
      name: apiProduct.name,
      price: apiProduct.price,
      originalPrice: apiProduct.originalPrice || apiProduct.price,
      category: apiProduct.category,
      icon: apiProduct.icon || '📦',
      images: apiProduct.images && apiProduct.images.length > 0 ? apiProduct.images : [apiProduct.thumbnail || apiProduct.icon || '📦'],
      rating: apiProduct.rating,
      reviews: apiProduct.reviews,
      sold: apiProduct.sold,
      discount: apiProduct.discount,
      inStock: apiProduct.inStock,
      isFreeShipping: apiProduct.isFreeShipping,
      description: apiProduct.description,
      thumbnail: apiProduct.thumbnail
    };
  }

  // Load fallback sample products if backend fails
  private loadSampleProducts(): void {
    const sampleProducts: Product[] = [
      { id: '1', name: 'Premium Winter Jacket', price: 45.99, originalPrice: 89.99, category: 'Adult Wears', icon: '🧥', images: ['🧥', '🧥‍♂️', '🧤'], rating: 4.8, reviews: 2345, sold: 5200, discount: 49, inStock: true, isFreeShipping: true, description: 'Premium quality winter jacket with warm lining. Perfect for cold weather.' },
      { id: '2', name: 'Trendy Kids Sneakers', price: 32.99, originalPrice: 59.99, category: 'Children Wears', icon: '👟', images: ['👟', '👞', '🩴'], rating: 4.7, reviews: 1890, sold: 4100, discount: 45, inStock: true, isFreeShipping: true, description: 'Comfortable and stylish sneakers for kids.' },
      { id: '3', name: 'Gold Necklace Set', price: 18.99, originalPrice: 89.99, category: 'Jewelry', icon: '⛓️', images: ['⛓️', '💍', '👑'], rating: 4.9, reviews: 3456, sold: 6700, discount: 79, inStock: true, isFreeShipping: true, description: 'Elegant gold necklace set with matching pendant.' },
      { id: '4', name: 'Organic Fresh Box', price: 22.99, originalPrice: 45.99, category: 'Supermarkets', icon: '🥬', images: ['🥬', '🥕', '🌽'], rating: 4.6, reviews: 1200, sold: 3400, discount: 50, inStock: true, isFreeShipping: false, description: 'Fresh organic vegetables delivered to your door.' },
      { id: '5', name: 'Casual Summer Dress', price: 28.99, originalPrice: 69.99, category: 'Adult Wears', icon: '👗', images: ['👗', '👔', '👠'], rating: 4.8, reviews: 2678, sold: 5890, discount: 59, inStock: true, isFreeShipping: true, description: 'Light and comfortable summer dress.' },
      { id: '6', name: 'Fun Toy Set Pack', price: 21.99, originalPrice: 49.99, category: 'Children Wears', icon: '🧸', images: ['🧸', '🎮', '🚂'], rating: 4.7, reviews: 987, sold: 2340, discount: 56, inStock: true, isFreeShipping: true, description: 'Entertaining toy set for children.' },
    ];
    this.allProducts.set(sampleProducts);
  }

  get filteredProducts(): Product[] {
    let products = this.allProducts();

    // Filter by search
    if (this.searchQuery()) {
      products = products.filter(p =>
        p.name.toLowerCase().includes(this.searchQuery().toLowerCase())
      );
    }

    // Filter by category
    if (this.selectedCategory() !== 'all') {
      products = products.filter(p => p.category === this.selectedCategory());
    }

    // Sort
    switch (this.sortBy()) {
      case 'price-low':
        products = [...products].sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        products = [...products].sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        products = [...products].sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        products = [...products].reverse();
        break;
      default:
        // Popular (by sold)
        products = [...products].sort((a, b) => b.sold - a.sold);
    }

    return products;
  }

  get cartTotal(): number {
    return this.cart().reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }

  get cartItemsCount(): number {
    return this.cart().reduce((sum, item) => sum + item.quantity, 0);
  }

  toggleWishlist(productId: string): void {
    this.wishlist.update(items =>
      items.includes(productId) ? items.filter(id => id !== productId) : [...items, productId]
    );
  }

  isInWishlist(productId: string): boolean {
    return this.wishlist().includes(productId);
  }

  addToCart(product: Product): void {
    this.cart.update(items => {
      const existingItem = items.find(item => item.product.id === product.id);
      if (existingItem) {
        existingItem.quantity += 1;
        return [...items];
      }
      return [...items, { product, quantity: 1 }];
    });
  }

  removeFromCart(productId: string): void {
    this.cart.update(items => items.filter(item => item.product.id !== productId));
  }

  updateCartQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    this.cart.update(items =>
      items.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }

  openQuickView(product: Product): void {
    this.quickViewProduct.set(product);
    this.selectedImageIndex.set(0);
    this.showQuickView.set(true);
    this.loadProductReviews(product.id);
    this.resetReviewForm();
  }

  closeQuickView(): void {
    this.showQuickView.set(false);
    this.quickViewProduct.set(null);
    this.selectedImageIndex.set(0);
  }

  selectImage(index: number): void {
    this.selectedImageIndex.set(index);
  }

  addQuickViewToCart(): void {
    const product = this.quickViewProduct();
    if (product) {
      this.addToCart(product);
      this.closeQuickView();
      this.showCart.set(true);
    }
  }

  loadProductReviews(productId: string): void {
    this.reviewService.getProductReviews(productId, 1, 10).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.productReviews.set(response.data);
        }
      },
      error: (error) => {
        console.error('Failed to load reviews:', error);
        this.productReviews.set([]);
      }
    });
  }

  resetReviewForm(): void {
    this.reviewTitle.set('');
    this.reviewComment.set('');
    this.reviewRating.set(5);
    this.showReviewForm.set(false);
  }

  submitReview(): void {
    const product = this.quickViewProduct();
    const userId = localStorage.getItem('userId');

    if (!userId) {
      alert('Please log in to submit a review');
      return;
    }

    if (!this.reviewTitle() || !this.reviewComment()) {
      alert('Please fill in all review fields');
      return;
    }

    if (!product) return;

    this.submittingReview.set(true);

    const review: Partial<ProductReview> = {
      productId: product.id,
      rating: this.reviewRating(),
      title: this.reviewTitle(),
      comment: this.reviewComment(),
      verified: true
    };

    this.reviewService.createReview(review).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Review submitted successfully!');
          this.loadProductReviews(product.id);
          this.resetReviewForm();
          this.submittingReview.set(false);
        }
      },
      error: (error) => {
        console.error('Failed to submit review:', error);
        alert('Failed to submit review. Please try again.');
        this.submittingReview.set(false);
      }
    });
  }

  deleteReview(reviewId: string | undefined): void {
    if (!reviewId) return;

    if (!confirm('Are you sure you want to delete this review?')) return;

    this.reviewService.deleteReview(reviewId).subscribe({
      next: (response) => {
        if (response.success) {
          const product = this.quickViewProduct();
          if (product) {
            this.loadProductReviews(product.id);
          }
        }
      },
      error: (error) => {
        console.error('Failed to delete review:', error);
        alert('Failed to delete review');
      }
    });
  }

  // ============================================
  // PAYMENT METHODS
  // ============================================

  openPaymentModal(): void {
    if (this.cart().length === 0) {
      alert('Your cart is empty. Add items before proceeding to payment.');
      return;
    }

    this.showPaymentModal.set(true);
    this.loadPaymentMethods();
    this.paymentError.set('');
    this.paymentSuccess.set(false);

    // Auto-fill test card details for testing
    this.autoFillTestCardDetails();
  }

  private autoFillTestCardDetails(): void {
    // Test Visa card (valid Luhn number for testing)
    this.cardNumber.set('4532015112830366');
    this.cardholderName.set('Test User');
    this.expiryMonth.set('12');
    this.expiryYear.set('2027');
    this.cvv.set('123');
    console.log('✅ Test card auto-filled: 4532015112830366');
  }

  closePaymentModal(): void {
    this.showPaymentModal.set(false);
    this.selectedPaymentMethod.set('');
    this.resetPaymentForm();
  }

  loadPaymentMethods(): void {
    // Load default payment methods
    this.loadDefaultPaymentMethods();

    // Try to fetch from API if available
    this.paymentService.getPaymentMethods().subscribe({
      next: (response: any) => {
        if (response.success && response.data && response.data.length > 0) {
          this.paymentMethods.set(response.data);
        }
      },
      error: (error: any) => {
        console.error('Failed to load payment methods from API:', error);
        // Keep using default payment methods
      }
    });
  }

  private loadDefaultPaymentMethods(): void {
    const defaultMethods: PaymentMethod[] = [
      { id: 'credit_card', name: 'Credit Card', icon: '💳', description: 'Visa, Mastercard, Amex' },
      { id: 'debit_card', name: 'Debit Card', icon: '🏦', description: 'Bank Debit Card' },
      { id: 'bank_transfer', name: 'Bank Transfer', icon: '🏪', description: 'Direct bank transfer' },
      { id: 'mobile_money', name: 'Mobile Money', icon: '📱', description: 'MTN, Airtel, Vodafone' },
      { id: 'wallet', name: 'Digital Wallet', icon: '💰', description: 'Use your wallet balance' }
    ];
    this.paymentMethods.set(defaultMethods);
  }

  submitPayment(): void {
    const paymentMethod = this.selectedPaymentMethod();

    if (!paymentMethod) {
      this.paymentError.set('Please select a payment method');
      return;
    }

    console.log('📝 Validating payment details for method:', paymentMethod);

    // Validate based on payment method
    if (!this.validatePaymentDetails(paymentMethod)) {
      console.error('❌ Validation failed:', this.paymentError());
      return;
    }

    console.log('✅ Validation passed');

    this.isProcessingPayment.set(true);
    this.paymentError.set('');

    // Get user info from localStorage
    const userId = localStorage.getItem('userId') || '';
    const userEmail = localStorage.getItem('userEmail') || 'customer@example.com';
    const userName = localStorage.getItem('userName') || 'Customer';

    // Create payment request with cart items
    const paymentRequest: PaymentRequest = {
      orderId: `ORD-${Date.now()}`,
      amount: this.cartTotal,
      currency: 'NGN',
      paymentMethod: paymentMethod,
      // Add customer and cart info
      items: this.cart().map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        category: item.product.category,
        image: item.product.icon || item.product.images?.[0] || '📦'
      })),
      userId: userId,
      userEmail: userEmail,
      customerName: userName,
      storeName: 'MarketHub Shopping'
    };

    // Add payment details based on method
    switch (paymentMethod) {
      case 'credit_card':
      case 'debit_card':
        paymentRequest.cardDetails = {
          cardNumber: this.cardNumber(),
          cardholderName: this.cardholderName(),
          expiryMonth: this.expiryMonth(),
          expiryYear: this.expiryYear(),
          cvv: this.cvv()
        };
        console.log('💳 Card details added');
        break;
      case 'bank_transfer':
        paymentRequest.bankDetails = {
          bankName: this.bankName(),
          accountNumber: this.accountNumber(),
          accountName: this.accountName(),
          bankCode: this.bankCode()
        };
        console.log('🏦 Bank details added');
        break;
      case 'mobile_money':
        paymentRequest.mobileMoneyDetails = {
          provider: this.mobileMoneyProvider(),
          phoneNumber: this.phoneNumber()
        };
        console.log('📱 Mobile money details added');
        break;
      case 'wallet':
        paymentRequest.walletDetails = {
          walletId: localStorage.getItem('userId') || ''
        };
        console.log('💰 Wallet details added');
        break;
    }

    console.log('🚀 Submitting payment request:', paymentRequest);

    // Submit payment
    console.log('💰 Cart total:', this.cartTotal);
    console.log('📦 Cart items:', this.cart());

    this.paymentService.processPayment(paymentRequest).subscribe({
      next: (response: any) => {
        console.log('📥 Payment response:', response);
        if (response.success && response.data) {
          console.log('✅ Payment successful');
          this.handlePaymentSuccess(response.data);
        } else {
          console.error('❌ Payment failed:', response.message);
          this.paymentError.set(response.message || 'Payment failed. Please try again.');
        }
        this.isProcessingPayment.set(false);
      },
      error: (error: any) => {
        console.error('❌ Payment processing error - Full error:', error);
        console.error('Error status:', error.status);
        console.error('Error statusText:', error.statusText);
        console.error('Error body:', error.error);
        this.paymentError.set(error.error?.message || error.statusText || 'An error occurred while processing payment');
        this.isProcessingPayment.set(false);
      }
    });
  }

  private validatePaymentDetails(paymentMethod: string): boolean {
    switch (paymentMethod) {
      case 'credit_card':
      case 'debit_card':
        console.log('📋 Validating card details:', {
          cardNumber: this.cardNumber(),
          cardholderName: this.cardholderName(),
          expiryMonth: this.expiryMonth(),
          expiryYear: this.expiryYear(),
          cvv: this.cvv()
        });

        if (!this.cardNumber() || !this.cardholderName() || !this.expiryMonth() || !this.expiryYear() || !this.cvv()) {
          console.error('❌ Missing card fields');
          this.paymentError.set('Please fill in all card details');
          return false;
        }

        const isCardNumberValid = this.paymentService.validateCardNumber(this.cardNumber());
        console.log('💳 Card number valid:', isCardNumberValid);
        if (!isCardNumberValid) {
          this.paymentError.set('Invalid card number');
          return false;
        }

        const isCVVValid = this.paymentService.validateCVV(this.cvv());
        console.log('🔐 CVV valid:', isCVVValid);
        if (!isCVVValid) {
          this.paymentError.set('Invalid CVV (3-4 digits)');
          return false;
        }

        const isExpiryValid = this.paymentService.validateExpiryDate(this.expiryMonth(), this.expiryYear());
        console.log('📅 Expiry date valid:', isExpiryValid);
        if (!isExpiryValid) {
          this.paymentError.set('Card has expired or invalid expiry date');
          return false;
        }

        console.log('✅ All card validations passed');
        return true;

      case 'bank_transfer':
        if (!this.bankName() || !this.accountNumber() || !this.accountName() || !this.bankCode()) {
          this.paymentError.set('Please fill in all bank details');
          return false;
        }
        return true;

      case 'mobile_money':
        if (!this.mobileMoneyProvider() || !this.phoneNumber()) {
          this.paymentError.set('Please fill in mobile money details');
          return false;
        }
        if (!/^\d{10}$/.test(this.phoneNumber().replace(/\D/g, ''))) {
          this.paymentError.set('Invalid phone number format');
          return false;
        }
        return true;

      case 'wallet':
        return true;

      default:
        this.paymentError.set('Invalid payment method');
        return false;
    }
  }

  private handlePaymentSuccess(response: PaymentResponse): void {
    this.paymentSuccess.set(true);
    this.transactionId.set(response.transactionId || 'TXN-' + Date.now());

    // Clear cart after successful payment
    setTimeout(() => {
      this.cart.set([]);
      this.showPaymentModal.set(false);
      alert(`✅ Payment Successful!\nTransaction ID: ${response.transactionId || 'TXN-' + Date.now()}\nAmount: ₦${(response.amount || this.cartTotal).toLocaleString()}`);
      this.paymentSuccess.set(false);
      this.resetPaymentForm();
    }, 2000);
  }

  private resetPaymentForm(): void {
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
    this.phoneNumber.set('');
  }

  /**
   * Format price with current currency
   */
  formatPrice(amount: number): string {
    return this.currencyService.formatPrice(amount);
  }

  /**
   * Change currency manually
   */
  changeCurrency(event: any): void {
    const currencyCode = event.target?.value || event;
    this.currencyService.setCurrency(currencyCode);
  }
}
