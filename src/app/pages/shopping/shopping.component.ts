import { Component, signal, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../../components/header/header.component';
import { MARKETPLACE_SERVICES } from '../../shared/data/marketplace-data';
import { ProductService, Product as ApiProduct } from '../../services/product.service';
import { ReviewService, ProductReview } from '../../services/review.service';
import { PaymentService, PaymentMethod, PaymentRequest, PaymentResponse } from '../../services/payment.service';
import { CurrencyService } from '../../services/currency.service';
import { DeliveryService, DeliveryServiceDefinition } from '../../services/delivery.service';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  icon?: string;
  images?: string[]; // Multiple product images or URLs
  rating?: number;
  reviews?: number;
  sold?: number;
  discount?: number;
  inStock?: boolean;
  isFreeShipping?: boolean;
  description?: string;
  thumbnail?: string;
  size?: string[]; // Available sizes for product
  color?: string[]; // Available colors for product
  vendorId?: string; // Vendor who sells this product
  vendorName?: string; // Vendor's name
  vendorType?: string; // Vendor type (retail, restaurant, etc.)
}

interface ProductVariant {
  size?: string;
  color?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  variant?: ProductVariant; // Selected variant for this cart item
}

@Component({
  selector: 'app-shopping',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FormsModule, MatIconModule],
  templateUrl: './shopping.component.html',
  styleUrl: './shopping.component.css',
  styles: [`
    ::ng-deep mat-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      vertical-align: middle;
    }
  `]
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
  selectedVariantSize = signal<string>(''); // Selected size in Quick View
  selectedVariantColor = signal<string>(''); // Selected color in Quick View

  // Add to Cart with Variants Modal
  showAddToCartModal = signal<boolean>(false);
  addToCartProduct = signal<Product | null>(null);
  addToCartVariantSize = signal<string>(''); // Selected size in add-to-cart modal
  addToCartVariantColor = signal<string>(''); // Selected color in add-to-cart modal

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

  // Delivery related signals
  deliveryServices = signal<DeliveryServiceDefinition[]>([]);
  selectedDeliveryService = signal<DeliveryServiceDefinition | null>(null);
  deliveryAddress = signal<string>('');
  estimatedDistance = signal<number>(0);
  estimatedWeight = signal<number>(0);
  deliveryPrice = signal<number>(0);
  isCalculatingDelivery = signal<boolean>(false);
  showDeliveryOptions = signal<boolean>(false);
  deliveryError = signal<string>('');

  // Delivery options can be configured per vendor or use third-party services
  // All product types can have delivery - the vendor decides if they want to offer it

  /**
   * Check if cart needs delivery
   * In the new model, all products CAN have delivery
   * Delivery is optional but recommended for all categories
   */
  cartNeedsDelivery(): boolean {
    const items = this.cart();
    if (items.length === 0) return false;

    // In the new system, delivery is available for all products
    // This ensures customers can get delivery options regardless of product type
    const needsDelivery = items.length > 0;

    if (items.length > 0) {
      console.log('🚚 Delivery available - Cart items:', items.map(i => ({ name: i.product.name, category: i.product.category })), 'Delivery available:', needsDelivery);
    }

    return needsDelivery;
  }

  constructor(
    private productService: ProductService,
    private reviewService: ReviewService,
    private paymentService: PaymentService,
    public currencyService: CurrencyService,
    private deliveryService: DeliveryService
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

    // Auto-load delivery services when cart is opened and has items
    effect(() => {
      const cartItems = this.cart();
      if (cartItems.length > 0 && this.showCart() && this.deliveryServices().length === 0) {
        console.log('🚚 Cart opened with items, loading delivery services...');
        this.loadDeliveryServices();
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

          // Debug: Show products with variants
          const productsWithVariants = products.filter(p => (p.size && p.size.length > 0) || (p.color && p.color.length > 0));
          if (productsWithVariants.length > 0) {
            console.log('📦 Products with variants:', productsWithVariants.map(p => ({
              name: p.name,
              sizes: p.size,
              colors: p.color,
              category: p.category
            })));
          } else {
            console.log('⚠️ No products with variants loaded');
          }
        } else {
          console.log('⚠️ API returned no products');
          this.allProducts.set([]);
          this.errorMessage.set('No products available at the moment. Please check back later.');
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load products from API:', error);
        this.allProducts.set([]);
        this.errorMessage.set('Unable to load products. Please check your internet connection and try again.');
        this.isLoading.set(false);
      }
    });
  }

  // Convert API product to frontend product format
  private convertApiProductToProduct(apiProduct: ApiProduct): Product {
    // Handle rating which can be an object or number
    let rating: number | undefined;
    if (typeof apiProduct.rating === 'object' && apiProduct.rating !== null && 'average' in apiProduct.rating) {
      rating = (apiProduct.rating as any).average;
    } else if (typeof apiProduct.rating === 'number') {
      rating = apiProduct.rating;
    }

    // Map category to default Material icon
    const getCategoryIcon = (category: string): string => {
      const categoryLower = category.toLowerCase();
      if (categoryLower.includes('wear') || categoryLower.includes('cloth')) return 'shopping_bag';
      if (categoryLower.includes('shoe') || categoryLower.includes('sneaker')) return 'shoe';
      if (categoryLower.includes('jewel') || categoryLower.includes('accessory')) return 'diamond';
      if (categoryLower.includes('super') || categoryLower.includes('grocery') || categoryLower.includes('food')) return 'shopping_cart';
      return 'inventory_2';
    };

    return {
      id: apiProduct._id || apiProduct.id || '',
      name: apiProduct.name,
      price: apiProduct.price,
      originalPrice: apiProduct.originalPrice || apiProduct.price || 0,
      category: apiProduct.category,
      icon: apiProduct.icon || getCategoryIcon(apiProduct.category),
      images: apiProduct.images && apiProduct.images.length > 0 ? apiProduct.images : [apiProduct.thumbnail || ''],
      rating: rating ?? 0,
      reviews: apiProduct.reviews ?? 0,
      sold: apiProduct.sold ?? 0,
      discount: apiProduct.discount ?? 0,
      inStock: apiProduct.inStock ?? true,
      isFreeShipping: apiProduct.isFreeShipping ?? false,
      description: apiProduct.description,
      thumbnail: apiProduct.thumbnail,
      size: apiProduct.size || [],  // Map size variants from API
      color: apiProduct.color || [], // Map color variants from API
      vendorId: (apiProduct as any).vendor || (apiProduct as any).vendorId,  // Map vendor ID
      vendorName: (apiProduct as any).vendorName,  // Map vendor name
      vendorType: (apiProduct as any).vendorType  // Map vendor type
    };
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
        products = [...products].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case 'newest':
        products = [...products].reverse();
        break;
      default:
        // Popular (by sold)
        products = [...products].sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0));
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

  addToCart(product: Product, variant?: ProductVariant): void {
    // Check if user is logged in
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('Please log in to add items to your cart. Redirecting to login...');
      window.location.href = '/login';
      return;
    }

    // If product has variants and no variant was provided, show variant selection modal
    if ((product.size && product.size.length > 0) || (product.color && product.color.length > 0)) {
      if (!variant) {
        // Show modal to select variants
        this.addToCartProduct.set(product);
        this.addToCartVariantSize.set('');
        this.addToCartVariantColor.set('');
        this.showAddToCartModal.set(true);
        return;
      }
    }

    // Add to cart with the provided variant (or no variant if not applicable)
    this.addToCartWithVariant(product, variant);
  }

  /**
   * Actually add the product to cart with the variant
   */
  private addToCartWithVariant(product: Product, variant?: ProductVariant): void {
    this.cart.update(items => {
      // For products with variants, match on both product ID and variant
      const existingItem = items.find(item =>
        item.product.id === product.id &&
        this.variantsMatch(item.variant, variant)
      );

      if (existingItem) {
        existingItem.quantity += 1;
        return [...items];
      }

      return [...items, { product, quantity: 1, variant }];
    });
  }

  /**
   * Confirm and add from the variant selection modal
   */
  confirmAddToCart(): void {
    const product = this.addToCartProduct();
    if (!product) return;

    const variant: ProductVariant = {
      size: this.addToCartVariantSize(),
      color: this.addToCartVariantColor()
    };

    // Only include variant if at least one option is selected
    const variantToAdd = (variant.size || variant.color) ? variant : undefined;

    this.addToCartWithVariant(product, variantToAdd);
    this.closeAddToCartModal();
    this.showCart.set(true);
  }

  closeAddToCartModal(): void {
    this.showAddToCartModal.set(false);
    this.addToCartProduct.set(null);
    this.addToCartVariantSize.set('');
    this.addToCartVariantColor.set('');
  }

  /**
   * Check if two variants are the same
   */
  private variantsMatch(v1?: ProductVariant, v2?: ProductVariant): boolean {
    if (!v1 && !v2) return true;
    if (!v1 || !v2) return false;
    return v1.size === v2.size && v1.color === v2.color;
  }

  removeFromCart(productId: string, variant?: ProductVariant): void {
    this.cart.update(items =>
      items.filter(item => !(
        item.product.id === productId &&
        this.variantsMatch(item.variant, variant)
      ))
    );
  }

  updateCartQuantity(productId: string, quantity: number, variant?: ProductVariant): void {
    if (quantity <= 0) {
      this.removeFromCart(productId, variant);
      return;
    }
    this.cart.update(items =>
      items.map(item =>
        item.product.id === productId && this.variantsMatch(item.variant, variant)
          ? { ...item, quantity }
          : item
      )
    );
  }

  openQuickView(product: Product): void {
    this.quickViewProduct.set(product);
    this.selectedImageIndex.set(0);
    this.selectedVariantSize.set(''); // Reset variant selections
    this.selectedVariantColor.set('');
    this.showQuickView.set(true);
    this.loadProductReviews(product.id);
    this.resetReviewForm();
  }

  closeQuickView(): void {
    this.showQuickView.set(false);
    this.quickViewProduct.set(null);
    this.selectedImageIndex.set(0);
    this.selectedVariantSize.set('');
    this.selectedVariantColor.set('');
  }

  selectImage(index: number): void {
    this.selectedImageIndex.set(index);
  }

  addQuickViewToCart(): void {
    const product = this.quickViewProduct();
    if (product) {
      // Build variant object from selected values
      const variant: ProductVariant = {
        size: this.selectedVariantSize(),
        color: this.selectedVariantColor()
      };

      // Only include variant if at least one option is selected
      const variantToAdd = (variant.size || variant.color) ? variant : undefined;

      this.addToCart(product, variantToAdd);
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

    if (!this.validateDeliveryInfo()) {
      alert(this.deliveryError());
      this.showDeliveryOptions.set(true);
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
      { id: 'credit_card', name: 'Credit Card', icon: 'credit_card', description: 'Visa, Mastercard, Amex' },
      { id: 'debit_card', name: 'Debit Card', icon: 'account_balance', description: 'Bank Debit Card' },
      { id: 'bank_transfer', name: 'Bank Transfer', icon: 'business', description: 'Direct bank transfer' },
      { id: 'mobile_money', name: 'Mobile Money', icon: 'phone_android', description: 'MTN, Airtel, Vodafone' },
      { id: 'wallet', name: 'Digital Wallet', icon: 'account_balance_wallet', description: 'Use your wallet balance' }
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

    // Create payment request with cart items and delivery
    const paymentRequest: PaymentRequest = {
      orderId: `ORD-${Date.now()}`,
      amount: this.getTotalWithDelivery(), // Include delivery cost in total
      currency: 'NGN',
      paymentMethod: paymentMethod,
      // Add customer and cart info (including variant selections and vendor info)
      items: this.cart().map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        category: item.product.category,
        image: item.product.icon || item.product.images?.[0] || 'inventory_2',
        // Include selected variant (size/color)
        variant: item.variant ? {
          size: item.variant.size,
          color: item.variant.color
        } : undefined,
        // Include vendor information to route transaction to the correct vendor
        vendorId: item.product.vendorId,
        vendorName: item.product.vendorName,
        vendorType: item.product.vendorType
      })),
      userId: userId,
      userEmail: userEmail,
      customerName: userName,
      storeName: 'MarketHub Shopping',
      // Add delivery information
      deliveryInfo: {
        serviceId: this.selectedDeliveryService()?.id,
        serviceName: this.selectedDeliveryService()?.name,
        address: this.deliveryAddress(),
        distance: this.estimatedDistance() || 10,
        estimatedTime: this.selectedDeliveryService()?.estimatedDeliveryTime.standard,
        price: this.deliveryPrice()
      } as any
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
    // Only validate delivery if cart needs delivery
    if (this.cartNeedsDelivery()) {
      if (!this.selectedDeliveryService()) {
        this.paymentError.set('Please select a delivery service');
        return false;
      }
      // Only require address for non-local services (remote delivery)
      // Local services (self-pickup, seller-delivery) don't need an address
      const isLocalService = this.isLocalDeliveryService();
      if (!isLocalService && !this.deliveryAddress()) {
        this.paymentError.set('Please enter a delivery address');
        return false;
      }
    }

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
  formatPrice(amount: number | undefined): string {
    return this.currencyService.formatPrice(amount ?? 0);
  }

  /**
   * Format delivery time from minutes to readable format
   */
  formatDeliveryTime(service: DeliveryServiceDefinition | null): string {
    if (!service) return 'N/A';
    const minutes = service.estimatedDeliveryTime.standard;
    if (minutes < 60) {
      return `${minutes} mins`;
    } else if (minutes < 1440) { // Less than 24 hours
      const hours = Math.ceil(minutes / 60);
      return `${hours}h`;
    } else {
      const days = Math.ceil(minutes / 1440);
      return `${days} day${days > 1 ? 's' : ''}`;
    }
  }

  /**
   * Change currency manually
   */
  changeCurrency(event: any): void {
    const currencyCode = event.target?.value || event;
    this.currencyService.setCurrency(currencyCode);
  }

  // ============================================
  // DELIVERY METHODS
  // ============================================

  /**
   * Load available delivery services
   * Combines retailer's own delivery options with third-party services
   */
  loadDeliveryServices(): void {
    const cartItems = this.cart();
    if (cartItems.length === 0) {
      console.warn('⚠️ No items in cart, cannot load delivery services');
      return;
    }

    const allServices: DeliveryServiceDefinition[] = [];
    const serviceIds = new Set<string>();

    // 1. Try to add retailer's own delivery service
    // In a real scenario, each retailer (vendor) would have their own delivery config
    // For now, we'll create a generic "Seller Delivery" option
    const retailerService: DeliveryServiceDefinition = {
      id: 'seller-delivery',
      name: 'Seller Delivery',
      category: 'package',
      description: 'Delivered by the seller',
      pricing: {
        basePrice: 0, // Free delivery from seller
        perKmRate: 0,
        perKgRate: 0,
        sizeMultiplier: 1
      },
      estimatedDeliveryTime: {
        standard: 1440, // 24 hours
        rush: 480       // 8 hours
      },
      availableVehicles: ['car', 'van'],
      supportedBusinessTypes: ['retail'],
      isActive: true
    };

    allServices.push(retailerService);
    serviceIds.add(retailerService.id);

    // 2. Add third-party delivery services as alternatives
    const thirdPartyServices = this.deliveryService.getAvailableServices('retail');
    console.log('📦 Third-party services available for retail:', thirdPartyServices.length, thirdPartyServices);
    thirdPartyServices.forEach(service => {
      if (!serviceIds.has(service.id)) {
        allServices.push(service);
        serviceIds.add(service.id);
      }
    });

    // 3. Add a free local pickup option
    const pickupService: DeliveryServiceDefinition = {
      id: 'self-pickup',
      name: 'Self Pickup',
      category: 'package',
      description: 'Pickup from store location',
      pricing: {
        basePrice: 0,
        perKmRate: 0,
        perKgRate: 0,
        sizeMultiplier: 1
      },
      estimatedDeliveryTime: {
        standard: 60,   // 1 hour
        rush: 30        // 30 mins
      },
      availableVehicles: ['bike', 'car', 'van'],
      supportedBusinessTypes: ['retail'],
      isActive: true
    };

    allServices.push(pickupService);

    this.deliveryServices.set(allServices);
    console.log('✅ Loaded', allServices.length, 'delivery options:');
    allServices.forEach(s => console.log(`   • ${s.name} - ₦${s.pricing.basePrice || 'FREE'}`));
  }

  /**
   * Select a delivery service and calculate price
   */
  selectDeliveryService(service: DeliveryServiceDefinition): void {
    this.selectedDeliveryService.set(service);
    console.log('📦 Selected delivery service:', service.name);
    this.calculateDeliveryPrice();
  }

  /**
   * Calculate delivery price based on selected service and cart weight/distance
   */
  calculateDeliveryPrice(): void {
    const service = this.selectedDeliveryService();
    if (!service) {
      this.deliveryError.set('Please select a delivery service');
      return;
    }

    this.isCalculatingDelivery.set(true);
    this.deliveryError.set('');

    // For self-pickup and seller delivery, no address required (they're free/local)
    // For other services, address is required
    const isLocalService = this.isLocalDeliveryService();

    if (!isLocalService && !this.deliveryAddress()) {
      this.deliveryError.set('Please enter a delivery address');
      this.isCalculatingDelivery.set(false);
      return;
    }

    // Calculate estimated weight from cart items (assume 0.5kg per item)
    const weight = this.cartItemsCount * 0.5;

    // Estimate distance (default to 10km for non-local services)
    const distance = isLocalService ? 0 : (this.estimatedDistance() || 10);

    console.log(`📊 Calculating delivery: service=${service.name}, type=${isLocalService ? 'local' : 'standard'}, distance=${distance}km, weight=${weight}kg`);

    // Calculate price
    let price = 0;

    // Check if service is free (seller delivery, self pickup)
    if (service.pricing.basePrice === 0 && service.pricing.perKmRate === 0 && service.pricing.perKgRate === 0) {
      price = 0;
      console.log(`✅ Free delivery: ${service.name}`);
    } else {
      // Calculate based on service pricing
      price = this.deliveryService.calculatePrice(service, distance, weight);
      console.log(`✅ Delivery price calculated: ${this.formatPrice(price)} (base: ₦${service.pricing.basePrice}, per km: ₦${service.pricing.perKmRate}, per kg: ₦${service.pricing.perKgRate})`);
    }

    this.deliveryPrice.set(price);

    this.isCalculatingDelivery.set(false);
  }

  /**
   * Get total with delivery cost
   */
  getTotalWithDelivery(): number {
    return this.cartTotal + this.deliveryPrice();
  }

  /**
   * Validate delivery information before checkout
   * Address is optional for local services (pickup, seller delivery)
   */
  validateDeliveryInfo(): boolean {
    if (!this.selectedDeliveryService()) {
      this.deliveryError.set('Please select a delivery service');
      return false;
    }

    const isLocalService = this.isLocalDeliveryService();

    // Only require address for non-local services
    if (!isLocalService && !this.deliveryAddress()) {
      this.deliveryError.set('Please enter a delivery address');
      return false;
    }

    return true;
  }

  /**
   * Open delivery options panel
   */
  openDeliveryOptions(): void {
    this.showDeliveryOptions.set(true);
    if (this.deliveryServices().length === 0) {
      console.log('📦 Delivery services empty, loading...');
      this.loadDeliveryServices();
    } else {
      console.log('📦 Delivery services already loaded:', this.deliveryServices().length);
    }
  }

  /**
   * Close delivery options panel
   */
  closeDeliveryOptions(): void {
    this.showDeliveryOptions.set(false);
  }

  /**
   * Check if selected delivery service is a local service (no address required)
   */
  isLocalDeliveryService(): boolean {
    const service = this.selectedDeliveryService();
    return service ? ['self-pickup', 'seller-delivery'].includes(service.id) : false;
  }
}
