import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../../core/services/order.service';
import { Order } from '../../../../core/models/order.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.scss'
})
export class OrderListComponent implements OnInit {
  orders$!: Observable<Order[]>;
  searchTerm: string = '';
  selectedStatus: string = '';
  sortBy: string = 'date';
  currentPage: number = 1;
  pageSize: number = 10;
  Math = Math; // Expose Math to template

  statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.orders$ = this.orderService.getOrders();
  }

  onSearch(term: string) {
    this.searchTerm = term;
    this.currentPage = 1;
  }

  onStatusChange(status: string) {
    this.selectedStatus = status;
    this.currentPage = 1;
  }

  onSortChange(sortType: string) {
    this.sortBy = sortType;
  }

  getFilteredOrders(orders: Order[]): Order[] {
    let filtered = orders;

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(o =>
        o.id.toLowerCase().includes(term) ||
        o.orderNumber.toLowerCase().includes(term) ||
        o.customerName.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (this.selectedStatus) {
      filtered = filtered.filter(o => o.status === this.selectedStatus);
    }

    // Sort
    switch (this.sortBy) {
      case 'amount-asc':
        filtered.sort((a, b) => a.totalAmount - b.totalAmount);
        break;
      case 'amount-desc':
        filtered.sort((a, b) => b.totalAmount - a.totalAmount);
        break;
      case 'date-newest':
        filtered.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'date-oldest':
        filtered.sort((a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case 'date':
      default:
        filtered.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    return filtered;
  }

  getPaginatedOrders(orders: Order[]): Order[] {
    const filtered = this.getFilteredOrders(orders);
    const startIdx = (this.currentPage - 1) * this.pageSize;
    return filtered.slice(startIdx, startIdx + this.pageSize);
  }

  getTotalPages(orders: Order[]): number {
    return Math.ceil(this.getFilteredOrders(orders).length / this.pageSize);
  }

  goToPage(page: number) {
    this.currentPage = page;
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(' ', '-');
  }
}
