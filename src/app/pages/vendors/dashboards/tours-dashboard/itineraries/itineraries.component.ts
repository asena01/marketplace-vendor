import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TourService } from '../../../../../services/tour.service';

@Component({
  selector: 'app-itineraries',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8 space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-slate-900">Itineraries Management</h1>
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

      @if (!selectedTourId()) {
        <div>
          @if (tours().length === 0) {
            <div class="bg-white rounded-lg p-12 shadow-md text-center">
              <p class="text-slate-600 font-semibold text-lg">No tours available</p>
              <p class="text-slate-500 mt-2">Create tours first to manage their itineraries</p>
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              @for (tour of tours(); track tour._id) {
                <div class="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition">
                  <div (click)="selectTour(tour)" class="space-y-3">
                    <h3 class="font-bold text-slate-900 text-lg">{{ tour.name }}</h3>
                    <p class="text-slate-600 text-sm">{{ tour.destination }}</p>
                    <div class="flex items-center justify-between pt-3 border-t border-slate-200">
                      <span class="text-sm text-slate-600">Duration:</span>
                      <span class="font-semibold">{{ tour.duration || 0 }} days</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-slate-600">Itinerary Days:</span>
                      <span class="font-semibold">{{ (tour.itinerary || []).length }}</span>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      } @else {
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <button
                (click)="selectedTourId.set('')"
                class="text-pink-600 hover:text-pink-700 font-medium text-sm mb-2"
              >
                ← Back to Tours
              </button>
              <h2 class="text-2xl font-bold text-slate-900">{{ selectedTourName() }} - Itinerary</h2>
            </div>
            <button
              (click)="openCreateDayModal()"
              class="bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 px-6 rounded-lg transition"
            >
              + Add Day
            </button>
          </div>

          @if (itineraryDays().length === 0) {
            <div class="bg-white rounded-lg p-12 shadow-md text-center">
              <p class="text-slate-600 font-semibold text-lg">No itinerary days added</p>
              <p class="text-slate-500 mt-2">Click "Add Day" to create the tour itinerary</p>
            </div>
          } @else {
            <div class="space-y-4">
              @for (day of itineraryDays(); track day.day) {
                <div class="bg-white rounded-lg shadow-md p-6">
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex-1">
                      <div class="flex items-center gap-3 mb-2">
                        <div class="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
                          <span class="font-bold text-pink-600 text-lg">{{ day.day }}</span>
                        </div>
                        <h3 class="font-bold text-slate-900 text-lg">{{ day.title }}</h3>
                      </div>
                      <p class="text-slate-600">{{ day.description }}</p>
                    </div>
                    <div class="flex gap-2">
                      <button
                        (click)="openEditDayModal(day)"
                        class="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        Edit
                      </button>
                      <button
                        (click)="confirmDeleteDay(day.day)"
                        class="text-red-600 hover:text-red-700 font-medium text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  @if (day.activities && day.activities.length > 0) {
                    <div class="mt-4 pl-4 border-l-2 border-pink-300">
                      <p class="text-sm font-semibold text-slate-700 mb-2">Activities:</p>
                      <ul class="space-y-1">
                        @for (activity of day.activities; track $index) {
                          <li class="text-sm text-slate-600">• {{ activity }}</li>
                        }
                      </ul>
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>
      }

      @if (showModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <h2 class="text-2xl font-bold text-slate-900 mb-6">
              {{ isEditingDay() ? 'Edit Day' : 'Add Day to Itinerary' }}
            </h2>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Day Number *</label>
                <input
                  [(ngModel)]="dayForm.day"
                  type="number"
                  min="1"
                  placeholder="e.g., 1"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                <input
                  [(ngModel)]="dayForm.title"
                  type="text"
                  placeholder="e.g., Arrival and City Overview"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Description *</label>
                <textarea
                  [(ngModel)]="dayForm.description"
                  rows="4"
                  placeholder="Detailed description of the day's activities..."
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Activities (one per line)</label>
                <textarea
                  [(ngModel)]="activitiesText"
                  rows="4"
                  placeholder="Visit Eiffel Tower&#10;Dinner at local restaurant&#10;Evening Seine cruise"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                ></textarea>
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
                (click)="saveDay()"
                class="flex-1 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition"
              >
                {{ isEditingDay() ? 'Update Day' : 'Add Day' }}
              </button>
            </div>
          </div>
        </div>
      }

      @if (showDeleteConfirm()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-8 max-w-sm w-full mx-4">
            <h3 class="text-lg font-bold text-slate-900 mb-4">Delete Day</h3>
            <p class="text-slate-600 mb-6">
              Are you sure you want to delete Day {{ deleteConfirmDay() }}? This action cannot be undone.
            </p>
            <div class="flex gap-3">
              <button
                (click)="showDeleteConfirm.set(false)"
                class="flex-1 px-4 py-2 border border-slate-300 text-slate-900 font-medium rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                (click)="deleteDay()"
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
export class ToursItinerariesComponent implements OnInit {
  tours = signal<any[]>([]);
  selectedTourId = signal('');
  selectedTourName = signal('');
  itineraryDays = signal<any[]>([]);

  showModal = signal(false);
  showDeleteConfirm = signal(false);
  isEditingDay = signal(false);
  isLoading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');
  formError = signal('');
  deleteConfirmDay = signal(0);

  dayForm = {
    day: 1,
    title: '',
    description: '',
    activities: [] as string[]
  };

  activitiesText = '';
  editingDayNumber = 0;

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

  selectTour(tour: any): void {
    this.selectedTourId.set(tour._id);
    this.selectedTourName.set(tour.name);
    this.itineraryDays.set(tour.itinerary || []);
  }

  openCreateDayModal(): void {
    const nextDay = Math.max(...this.itineraryDays().map(d => d.day || 0), 0) + 1;
    this.dayForm = {
      day: nextDay,
      title: '',
      description: '',
      activities: []
    };
    this.activitiesText = '';
    this.isEditingDay.set(false);
    this.editingDayNumber = 0;
    this.formError.set('');
    this.showModal.set(true);
  }

  openEditDayModal(day: any): void {
    this.dayForm = {
      day: day.day,
      title: day.title || '',
      description: day.description || '',
      activities: day.activities || []
    };
    this.activitiesText = (day.activities || []).join('\n');
    this.editingDayNumber = day.day;
    this.isEditingDay.set(true);
    this.formError.set('');
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveDay(): void {
    this.formError.set('');

    if (!this.dayForm.title || !this.dayForm.description) {
      this.formError.set('Please fill in all required fields');
      return;
    }

    const activities = this.activitiesText
      .split('\n')
      .map(a => a.trim())
      .filter(a => a.length > 0);

    const updatedDay = {
      ...this.dayForm,
      activities
    };

    if (this.isEditingDay()) {
      const updatedItinerary = this.itineraryDays().map(day =>
        day.day === this.editingDayNumber ? updatedDay : day
      );
      this.updateItinerary(updatedItinerary);
    } else {
      const updatedItinerary = [...this.itineraryDays(), updatedDay];
      this.updateItinerary(updatedItinerary);
    }
  }

  updateItinerary(itinerary: any[]): void {
    this.tourService.updateTour(this.selectedTourId(), { itinerary }).subscribe({
      next: () => {
        this.successMessage.set(this.isEditingDay() ? 'Day updated successfully' : 'Day added successfully');
        this.itineraryDays.set(itinerary);
        this.closeModal();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        console.error('Error updating itinerary:', error);
        this.formError.set('Failed to update itinerary');
      }
    });
  }

  confirmDeleteDay(dayNumber: number): void {
    this.deleteConfirmDay.set(dayNumber);
    this.showDeleteConfirm.set(true);
  }

  deleteDay(): void {
    const updatedItinerary = this.itineraryDays().filter(day => day.day !== this.deleteConfirmDay());
    this.tourService.updateTour(this.selectedTourId(), { itinerary: updatedItinerary }).subscribe({
      next: () => {
        this.successMessage.set('Day deleted successfully');
        this.itineraryDays.set(updatedItinerary);
        this.showDeleteConfirm.set(false);
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        console.error('Error deleting day:', error);
        this.errorMessage.set('Failed to delete day');
        this.showDeleteConfirm.set(false);
        setTimeout(() => this.errorMessage.set(''), 3000);
      }
    });
  }
}
