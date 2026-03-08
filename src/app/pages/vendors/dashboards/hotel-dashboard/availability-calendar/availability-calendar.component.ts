import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../../../../services/hotel.service';

interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  availability: { [roomId: string]: string }; // 'available', 'blocked', 'maintenance'
}

@Component({
  selector: 'app-availability-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8 space-y-6">
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white shadow-lg">
        <div>
          <h1 class="text-3xl font-bold mb-2">Availability Calendar</h1>
          <p class="text-blue-100">Manage room availability, block dates, and track occupancy</p>
        </div>
      </div>

      <!-- Controls -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-6 rounded-lg shadow-md">
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">View Mode</label>
          <select
            [(ngModel)]="viewMode"
            (change)="onViewModeChange()"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
          >
            <option value="month">Month View</option>
            <option value="week">Week View</option>
            <option value="room">Room View</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">Room Filter</label>
          <select
            [(ngModel)]="selectedRoomFilter"
            (change)="filterRooms()"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
          >
            <option value="">All Rooms</option>
            @for (room of rooms(); track room._id) {
              <option [value]="room._id">{{ room.roomNumber }} ({{ room.roomType }})</option>
            }
          </select>
        </div>
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">Status Filter</label>
          <select
            [(ngModel)]="statusFilter"
            (change)="loadCalendarData()"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="blocked">Blocked</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
        <div class="flex items-end gap-2">
          <button
            (click)="previousPeriod()"
            class="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold py-2 px-4 rounded-lg transition"
          >
            ←
          </button>
          <div class="flex-1 text-center font-semibold text-slate-900">
            {{ currentDateDisplay() }}
          </div>
          <button
            (click)="nextPeriod()"
            class="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold py-2 px-4 rounded-lg transition"
          >
            →
          </button>
        </div>
      </div>

      <!-- Legend -->
      <div class="bg-white rounded-lg shadow-md p-4 flex gap-6 flex-wrap">
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-green-500 rounded"></div>
          <span class="text-sm font-medium text-slate-700">Available</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-red-500 rounded"></div>
          <span class="text-sm font-medium text-slate-700">Blocked</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-yellow-500 rounded"></div>
          <span class="text-sm font-medium text-slate-700">Maintenance</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-blue-500 rounded"></div>
          <span class="text-sm font-medium text-slate-700">Booked</span>
        </div>
      </div>

      <!-- Calendar -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <!-- Month View -->
        @if (viewMode === 'month') {
          <div class="p-6">
            <div class="grid grid-cols-7 gap-1">
              <!-- Day Headers -->
              @for (day of ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; track day) {
                <div class="text-center font-semibold text-slate-700 py-2">{{ day }}</div>
              }
              <!-- Calendar Days -->
              @for (day of calendarDays(); track day.date.toString()) {
                <div
                  (click)="selectDate(day.date)"
                  class="min-h-24 p-2 border rounded-lg cursor-pointer transition hover:shadow-md"
                  [ngClass]="{
                    'bg-slate-100 text-slate-400': !day.isCurrentMonth,
                    'bg-white': day.isCurrentMonth && !isDateSelected(day.date),
                    'bg-blue-50 border-blue-500': isDateSelected(day.date)
                  }"
                >
                  <div class="font-semibold text-sm mb-1" [class.text-slate-700]="day.isCurrentMonth">
                    {{ day.dayOfMonth }}
                  </div>
                  @if (day.isCurrentMonth && selectedRoomFilter) {
                    <div
                      class="text-xs py-1 px-2 rounded font-medium text-white"
                      [ngClass]="getStatusColorClass(day.availability[selectedRoomFilter])"
                    >
                      {{ getStatusLabel(day.availability[selectedRoomFilter]) }}
                    </div>
                  } @else if (day.isCurrentMonth) {
                    <div class="text-xs space-y-1">
                      @if (getAvailabilityCount(day.date, 'available'); as count) {
                        <div class="text-green-600">✓ {{ count }} avail</div>
                      }
                      @if (getAvailabilityCount(day.date, 'blocked'); as count) {
                        @if (count > 0) {
                          <div class="text-red-600">⊗ {{ count }} blocked</div>
                        }
                      }
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        }

        <!-- Room View -->
        @if (viewMode === 'room') {
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-slate-100 border-b">
                <tr>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Room</th>
                  @for (day of getWeekDays(); track day.toString()) {
                    <th class="px-4 py-4 text-center text-sm font-semibold text-slate-900">
                      {{ formatDayHeader(day) }}
                    </th>
                  }
                </tr>
              </thead>
              <tbody class="divide-y">
                @for (room of filteredRooms(); track room._id) {
                  <tr class="hover:bg-slate-50">
                    <td class="px-6 py-4 text-sm font-medium text-slate-900 min-w-40">
                      <div>{{ room.roomNumber }}</div>
                      <div class="text-xs text-slate-500">{{ room.roomType }}</div>
                    </td>
                    @for (day of getWeekDays(); track day.toString()) {
                      <td class="px-4 py-4 text-center">
                        <div
                          (click)="changeRoomAvailability(room._id, day)"
                          class="cursor-pointer w-full py-2 px-2 rounded font-medium text-xs text-white transition hover:opacity-80"
                          [ngClass]="getStatusColorClass(getRoomStatus(room._id, day))"
                        >
                          {{ getStatusLabel(getRoomStatus(room._id, day)) }}
                        </div>
                      </td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- Bulk Actions -->
      @if (selectedDates().length > 0) {
        <div class="bg-blue-50 border border-blue-300 rounded-lg p-6 shadow-md">
          <h3 class="text-lg font-bold text-slate-900 mb-4">
            📅 Bulk Update ({{ selectedDates().length }} dates selected)
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              (click)="bulkUpdateStatus('available')"
              class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              ✓ Mark Available
            </button>
            <button
              (click)="bulkUpdateStatus('blocked')"
              class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              ⊗ Block Dates
            </button>
            <button
              (click)="bulkUpdateStatus('maintenance')"
              class="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              🔧 Maintenance
            </button>
          </div>
        </div>
      }

      <!-- Status Messages -->
      @if (successMessage()) {
        <div class="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">✓ {{ successMessage() }}</p>
        </div>
      }
      @if (errorMessage()) {
        <div class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">✗ {{ errorMessage() }}</p>
        </div>
      }
    </div>
  `,
  styles: []
})
export class AvailabilityCalendarComponent implements OnInit {
  rooms = signal<any[]>([]);
  filteredRooms = signal<any[]>([]);
  calendarDays = signal<CalendarDay[]>([]);
  
  currentDate = signal(new Date());
  viewMode = 'month';
  selectedRoomFilter = '';
  statusFilter = '';
  selectedDates = signal<Date[]>([]);
  successMessage = signal('');
  errorMessage = signal('');

  currentDateDisplay = computed(() => {
    const date = this.currentDate();
    if (this.viewMode === 'month') {
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
  });

  constructor(private hotelService: HotelService) {}

  ngOnInit(): void {
    this.loadRooms();
    this.loadCalendarData();
  }

  loadRooms(): void {
    this.hotelService.getRooms(1, 100).subscribe({
      next: (response: any) => {
        if (response.status === 'success' && Array.isArray(response.data)) {
          this.rooms.set(response.data);
          this.filterRooms();
        }
      },
      error: (error) => console.error('Error loading rooms:', error)
    });
  }

  loadCalendarData(): void {
    const year = this.currentDate().getFullYear();
    const month = this.currentDate().getMonth();

    if (this.viewMode === 'month') {
      this.generateMonthCalendar(year, month);
    } else {
      this.generateWeekCalendar();
    }
  }

  generateMonthCalendar(year: number, month: number): void {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const current = new Date(startDate);

    while (current <= lastDay || current.getDay() !== 0) {
      const isCurrentMonth = current.getMonth() === month;
      days.push({
        date: new Date(current),
        dayOfMonth: current.getDate(),
        isCurrentMonth,
        availability: {}
      });
      current.setDate(current.getDate() + 1);
    }

    this.calendarDays.set(days);
  }

  generateWeekCalendar(): void {
    const start = new Date(this.currentDate());
    start.setDate(start.getDate() - start.getDay());
    
    const days: CalendarDay[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      days.push({
        date,
        dayOfMonth: date.getDate(),
        isCurrentMonth: true,
        availability: {}
      });
    }
    this.calendarDays.set(days);
  }

  filterRooms(): void {
    if (this.selectedRoomFilter) {
      this.filteredRooms.set(
        this.rooms().filter(r => r._id === this.selectedRoomFilter)
      );
    } else {
      this.filteredRooms.set(this.rooms());
    }
  }

  getWeekDays(): Date[] {
    const start = new Date(this.currentDate());
    start.setDate(start.getDate() - start.getDay());
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      days.push(date);
    }
    return days;
  }

  getAvailabilityCount(date: Date, status: string): number {
    const dateStr = date.toDateString();
    return this.rooms().filter(room => {
      const roomStatus = this.getRoomStatus(room._id, date);
      return roomStatus === status;
    }).length;
  }

  getRoomStatus(roomId: string, date: Date): string {
    // In real implementation, fetch from API
    // For now, return 'available' as default
    return 'available';
  }

  changeRoomAvailability(roomId: string, date: Date): void {
    // Toggle between available, blocked, maintenance
    const currentStatus = this.getRoomStatus(roomId, date);
    const nextStatus = currentStatus === 'available' ? 'blocked' : 
                      currentStatus === 'blocked' ? 'maintenance' : 'available';
    
    this.hotelService.updateRoomAvailability(roomId, date, nextStatus).subscribe({
      next: () => {
        this.successMessage.set('Availability updated');
        setTimeout(() => this.successMessage.set(''), 3000);
        this.loadCalendarData();
      },
      error: () => this.errorMessage.set('Failed to update availability')
    });
  }

  selectDate(date: Date): void {
    const selected = this.selectedDates();
    const dateStr = date.toDateString();
    const index = selected.findIndex(d => d.toDateString() === dateStr);
    
    if (index > -1) {
      selected.splice(index, 1);
    } else {
      selected.push(date);
    }
    this.selectedDates.set([...selected]);
  }

  isDateSelected(date: Date): boolean {
    return this.selectedDates().some(d => d.toDateString() === date.toDateString());
  }

  bulkUpdateStatus(status: string): void {
    const roomId = this.selectedRoomFilter || this.rooms()[0]?._id;
    if (!roomId) return;

    const updates = this.selectedDates().map(date => ({
      roomId,
      date,
      status
    }));

    this.hotelService.bulkUpdateAvailability(updates).subscribe({
      next: () => {
        this.successMessage.set(`${updates.length} dates updated to ${status}`);
        this.selectedDates.set([]);
        setTimeout(() => this.successMessage.set(''), 3000);
        this.loadCalendarData();
      },
      error: () => this.errorMessage.set('Failed to update availability')
    });
  }

  previousPeriod(): void {
    const date = new Date(this.currentDate());
    if (this.viewMode === 'month') {
      date.setMonth(date.getMonth() - 1);
    } else {
      date.setDate(date.getDate() - 7);
    }
    this.currentDate.set(date);
    this.loadCalendarData();
  }

  nextPeriod(): void {
    const date = new Date(this.currentDate());
    if (this.viewMode === 'month') {
      date.setMonth(date.getMonth() + 1);
    } else {
      date.setDate(date.getDate() + 7);
    }
    this.currentDate.set(date);
    this.loadCalendarData();
  }

  onViewModeChange(): void {
    this.selectedRoomFilter = '';
    this.selectedDates.set([]);
    this.loadCalendarData();
  }

  formatDayHeader(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'available': '✓ Avail',
      'blocked': '⊗ Blocked',
      'maintenance': '🔧 Maint',
      'booked': '📅 Booked'
    };
    return labels[status] || 'Unknown';
  }

  getStatusColorClass(status: string): string {
    const colors: { [key: string]: string } = {
      'available': 'bg-green-500 hover:bg-green-600',
      'blocked': 'bg-red-500 hover:bg-red-600',
      'maintenance': 'bg-yellow-500 hover:bg-yellow-600',
      'booked': 'bg-blue-500 hover:bg-blue-600'
    };
    return colors[status] || 'bg-gray-500';
  }
}
