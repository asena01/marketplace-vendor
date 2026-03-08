import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TourService } from '../../../../../services/tour.service';

@Component({
  selector: 'app-tours',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8 space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-slate-900">Tours Management</h1>
        <button
          (click)="openCreateModal()"
          class="bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 px-6 rounded-lg transition"
        >
          + New Tour
        </button>
      </div>

      @if (isLoading()) {
        <div class="bg-blue-50 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">Loading tours...</p>
        </div>
      }

      @if (successMessage()) {
        <div class="bg-emerald-50 border border-emerald-300 text-emerald-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">{{ successMessage() }}</p>
        </div>
      }

      @if (errorMessage()) {
        <div class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">{{ errorMessage() }}</p>
        </div>
      }

      @if (tours().length === 0) {
        <div class="bg-white rounded-lg p-12 shadow-md text-center">
          <p class="text-slate-600 font-semibold text-lg">No tours created yet</p>
          <p class="text-slate-500 mt-2">Click "New Tour" to create your first tour package</p>
        </div>
      } @else {
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Tour Name</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Destination</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Duration</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Price</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Capacity</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                @for (tour of tours(); track tour._id) {
                  <tr class="hover:bg-slate-50">
                    <td class="px-6 py-4">
                      <span class="font-medium text-slate-900">{{ tour.name }}</span>
                    </td>
                    <td class="px-6 py-4 text-slate-600">{{ tour.destination || '-' }}</td>
                    <td class="px-6 py-4 text-slate-600">{{ tour.duration || '-' }} days</td>
                    <td class="px-6 py-4 text-slate-900 font-medium">{{ tour.price | currency }}</td>
                    <td class="px-6 py-4 text-slate-600">{{ tour.currentParticipants || 0 }}/{{ tour.maxParticipants || 0 }}</td>
                    <td class="px-6 py-4">
                      @if (tour.isActive) {
                        <span class="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">Active</span>
                      } @else {
                        <span class="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">Inactive</span>
                      }
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex gap-2">
                        <button
                          (click)="openEditModal(tour)"
                          class="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          Edit
                        </button>
                        <button
                          (click)="confirmDelete(tour._id, tour.name)"
                          class="text-red-600 hover:text-red-700 font-medium text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      @if (showModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <h2 class="text-2xl font-bold text-slate-900 mb-6">
              {{ isEditing() ? 'Edit Tour' : 'Create New Tour' }}
            </h2>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Tour Name *</label>
                <input
                  [(ngModel)]="tourForm.name"
                  type="text"
                  placeholder="e.g., Paris City Explorer"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Destination *</label>
                  <input
                    [(ngModel)]="tourForm.destination"
                    type="text"
                    placeholder="e.g., Paris, France"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Duration (days) *</label>
                  <input
                    [(ngModel)]="tourForm.duration"
                    type="number"
                    placeholder="e.g., 7"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Price per Person *</label>
                  <input
                    [(ngModel)]="tourForm.price"
                    type="number"
                    placeholder="e.g., 1500"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Max Participants *</label>
                  <input
                    [(ngModel)]="tourForm.maxParticipants"
                    type="number"
                    placeholder="e.g., 20"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  [(ngModel)]="tourForm.description"
                  rows="4"
                  placeholder="Tour details and highlights..."
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Difficulty Level</label>
                <select
                  [(ngModel)]="tourForm.difficulty"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                >
                  <option value="">Select difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div class="flex items-center gap-2">
                <input
                  [(ngModel)]="tourForm.isActive"
                  type="checkbox"
                  id="isActive"
                  class="w-4 h-4"
                />
                <label for="isActive" class="text-sm font-medium text-slate-700">Active Tour</label>
              </div>
            </div>

            @if (formError()) {
              <div class="mt-4 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
                <p class="font-semibold text-sm">{{ formError() }}</p>
              </div>
            }

            <div class="flex gap-3 mt-8">
              <button
                (click)="closeModal()"
                class="flex-1 px-4 py-2 border border-slate-300 text-slate-900 font-medium rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                (click)="saveTour()"
                class="flex-1 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition"
              >
                {{ isEditing() ? 'Update Tour' : 'Create Tour' }}
              </button>
            </div>
          </div>
        </div>
      }

      @if (showDeleteConfirm()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-8 max-w-sm w-full mx-4">
            <h3 class="text-lg font-bold text-slate-900 mb-4">Delete Tour</h3>
            <p class="text-slate-600 mb-6">
              Are you sure you want to delete <strong>{{ deleteConfirmName() }}</strong>? This action cannot be undone.
            </p>
            <div class="flex gap-3">
              <button
                (click)="showDeleteConfirm.set(false)"
                class="flex-1 px-4 py-2 border border-slate-300 text-slate-900 font-medium rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                (click)="deleteTour()"
                class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: []
})
export class ToursDashboardToursComponent implements OnInit {
  tours = signal<any[]>([]);
  showModal = signal(false);
  showDeleteConfirm = signal(false);
  isEditing = signal(false);
  isLoading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');
  formError = signal('');
  deleteConfirmName = signal('');
  deleteConfirmId = signal('');

  tourForm = {
    name: '',
    destination: '',
    duration: 0,
    price: 0,
    maxParticipants: 0,
    description: '',
    difficulty: '',
    isActive: true
  };

  editingTourId = '';

  constructor(private tourService: TourService) {}

  ngOnInit(): void {
    this.loadTours();
  }

  loadTours(): void {
    this.isLoading.set(true);
    this.tourService.getTours(1, 100).subscribe({
      next: (response: any) => {
        if (response.status === 'success' && Array.isArray(response.data)) {
          this.tours.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading tours:', error);
        this.errorMessage.set('Failed to load tours');
        this.isLoading.set(false);
        setTimeout(() => this.errorMessage.set(''), 3000);
      }
    });
  }

  openCreateModal(): void {
    this.resetForm();
    this.isEditing.set(false);
    this.editingTourId = '';
    this.showModal.set(true);
  }

  openEditModal(tour: any): void {
    this.tourForm = {
      name: tour.name,
      destination: tour.destination || '',
      duration: tour.duration || 0,
      price: tour.price || 0,
      maxParticipants: tour.maxParticipants || 0,
      description: tour.description || '',
      difficulty: tour.difficulty || '',
      isActive: tour.isActive !== false
    };
    this.editingTourId = tour._id;
    this.isEditing.set(true);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.resetForm();
  }

  resetForm(): void {
    this.tourForm = {
      name: '',
      destination: '',
      duration: 0,
      price: 0,
      maxParticipants: 0,
      description: '',
      difficulty: '',
      isActive: true
    };
    this.formError.set('');
  }

  saveTour(): void {
    this.formError.set('');

    if (!this.tourForm.name || !this.tourForm.destination || !this.tourForm.duration || !this.tourForm.price || !this.tourForm.maxParticipants) {
      this.formError.set('Please fill in all required fields');
      return;
    }

    const tourData: any = {
      ...this.tourForm,
      duration: this.tourForm.duration.toString(),
      groupSize: 'group',
      highlights: [],
      includes: [],
      rating: 0,
      reviews: 0
    };

    if (this.isEditing()) {
      this.tourService.updateTour(this.editingTourId, tourData).subscribe({
        next: () => {
          this.successMessage.set('Tour updated successfully');
          this.closeModal();
          this.loadTours();
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: (error) => {
          console.error('Error updating tour:', error);
          this.formError.set('Failed to update tour');
        }
      });
    } else {
      this.tourService.createTour(tourData).subscribe({
        next: () => {
          this.successMessage.set('Tour created successfully');
          this.closeModal();
          this.loadTours();
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: (error) => {
          console.error('Error creating tour:', error);
          this.formError.set('Failed to create tour');
        }
      });
    }
  }

  confirmDelete(id: string, name: string): void {
    this.deleteConfirmId.set(id);
    this.deleteConfirmName.set(name);
    this.showDeleteConfirm.set(true);
  }

  deleteTour(): void {
    this.tourService.deleteTour(this.deleteConfirmId()).subscribe({
      next: () => {
        this.successMessage.set('Tour deleted successfully');
        this.showDeleteConfirm.set(false);
        this.loadTours();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        console.error('Error deleting tour:', error);
        this.errorMessage.set('Failed to delete tour');
        this.showDeleteConfirm.set(false);
        setTimeout(() => this.errorMessage.set(''), 3000);
      }
    });
  }
}
