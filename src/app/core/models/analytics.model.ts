import { Product } from './product.model';
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
}