import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { DeliveryService } from '../../../../../services/delivery.service';
import { NotificationService } from '../../../../../services/notification.service';

interface SupportTicket {
  _id?: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  issueType: 'late_delivery' | 'wrong_address' | 'damaged_items' | 'missing_items' | 'other';
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt?: string;
  messages?: any[];
}

@Component({
  selector: 'app-delivery-support',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule],
  template: `
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Delivery Support</h1>
          <p class="text-slate-600 mt-2">Manage customer support tickets for delivery issues</p>
        </div>
        <button 
          (click)="openCreateTicket()"
          class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
        >
          <mat-icon>add</mat-icon>
          <span>New Ticket</span>
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Total Tickets</p>
          <p class="text-3xl font-bold text-slate-900">{{ tickets().length }}</p>
          <p class="mt-2 text-sm text-slate-500">All time</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-yellow-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Open</p>
          <p class="text-3xl font-bold text-yellow-600">{{ countByStatus('open') }}</p>
          <p class="mt-2 text-sm text-yellow-600">Need attention</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-purple-500">
          <p class="text-slate-600 text-sm font-medium mb-1">In Progress</p>
          <p class="text-3xl font-bold text-purple-600">{{ countByStatus('in_progress') }}</p>
          <p class="mt-2 text-sm text-purple-600">Being resolved</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-emerald-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Resolved</p>
          <p class="text-3xl font-bold text-emerald-600">{{ countByStatus('resolved') }}</p>
          <p class="mt-2 text-sm text-emerald-600">This month</p>
        </div>
      </div>

      <!-- Create Ticket Form -->
      @if (showCreateForm()) {
        <div class="bg-white rounded-lg p-6 shadow-md border border-slate-200">
          <h2 class="text-xl font-bold text-slate-900 mb-4">Create Support Ticket</h2>
          <form [formGroup]="ticketForm" (ngSubmit)="submitTicket()" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Order Number *</label>
                <input 
                  type="text" 
                  formControlName="orderNumber"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Enter order number"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Customer Name *</label>
                <input 
                  type="text" 
                  formControlName="customerName"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Enter customer name"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Customer Phone *</label>
                <input 
                  type="tel" 
                  formControlName="customerPhone"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Enter phone number"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Issue Type *</label>
                <select 
                  formControlName="issueType"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select issue type</option>
                  <option value="late_delivery">Late Delivery</option>
                  <option value="wrong_address">Wrong Address</option>
                  <option value="damaged_items">Damaged Items</option>
                  <option value="missing_items">Missing Items</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Priority *</label>
                <select 
                  formControlName="priority"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Subject *</label>
                <input 
                  type="text" 
                  formControlName="subject"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Brief issue summary"
                >
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Description *</label>
              <textarea 
                formControlName="description"
                rows="4"
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Detailed description of the issue"
              ></textarea>
            </div>
            <div class="flex gap-3 justify-end">
              <button 
                type="button"
                (click)="closeCreateForm()"
                class="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                [disabled]="isCreating()"
                class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {{ isCreating() ? 'Creating...' : 'Create Ticket' }}
              </button>
            </div>
          </form>
        </div>
      }

      <!-- Filter -->
      <div class="bg-white rounded-lg p-4 shadow-md flex gap-4 flex-wrap">
        <select 
          [(ngModel)]="filterStatus"
          (ngModelChange)="filterTickets()"
          class="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>

        <select 
          [(ngModel)]="filterPriority"
          (ngModelChange)="filterTickets()"
          class="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
        >
          <option value="">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <input 
          type="text" 
          placeholder="Search by order number or customer..." 
          [(ngModel)]="searchQuery"
          (ngModelChange)="filterTickets()"
          class="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
        >
      </div>

      <!-- Tickets List -->
      <div class="space-y-4">
        @if (isLoading()) {
          <div class="bg-white rounded-lg p-12 shadow-md text-center">
            <p class="text-slate-600">Loading support tickets...</p>
          </div>
        }
        @if (!isLoading() && filteredTickets().length === 0) {
          <div class="bg-white rounded-lg p-12 shadow-md text-center">
            <p class="text-slate-600 text-lg">No support tickets found</p>
          </div>
        }
        @for (ticket of filteredTickets(); track ticket._id) {
          <div class="bg-white rounded-lg p-6 shadow-md border-l-4" [ngClass]="{
            'border-red-500': ticket.priority === 'urgent',
            'border-orange-500': ticket.priority === 'high',
            'border-yellow-500': ticket.priority === 'medium',
            'border-blue-500': ticket.priority === 'low'
          }">
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-lg font-bold text-slate-900">{{ ticket.orderNumber }}</h3>
                  <span [ngClass]="{
                    'bg-red-100 text-red-700': ticket.priority === 'urgent',
                    'bg-orange-100 text-orange-700': ticket.priority === 'high',
                    'bg-yellow-100 text-yellow-700': ticket.priority === 'medium',
                    'bg-blue-100 text-blue-700': ticket.priority === 'low'
                  }" class="px-3 py-1 rounded-full text-xs font-medium capitalize">
                    {{ ticket.priority }}
                  </span>
                  <span [ngClass]="{
                    'bg-red-100 text-red-700': ticket.status === 'open',
                    'bg-purple-100 text-purple-700': ticket.status === 'in_progress',
                    'bg-emerald-100 text-emerald-700': ticket.status === 'resolved',
                    'bg-slate-100 text-slate-700': ticket.status === 'closed'
                  }" class="px-3 py-1 rounded-full text-xs font-medium capitalize">
                    {{ formatStatus(ticket.status) }}
                  </span>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span class="text-slate-600 text-sm">Customer</span>
                    <p class="font-medium text-slate-900">{{ ticket.customerName }}</p>
                    <p class="text-xs text-slate-600">{{ ticket.customerPhone }}</p>
                  </div>
                  <div>
                    <span class="text-slate-600 text-sm">Issue Type</span>
                    <p class="font-medium text-slate-900 capitalize">{{ formatIssueType(ticket.issueType) }}</p>
                  </div>
                  <div>
                    <span class="text-slate-600 text-sm">Subject</span>
                    <p class="font-medium text-slate-900">{{ ticket.subject }}</p>
                  </div>
                </div>

                <p class="text-slate-700 mt-3">{{ ticket.description }}</p>
              </div>
            </div>

            <div class="flex gap-3">
              <button 
                (click)="viewTicket(ticket)"
                class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <mat-icon>chat</mat-icon>
                <span>View & Reply</span>
              </button>
              <select 
                [value]="ticket.status"
                (change)="updateTicketStatus(ticket._id!, $event)"
                class="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: []
})
export class DeliverySupportComponent implements OnInit {
  tickets = signal<SupportTicket[]>([]);
  filteredTickets = signal<SupportTicket[]>([]);
  isLoading = signal(false);
  isCreating = signal(false);
  showCreateForm = signal(false);
  filterStatus = '';
  filterPriority = '';
  searchQuery = '';
  ticketForm: FormGroup;

  constructor(
    private deliveryService: DeliveryService,
    private notificationService: NotificationService,
    private fb: FormBuilder
  ) {
    this.ticketForm = this.fb.group({
      orderNumber: ['', Validators.required],
      customerName: ['', Validators.required],
      customerPhone: ['', Validators.required],
      issueType: ['', Validators.required],
      priority: ['medium', Validators.required],
      subject: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.isLoading.set(true);
    this.deliveryService.getSupportTickets().subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        if (response.status === 'success' && response.data) {
          this.tickets.set(response.data);
          this.filterTickets();
        }
      },
      error: (error: any) => {
        this.isLoading.set(false);
        console.error('Error loading support tickets:', error);
        this.notificationService.error('Error', 'Failed to load support tickets');
      }
    });
  }

  openCreateTicket(): void {
    this.showCreateForm.set(true);
    this.ticketForm.reset({ priority: 'medium' });
  }

  closeCreateForm(): void {
    this.showCreateForm.set(false);
    this.ticketForm.reset();
  }

  submitTicket(): void {
    if (!this.ticketForm.valid) {
      this.notificationService.warning('Validation Error', 'Please fill in all required fields');
      return;
    }

    this.isCreating.set(true);
    const ticketData = this.ticketForm.value;

    this.deliveryService.createSupportTicket(ticketData).subscribe({
      next: (response: any) => {
        this.isCreating.set(false);
        if (response.status === 'success') {
          this.notificationService.success('Success', 'Support ticket created');
          this.loadTickets();
          this.closeCreateForm();
        }
      },
      error: (error: any) => {
        this.isCreating.set(false);
        this.notificationService.error('Error', 'Failed to create support ticket');
      }
    });
  }

  filterTickets(): void {
    let filtered = this.tickets();

    if (this.filterStatus) {
      filtered = filtered.filter(t => t.status === this.filterStatus);
    }

    if (this.filterPriority) {
      filtered = filtered.filter(t => t.priority === this.filterPriority);
    }

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.orderNumber.toLowerCase().includes(query) ||
        t.customerName.toLowerCase().includes(query)
      );
    }

    this.filteredTickets.set(filtered);
  }

  countByStatus(status: string): number {
    return this.tickets().filter(t => t.status === status).length;
  }

  formatStatus(status: string): string {
    return status.replace(/_/g, ' ').toLowerCase();
  }

  formatIssueType(issueType: string): string {
    return issueType.replace(/_/g, ' ').toLowerCase();
  }

  updateTicketStatus(ticketId: string, event: any): void {
    const newStatus = event.target.value;
    this.deliveryService.updateSupportTicket(ticketId, { status: newStatus }).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.notificationService.success('Success', `Ticket status updated to ${newStatus}`);
          this.loadTickets();
        }
      },
      error: (error: any) => {
        this.notificationService.error('Error', 'Failed to update ticket status');
        this.loadTickets();
      }
    });
  }

  viewTicket(ticket: SupportTicket): void {
    this.notificationService.info('Support', `Opening ticket ${ticket.orderNumber}`);
    // Implement detailed ticket view with messaging here
  }
}
