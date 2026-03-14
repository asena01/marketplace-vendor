import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TourService } from '../../../../../services/tour.service';

@Component({
  selector: 'app-guides',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8 space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-slate-900">Tour Guides Management</h1>
        <button
          (click)="openCreateModal()"
          class="bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 px-6 rounded-lg transition"
        >
          + Add Guide
        </button>
      </div>

      @if (isLoading()) {
        <div class="bg-blue-50 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">Loading guides...</p>
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

      @if (guides().length === 0) {
        <div class="bg-white rounded-lg p-12 shadow-md text-center">
          <p class="text-slate-600 font-semibold text-lg">No guides added yet</p>
          <p class="text-slate-500 mt-2">Click "Add Guide" to add your first tour guide</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (guide of guides(); track guide._id) {
            <div class="bg-white rounded-lg shadow-md p-6">
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-4 flex-1">
                  <div class="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center">
                    <span class="text-2xl font-bold text-pink-600">{{ getInitials(guide.name) }}</span>
                  </div>
                  <div>
                    <h3 class="font-bold text-slate-900 text-lg">{{ guide.name }}</h3>
                    <p class="text-sm text-slate-600">{{ guide.expertise || 'Tour Guide' }}</p>
                  </div>
                </div>
              </div>

              <div class="space-y-2 border-t border-slate-200 pt-4">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-slate-600">Tours Completed:</span>
                  <span class="font-semibold text-slate-900">{{ guide.toursCompleted || 0 }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-slate-600">Rating:</span>
                  <span class="font-semibold text-slate-900">{{ guide.rating || 'N/A' }}/5</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-slate-600">Phone:</span>
                  <span class="text-sm text-slate-700">{{ guide.phone || 'N/A' }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-slate-600">Email:</span>
                  <span class="text-sm text-slate-700">{{ guide.email || 'N/A' }}</span>
                </div>
              </div>

              @if (guide.status === 'active' || guide.status === 'Active') {
                <div class="mt-4 px-3 py-2 bg-emerald-100 rounded-lg text-center">
                  <span class="text-xs font-semibold text-emerald-700">Active</span>
                </div>
              } @else {
                <div class="mt-4 px-3 py-2 bg-slate-100 rounded-lg text-center">
                  <span class="text-xs font-semibold text-slate-700">Inactive</span>
                </div>
              }

              <div class="flex gap-2 mt-4">
                <button
                  (click)="openEditModal(guide)"
                  class="flex-1 text-blue-600 hover:text-blue-700 font-medium text-sm border border-blue-300 rounded-lg py-2 transition"
                >
                  Edit
                </button>
                <button
                  (click)="confirmDelete(guide._id, guide.name)"
                  class="flex-1 text-red-600 hover:text-red-700 font-medium text-sm border border-red-300 rounded-lg py-2 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          }
        </div>
      }

      @if (showModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <h2 class="text-2xl font-bold text-slate-900 mb-6">
              {{ isEditing() ? 'Edit Guide' : 'Add New Guide' }}
            </h2>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                <input
                  [(ngModel)]="guideForm.name"
                  type="text"
                  placeholder="e.g., Michael Chen"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                  <input
                    [(ngModel)]="guideForm.email"
                    type="email"
                    placeholder="e.g., michael@example.com"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
                  <input
                    [(ngModel)]="guideForm.phone"
                    type="tel"
                    placeholder="e.g., +1234567890"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Expertise/Specialty *</label>
                <input
                  [(ngModel)]="guideForm.expertise"
                  type="text"
                  placeholder="e.g., Cultural Heritage, Mountain Hiking"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Tours Completed</label>
                  <input
                    [(ngModel)]="guideForm.toursCompleted"
                    type="number"
                    placeholder="e.g., 45"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Rating (0-5)</label>
                  <input
                    [(ngModel)]="guideForm.rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    placeholder="e.g., 4.8"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Languages</label>
                <input
                  [(ngModel)]="guideForm.languages"
                  type="text"
                  placeholder="e.g., English, French, Spanish (comma-separated)"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Bio/Description</label>
                <textarea
                  [(ngModel)]="guideForm.bio"
                  rows="4"
                  placeholder="About the guide..."
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  [(ngModel)]="guideForm.status"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
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
                (click)="saveGuide()"
                class="flex-1 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition"
              >
                {{ isEditing() ? 'Update Guide' : 'Add Guide' }}
              </button>
            </div>
          </div>
        </div>
      }

      @if (showDeleteConfirm()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-8 max-w-sm w-full mx-4">
            <h3 class="text-lg font-bold text-slate-900 mb-4">Delete Guide</h3>
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
                (click)="deleteGuide()"
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
export class ToursGuidesComponent implements OnInit {
  guides = signal<any[]>([]);
  showModal = signal(false);
  showDeleteConfirm = signal(false);
  isEditing = signal(false);
  isLoading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');
  formError = signal('');
  deleteConfirmName = signal('');
  deleteConfirmId = signal('');

  guideForm = {
    name: '',
    email: '',
    phone: '',
    expertise: '',
    toursCompleted: 0,
    rating: 0,
    languages: '',
    bio: '',
    status: 'active'
  };

  editingGuideId = '';

  constructor(private tourService: TourService) {}

  ngOnInit(): void {
    this.loadGuides();
  }

  loadGuides(): void {
    this.isLoading.set(true);
    this.tourService.getTourGuides().subscribe({
      next: (response: any) => {
        if (response.status === 'success' && Array.isArray(response.data)) {
          this.guides.set(response.data);
        } else if (Array.isArray(response.data)) {
          this.guides.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading guides:', error);
        this.errorMessage.set('Failed to load guides');
        this.isLoading.set(false);
        setTimeout(() => this.errorMessage.set(''), 3000);
      }
    });
  }

  openCreateModal(): void {
    this.resetForm();
    this.isEditing.set(false);
    this.editingGuideId = '';
    this.showModal.set(true);
  }

  openEditModal(guide: any): void {
    this.guideForm = {
      name: guide.name || '',
      email: guide.email || '',
      phone: guide.phone || '',
      expertise: guide.expertise || '',
      toursCompleted: guide.toursCompleted || 0,
      rating: guide.rating || 0,
      languages: guide.languages ? (Array.isArray(guide.languages) ? guide.languages.join(', ') : guide.languages) : '',
      bio: guide.bio || '',
      status: guide.status || 'active'
    };
    this.editingGuideId = guide._id;
    this.isEditing.set(true);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.resetForm();
  }

  resetForm(): void {
    this.guideForm = {
      name: '',
      email: '',
      phone: '',
      expertise: '',
      toursCompleted: 0,
      rating: 0,
      languages: '',
      bio: '',
      status: 'active'
    };
    this.formError.set('');
  }

  saveGuide(): void {
    this.formError.set('');

    if (!this.guideForm.name || !this.guideForm.email || !this.guideForm.phone || !this.guideForm.expertise) {
      this.formError.set('Please fill in all required fields');
      return;
    }

    const formData = {
      ...this.guideForm,
      languages: this.guideForm.languages ? this.guideForm.languages.split(',').map(l => l.trim()) : []
    };

    if (this.isEditing()) {
      this.tourService.updateTourGuide(this.editingGuideId, formData).subscribe({
        next: () => {
          this.successMessage.set('Guide updated successfully');
          this.closeModal();
          this.loadGuides();
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: (error) => {
          console.error('Error updating guide:', error);
          this.formError.set('Failed to update guide');
        }
      });
    } else {
      this.tourService.createTourGuide(formData).subscribe({
        next: () => {
          this.successMessage.set('Guide added successfully');
          this.closeModal();
          this.loadGuides();
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: (error) => {
          console.error('Error creating guide:', error);
          this.formError.set('Failed to add guide');
        }
      });
    }
  }

  confirmDelete(id: string, name: string): void {
    this.deleteConfirmId.set(id);
    this.deleteConfirmName.set(name);
    this.showDeleteConfirm.set(true);
  }

  deleteGuide(): void {
    this.tourService.deleteTourGuide(this.deleteConfirmId()).subscribe({
      next: () => {
        this.successMessage.set('Guide deleted successfully');
        this.showDeleteConfirm.set(false);
        this.loadGuides();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        console.error('Error deleting guide:', error);
        this.errorMessage.set('Failed to delete guide');
        this.showDeleteConfirm.set(false);
        setTimeout(() => this.errorMessage.set(''), 3000);
      }
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().substring(0, 2);
  }
}
