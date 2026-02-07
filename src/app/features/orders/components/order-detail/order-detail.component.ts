import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../../../core/services/order.service';
import { Order } from '../../../../core/models/order.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss'
})
export class OrderDetailComponent implements OnInit {
  order$!: Observable<Order>;
  orderId: string = '';
  loading = true;
  error = '';

  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.orderId = params['id'];
      if (this.orderId) {
        this.loadOrder();
      } else {
        this.error = 'Order ID not provided';
        this.loading = false;
      }
    });
  }

  loadOrder() {
    this.order$ = this.orderService.getOrderById(this.orderId);
    this.order$.subscribe(
      () => {
        this.loading = false;
      },
      (err) => {
        this.error = 'Failed to load order';
        this.loading = false;
      }
    );
  }

  updateOrderStatus(order: Order, newStatus: string) {
    this.orderService.updateOrder(order.id, { status: newStatus as any }).subscribe(
      () => {
        this.loadOrder();
      },
      () => {
        this.error = 'Failed to update order status';
      }
    );
  }

  goBack() {
    this.router.navigate(['/orders']);
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(' ', '-');
  }
}
