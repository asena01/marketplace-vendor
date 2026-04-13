import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HotelService } from '../../services/hotel.service';

@Component({
  selector: 'app-staff-timesheet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8 space-y-6">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Timesheet</h1>
          <p class="mt-1 text-slate-600">Basic weekly view of accepted/final shifts and scheduled hours.</p>
        </div>
        <input type="date" [(ngModel)]="weekStart" (change)="loadSchedule()" class="rounded-xl border border-slate-300 px-4 py-3" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="rounded-2xl bg-white p-5 shadow-sm">
          <p class="text-sm text-slate-500">Accepted / Final Shifts</p>
          <p class="mt-2 text-3xl font-bold text-slate-900">{{ approvedEntries().length }}</p>
        </div>
        <div class="rounded-2xl bg-white p-5 shadow-sm">
          <p class="text-sm text-slate-500">Scheduled Hours</p>
          <p class="mt-2 text-3xl font-bold text-slate-900">{{ totalHours() }}</p>
        </div>
        <div class="rounded-2xl bg-white p-5 shadow-sm">
          <p class="text-sm text-slate-500">Week Range</p>
          <p class="mt-2 text-lg font-bold text-slate-900">{{ weekRange() }}</p>
        </div>
      </div>

      <div class="rounded-2xl bg-white shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-100">
              <tr>
                <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Date</th>
                <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Shift</th>
                <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Area</th>
                <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Hours</th>
              </tr>
            </thead>
            <tbody>
              @if (approvedEntries().length === 0) {
                <tr><td colspan="4" class="px-5 py-8 text-center text-slate-500">No accepted shifts yet for this week.</td></tr>
              } @else {
                @for (entry of approvedEntries(); track entry._id) {
                  <tr class="border-t border-slate-100">
                    <td class="px-5 py-4 text-sm text-slate-700">{{ formatDate(entry.date) }}</td>
                    <td class="px-5 py-4 text-sm text-slate-700">{{ formatLabel(entry.shiftType) }} · {{ entry.startTime }} - {{ entry.endTime }}</td>
                    <td class="px-5 py-4 text-sm text-slate-700">{{ formatLabel(entry.assignedArea || 'lobby') }}</td>
                    <td class="px-5 py-4 text-sm text-slate-700">{{ calculateShiftHours(entry.startTime, entry.endTime) }}</td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class StaffTimesheetComponent implements OnInit {
  schedule = signal<any>(null);
  weekStart = this.getDefaultWeekStart();
  approvedEntries = computed(() => (this.schedule()?.entries || []).filter((entry: any) => ['accepted', 'final'].includes(entry.status) || entry.responseStatus === 'accepted'));
  totalHours = computed(() => this.approvedEntries().reduce((sum: number, entry: any) => sum + this.calculateShiftHours(entry.startTime, entry.endTime), 0));
  weekRange = computed(() => {
    const schedule = this.schedule();
    if (!schedule) return 'No schedule';
    return `${this.formatDate(schedule.weekStart)} - ${this.formatDate(schedule.weekEnd)}`;
  });

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
    if (!user?._id || !user.hotelId) return;
    this.hotelService.setHotelId(user.hotelId);
    this.hotelService.getMyStaffSchedule(user._id, this.weekStart).subscribe({
      next: (response: any) => this.schedule.set(response.status === 'success' ? response.data : null)
    });
  }

  calculateShiftHours(startTime: string, endTime: string): number {
    const [startHour] = startTime.split(':').map(Number);
    const [endHour] = endTime.split(':').map(Number);
    return endHour > startHour ? endHour - startHour : 24 - startHour + endHour;
  }

  formatLabel(value: string): string {
    return value.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  private getDefaultWeekStart(): string {
    const today = new Date();
    const day = today.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    today.setDate(today.getDate() + diff);
    return today.toISOString().slice(0, 10);
  }
}
