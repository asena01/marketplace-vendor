import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HotelService } from '../../services/hotel.service';

interface ScheduleEntry {
  _id: string;
  date: string;
  shiftType: string;
  startTime: string;
  endTime: string;
  assignedArea?: string;
  status: string;
  responseStatus: 'pending' | 'accepted' | 'rejected';
  swapRequest?: {
    targetStaffName?: string;
    status?: 'pending' | 'approved' | 'declined';
    reason?: string;
  };
}

interface ColleagueEntry {
  _id: string;
  staffName: string;
  position: string;
  department: string;
  date: string;
  shiftType: string;
  startTime: string;
  endTime: string;
  assignedArea?: string;
}

@Component({
  selector: 'app-staff-my-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 p-6 md:p-8">
      <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">My Schedule</h1>
          <p class="mt-1 text-slate-600">Review admin-assigned shifts, respond quickly, and request a colleague switch from the same card.</p>
        </div>
        <div class="w-full max-w-xs">
          <label class="mb-2 block text-sm font-medium text-slate-700">Week Start</label>
          <input
            type="date"
            [(ngModel)]="weekStart"
            (change)="loadSchedule()"
            class="w-full rounded-xl border border-slate-300 px-4 py-3"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div class="rounded-2xl bg-white p-5 shadow-sm">
          <p class="text-sm text-slate-500">Available</p>
          <p class="mt-2 text-3xl font-bold text-orange-600">{{ pendingCount() }}</p>
        </div>
        <div class="rounded-2xl bg-white p-5 shadow-sm">
          <p class="text-sm text-slate-500">Accepted</p>
          <p class="mt-2 text-3xl font-bold text-emerald-600">{{ acceptedCount() }}</p>
        </div>
        <div class="rounded-2xl bg-white p-5 shadow-sm">
          <p class="text-sm text-slate-500">Rejected</p>
          <p class="mt-2 text-3xl font-bold text-red-600">{{ rejectedCount() }}</p>
        </div>
        <div class="rounded-2xl bg-white p-5 shadow-sm">
          <p class="text-sm text-slate-500">Best Matches</p>
          <p class="mt-2 text-3xl font-bold text-sky-600">{{ activeMatches().length }}</p>
        </div>
      </div>

      @if (errorMessage()) {
        <div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ errorMessage() }}
        </div>
      }

      <div class="rounded-2xl bg-white p-5 shadow-sm">
        <h2 class="text-lg font-bold text-slate-900">How Shift Switching Works</h2>
        <div class="mt-3 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
          <div class="rounded-xl bg-slate-50 p-4">1. Review the shift and accept or reject it.</div>
          <div class="rounded-xl bg-slate-50 p-4">2. Open <span class="font-semibold text-slate-800">Find Colleague</span> on that shift only.</div>
          <div class="rounded-xl bg-slate-50 p-4">3. Pick one suggested match and send the request from that same card.</div>
        </div>
      </div>

      @if (entries().length === 0) {
        <div class="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-500">
          No shifts found for this week.
        </div>
      } @else {
        <div class="grid gap-5">
          @for (entry of entries(); track entry._id) {
            <section class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p class="text-sm font-semibold uppercase tracking-wide text-slate-500">{{ formatDate(entry.date) }}</p>
                  <h2 class="mt-2 text-2xl font-bold text-slate-900">{{ formatLabel(entry.shiftType) }} Shift</h2>
                  <p class="mt-1 text-sm text-slate-600">{{ entry.startTime }} - {{ entry.endTime }} · {{ formatLabel(entry.assignedArea || 'general') }}</p>
                </div>

                <div class="flex flex-wrap gap-2">
                  <span
                    class="rounded-full px-3 py-1 text-xs font-semibold"
                    [ngClass]="{
                      'bg-yellow-100 text-yellow-700': entry.responseStatus === 'pending',
                      'bg-emerald-100 text-emerald-700': entry.responseStatus === 'accepted',
                      'bg-red-100 text-red-700': entry.responseStatus === 'rejected'
                    }"
                  >
                    {{ formatLabel(entry.responseStatus) }}
                  </span>

                  @if (entry.swapRequest?.status) {
                    <span
                      class="rounded-full px-3 py-1 text-xs font-semibold"
                      [ngClass]="{
                        'bg-yellow-100 text-yellow-700': entry.swapRequest?.status === 'pending',
                        'bg-emerald-100 text-emerald-700': entry.swapRequest?.status === 'approved',
                        'bg-red-100 text-red-700': entry.swapRequest?.status === 'declined'
                      }"
                    >
                      Switch {{ formatLabel(entry.swapRequest?.status || 'pending') }}
                    </span>
                  }
                </div>
              </div>

              <div class="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
                <div class="space-y-4">
                  <div class="flex flex-wrap gap-3">
                    @if (entry.responseStatus === 'pending') {
                      <button
                        (click)="respond(entry, 'accepted')"
                        class="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                      >
                        Accept Schedule
                      </button>
                      <button
                        (click)="respond(entry, 'rejected')"
                        class="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
                      >
                        Reject Schedule
                      </button>
                    } @else {
                      <div class="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        You already responded to this shift.
                      </div>
                    }

                    @if (entry.responseStatus !== 'rejected') {
                      <button
                        (click)="toggleSwapFinder(entry)"
                        class="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        {{ activeSwapEntryId() === entry._id ? 'Hide Colleagues' : 'Find Colleague' }}
                      </button>
                    }
                  </div>

                  @if (entry.swapRequest?.status) {
                    <div class="rounded-2xl bg-sky-50 px-4 py-4 text-sm text-slate-700">
                      <p class="font-semibold text-slate-900">Latest switch request</p>
                      <p class="mt-2">Requested with {{ entry.swapRequest?.targetStaffName || 'a colleague' }}.</p>
                      <p class="mt-1">Reason: {{ entry.swapRequest?.reason || 'No reason provided.' }}</p>
                    </div>
                  }

                  @if (activeSwapEntryId() === entry._id) {
                    <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 class="text-base font-bold text-slate-900">Suggested Colleagues</h3>
                          <p class="text-sm text-slate-500">Closest matches are sorted by same day, same shift, then same area.</p>
                        </div>
                        <div class="rounded-full bg-white px-3 py-1 text-xs font-semibold text-sky-700 shadow-sm">
                          {{ activeMatches().length }} options
                        </div>
                      </div>

                      <div class="mt-4 grid gap-3">
                        @if (activeMatches().length === 0) {
                          <div class="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-5 text-sm text-slate-500">
                            No suitable colleague shifts were found for this schedule.
                          </div>
                        } @else {
                          @for (colleague of activeMatches(); track colleague._id) {
                            <button
                              type="button"
                              (click)="selectedColleagueId.set(colleague._id)"
                              class="rounded-2xl border bg-white px-4 py-4 text-left transition"
                              [class.border-sky-500]="selectedColleagueId() === colleague._id"
                              [class.bg-sky-50]="selectedColleagueId() === colleague._id"
                              [class.border-slate-200]="selectedColleagueId() !== colleague._id"
                            >
                              <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div>
                                  <p class="font-semibold text-slate-900">{{ colleague.staffName }}</p>
                                  <p class="mt-1 text-sm text-slate-500">{{ colleague.position }} · {{ formatLabel(colleague.department) }}</p>
                                  <p class="mt-1 text-sm text-slate-500">{{ formatDate(colleague.date) }} · {{ formatLabel(colleague.shiftType) }}</p>
                                  <p class="mt-1 text-xs text-slate-400">{{ colleague.startTime }} - {{ colleague.endTime }} · {{ formatLabel(colleague.assignedArea || 'general') }}</p>
                                </div>
                                <span class="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                                  {{ matchReason(entry, colleague) }}
                                </span>
                              </div>
                            </button>
                          }
                        }
                      </div>

                      <div class="mt-4">
                        <label class="mb-2 block text-sm font-medium text-slate-700">Reason for the request</label>
                        <textarea
                          [(ngModel)]="swapReason"
                          rows="3"
                          placeholder="Explain why you need this switch..."
                          class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
                        ></textarea>
                      </div>

                      <div class="mt-4 flex flex-wrap gap-3">
                        <button
                          (click)="requestSwap()"
                          [disabled]="!selectedColleague() || isSubmittingSwap()"
                          class="rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {{ isSubmittingSwap() ? 'Submitting...' : 'Send Switch Request' }}
                        </button>
                        <button
                          (click)="clearSwapSelection()"
                          class="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-white"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  }
                </div>

                <div class="rounded-2xl bg-slate-50 p-4">
                  <p class="text-sm font-semibold text-slate-900">Shift Summary</p>
                  <div class="mt-3 space-y-2 text-sm text-slate-600">
                    <p><span class="font-medium text-slate-800">Status:</span> {{ formatLabel(entry.responseStatus) }}</p>
                    <p><span class="font-medium text-slate-800">Area:</span> {{ formatLabel(entry.assignedArea || 'general') }}</p>
                    <p><span class="font-medium text-slate-800">Hours:</span> {{ entry.startTime }} - {{ entry.endTime }}</p>
                    @if (entry.swapRequest?.status) {
                      <p><span class="font-medium text-slate-800">Switch:</span> {{ formatLabel(entry.swapRequest?.status || 'pending') }}</p>
                    }
                  </div>
                </div>
              </div>
            </section>
          }
        </div>
      }
    </div>
  `
})
export class StaffMyScheduleComponent implements OnInit {
  schedule = signal<any>(null);
  errorMessage = signal('');
  isSubmittingSwap = signal(false);
  activeSwapEntryId = signal<string | null>(null);
  selectedColleagueId = signal<string | null>(null);
  swapReason = '';
  weekStart = this.getDefaultWeekStart();

  entries = computed(() => (this.schedule()?.entries || []) as ScheduleEntry[]);
  pendingCount = computed(() => this.entries().filter((entry) => entry.responseStatus === 'pending').length);
  acceptedCount = computed(() => this.entries().filter((entry) => entry.responseStatus === 'accepted').length);
  rejectedCount = computed(() => this.entries().filter((entry) => entry.responseStatus === 'rejected').length);
  activeEntry = computed(() => this.entries().find((entry) => entry._id === this.activeSwapEntryId()) || null);
  activeMatches = computed(() => {
    const currentEntry = this.activeEntry();
    const colleagues = (this.schedule()?.colleagueEntries || []) as ColleagueEntry[];
    if (!currentEntry) {
      return [];
    }

    return [...colleagues]
      .sort((a, b) => this.matchScore(currentEntry, b) - this.matchScore(currentEntry, a))
      .slice(0, 5);
  });
  selectedColleague = computed(
    () => this.activeMatches().find((entry) => entry._id === this.selectedColleagueId()) || null
  );

  constructor(private authService: AuthService, private hotelService: HotelService, private router: Router) {}

  ngOnInit(): void {
    if (!this.authService.isStaff()) {
      this.router.navigateByUrl('/staff-login');
      return;
    }
    this.loadSchedule();
  }

  loadSchedule(): void {
    const user = this.authService.getCurrentUser();
    if (!user?._id || !user.hotelId) {
      return;
    }

    this.errorMessage.set('');
    this.hotelService.setHotelId(user.hotelId);
    this.hotelService.getMyStaffSchedule(user._id, this.weekStart).subscribe({
      next: (response: any) => {
        this.schedule.set(response.status === 'success' ? response.data : null);
        this.clearSwapSelection();
      },
      error: (error: any) => this.errorMessage.set(error.error?.message || 'Failed to load schedule')
    });
  }

  respond(entry: ScheduleEntry, responseStatus: 'accepted' | 'rejected'): void {
    const user = this.authService.getCurrentUser();
    if (!user?._id) {
      return;
    }

    this.hotelService.respondToStaffSchedule(user._id, entry._id, responseStatus).subscribe({
      next: () => this.loadSchedule(),
      error: (error: any) => this.errorMessage.set(error.error?.message || 'Failed to update schedule response')
    });
  }

  toggleSwapFinder(entry: ScheduleEntry): void {
    if (this.activeSwapEntryId() === entry._id) {
      this.clearSwapSelection();
      return;
    }

    this.activeSwapEntryId.set(entry._id);
    this.selectedColleagueId.set(null);
    this.swapReason = '';
  }

  clearSwapSelection(): void {
    this.activeSwapEntryId.set(null);
    this.selectedColleagueId.set(null);
    this.swapReason = '';
  }

  requestSwap(): void {
    const user = this.authService.getCurrentUser();
    const ownEntry = this.activeEntry();
    const colleagueEntry = this.selectedColleague();
    if (!user?._id || !ownEntry?._id || !colleagueEntry?._id) {
      return;
    }

    this.isSubmittingSwap.set(true);
    this.hotelService.requestScheduleSwap(user._id, ownEntry._id, colleagueEntry._id, this.swapReason).subscribe({
      next: () => {
        this.isSubmittingSwap.set(false);
        this.loadSchedule();
      },
      error: (error: any) => {
        this.isSubmittingSwap.set(false);
        this.errorMessage.set(error.error?.message || 'Failed to request schedule switch');
      }
    });
  }

  matchReason(entry: ScheduleEntry, colleague: ColleagueEntry): string {
    if (entry.date === colleague.date && entry.shiftType === colleague.shiftType) {
      return 'Same day + shift';
    }
    if (entry.date === colleague.date) {
      return 'Same day';
    }
    if (entry.shiftType === colleague.shiftType) {
      return 'Same shift';
    }
    if ((entry.assignedArea || '') === (colleague.assignedArea || '')) {
      return 'Same area';
    }
    return 'Closest match';
  }

  formatLabel(value: string): string {
    return value.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  private matchScore(entry: ScheduleEntry, colleague: ColleagueEntry): number {
    let score = 0;
    if (entry.date === colleague.date) score += 5;
    if (entry.shiftType === colleague.shiftType) score += 4;
    if ((entry.assignedArea || '') === (colleague.assignedArea || '')) score += 3;
    return score;
  }

  private getDefaultWeekStart(): string {
    const today = new Date();
    const day = today.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    today.setDate(today.getDate() + diff);
    return today.toISOString().slice(0, 10);
  }
}
