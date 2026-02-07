import { Injectable } from '@angular/core';
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
        if (!order) throw new Error(`Order with id ${id} not found`);
        return order;
      }),
      delay(300)
    );
  }

  updateOrderStatus(id: string, status: Order['status']): Observable<Order> {
    const currentOrders = this.ordersSubject.value;
    const index = currentOrders.findIndex(o => o.id === id);
    if (index === -1) throw new Error(`Order with id ${id} not found`);

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
}