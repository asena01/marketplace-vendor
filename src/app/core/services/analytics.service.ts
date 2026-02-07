import { Injectable } from '@angular/core';
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
          const existing: DailySalesData = salesByDate.get(date) || {
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
    return this.affiliateService.getAffiliates().pipe(
      map((affiliates: any) => {
        const topPerformer = affiliates && affiliates.length > 0 ? affiliates[0] : {
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
}
