import { Injectable } from '@angular/core';
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
    return new Observable<Analytics>(observer => {
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
}
