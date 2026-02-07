import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VendorService } from '../../../core/services/vendor.service';
import { OrderService } from '../../../core/services/order.service';
import { AffiliateService } from '../../../core/services/affiliate.service';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { Vendor } from '../../../core/models/vendor.model';
import { Order } from '../../../core/models/order.model';
import { Affiliate } from '../../../core/models/affiliate.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  vendor$!: Observable<Vendor>;
  recentOrders$!: Observable<Order[]>;
  affiliateStats$!: Observable<any>;
  analyticsData$!: Observable<any>;

  constructor(
    private vendorService: VendorService,
    private orderService: OrderService,
    private affiliateService: AffiliateService,
    private analyticsService: AnalyticsService
  ) {}

  ngOnInit() {
    this.vendor$ = this.vendorService.getVendorProfile();
    this.recentOrders$ = this.orderService.getRecentOrders(5);
    this.affiliateStats$ = this.affiliateService.getAffiliateStats();
    this.analyticsData$ = this.analyticsService.getSalesData('7days');
  }
}
