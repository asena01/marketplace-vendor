const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

const fileContents = {
  // ==================== MODELS ====================
  'src/app/core/models/product.model.ts': `export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  category: string;
  subcategory: string;
  images: string[];
  price: number;
  originalPrice: number;
  discount: number;
  stock: number;
  rating: number;
  reviews: number;
  status: 'active' | 'inactive' | 'draft';
  tags: string[];
  specifications: { [key: string]: string };
  shipping: {
    weight: number;
    dimensions: string;
    shippingCost: number;
  };
  affiliateCommissionRate: number;
  createdAt: Date;
  updatedAt: Date;
  vendorId: string;
}

export interface ProductFilter {
  search?: string;
  category?: string;
  status?: string;
  priceMin?: number;
  priceMax?: number;
  sortBy?: 'name' | 'price' | 'rating' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}`,

  'src/app/core/models/order.model.ts': `export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: Address;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'failed';
  paymentMethod: string;
  shippingTrackingNumber?: string;
  affiliateLinkId?: string;
  affiliateId?: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  expectedDelivery: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Address {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderFilter {
  status?: string;
  paymentStatus?: string;
  dateFrom?: Date;
  dateTo?: Date;
  customerName?: string;
  affiliateId?: string;
}

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
}`,

  'src/app/core/models/vendor.model.ts': `export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  storeName: string;
  storeDescription: string;
  avatar: string;
  banner: string;
  rating: number;
  totalReviews: number;
  createdAt: Date;
  status: 'active' | 'inactive' | 'suspended';
  location: {
    country: string;
    city: string;
  };
  bankDetails: {
    accountHolder: string;
    accountNumber: string;
    bankName: string;
  };
  affiliateSettings: {
    defaultCommissionRate: number;
    minWithdrawal: number;
    payoutFrequency: 'weekly' | 'monthly';
    requireApproval: boolean;
  };
}`,

  'src/app/core/models/review.model.ts': `export interface Review {
  id: string;
  productId: string;
  customerId: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  verified: boolean;
  helpfulCount: number;
  createdAt: Date;
  response?: {
    vendorResponse: string;
    respondedAt: Date;
  };
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    [key: number]: number;
  };
}`,

  'src/app/core/models/affiliate.model.ts': `export interface Affiliate {
  id: string;
  vendorId: string;
  name: string;
  email: string;
  phone: string;
  website?: string;
  socialMedia?: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    twitter?: string;
  };
  commissionRate: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  status: 'pending' | 'active' | 'suspended' | 'inactive';
  totalEarnings: number;
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  totalReferredSales: number;
  lastPaymentAmount: number;
  lastPaymentDate: Date;
  nextPaymentDue: number;
  bankDetails: {
    accountHolder: string;
    accountNumber: string;
    bankName: string;
  };
  notes: string;
  createdAt: Date;
  approvedAt?: Date;
  suspendedAt?: Date;
  suspensionReason?: string;
}

export interface AffiliateFilter {
  search?: string;
  status?: string;
  tier?: string;
  sortBy?: 'name' | 'earnings' | 'conversions' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface AffiliateStats {
  totalAffiliates: number;
  activeAffiliates: number;
  totalEarnings: number;
  totalCommissions: number;
  pendingPayouts: number;
  topAffiliates: Affiliate[];
}`,

  'src/app/core/models/affiliate-link.model.ts': `export interface AffiliateLink {
  id: string;
  affiliateId: string;
  vendorId: string;
  productId?: string;
  uniqueCode: string;
  fullLink: string;
  clicks: number;
  conversions: number;
  earnings: number;
  conversionRate: number;
  status: 'active' | 'inactive';
  createdAt: Date;
}`,

  'src/app/core/models/commission.model.ts': `export interface Commission {
  id: string;
  affiliateId: string;
  orderId: string;
  productId: string;
  vendorId: string;
  saleAmount: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  createdAt: Date;
  approvedAt?: Date;
  paidAt?: Date;
}

export interface CommissionStats {
  pendingAmount: number;
  approvedAmount: number;
  paidAmount: number;
  totalCommissions: number;
  averageCommission: number;
}`,

  'src/app/core/models/payout.model.ts': `import { Commission } from './commission.model';

export interface Payout {
  id: string;
  affiliateId: string;
  vendorId: string;
  amount: number;
  commissions: Commission[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  paymentMethod: string;
  transactionId?: string;
  createdAt: Date;
  scheduledDate: Date;
  completedAt?: Date;
  failureReason?: string;
}`,

  'src/app/core/models/analytics.model.ts': `import { Product } from './product.model';
import { Order } from './order.model';
import { Affiliate } from './affiliate.model';

export interface Analytics {
  totalSales: number;
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  avgOrderValue: number;
  conversionRate: number;
  customerCount: number;
  returnRate: number;
  totalAffiliates: number;
  affiliateRevenue: number;
  affiliateCommissionsPaid: number;
  affiliateConversions: number;
  dailySales: DailySalesData[];
  topProducts: Product[];
  recentOrders: Order[];
  topAffiliates: Affiliate[];
}

export interface DailySalesData {
  date: string;
  sales: number;
  orders: number;
  revenue: number;
  affiliateOrders?: number;
  affiliateRevenue?: number;
}

export interface AffiliatePerformanceData {
  date: string;
  clicks: number;
  conversions: number;
  earnings: number;
}

export interface CustomerMetrics {
  newCustomers: number;
  repeatCustomers: number;
  customerRetentionRate: number;
  avgCustomerValue: number;
}

export interface AffiliateMetrics {
  topPerformer: Affiliate;
  averageConversionRate: number;
  totalPendingPayouts: number;
  nextPayoutDate: Date;
}`,

  // ==================== SERVICES ====================
  'src/app/core/services/auth.service.ts': `import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<AuthUser | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor() {
    this.checkAuth();
  }

  private checkAuth(): void {
    const token = localStorage.getItem('auth_token');
    if (token) {
      const user: AuthUser = {
        id: 'vendor001',
        email: 'john@marketplace.com',
        name: 'John Doe',
        token
      };
      this.userSubject.next(user);
    }
  }

  login(email: string, password: string): Observable<AuthUser> {
    return of({
      id: 'vendor001',
      email,
      name: 'John Doe',
      token: \`token_\${Date.now()}\`
    }).pipe(
      map(user => {
        localStorage.setItem('auth_token', user.token);
        this.userSubject.next(user);
        return user;
      }),
      delay(1000)
    );
  }

  register(email: string, password: string, name: string): Observable<AuthUser> {
    return of({
      id: \`vendor\${Date.now()}\`,
      email,
      name,
      token: \`token_\${Date.now()}\`
    }).pipe(
      map(user => {
        localStorage.setItem('auth_token', user.token);
        this.userSubject.next(user);
        return user;
      }),
      delay(1200)
    );
  }

  logout(): Observable<void> {
    return of(undefined).pipe(
      map(() => {
        localStorage.removeItem('auth_token');
        this.userSubject.next(null);
      }),
      delay(500)
    );
  }

  getCurrentUser(): Observable<AuthUser | null> {
    return this.user$;
  }

  isLoggedIn(): Observable<boolean> {
    return this.user$.pipe(map(user => !!user));
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}`,

  'src/app/core/services/product.service.ts': `import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { Product, ProductFilter } from '../models/product.model';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsSubject = new BehaviorSubject<Product[]>([]);
  public products$ = this.productsSubject.asObservable();

  constructor(private mockDataService: MockDataService) {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    const mockProducts = this.mockDataService.getMockProducts();
    this.productsSubject.next(mockProducts);
  }

  getProducts(): Observable<Product[]> {
    return this.products$.pipe(delay(500));
  }

  getProductById(id: string): Observable<Product> {
    return this.products$.pipe(
      map(products => {
        const product = products.find(p => p.id === id);
        if (!product) throw new Error(\`Product with id \${id} not found\`);
        return product;
      }),
      delay(300)
    );
  }

  createProduct(product: Product): Observable<Product> {
    const newProduct = {
      ...product,
      id: \`p\${Date.now()}\`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const currentProducts = this.productsSubject.value;
    this.productsSubject.next([...currentProducts, newProduct]);
    return of(newProduct).pipe(delay(500));
  }

  updateProduct(id: string, updatedProduct: Partial<Product>): Observable<Product> {
    const currentProducts = this.productsSubject.value;
    const index = currentProducts.findIndex(p => p.id === id);
    if (index === -1) throw new Error(\`Product with id \${id} not found\`);

    const product = {
      ...currentProducts[index],
      ...updatedProduct,
      id,
      updatedAt: new Date()
    };

    const newProducts = [...currentProducts];
    newProducts[index] = product;
    this.productsSubject.next(newProducts);
    return of(product).pipe(delay(500));
  }

  deleteProduct(id: string): Observable<void> {
    const currentProducts = this.productsSubject.value;
    const filtered = currentProducts.filter(p => p.id !== id);
    this.productsSubject.next(filtered);
    return of(undefined).pipe(delay(300));
  }

  searchProducts(query: string): Observable<Product[]> {
    return this.products$.pipe(
      map(products => {
        const lowerQuery = query.toLowerCase();
        return products.filter(p =>
          p.name.toLowerCase().includes(lowerQuery) ||
          p.description.toLowerCase().includes(lowerQuery)
        );
      }),
      delay(400)
    );
  }

  filterProducts(filter: ProductFilter): Observable<Product[]> {
    return this.products$.pipe(
      map(products => {
        let filtered = products;
        if (filter.search) {
          const lowerSearch = filter.search.toLowerCase();
          filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(lowerSearch) ||
            p.description.toLowerCase().includes(lowerSearch)
          );
        }
        if (filter.category) {
          filtered = filtered.filter(p => p.category === filter.category);
        }
        if (filter.status) {
          filtered = filtered.filter(p => p.status === filter.status);
        }
        if (filter.priceMin !== undefined) {
          filtered = filtered.filter(p => p.price >= filter.priceMin!);
        }
        if (filter.priceMax !== undefined) {
          filtered = filtered.filter(p => p.price <= filter.priceMax!);
        }
        return filtered;
      }),
      delay(400)
    );
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    return this.products$.pipe(
      map(products => products.filter(p => p.category === category)),
      delay(400)
    );
  }

  getProductCount(): Observable<number> {
    return this.products$.pipe(
      map(products => products.length),
      delay(200)
    );
  }

  getTopRatedProducts(limit: number = 5): Observable<Product[]> {
    return this.products$.pipe(
      map(products =>
        products.sort((a, b) => b.rating - a.rating).slice(0, limit)
      ),
      delay(300)
    );
  }
}`,

  'src/app/core/services/order.service.ts': `import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { Order, OrderFilter, OrderStats } from '../models/order.model';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  public orders$ = this.ordersSubject.asObservable();

  constructor(private mockDataService: MockDataService) {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    const mockOrders = this.mockDataService.getMockOrders();
    this.ordersSubject.next(mockOrders);
  }

  getOrders(filter?: OrderFilter): Observable<Order[]> {
    return this.orders$.pipe(
      map(orders => this.applyFilters(orders, filter)),
      delay(500)
    );
  }

  getOrderById(id: string): Observable<Order> {
    return this.orders$.pipe(
      map(orders => {
        const order = orders.find(o => o.id === id);
        if (!order) throw new Error(\`Order with id \${id} not found\`);
        return order;
      }),
      delay(300)
    );
  }

  updateOrderStatus(id: string, status: Order['status']): Observable<Order> {
    const currentOrders = this.ordersSubject.value;
    const index = currentOrders.findIndex(o => o.id === id);
    if (index === -1) throw new Error(\`Order with id \${id} not found\`);

    const order = {
      ...currentOrders[index],
      status,
      updatedAt: new Date()
    };

    const newOrders = [...currentOrders];
    newOrders[index] = order;
    this.ordersSubject.next(newOrders);
    return of(order).pipe(delay(400));
  }

  cancelOrder(id: string): Observable<Order> {
    return this.updateOrderStatus(id, 'cancelled');
  }

  getOrderStats(): Observable<OrderStats> {
    return this.orders$.pipe(
      map(orders => ({
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        shippedOrders: orders.filter(o => o.status === 'shipped').length,
        deliveredOrders: orders.filter(o => o.status === 'delivered').length,
        cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
        totalRevenue: orders.reduce((sum, o) => sum + o.totalAmount, 0)
      })),
      delay(400)
    );
  }

  getRecentOrders(limit: number = 10): Observable<Order[]> {
    return this.orders$.pipe(
      map(orders =>
        orders
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, limit)
      ),
      delay(400)
    );
  }

  private applyFilters(orders: Order[], filter?: OrderFilter): Order[] {
    if (!filter) return orders;
    let filtered = orders;
    if (filter.status) {
      filtered = filtered.filter(o => o.status === filter.status);
    }
    if (filter.paymentStatus) {
      filtered = filtered.filter(o => o.paymentStatus === filter.paymentStatus);
    }
    if (filter.customerName) {
      const lowerName = filter.customerName.toLowerCase();
      filtered = filtered.filter(o => o.customerName.toLowerCase().includes(lowerName));
    }
    return filtered;
  }
}`,

  'src/app/core/services/vendor.service.ts': `import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { Vendor } from '../models/vendor.model';
import { Analytics } from '../models/analytics.model';
import { MockDataService } from './mock-data.service';
import { ProductService } from './product.service';
import { OrderService } from './order.service';
import { AffiliateService } from './affiliate.service';

@Injectable({
  providedIn: 'root'
})
export class VendorService {
  private vendorSubject = new BehaviorSubject<Vendor | null>(null);
  public vendor$ = this.vendorSubject.asObservable();

  constructor(
    private mockDataService: MockDataService,
    private productService: ProductService,
    private orderService: OrderService,
    private affiliateService: AffiliateService
  ) {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    const mockVendor = this.mockDataService.getMockVendor();
    this.vendorSubject.next(mockVendor);
  }

  getVendorProfile(): Observable<Vendor> {
    return this.vendor$.pipe(
      map(vendor => {
        if (!vendor) throw new Error('Vendor not found');
        return vendor;
      }),
      delay(300)
    );
  }

  updateVendorProfile(updatedVendor: Partial<Vendor>): Observable<Vendor> {
    const current = this.vendorSubject.value;
    if (!current) throw new Error('Vendor not found');
    const vendor = { ...current, ...updatedVendor };
    this.vendorSubject.next(vendor);
    return of(vendor).pipe(delay(500));
  }

  getVendorStats(): Observable<Analytics> {
    return new Observable(observer => {
      Promise.all([
        this.productService.getProducts().toPromise(),
        this.orderService.getOrders().toPromise(),
        this.affiliateService.getAffiliates().toPromise(),
      ]).then(([products, orders, affiliates]) => {
        if (!products || !orders || !affiliates) {
          observer.error('Data not available');
          return;
        }

        const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
        const affiliateOrders = orders.filter(o => o.affiliateId).length;
        const affiliateRevenue = orders
          .filter(o => o.affiliateId)
          .reduce((sum, o) => sum + o.totalAmount, 0);

        const analytics: Analytics = {
          totalSales: orders.length,
          totalRevenue,
          totalOrders: orders.length,
          totalProducts: products.length,
          avgOrderValue: totalRevenue / orders.length || 0,
          conversionRate: 0.035,
          customerCount: new Set(orders.map(o => o.customerId)).size,
          returnRate: 0.02,
          totalAffiliates: affiliates.length,
          affiliateRevenue,
          affiliateCommissionsPaid: affiliates.reduce((sum, a) => sum + a.totalEarnings, 0),
          affiliateConversions: affiliateOrders,
          dailySales: [],
          topProducts: products.sort((a, b) => b.rating - a.rating).slice(0, 5),
          recentOrders: orders.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ).slice(0, 5),
          topAffiliates: affiliates.sort((a, b) => b.totalEarnings - a.totalEarnings).slice(0, 5)
        };

        observer.next(analytics);
        observer.complete();
      }).catch(error => observer.error(error));
    }).pipe(delay(600));
  }
}`,

  'src/app/core/services/affiliate.service.ts': `import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { Affiliate, AffiliateFilter, AffiliateStats } from '../models/affiliate.model';
import { AffiliateLink } from '../models/affiliate-link.model';
import { Commission, CommissionStats } from '../models/commission.model';
import { Payout } from '../models/payout.model';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class AffiliateService {
  private affiliatesSubject = new BehaviorSubject<Affiliate[]>([]);
  public affiliates$ = this.affiliatesSubject.asObservable();

  private linksSubject = new BehaviorSubject<AffiliateLink[]>([]);
  public links$ = this.linksSubject.asObservable();

  private commissionsSubject = new BehaviorSubject<Commission[]>([]);
  public commissions$ = this.commissionsSubject.asObservable();

  private payoutsSubject = new BehaviorSubject<Payout[]>([]);
  public payouts$ = this.payoutsSubject.asObservable();

  constructor(private mockDataService: MockDataService) {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    const mockAffiliates = this.mockDataService.getMockAffiliates();
    const mockLinks = this.mockDataService.getMockAffiliateLinks();
    const mockCommissions = this.mockDataService.getMockCommissions();
    const mockPayouts = this.mockDataService.getMockPayouts();

    this.affiliatesSubject.next(mockAffiliates);
    this.linksSubject.next(mockLinks);
    this.commissionsSubject.next(mockCommissions);
    this.payoutsSubject.next(mockPayouts);
  }

  getAffiliates(filter?: AffiliateFilter): Observable<Affiliate[]> {
    return this.affiliates$.pipe(
      map(affiliates => this.applyAffiliateFilters(affiliates, filter)),
      delay(500)
    );
  }

  getAffiliateById(id: string): Observable<Affiliate> {
    return this.affiliates$.pipe(
      map(affiliates => {
        const affiliate = affiliates.find(a => a.id === id);
        if (!affiliate) throw new Error(\`Affiliate with id \${id} not found\`);
        return affiliate;
      }),
      delay(300)
    );
  }

  createAffiliate(affiliate: Affiliate): Observable<Affiliate> {
    const newAffiliate = {
      ...affiliate,
      id: \`aff\${Date.now()}\`,
      createdAt: new Date(),
      status: 'pending' as const
    };
    const currentAffiliates = this.affiliatesSubject.value;
    this.affiliatesSubject.next([...currentAffiliates, newAffiliate]);
    return of(newAffiliate).pipe(delay(500));
  }

  updateAffiliate(id: string, updatedAffiliate: Partial<Affiliate>): Observable<Affiliate> {
    const currentAffiliates = this.affiliatesSubject.value;
    const index = currentAffiliates.findIndex(a => a.id === id);
    if (index === -1) throw new Error(\`Affiliate with id \${id} not found\`);

    const affiliate = { ...currentAffiliates[index], ...updatedAffiliate, id };
    const newAffiliates = [...currentAffiliates];
    newAffiliates[index] = affiliate;
    this.affiliatesSubject.next(newAffiliates);
    return of(affiliate).pipe(delay(400));
  }

  deleteAffiliate(id: string): Observable<void> {
    const currentAffiliates = this.affiliatesSubject.value;
    const filtered = currentAffiliates.filter(a => a.id !== id);
    this.affiliatesSubject.next(filtered);
    return of(undefined).pipe(delay(300));
  }

  approveAffiliate(id: string): Observable<Affiliate> {
    return this.updateAffiliate(id, {
      status: 'active',
      approvedAt: new Date()
    });
  }

  suspendAffiliate(id: string, reason: string): Observable<Affiliate> {
    return this.updateAffiliate(id, {
      status: 'suspended',
      suspendedAt: new Date(),
      suspensionReason: reason
    });
  }

  getAffiliateStats(): Observable<AffiliateStats> {
    return this.affiliates$.pipe(
      map(affiliates => {
        const activeAffiliates = affiliates.filter(a => a.status === 'active');
        return {
          totalAffiliates: affiliates.length,
          activeAffiliates: activeAffiliates.length,
          totalEarnings: affiliates.reduce((sum, a) => sum + a.totalEarnings, 0),
          totalCommissions: affiliates.reduce((sum, a) => sum + a.nextPaymentDue, 0),
          pendingPayouts: 0,
          topAffiliates: affiliates.sort((a, b) => b.totalEarnings - a.totalEarnings).slice(0, 5)
        };
      }),
      delay(400)
    );
  }

  getAffiliateLinks(affiliateId: string): Observable<AffiliateLink[]> {
    return this.links$.pipe(
      map(links => links.filter(l => l.affiliateId === affiliateId)),
      delay(400)
    );
  }

  generateLink(affiliateId: string, productId?: string): Observable<AffiliateLink> {
    return this.getAffiliateById(affiliateId).pipe(
      map(affiliate => {
        const code = \`aff_\${affiliate.name.substring(0, 3).toLowerCase()}_\${Date.now()}\`;
        const baseUrl = 'https://marketplace.com';
        const fullLink = productId
          ? \`\${baseUrl}/product/\${productId}?ref=\${code}\`
          : \`\${baseUrl}/?ref=\${code}\`;

        const newLink: AffiliateLink = {
          id: \`link\${Date.now()}\`,
          affiliateId,
          vendorId: affiliate.vendorId,
          productId,
          uniqueCode: code,
          fullLink,
          clicks: 0,
          conversions: 0,
          earnings: 0,
          conversionRate: 0,
          status: 'active',
          createdAt: new Date()
        };

        const currentLinks = this.linksSubject.value;
        this.linksSubject.next([...currentLinks, newLink]);
        return newLink;
      }),
      delay(500)
    );
  }

  getCommissions(affiliateId?: string): Observable<Commission[]> {
    return this.commissions$.pipe(
      map(commissions =>
        affiliateId ? commissions.filter(c => c.affiliateId === affiliateId) : commissions
      ),
      delay(400)
    );
  }

  getCommissionStats(affiliateId: string): Observable<CommissionStats> {
    return this.commissions$.pipe(
      map(commissions => {
        const affiliateCommissions = commissions.filter(c => c.affiliateId === affiliateId);
        const pendingAmount = affiliateCommissions
          .filter(c => c.status === 'pending')
          .reduce((sum, c) => sum + c.commissionAmount, 0);
        const approvedAmount = affiliateCommissions
          .filter(c => c.status === 'approved')
          .reduce((sum, c) => sum + c.commissionAmount, 0);
        const paidAmount = affiliateCommissions
          .filter(c => c.status === 'paid')
          .reduce((sum, c) => sum + c.commissionAmount, 0);

        return {
          pendingAmount,
          approvedAmount,
          paidAmount,
          totalCommissions: affiliateCommissions.length,
          averageCommission: approvedAmount / (affiliateCommissions.length || 1)
        };
      }),
      delay(400)
    );
  }

  getPayouts(affiliateId?: string): Observable<Payout[]> {
    return this.payouts$.pipe(
      map(payouts =>
        affiliateId ? payouts.filter(p => p.affiliateId === affiliateId) : payouts
      ),
      delay(500)
    );
  }

  private applyAffiliateFilters(
    affiliates: Affiliate[],
    filter?: AffiliateFilter
  ): Affiliate[] {
    if (!filter) return affiliates;
    let filtered = affiliates;

    if (filter.search) {
      const lowerSearch = filter.search.toLowerCase();
      filtered = filtered.filter(
        a =>
          a.name.toLowerCase().includes(lowerSearch) ||
          a.email.toLowerCase().includes(lowerSearch)
      );
    }

    if (filter.status) {
      filtered = filtered.filter(a => a.status === filter.status);
    }

    if (filter.tier) {
      filtered = filtered.filter(a => a.tier === filter.tier);
    }

    return filtered;
  }
}`,

  'src/app/core/services/analytics.service.ts': `import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { DailySalesData, CustomerMetrics, AffiliateMetrics } from '../models/analytics.model';
import { OrderService } from './order.service';
import { ProductService } from './product.service';
import { AffiliateService } from './affiliate.service';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  constructor(
    private orderService: OrderService,
    private productService: ProductService,
    private affiliateService: AffiliateService
  ) {}

  getSalesData(period: string = '30days'): Observable<DailySalesData[]> {
    return this.orderService.getOrders().pipe(
      map(orders => {
        const salesByDate = new Map<string, DailySalesData>();

        orders.forEach(order => {
          const date = new Date(order.createdAt).toISOString().split('T')[0];
          const existing = salesByDate.get(date) || {
            date,
            sales: 0,
            orders: 0,
            revenue: 0,
            affiliateOrders: 0,
            affiliateRevenue: 0
          };

          salesByDate.set(date, {
            date,
            sales: existing.sales + 1,
            orders: existing.orders + 1,
            revenue: existing.revenue + order.totalAmount,
            affiliateOrders: existing.affiliateOrders + (order.affiliateId ? 1 : 0),
            affiliateRevenue: existing.affiliateRevenue + (order.affiliateId ? order.totalAmount : 0)
          });
        });

        return Array.from(salesByDate.values())
          .sort((a, b) => a.date.localeCompare(b.date));
      }),
      delay(600)
    );
  }

  getRevenueData(period: string = '30days'): Observable<DailySalesData[]> {
    return this.getSalesData(period);
  }

  getTopProducts(limit: number = 5): Observable<any[]> {
    return this.productService.getProducts().pipe(
      map(products =>
        products
          .sort((a, b) => b.reviews - a.reviews)
          .slice(0, limit)
      ),
      delay(400)
    );
  }

  getCustomerMetrics(): Observable<CustomerMetrics> {
    return this.orderService.getOrders().pipe(
      map(orders => {
        const uniqueCustomers = new Set(orders.map(o => o.customerId));
        const customerOrders = new Map<string, number>();

        orders.forEach(order => {
          const count = customerOrders.get(order.customerId) || 0;
          customerOrders.set(order.customerId, count + 1);
        });

        const repeatCustomers = Array.from(customerOrders.values())
          .filter(count => count > 1).length;

        const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

        return {
          newCustomers: uniqueCustomers.size - repeatCustomers,
          repeatCustomers,
          customerRetentionRate: repeatCustomers / (uniqueCustomers.size || 1),
          avgCustomerValue: totalRevenue / (uniqueCustomers.size || 1)
        };
      }),
      delay(500)
    );
  }

  getAffiliateMetrics(): Observable<AffiliateMetrics> {
    return this.affiliateService.getTopAffiliates(1).pipe(
      map(affiliates => {
        const topPerformer = affiliates[0] || {
          id: '',
          name: 'N/A',
          totalConversions: 0,
          conversionRate: 0
        };

        return {
          topPerformer,
          averageConversionRate: 0.065,
          totalPendingPayouts: 0,
          nextPayoutDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        };
      }),
      delay(400)
    );
  }
}`,

  'src/app/core/services/mock-data.service.ts': `import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';
import { Order } from '../models/order.model';
import { Vendor } from '../models/vendor.model';
import { Affiliate } from '../models/affiliate.model';
import { AffiliateLink } from '../models/affiliate-link.model';
import { Commission } from '../models/commission.model';
import { Payout } from '../models/payout.model';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  getMockVendor(): Vendor {
    return {
      id: 'v001',
      name: 'John Doe',
      email: 'john@marketplace.com',
      phone: '+1-555-0100',
      storeName: 'TechHub Store',
      storeDescription: 'Quality electronics at affordable prices',
      avatar: 'https://via.placeholder.com/100',
      banner: 'https://via.placeholder.com/1200x400',
      rating: 4.7,
      totalReviews: 1250,
      status: 'active',
      location: { country: 'USA', city: 'New York' },
      bankDetails: {
        accountHolder: 'John Doe',
        accountNumber: '****1234',
        bankName: 'First National Bank'
      },
      affiliateSettings: {
        defaultCommissionRate: 10,
        minWithdrawal: 100,
        payoutFrequency: 'monthly',
        requireApproval: true
      },
      createdAt: new Date('2023-01-01'),
    };
  }

  getMockProducts(): Product[] {
    return [
      {
        id: 'p001',
        name: 'Wireless Earbuds Pro',
        sku: 'WE-001',
        description: 'High-quality wireless earbuds with active noise cancellation',
        category: 'Electronics',
        subcategory: 'Audio',
        images: ['https://via.placeholder.com/300', 'https://via.placeholder.com/300'],
        price: 29.99,
        originalPrice: 49.99,
        discount: 40,
        stock: 150,
        rating: 4.5,
        reviews: 234,
        status: 'active',
        tags: ['wireless', 'audio', 'electronics'],
        specifications: { 'Battery Life': '8 hours', 'Connectivity': 'Bluetooth 5.0' },
        shipping: { weight: 0.1, dimensions: '10x5x5', shippingCost: 5.99 },
        affiliateCommissionRate: 10,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
        vendorId: 'v001'
      },
      {
        id: 'p002',
        name: 'USB-C Fast Charger',
        sku: 'CH-001',
        description: 'Super fast 65W USB-C charger',
        category: 'Electronics',
        subcategory: 'Chargers',
        images: ['https://via.placeholder.com/300'],
        price: 12.99,
        originalPrice: 19.99,
        discount: 35,
        stock: 200,
        rating: 4.8,
        reviews: 567,
        status: 'active',
        tags: ['charger', 'usb-c', 'fast-charging'],
        specifications: { 'Power': '65W', 'Ports': '1 USB-C' },
        shipping: { weight: 0.2, dimensions: '8x6x4', shippingCost: 2.99 },
        affiliateCommissionRate: 12,
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-20'),
        vendorId: 'v001'
      },
      {
        id: 'p003',
        name: 'Portable Phone Stand',
        sku: 'ST-001',
        description: 'Adjustable portable phone stand for desk',
        category: 'Accessories',
        subcategory: 'Phone Accessories',
        images: ['https://via.placeholder.com/300'],
        price: 7.99,
        originalPrice: 14.99,
        discount: 47,
        stock: 300,
        rating: 4.3,
        reviews: 189,
        status: 'active',
        tags: ['stand', 'phone', 'accessories'],
        specifications: { 'Material': 'Aluminum', 'Compatibility': 'Universal' },
        shipping: { weight: 0.15, dimensions: '15x10x2', shippingCost: 1.99 },
        affiliateCommissionRate: 15,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-18'),
        vendorId: 'v001'
      }
    ];
  }

  getMockOrders(): Order[] {
    return [
      {
        id: 'o001',
        orderNumber: 'ORD-2024-001',
        customerId: 'c001',
        customerName: 'Alice Johnson',
        items: [
          { productId: 'p001', productName: 'Wireless Earbuds Pro', quantity: 1, price: 29.99, image: 'https://via.placeholder.com/100' }
        ],
        totalAmount: 34.99,
        shippingAddress: {
          fullName: 'Alice Johnson',
          phone: '+1-555-0101',
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'USA'
        },
        status: 'shipped',
        paymentStatus: 'paid',
        paymentMethod: 'credit_card',
        shippingTrackingNumber: 'TRACK001',
        affiliateLinkId: 'link001',
        affiliateId: 'aff001',
        notes: 'Gift wrapping requested',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-22'),
        expectedDelivery: new Date('2024-02-01')
      },
      {
        id: 'o002',
        orderNumber: 'ORD-2024-002',
        customerId: 'c002',
        customerName: 'Bob Smith',
        items: [
          { productId: 'p002', productName: 'USB-C Fast Charger', quantity: 2, price: 12.99, image: 'https://via.placeholder.com/100' }
        ],
        totalAmount: 28.98,
        shippingAddress: {
          fullName: 'Bob Smith',
          phone: '+1-555-0102',
          street: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          postalCode: '90001',
          country: 'USA'
        },
        status: 'processing',
        paymentStatus: 'paid',
        paymentMethod: 'debit_card',
        notes: '',
        createdAt: new Date('2024-01-21'),
        updatedAt: new Date('2024-01-23'),
        expectedDelivery: new Date('2024-02-02')
      }
    ];
  }

  getMockAffiliates(): Affiliate[] {
    return [
      {
        id: 'aff001',
        vendorId: 'v001',
        name: 'Marketing Pro',
        email: 'pro@marketing.com',
        phone: '+1-555-1001',
        website: 'https://marketingblog.com',
        socialMedia: { instagram: '@marketingpro', tiktok: '@marketingpro', youtube: 'MarketingProChannel' },
        commissionRate: 10,
        tier: 'gold',
        status: 'active',
        totalEarnings: 5234.50,
        totalClicks: 2400,
        totalConversions: 147,
        conversionRate: 6.13,
        totalReferredSales: 4850.00,
        lastPaymentAmount: 850.00,
        lastPaymentDate: new Date('2024-01-15'),
        nextPaymentDue: 1250.75,
        bankDetails: { accountHolder: 'Marketing Pro', accountNumber: '****5678', bankName: 'Tech Bank' },
        notes: 'Top performer',
        createdAt: new Date('2023-06-01'),
        approvedAt: new Date('2023-06-05'),
      },
      {
        id: 'aff002',
        vendorId: 'v001',
        name: 'Tech Reviewer',
        email: 'reviewer@techblog.com',
        phone: '+1-555-1002',
        website: 'https://techreviewblog.com',
        socialMedia: { youtube: 'TechReviewerChannel', twitter: '@tech_reviewer' },
        commissionRate: 12,
        tier: 'platinum',
        status: 'active',
        totalEarnings: 8945.00,
        totalClicks: 5200,
        totalConversions: 412,
        conversionRate: 7.92,
        totalReferredSales: 8650.00,
        lastPaymentAmount: 1500.00,
        lastPaymentDate: new Date('2024-01-10'),
        nextPaymentDue: 2180.00,
        bankDetails: { accountHolder: 'Tech Reviewer', accountNumber: '****9012', bankName: 'Premier Bank' },
        notes: 'Excellent engagement',
        createdAt: new Date('2023-03-15'),
        approvedAt: new Date('2023-03-20'),
      }
    ];
  }

  getMockAffiliateLinks(): AffiliateLink[] {
    return [
      {
        id: 'link001',
        affiliateId: 'aff001',
        vendorId: 'v001',
        productId: 'p001',
        uniqueCode: 'aff_mk_pro_001',
        fullLink: 'https://marketplace.com/product/p001?ref=aff_mk_pro_001',
        clicks: 450,
        conversions: 28,
        earnings: 840.00,
        conversionRate: 6.22,
        status: 'active',
        createdAt: new Date('2024-01-15')
      }
    ];
  }

  getMockCommissions(): Commission[] {
    return [
      {
        id: 'comm001',
        affiliateId: 'aff001',
        orderId: 'o001',
        productId: 'p001',
        vendorId: 'v001',
        saleAmount: 34.99,
        commissionRate: 10,
        commissionAmount: 3.50,
        status: 'approved',
        createdAt: new Date('2024-01-20'),
        approvedAt: new Date('2024-01-22'),
      }
    ];
  }

  getMockPayouts(): Payout[] {
    return [
      {
        id: 'payout001',
        affiliateId: 'aff001',
        vendorId: 'v001',
        amount: 1250.75,
        commissions: [],
        status: 'completed',
        paymentMethod: 'bank_transfer',
        transactionId: 'TXN-2024-001',
        createdAt: new Date('2024-01-25'),
        scheduledDate: new Date('2024-02-01'),
        completedAt: new Date('2024-02-01')
      }
    ];
  }
}`,

  // ==================== GUARDS ====================
  'src/app/core/guards/auth.guard.ts': `import { Injectable } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const isLoggedIn = !!this.authService.getToken();
    if (!isLoggedIn) {
      this.router.navigate(['/auth/login']);
      return false;
    }
    return true;
  }
}

export const AuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isLoggedIn = !!authService.getToken();
  if (!isLoggedIn) {
    router.navigate(['/auth/login']);
    return false;
  }
  return true;
};`,

  // ==================== APP CONFIGURATION ====================
  'src/app/app.routes.ts': `import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/pages/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/pages/register/register.component').then(m => m.RegisterComponent)
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/dashboard/pages/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'products',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/products/components/product-list/product-list.component').then(m => m.ProductListComponent)
      },
      {
        path: 'add',
        loadComponent: () => import('./features/products/components/product-form/product-form.component').then(m => m.ProductFormComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/products/components/product-list/product-list.component').then(m => m.ProductListComponent)
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./features/products/components/product-form/product-form.component').then(m => m.ProductFormComponent)
      }
    ]
  },
  {
    path: 'orders',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/orders/components/order-list/order-list.component').then(m => m.OrderListComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/orders/components/order-detail/order-detail.component').then(m => m.OrderDetailComponent)
      }
    ]
  },
  {
    path: 'affiliates',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/affiliates/components/affiliate-list/affiliate-list.component').then(m => m.AffiliateListComponent)
      },
      {
        path: 'add',
        loadComponent: () => import('./features/affiliates/components/affiliate-form/affiliate-form.component').then(m => m.AffiliateFormComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/affiliates/components/affiliate-detail/affiliate-detail.component').then(m => m.AffiliateDetailComponent)
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./features/affiliates/components/affiliate-form/affiliate-form.component').then(m => m.AffiliateFormComponent)
      },
      {
        path: ':id/links',
        loadComponent: () => import('./features/affiliates/components/link-generator/link-generator.component').then(m => m.LinkGeneratorComponent)
      }
    ]
  },
  {
    path: 'analytics',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/analytics/pages/analytics.component').then(m => m.AnalyticsComponent)
  },
  {
    path: 'settings',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/settings/pages/settings.component').then(m => m.SettingsComponent)
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];`,

  'src/app/app.component.ts': `import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  showLayout = false;
  private destroy$ = new Subject<void>();

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService
      .isLoggedIn()
      .pipe(takeUntil(this.destroy$))
      .subscribe(isLoggedIn => {
        this.isLoggedIn = isLoggedIn;
        this.showLayout = isLoggedIn;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}`,

  'src/app/app.component.html': `<ng-container *ngIf="showLayout">
  <app-navbar></app-navbar>
  <div class="app-layout">
    <app-sidebar></app-sidebar>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
  </div>
</ng-container>
<router-outlet *ngIf="!showLayout"></router-outlet>`,

  'src/app/app.component.scss': `:host {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
}

.app-layout {
  display: flex;
  flex: 1;
  overflow: hidden;

  .main-content {
    flex: 1;
    overflow-y: auto;
    background: #f5f5f5;
    margin-left: 250px;
    transition: margin-left 0.3s ease;
  }
}

@media (max-width: 768px) {
  .app-layout {
    .main-content {
      margin-left: 80px;
    }
  }
}`,

  // ==================== GLOBAL STYLES ====================
  'src/styles.scss': `@import 'styles/variables';
@import 'styles/mixins';
@import 'styles/theme';
@import 'styles/utilities';

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  width: 100%;
}

body {
  font-family: $font-family;
  font-size: $font-size-base;
  color: $color-text;
  background-color: $color-bg;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
  color: $color-text;
  margin-bottom: 1rem;
}

h1 { font-size: 2.5rem; }
h2 { font-size: 2rem; }
h3 { font-size: 1.5rem; }
h4 { font-size: 1.25rem; }
h5 { font-size: 1.1rem; }
h6 { font-size: 1rem; }

a {
  color: $color-primary;
  text-decoration: none;
  transition: color 0.3s ease;

  &:hover {
    color: $color-primary-dark;
  }
}

input, textarea, select {
  font-family: inherit;
  font-size: inherit;
  color: inherit;
}

button {
  font-family: inherit;
  cursor: pointer;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;

  &:hover {
    background: #a1a1a1;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}`,

  'src/styles/_variables.scss': `$color-primary: #ff6b6b;
$color-primary-dark: #ff5252;
$color-primary-light: #ff9999;
$color-secondary: #667eea;
$color-success: #4caf50;
$color-warning: #ff9800;
$color-error: #f44336;
$color-info: #2196f3;
$color-text: #333;
$color-text-light: #666;
$color-text-lighter: #999;
$color-bg: #f5f5f5;
$color-bg-light: #fafafa;
$color-border: #e0e0e0;
$color-border-light: #f0f0f0;
$color-white: #ffffff;

$font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
$font-size-base: 1rem;
$font-size-lg: 1.125rem;
$font-size-xl: 1.25rem;
$font-size-2xl: 1.5rem;
$font-weight-semibold: 600;
$font-weight-bold: 700;

$spacing-xs: 0.25rem;
$spacing-sm: 0.5rem;
$spacing-md: 1rem;
$spacing-lg: 1.5rem;
$spacing-xl: 2rem;

$radius-sm: 4px;
$radius-md: 6px;
$radius-lg: 8px;
$radius-xl: 12px;
$radius-full: 9999px;

$shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
$shadow-md: 0 2px 8px rgba(0, 0, 0, 0.08);
$shadow-lg: 0 4px 12px rgba(0, 0, 0, 0.1);

$transition-fast: 0.15s ease;
$transition-base: 0.3s ease;
$transition-slow: 0.5s ease;

$z-index-dropdown: 100;
$z-index-modal: 1000;
$z-index-tooltip: 1100;

$breakpoint-md: 768px;
$breakpoint-lg: 992px;`,

  'src/styles/_mixins.scss': `@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

@mixin text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@mixin button-primary {
  padding: 0.7rem 1.5rem;
  background: $color-primary;
  color: white;
  border: none;
  border-radius: $radius-md;
  font-weight: 600;
  cursor: pointer;
  transition: all $transition-base;

  &:hover:not(:disabled) {
    background: $color-primary-dark;
  }
}

@mixin card {
  background: white;
  padding: 1.5rem;
  border-radius: $radius-lg;
  box-shadow: $shadow-md;
}

@mixin respond-to($breakpoint) {
  @if $breakpoint == 'md' {
    @media (max-width: $breakpoint-md) {
      @content;
    }
  } @else if $breakpoint == 'lg' {
    @media (max-width: $breakpoint-lg) {
      @content;
    }
  }
}`,

  'src/styles/_theme.scss': `:root {
  --color-primary: #{$color-primary};
  --color-text: #{$color-text};
  --color-bg: #{$color-bg};
  --color-border: #{$color-border};
}`,

  'src/styles/_utilities.scss': `.d-none { display: none; }
.d-block { display: block; }
.d-flex { display: flex; }
.text-center { text-align: center; }
.font-bold { font-weight: $font-weight-bold; }
.text-primary { color: $color-primary; }
.bg-light { background-color: $color-bg-light; }
.rounded { border-radius: $radius-md; }
.shadow { box-shadow: $shadow-md; }`,

  // ==================== ENVIRONMENT ====================
  'src/environments/environment.ts': `export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  appName: 'Marketplace Vendor',
  appVersion: '1.0.0',
  features: {
    analytics: true,
    affiliates: true,
    reviews: true,
    inventory: true
  }
};`,

  'src/environments/environment.prod.ts': `export const environment = {
  production: true,
  apiUrl: 'https://api.marketplace.com/api',
  appName: 'Marketplace Vendor',
  appVersion: '1.0.0',
  features: {
    analytics: true,
    affiliates: true,
    reviews: true,
    inventory: true
  }
};`,

  // ==================== BOOTSTRAP ====================
  'src/index.html': `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Marketplace Vendor Dashboard</title>
    <base href="/" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="Marketplace vendor management dashboard" />
    <meta name="theme-color" content="#ff6b6b" />
    <link rel="icon" type="image/x-icon" href="favicon.ico" />
  </head>
  <body>
    <app-root></app-root>
  </body>
</html>`,

  'src/main.ts': `import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient()
  ]
}).catch(err => console.error(err));`,

  // ==================== PLACEHOLDER COMPONENTS (Empty for now) ====================
  'src/app/features/dashboard/pages/dashboard.component.ts': `import { Component } from '@angular/core';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: '<p>Dashboard works!</p>'
})
export class DashboardComponent {}`,

  'src/app/features/products/components/product-list/product-list.component.ts': `import { Component } from '@angular/core';
@Component({
  selector: 'app-product-list',
  standalone: true,
  template: '<p>Products work!</p>'
})
export class ProductListComponent {}`,

  'src/app/features/products/components/product-form/product-form.component.ts': `import { Component } from '@angular/core';
@Component({
  selector: 'app-product-form',
  standalone: true,
  template: '<p>Product Form works!</p>'
})
export class ProductFormComponent {}`,

  'src/app/features/orders/components/order-list/order-list.component.ts': `import { Component } from '@angular/core';
@Component({
  selector: 'app-order-list',
  standalone: true,
  template: '<p>Orders work!</p>'
})
export class OrderListComponent {}`,

  'src/app/features/orders/components/order-detail/order-detail.component.ts': `import { Component } from '@angular/core';
@Component({
  selector: 'app-order-detail',
  standalone: true,
  template: '<p>Order Detail works!</p>'
})
export class OrderDetailComponent {}`,

  'src/app/features/affiliates/components/affiliate-list/affiliate-list.component.ts': `import { Component } from '@angular/core';
@Component({
  selector: 'app-affiliate-list',
  standalone: true,
  template: '<p>Affiliates work!</p>'
})
export class AffiliateListComponent {}`,

  'src/app/features/affiliates/components/affiliate-detail/affiliate-detail.component.ts': `import { Component } from '@angular/core';
@Component({
  selector: 'app-affiliate-detail',
  standalone: true,
  template: '<p>Affiliate Detail works!</p>'
})
export class AffiliateDetailComponent {}`,

  'src/app/features/affiliates/components/affiliate-form/affiliate-form.component.ts': `import { Component } from '@angular/core';
@Component({
  selector: 'app-affiliate-form',
  standalone: true,
  template: '<p>Affiliate Form works!</p>'
})
export class AffiliateFormComponent {}`,

  'src/app/features/affiliates/components/link-generator/link-generator.component.ts': `import { Component } from '@angular/core';
@Component({
  selector: 'app-link-generator',
  standalone: true,
  template: '<p>Link Generator works!</p>'
})
export class LinkGeneratorComponent {}`,

  'src/app/features/auth/pages/login/login.component.ts': `import { Component } from '@angular/core';
@Component({
  selector: 'app-login',
  standalone: true,
  template: '<p>Login works!</p>'
})
export class LoginComponent {}`,

  'src/app/features/auth/pages/register/register.component.ts': `import { Component } from '@angular/core';
@Component({
  selector: 'app-register',
  standalone: true,
  template: '<p>Register works!</p>'
})
export class RegisterComponent {}`,

  'src/app/features/analytics/pages/analytics.component.ts': `import { Component } from '@angular/core';
@Component({
  selector: 'app-analytics',
  standalone: true,
  template: '<p>Analytics works!</p>'
})
export class AnalyticsComponent {}`,

  'src/app/features/settings/pages/settings.component.ts': `import { Component } from '@angular/core';
@Component({
  selector: 'app-settings',
  standalone: true,
  template: '<p>Settings works!</p>'
})
export class SettingsComponent {}`,

  'src/app/shared/components/navbar/navbar.component.ts': `import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: '<nav>Navbar Placeholder</nav>',
  styles: ['nav { background: white; padding: 1rem; border-bottom: 1px solid #ddd; }']
})
export class NavbarComponent {}`,

  'src/app/shared/components/sidebar/sidebar.component.ts': `import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: '<aside>Sidebar Placeholder</aside>',
  styles: ['aside { background: #1a1a1a; color: white; width: 250px; padding: 1rem; }']
})
export class SidebarComponent {}`,
};

function createDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function createFile(filePath, content) {
  const dir = path.dirname(filePath);
  createDir(dir);
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`${colors.blue}✓${colors.reset} ${filePath}`);
}

function main() {
  console.log(`\n${colors.cyan}${'='.repeat(70)}${colors.reset}`);
  console.log(`${colors.cyan}  Temu Marketplace Vendor Dashboard - Complete Project Generator${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(70)}${colors.reset}\n`);

  console.log(`${colors.yellow}Creating all project files...${colors.reset}\n`);

  let count = 0;
  Object.entries(fileContents).forEach(([filePath, content]) => {
    createFile(filePath, content);
    count++;
  });

  console.log(`\n${colors.cyan}${'='.repeat(70)}${colors.reset}`);
  console.log(`${colors.green}✓ Success! Created ${count} files${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(70)}${colors.reset}\n`);

  console.log(`${colors.yellow}Next Steps:${colors.reset}`);
  console.log(`  1. ${colors.blue}npm install${colors.reset}`);
  console.log(`  2. ${colors.blue}npm start${colors.reset}`);
  console.log(`  3. Open ${colors.blue}http://localhost:4200${colors.reset}\n`);

  console.log(`${colors.yellow}Test Credentials:${colors.reset}`);
  console.log(`  Email: ${colors.blue}john@marketplace.com${colors.reset}`);
  console.log(`  Password: ${colors.blue}any${colors.reset}\n`);

  console.log(`${colors.green}Happy coding! 🚀${colors.reset}\n`);
}

main();