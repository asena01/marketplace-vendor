import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HotelService } from '../../services/hotel.service';

interface StaffTask {
  _id: string;
  roomNumber: string;
  taskType: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  scheduledDate: string;
  dueAt?: string;
  startedAt?: string;
  completedAt?: string;
  actualDurationMinutes?: number;
  completionNotes?: string;
  booking?: {
    bookingNumber?: string;
    checkOutDate?: string;
  };
}

@Component({
  selector: 'app-staff-my-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 p-6 md:p-8">
      <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">My Tasks</h1>
          <p class="mt-1 text-slate-600">Cleaning, maintenance, inspection, and room support work assigned to your role.</p>
        </div>
        <select [(ngModel)]="selectedStatus" (change)="loadTasks()" class="w-full max-w-xs rounded-xl border border-slate-300 px-4 py-3">
          <option value="">All Tasks</option>
          <option value="open">Open</option>
          <option value="assigned">Assigned</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      @if (errorMessage()) {
        <div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ errorMessage() }}</div>
      }

      <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div class="rounded-2xl bg-white p-5 shadow-sm">
          <p class="text-sm text-slate-500">Assigned</p>
          <p class="mt-2 text-3xl font-bold text-slate-900">{{ countByStatus('assigned') }}</p>
        </div>
        <div class="rounded-2xl bg-white p-5 shadow-sm">
          <p class="text-sm text-slate-500">In Progress</p>
          <p class="mt-2 text-3xl font-bold text-amber-700">{{ countByStatus('in-progress') }}</p>
        </div>
        <div class="rounded-2xl bg-white p-5 shadow-sm">
          <p class="text-sm text-slate-500">Completed</p>
          <p class="mt-2 text-3xl font-bold text-emerald-700">{{ countByStatus('completed') }}</p>
        </div>
        <div class="rounded-2xl bg-white p-5 shadow-sm">
          <p class="text-sm text-slate-500">Urgent</p>
          <p class="mt-2 text-3xl font-bold text-red-700">{{ urgentTasksCount() }}</p>
        </div>
      </div>

      @if (tasks().length === 0) {
        <div class="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-500">
          No tasks assigned right now.
        </div>
      } @else {
        <div class="grid gap-5">
          @for (task of tasks(); track task._id) {
            <section class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p class="text-sm font-semibold uppercase tracking-wide text-slate-500">Room {{ task.roomNumber }}</p>
                  <h2 class="mt-2 text-2xl font-bold text-slate-900">{{ task.title }}</h2>
                  <p class="mt-1 text-sm text-slate-600">{{ formatLabel(task.taskType) }} · {{ formatDate(task.scheduledDate) }}</p>
                  @if (task.booking?.bookingNumber) {
                    <p class="mt-1 text-xs text-slate-400">Booking {{ task.booking?.bookingNumber }}</p>
                  }
                </div>
                <div class="flex flex-wrap gap-2">
                  <span class="rounded-full px-3 py-1 text-xs font-semibold"
                    [ngClass]="{
                      'bg-slate-100 text-slate-700': task.status === 'assigned' || task.status === 'open',
                      'bg-amber-100 text-amber-700': task.status === 'in-progress',
                      'bg-emerald-100 text-emerald-700': task.status === 'completed',
                      'bg-red-100 text-red-700': task.status === 'cancelled'
                    }"
                  >
                    {{ formatLabel(task.status) }}
                  </span>
                  <span class="rounded-full px-3 py-1 text-xs font-semibold"
                    [ngClass]="{
                      'bg-slate-100 text-slate-700': task.priority === 'low',
                      'bg-blue-100 text-blue-700': task.priority === 'medium',
                      'bg-amber-100 text-amber-700': task.priority === 'high',
                      'bg-red-100 text-red-700': task.priority === 'critical'
                    }"
                  >
                    {{ task.priority | titlecase }}
                  </span>
                </div>
              </div>

              @if (task.description) {
                <p class="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">{{ task.description }}</p>
              }

              <div class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                <div class="rounded-2xl bg-slate-50 px-4 py-3">
                  <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Started</p>
                  <p class="mt-1 text-sm font-medium text-slate-900">{{ formatDateTime(task.startedAt, 'Not started') }}</p>
                </div>
                <div class="rounded-2xl bg-slate-50 px-4 py-3">
                  <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Completed</p>
                  <p class="mt-1 text-sm font-medium text-slate-900">{{ formatDateTime(task.completedAt, 'Not completed') }}</p>
                </div>
                <div class="rounded-2xl bg-slate-50 px-4 py-3">
                  <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {{ task.status === 'in-progress' ? 'Live Duration' : 'Total Time' }}
                  </p>
                  <p class="mt-1 text-sm font-medium text-slate-900">{{ formatDuration(task) }}</p>
                </div>
              </div>

              <div class="mt-5 flex flex-wrap gap-3">
                @if (task.status === 'assigned' || task.status === 'open') {
                  <button (click)="updateTask(task, 'in-progress')" class="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
                    Start Task
                  </button>
                }
                @if (task.status !== 'completed' && task.status !== 'cancelled') {
                  <button (click)="prepareComplete(task)" class="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
                    Mark Complete
                  </button>
                }
              </div>

              @if (completingTaskId() === task._id) {
                <div class="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <label class="mb-2 block text-sm font-medium text-slate-700">Completion note</label>
                  <textarea [(ngModel)]="completionNote" rows="3" class="w-full rounded-xl border border-slate-300 px-4 py-3"></textarea>
                  <div class="mt-3 flex flex-wrap gap-3">
                    <button (click)="updateTask(task, 'completed')" class="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">Confirm Complete</button>
                    <button (click)="cancelComplete()" class="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-white">Cancel</button>
                  </div>
                </div>
              }
            </section>
          }
        </div>
      }
    </div>
  `
})
export class StaffMyTasksComponent implements OnInit, OnDestroy {
  tasks = signal<StaffTask[]>([]);
  errorMessage = signal('');
  completingTaskId = signal<string | null>(null);
  completionNote = '';
  selectedStatus = '';
  now = signal(Date.now());
  private timerId: ReturnType<typeof setInterval> | null = null;

  constructor(private authService: AuthService, private hotelService: HotelService, private router: Router) {}

  ngOnInit(): void {
    if (!this.authService.isStaff()) {
      this.router.navigateByUrl('/staff-login');
      return;
    }
    this.timerId = setInterval(() => this.now.set(Date.now()), 60000);
    this.loadTasks();
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  loadTasks(): void {
    const user = this.authService.getCurrentUser();
    if (!user?._id || !user.hotelId) return;

    this.hotelService.setHotelId(user.hotelId);
    this.hotelService.getMyRoomTasks(user._id, this.selectedStatus || undefined).subscribe({
      next: (response: any) => {
        this.tasks.set(response.status === 'success' && Array.isArray(response.data) ? response.data : []);
      },
      error: (error: any) => {
        this.errorMessage.set(error.error?.message || 'Failed to load tasks');
      }
    });
  }

  countByStatus(status: StaffTask['status']): number {
    return this.tasks().filter((task) => task.status === status).length;
  }

  urgentTasksCount(): number {
    return this.tasks().filter((task) => ['high', 'critical'].includes(task.priority) && task.status !== 'completed').length;
  }

  prepareComplete(task: StaffTask): void {
    this.completingTaskId.set(task._id);
    this.completionNote = task.completionNotes || '';
  }

  cancelComplete(): void {
    this.completingTaskId.set(null);
    this.completionNote = '';
  }

  updateTask(task: StaffTask, status: StaffTask['status']): void {
    const note = status === 'completed' ? this.completionNote : undefined;
    this.hotelService.updateRoomTaskStatus(task._id, status, note).subscribe({
      next: () => {
        this.cancelComplete();
        this.loadTasks();
      },
      error: (error: any) => {
        this.errorMessage.set(error.error?.message || 'Failed to update task');
      }
    });
  }

  formatLabel(value: string): string {
    return value.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  formatDateTime(value?: string, fallback = 'Not recorded'): string {
    if (!value) return fallback;
    return new Date(value).toLocaleString('en-NG', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDuration(task: StaffTask): string {
    if (task.actualDurationMinutes && task.status === 'completed') {
      return this.formatMinutes(task.actualDurationMinutes);
    }

    if (task.startedAt && task.status === 'in-progress') {
      const elapsedMinutes = Math.max(1, Math.floor((this.now() - new Date(task.startedAt).getTime()) / 60000));
      return this.formatMinutes(elapsedMinutes);
    }

    return 'Not tracked yet';
  }

  private formatMinutes(totalMinutes: number): string {
    if (totalMinutes < 60) {
      return `${totalMinutes} min`;
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes === 0 ? `${hours} hr` : `${hours} hr ${minutes} min`;
  }
}
