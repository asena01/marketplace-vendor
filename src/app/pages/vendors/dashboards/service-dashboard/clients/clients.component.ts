import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiceProviderService } from '../../../../../services/service-provider.service';

@Component({
  selector: 'app-service-clients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">👥 Clients</h1>
          <p class="text-gray-600 text-sm mt-1">Total clients: {{ clients().length }}</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="mb-6">
        <input
          type="text"
          [(ngModel)]="searchQuery"
          placeholder="Search by name or email..."
          class="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
        />
      </div>

      @if (isLoading()) {
        <div class="text-center py-12">
          <div class="inline-block animate-spin text-4xl mb-4">⏳</div>
          <p class="text-gray-600">Loading clients...</p>
        </div>
      } @else if (filteredClients().length === 0) {
        <div class="text-center py-12 bg-white rounded-lg">
          <p class="text-gray-600 text-lg">No clients found</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          @for (client of filteredClients(); track client._id) {
            <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h3 class="text-xl font-bold text-gray-900">{{ client.name || client.customerName }}</h3>
                  <p class="text-gray-600 text-sm">{{ client.email || client.customerEmail }}</p>
                </div>
                <span [class]="'px-3 py-1 rounded-full text-xs font-semibold ' + getStatusColor(client.status)">
                  {{ client.status | titlecase }}
                </span>
              </div>

              <div class="space-y-2 mb-4 text-sm text-gray-600">
                <p>📱 {{ client.phone || client.customerPhone }}</p>
                <p>📍 {{ client.city || 'City not set' }}</p>
                @if (client.totalPurchases || client.totalSpent) {
                  <p>💰 Total Spent: ₦{{ (client.totalSpent || 0)?.toLocaleString() }}</p>
                  <p>🛒 Total Bookings: {{ client.totalPurchases || 0 }}</p>
                }
                @if (client.lastPurchaseDate) {
                  <p>📅 Last Booking: {{ client.lastPurchaseDate | date: 'MMM dd, yyyy' }}</p>
                }
              </div>

              @if (client.notes) {
                <div class="mb-4 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                  <p class="text-xs font-semibold text-yellow-800">Notes:</p>
                  <p class="text-sm text-yellow-700 mt-1">{{ client.notes }}</p>
                </div>
              }

              <div class="flex gap-2">
                <button
                  (click)="viewClientDetails(client)"
                  class="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg transition font-medium text-sm"
                >
                  View Details
                </button>
                <button
                  (click)="openAddNoteModal(client)"
                  class="flex-1 bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded-lg transition font-medium text-sm"
                >
                  Add Note
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- Add Note Modal -->
      @if (showNoteModal()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4">
            <div class="p-6 border-b border-gray-200">
              <h2 class="text-2xl font-bold text-gray-900">Add Note to {{ selectedClient()?.name }}</h2>
            </div>

            <div class="p-6">
              <textarea
                [(ngModel)]="currentNote"
                rows="5"
                placeholder="Add a note about this client..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              ></textarea>
            </div>

            <div class="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                (click)="closeNoteModal()"
                class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                (click)="saveNote()"
                [disabled]="isSaving()"
                class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
              >
                {{ isSaving() ? 'Saving...' : 'Save Note' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Client Details Modal -->
      @if (showDetailsModal()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div class="p-6 border-b border-gray-200">
              <h2 class="text-2xl font-bold text-gray-900">Client Details</h2>
            </div>

            @if (selectedClient(); as client) {
              <div class="p-6 space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-gray-600">Full Name</p>
                    <p class="text-lg font-semibold text-gray-900">{{ client.name }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Email</p>
                    <p class="text-lg font-semibold text-gray-900">{{ client.email }}</p>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-gray-600">Phone</p>
                    <p class="text-lg font-semibold text-gray-900">{{ client.phone }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Status</p>
                    <p class="text-lg font-semibold text-gray-900">{{ client.status | titlecase }}</p>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-gray-600">Total Bookings</p>
                    <p class="text-lg font-semibold text-gray-900">{{ client.totalPurchases }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Total Spent</p>
                    <p class="text-lg font-semibold text-gray-900">₦{{ (client.totalSpent || 0)?.toLocaleString() }}</p>
                  </div>
                </div>

                <div>
                  <p class="text-sm text-gray-600">Member Since</p>
                  <p class="text-lg font-semibold text-gray-900">{{ client.firstPurchaseDate | date: 'MMM dd, yyyy' }}</p>
                </div>

                @if (client.notes) {
                  <div class="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <p class="text-xs font-semibold text-blue-800">Notes:</p>
                    <p class="text-sm text-blue-700 mt-1">{{ client.notes }}</p>
                  </div>
                }
              </div>
            }

            <div class="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                (click)="closeDetailsModal()"
                class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ServiceClientsComponent implements OnInit {
  isLoading = signal(false);
  isSaving = signal(false);
  showNoteModal = signal(false);
  showDetailsModal = signal(false);

  clients = signal<any[]>([]);
  selectedClient = signal<any>(null);
  searchQuery = '';
  currentNote = '';

  filteredClients = computed(() => {
    let result = this.clients();
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(c =>
        (c.name || c.customerName || '').toLowerCase().includes(query) ||
        (c.email || c.customerEmail || '').toLowerCase().includes(query)
      );
    }
    return result;
  });

  providerId: string = '';

  constructor(private serviceProviderService: ServiceProviderService) {}

  ngOnInit(): void {
    this.providerId = localStorage.getItem('userId') || '';
    this.loadClients();
  }

  loadClients(): void {
    this.isLoading.set(true);
    this.serviceProviderService.getProviderClients(this.providerId, 1, 50).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.clients.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading clients:', error);
        this.isLoading.set(false);
      }
    });
  }

  viewClientDetails(client: any): void {
    this.selectedClient.set(client);
    this.showDetailsModal.set(true);
  }

  openAddNoteModal(client: any): void {
    this.selectedClient.set(client);
    this.currentNote = '';
    this.showNoteModal.set(true);
  }

  saveNote(): void {
    if (!this.currentNote) {
      alert('Please enter a note');
      return;
    }

    this.isSaving.set(true);
    this.serviceProviderService.addClientNote(this.selectedClient()._id, this.currentNote).subscribe({
      next: () => {
        this.loadClients();
        this.closeNoteModal();
        this.isSaving.set(false);
      },
      error: (error) => {
        console.error('Error saving note:', error);
        this.isSaving.set(false);
      }
    });
  }

  closeNoteModal(): void {
    this.showNoteModal.set(false);
    this.selectedClient.set(null);
    this.currentNote = '';
  }

  closeDetailsModal(): void {
    this.showDetailsModal.set(false);
    this.selectedClient.set(null);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'vip':
        return 'bg-purple-100 text-purple-700';
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'blocked':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }
}
