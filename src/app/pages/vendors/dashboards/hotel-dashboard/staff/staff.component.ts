import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../../../../services/hotel.service';
import { AuthService } from '../../../../../services/auth.service';

type StaffPosition =
  | 'manager'
  | 'receptionist'
  | 'housekeeping'
  | 'housekeeper'
  | 'chef'
  | 'waiter'
  | 'maintenance'
  | 'security'
  | 'other';

type StaffStatus = 'active' | 'inactive' | 'on-leave';
type AccessRole =
  | 'admin'
  | 'operations'
  | 'front-desk'
  | 'housekeeping'
  | 'food-service'
  | 'maintenance'
  | 'security'
  | 'custom';

type StaffManagementView = 'team' | 'scheduling' | 'activity' | 'keys';

interface StaffPermissions {
  canManageBookings: boolean;
  canManageRooms: boolean;
  canManageOrders: boolean;
  canViewRevenue: boolean;
  canViewAnalytics: boolean;
  canManageStaff: boolean;
  canHandleMaintenance: boolean;
}

interface Staff {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  position: StaffPosition;
  department: string;
  salary: number;
  hireDate: string;
  status: StaffStatus;
  shiftType?: 'morning' | 'evening' | 'night';
  accessRole: AccessRole;
  allowedModules: string[];
  allowedAreas: string[];
  permissions: StaffPermissions;
  mustChangePassword?: boolean;
  temporaryPasswordIssuedAt?: string;
  lastLogin?: string;
  createdAt?: string;
}

interface StaffCredentialPreview {
  staffName: string;
  email: string;
  temporaryPassword: string;
}

interface StaffActivitySummary {
  summary: {
    totalActions: number;
    todayActions: number;
    successfulActions: number;
    pendingActions: number;
    failedActions: number;
    lastLogin: string | null;
    lastActivityAt: string | null;
  };
  recentActivities: Array<{
    _id: string;
    action: string;
    description: string;
    status: 'success' | 'pending' | 'failed';
    timestamp: string;
  }>;
}

interface GeneratedScheduleEntry {
  _id?: string;
  staff?: string | { _id?: string; name?: string };
  staffId?: string;
  scheduleId?: string;
  staffName: string;
  position: string;
  department: string;
  date: string;
  shiftType: 'morning' | 'evening' | 'night';
  startTime: string;
  endTime: string;
  assignedArea: string;
  notes?: string;
  status: 'draft' | 'pending-acceptance' | 'accepted' | 'rejected' | 'final';
  responseStatus?: 'pending' | 'accepted' | 'rejected';
  scheduleWeekStart?: string;
  scheduleWeekEnd?: string;
  keyAccessAudit?: {
    status?: 'pending' | 'generated' | 'not-generated' | 'revoked';
    reason?: string;
    generatedAt?: string;
    revokedAt?: string;
    grants?: Array<{
      grantId?: string;
      roomId?: string;
      roomNumber?: string;
      deviceId?: string;
      accessCode?: string;
      status?: string;
    }>;
  };
}

interface GeneratedStaffSchedule {
  _id?: string;
  weekStart: string;
  weekEnd: string;
  generatedBy?: string;
  notes?: string;
  entries: GeneratedScheduleEntry[];
}

interface ScheduleEditorForm {
  scheduleId: string;
  entryId: string;
  staffId: string;
  date: string;
  shiftType: 'morning' | 'evening' | 'night';
  startTime: string;
  endTime: string;
  assignedArea: string;
  notes: string;
  status: 'draft' | 'pending-acceptance' | 'accepted' | 'rejected' | 'final';
}

interface ConfirmActionState {
  type: 'delete-staff' | 'delete-schedule-entry' | 'delete-schedule-weeks';
  title: string;
  message: string;
  confirmLabel: string;
  tone: 'danger';
  payload?: {
    staffId?: string;
    scheduleId?: string;
    entryId?: string;
  };
}

interface SmartAccessGrant {
  _id: string;
  room?: { _id?: string; roomNumber?: string; accessMode?: string };
  device?: { _id?: string; deviceId?: string; deviceType?: string };
  subjectStaff?: { _id?: string; name?: string; email?: string; position?: string; department?: string };
  grantType?: string;
  accessCode?: string;
  validFrom?: string;
  validUntil?: string;
  status?: 'active' | 'revoked' | 'expired';
  metadata?: { notes?: string };
  scheduleId?: string;
  scheduleEntryId?: string;
}

interface ContactlessRoomOption {
  _id: string;
  roomNumber: string;
  roomType: string;
  accessMode: string;
  smartLockDevice?: { _id?: string; deviceId?: string };
}

interface StaffKeyAccessForm {
  staffId: string;
  roomId: string;
  validFrom: string;
  validUntil: string;
  notes: string;
}

const MODULE_OPTIONS = [
  { value: 'overview', label: 'Overview' },
  { value: 'bookings', label: 'Bookings' },
  { value: 'rooms', label: 'Rooms' },
  { value: 'guests', label: 'Guests' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'food-orders', label: 'Food Orders' },
  { value: 'food-menu', label: 'Food Menu' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'housekeeping', label: 'Housekeeping' },
  { value: 'pre-checkin', label: 'Pre Check-in' },
  { value: 'staff', label: 'Staff' },
  { value: 'services', label: 'Services' }
];

const AREA_OPTIONS = [
  { value: 'front-desk', label: 'Front Desk' },
  { value: 'lobby', label: 'Lobby' },
  { value: 'guest-rooms', label: 'Guest Rooms' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'security', label: 'Security' },
  { value: 'admin-office', label: 'Admin Office' },
  { value: 'spa-services', label: 'Spa Services' }
];

@Component({
  selector: 'app-hotel-staff',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 p-8">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Staff Management</h1>
          <p class="mt-1 text-slate-600">
            Control staff access, onboard them with temporary credentials, and review recent activity by role.
          </p>
        </div>
        <button
          (click)="openAddStaffModal()"
          class="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition hover:bg-blue-700"
        >
          Add Staff Member
        </button>
      </div>

      @if (credentialPreview()) {
        <div class="rounded-xl border border-amber-300 bg-amber-50 p-5 shadow-sm">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p class="text-sm font-semibold uppercase tracking-wide text-amber-700">Temporary Password Issued</p>
              <p class="mt-1 font-semibold text-slate-900">{{ credentialPreview()?.staffName }} · {{ credentialPreview()?.email }}</p>
              <p class="mt-2 text-sm text-slate-700">
                Temporary password:
                <span class="rounded bg-white px-2 py-1 font-mono text-slate-900 shadow-sm">{{ credentialPreview()?.temporaryPassword }}</span>
              </p>
              <p class="mt-2 text-sm text-slate-600">The staff member should change this on first login.</p>
            </div>
            <button
              (click)="credentialPreview.set(null)"
              class="self-start rounded-lg border border-amber-300 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100"
            >
              Dismiss
            </button>
          </div>
        </div>
      }

      <div class="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <div class="grid grid-cols-1 gap-2 md:grid-cols-4">
          <button
            (click)="setActiveView('team')"
            [ngClass]="activeView() === 'team' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'"
            class="rounded-xl px-4 py-3 text-sm font-semibold transition"
          >
            Team
          </button>
          <button
            (click)="setActiveView('scheduling')"
            [ngClass]="activeView() === 'scheduling' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'"
            class="rounded-xl px-4 py-3 text-sm font-semibold transition"
          >
            Scheduling
          </button>
          <button
            (click)="setActiveView('activity')"
            [ngClass]="activeView() === 'activity' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'"
            class="rounded-xl px-4 py-3 text-sm font-semibold transition"
          >
            Activity
          </button>
          <button
            (click)="setActiveView('keys')"
            [ngClass]="activeView() === 'keys' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'"
            class="rounded-xl px-4 py-3 text-sm font-semibold transition"
          >
            Key Access
          </button>
        </div>
      </div>

      @if (activeView() === 'team') {
      <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div class="rounded-lg bg-white p-4 shadow-md">
          <p class="text-sm font-medium text-slate-600">Total Staff</p>
          <p class="text-2xl font-bold text-slate-900">{{ filteredStaff().length }}</p>
        </div>
        <div class="rounded-lg border-l-4 border-emerald-500 bg-emerald-50 p-4 shadow-md">
          <p class="text-sm font-medium text-slate-600">Active</p>
          <p class="text-2xl font-bold text-emerald-600">{{ countByStatus('active') }}</p>
        </div>
        <div class="rounded-lg border-l-4 border-orange-500 bg-orange-50 p-4 shadow-md">
          <p class="text-sm font-medium text-slate-600">Password Reset Required</p>
          <p class="text-2xl font-bold text-orange-600">{{ countMustChangePassword() }}</p>
        </div>
        <div class="rounded-lg border-l-4 border-indigo-500 bg-indigo-50 p-4 shadow-md">
          <p class="text-sm font-medium text-slate-600">Managers / Leads</p>
          <p class="text-2xl font-bold text-indigo-600">{{ countPrivilegedStaff() }}</p>
        </div>
      </div>
      }

      @if (activeView() === 'scheduling' && isHotelAdmin()) {
        <div class="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 class="text-xl font-bold text-slate-900">Staff Schedule Generator</h2>
              <p class="mt-1 text-sm text-slate-600">
                Generate schedules across one or more weeks. Existing weeks are preserved and not overwritten.
              </p>
            </div>
            <span class="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">Admin Only</span>
          </div>

          <div class="grid grid-cols-1 gap-4 lg:grid-cols-[220px_220px_minmax(0,1fr)_auto]">
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">Week Start</label>
              <input
                type="date"
                [(ngModel)]="scheduleWeekStart"
                (change)="onScheduleRangeChange()"
                class="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">Week End</label>
              <input
                type="date"
                [(ngModel)]="scheduleWeekEnd"
                (change)="onScheduleRangeChange()"
                class="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">Notes</label>
              <input
                type="text"
                [(ngModel)]="scheduleNotes"
                placeholder="Optional note for the generated schedules"
                class="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div class="flex items-end">
              <button
                (click)="generateSchedule()"
                [disabled]="isGeneratingSchedule()"
                class="w-full rounded-lg bg-slate-900 px-5 py-2.5 font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {{ isGeneratingSchedule() ? 'Generating...' : 'Generate Schedule' }}
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-5">
            <div class="rounded-xl bg-slate-50 p-4">
              <p class="text-xs uppercase tracking-wide text-slate-500">Selected Range</p>
              <p class="mt-1 text-lg font-bold text-slate-900">{{ selectedScheduleRangeLabel() }}</p>
            </div>
            <div class="rounded-xl bg-slate-50 p-4">
              <p class="text-xs uppercase tracking-wide text-slate-500">Weeks Loaded</p>
              <p class="mt-1 text-lg font-bold text-slate-900">{{ schedules().length }}</p>
            </div>
            <div class="rounded-xl bg-slate-50 p-4">
              <p class="text-xs uppercase tracking-wide text-slate-500">Scheduled Staff</p>
              <p class="mt-1 text-lg font-bold text-slate-900">{{ uniqueScheduledStaffCount() }}</p>
            </div>
            <div class="rounded-xl bg-slate-50 p-4">
              <p class="text-xs uppercase tracking-wide text-slate-500">Shift Slots</p>
              <p class="mt-1 text-lg font-bold text-slate-900">{{ scheduleEntries().length }}</p>
            </div>
            <div class="rounded-xl bg-slate-50 p-4">
              <p class="text-xs uppercase tracking-wide text-slate-500">Existing Weeks Kept</p>
              <p class="mt-1 text-lg font-bold text-slate-900">{{ skippedScheduleWeeks().length }}</p>
            </div>
          </div>

          @if (skippedScheduleWeeks().length > 0) {
            <div class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Existing schedules were kept for:
              {{ skippedScheduleLabels() }}.
            </div>
          }

          <div class="rounded-xl border border-slate-200">
            <div class="flex flex-col gap-2 border-b border-slate-200 bg-slate-50 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p class="font-semibold text-slate-900">Generated Schedule Range</p>
                <p class="mt-1 text-sm text-slate-500">
                  Review all generated entries for the selected range. Pagination is applied below.
                </p>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <button
                  (click)="loadSchedule()"
                  class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Refresh
                </button>
                <button
                  (click)="deleteLoadedScheduleWeeks()"
                  [disabled]="isDeletingScheduleWeek() || schedules().length === 0"
                  class="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {{ isDeletingScheduleWeek() ? 'Deleting...' : 'Delete Loaded Weeks' }}
                </button>
              </div>
            </div>

            @if (isLoadingSchedule()) {
              <div class="px-5 py-6 text-sm text-blue-700">Loading schedule range...</div>
            } @else if (scheduleEntries().length === 0) {
              <div class="px-5 py-8 text-sm text-slate-500">No schedule has been generated for this date range yet.</div>
            } @else {
              <div class="overflow-x-auto">
                <table class="w-full min-w-[1080px]">
                  <thead class="border-b border-slate-200 bg-slate-100">
                    <tr>
                      <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Week</th>
                      <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Date</th>
                      <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Staff</th>
                      <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Shift</th>
                      <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Area</th>
                      <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Acceptance</th>
                      <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Smart Keys</th>
                      <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (entry of paginatedScheduleEntries(); track entry._id || (entry.staffName + entry.date + entry.shiftType)) {
                      <tr class="border-b border-slate-100">
                        <td class="px-5 py-3 text-sm text-slate-700">{{ formatDateOnly(entry.scheduleWeekStart) }} - {{ formatDateOnly(entry.scheduleWeekEnd) }}</td>
                        <td class="px-5 py-3 text-sm text-slate-700">{{ formatDateOnly(entry.date) }}</td>
                        <td class="px-5 py-3">
                          <p class="font-medium text-slate-900">{{ entry.staffName }}</p>
                          <p class="text-xs text-slate-500">{{ formatLabel(entry.position) }} · {{ entry.department }}</p>
                        </td>
                        <td class="px-5 py-3 text-sm text-slate-700">
                          <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{{ formatLabel(entry.shiftType) }}</span>
                          <p class="mt-1 text-xs text-slate-500">{{ entry.startTime }} - {{ entry.endTime }}</p>
                        </td>
                        <td class="px-5 py-3 text-sm text-slate-700">{{ formatLabel(entry.assignedArea || 'lobby') }}</td>
                        <td class="px-5 py-3 text-sm">
                          <span
                            class="rounded-full px-2.5 py-1 text-xs font-semibold"
                            [ngClass]="{
                              'bg-yellow-100 text-yellow-700': entry.responseStatus === 'pending',
                              'bg-emerald-100 text-emerald-700': entry.responseStatus === 'accepted',
                              'bg-red-100 text-red-700': entry.responseStatus === 'rejected'
                            }"
                          >
                            {{ formatLabel(entry.responseStatus || 'pending') }}
                          </span>
                        </td>
                        <td class="px-5 py-3 text-sm">
                          @if (entry.responseStatus === 'accepted') {
                            @if (getScheduleEntryKeyGrants(entry).length > 0) {
                              <div class="space-y-2">
                                @for (grant of getScheduleEntryKeyGrants(entry); track grant._id) {
                                  <div class="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                                    <p class="text-xs font-semibold text-emerald-800">Room {{ grant.room?.roomNumber || 'N/A' }}</p>
                                    <p class="mt-1 text-[11px] text-emerald-700">Code {{ grant.accessCode }} · {{ grant.device?.deviceId || 'lock' }}</p>
                                  </div>
                                }
                                @if (entry.keyAccessAudit?.reason) {
                                  <p class="text-[11px] text-slate-500">{{ entry.keyAccessAudit?.reason }}</p>
                                }
                              </div>
                            } @else {
                              <div class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                                {{ entry.keyAccessAudit?.reason || 'Accepted, no key generated' }}
                              </div>
                            }
                          } @else if (entry.responseStatus === 'rejected') {
                            <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                              {{ entry.keyAccessAudit?.reason || 'No active key' }}
                            </div>
                          } @else {
                            <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                              {{ entry.keyAccessAudit?.reason || 'Awaiting response' }}
                            </div>
                          }
                        </td>
                        <td class="px-5 py-3 text-sm">
                          <div class="flex flex-wrap gap-2">
                            <button
                              (click)="openScheduleEditor(entry)"
                              class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                            >
                              Edit / Reassign
                            </button>
                            <button
                              (click)="deleteScheduleEntry(entry)"
                              class="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                            >
                              Delete Shift
                            </button>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <div class="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 md:flex-row md:items-center md:justify-between">
                <p class="text-sm text-slate-500">{{ schedulePaginationLabel() }}</p>
                <div class="flex items-center gap-2">
                  <button
                    (click)="changeSchedulePage(-1)"
                    [disabled]="schedulePage === 1"
                    class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span class="text-sm text-slate-600">Page {{ schedulePage }} of {{ scheduleTotalPages() }}</span>
                  <button
                    (click)="changeSchedulePage(1)"
                    [disabled]="schedulePage >= scheduleTotalPages()"
                    class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }

      @if (activeView() === 'team') {
      <div class="rounded-lg bg-white p-6 shadow-md">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Search Staff</label>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (input)="filterStaff()"
              placeholder="Search name or email..."
              class="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Position</label>
            <select
              [(ngModel)]="selectedPosition"
              (change)="filterStaff()"
              class="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Positions</option>
              @for (position of positionOptions; track position) {
                <option [value]="position">{{ formatLabel(position) }}</option>
              }
            </select>
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Status</label>
            <select
              [(ngModel)]="selectedStatus"
              (change)="filterStaff()"
              class="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on-leave">On Leave</option>
            </select>
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Access Role</label>
            <select
              [(ngModel)]="selectedAccessRole"
              (change)="filterStaff()"
              class="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Access Roles</option>
              @for (role of accessRoleOptions; track role) {
                <option [value]="role">{{ formatLabel(role) }}</option>
              }
            </select>
          </div>
        </div>
      </div>
      }

      @if (activeView() === 'team') {
      <div class="overflow-hidden rounded-lg bg-white shadow-md">
        <div class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 class="text-lg font-bold text-slate-900">Staff Directory</h2>
            <p class="mt-1 text-sm text-slate-500">The full staff table stays wide. Open operations from the right-side drawer.</p>
          </div>
          <p class="text-sm text-slate-500">{{ staffPaginationLabel() }}</p>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full min-w-[1080px]">
            <thead class="border-b border-slate-200 bg-slate-100">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Staff</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Role</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">System Access</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              @if (paginatedStaff().length === 0) {
                <tr>
                  <td colspan="5" class="px-6 py-8 text-center text-slate-600">No staff members found</td>
                </tr>
              } @else {
                @for (member of paginatedStaff(); track member._id) {
                  <tr class="border-b border-slate-200 transition hover:bg-slate-50">
                    <td class="px-6 py-4">
                      <div>
                        <p class="font-medium text-slate-900">{{ member.name }}</p>
                        <p class="text-sm text-slate-500">{{ member.email }}</p>
                        <p class="mt-1 text-xs text-slate-400">{{ member.department }}</p>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-sm text-slate-600">
                      <p>{{ formatLabel(member.position) }}</p>
                      <p class="mt-1 text-xs text-slate-400">{{ formatLabel(member.accessRole) }}</p>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex flex-wrap gap-2">
                        @for (module of member.allowedModules.slice(0, 3); track module) {
                          <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                            {{ formatLabel(module) }}
                          </span>
                        }
                        @if (member.allowedModules.length > 3) {
                          <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                            +{{ member.allowedModules.length - 3 }}
                          </span>
                        }
                      </div>
                      @if (member.mustChangePassword) {
                        <p class="mt-2 text-xs font-medium text-orange-600">Password change pending</p>
                      }
                    </td>
                    <td class="px-6 py-4">
                      <span
                        class="rounded-full px-3 py-1 text-xs font-medium"
                        [ngClass]="{
                          'bg-emerald-100 text-emerald-700': member.status === 'active',
                          'bg-yellow-100 text-yellow-700': member.status === 'on-leave',
                          'bg-red-100 text-red-700': member.status === 'inactive'
                        }"
                      >
                        {{ formatLabel(member.status) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm">
                      <div class="flex flex-wrap gap-3">
                        <button (click)="openOperationsDrawer(member)" class="font-medium text-indigo-600 hover:text-indigo-700">Operations</button>
                        <button (click)="editStaff(member)" class="font-medium text-blue-600 hover:text-blue-700">Edit</button>
                        <button (click)="resetPassword(member)" class="font-medium text-orange-600 hover:text-orange-700">Reset Access</button>
                        <button (click)="deleteStaff(member._id)" class="font-medium text-red-600 hover:text-red-700">Delete</button>
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>

        <div class="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <p class="text-sm text-slate-500">{{ staffPaginationLabel() }}</p>
          <div class="flex items-center gap-2">
            <button
              (click)="changeStaffPage(-1)"
              [disabled]="staffPage === 1"
              class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span class="text-sm text-slate-600">Page {{ staffPage }} of {{ staffTotalPages() }}</span>
            <button
              (click)="changeStaffPage(1)"
              [disabled]="staffPage >= staffTotalPages()"
              class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      }

      @if (activeView() === 'activity') {
        <div class="grid grid-cols-1 gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <div class="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
            <div>
              <h2 class="text-xl font-bold text-slate-900">Activity Monitor</h2>
              <p class="mt-1 text-sm text-slate-500">Pick a staff member to review access scope, recent actions, and last login details.</p>
            </div>

            <div class="rounded-xl border border-slate-200 p-4">
              <label class="mb-2 block text-sm font-medium text-slate-700">Find Staff</label>
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (input)="filterStaff()"
                placeholder="Search name or email..."
                class="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div class="max-h-[640px] space-y-2 overflow-y-auto pr-1">
              @for (member of filteredStaff(); track member._id) {
                <button
                  (click)="selectStaff(member)"
                  [ngClass]="selectedStaff()?._id === member._id ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-white hover:bg-slate-50'"
                  class="w-full rounded-xl border p-4 text-left transition"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <p class="font-semibold text-slate-900">{{ member.name }}</p>
                      <p class="mt-1 text-sm text-slate-500">{{ formatLabel(member.position) }} · {{ member.department }}</p>
                      <p class="mt-1 text-xs text-slate-400">{{ member.email }}</p>
                    </div>
                    <span
                      class="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                      [ngClass]="{
                        'bg-emerald-100 text-emerald-700': member.status === 'active',
                        'bg-yellow-100 text-yellow-700': member.status === 'on-leave',
                        'bg-red-100 text-red-700': member.status === 'inactive'
                      }"
                    >
                      {{ formatLabel(member.status) }}
                    </span>
                  </div>
                </button>
              }
            </div>
          </div>

          <div class="space-y-5">
            @if (selectedStaff()) {
              <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
                <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 class="text-2xl font-bold text-slate-900">{{ selectedStaff()?.name }}</h2>
                    <p class="mt-1 text-sm text-slate-500">{{ formatLabel(selectedStaff()?.position || '') }} · {{ selectedStaff()?.department }}</p>
                  </div>
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                      {{ formatLabel(selectedStaff()?.accessRole || '') }}
                    </span>
                    @if (selectedStaff()?.mustChangePassword) {
                      <span class="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">Must change password</span>
                    }
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div class="rounded-xl bg-white p-4 shadow-md">
                  <p class="text-xs uppercase tracking-wide text-slate-500">Today</p>
                  <p class="mt-1 text-2xl font-bold text-slate-900">{{ activitySummary()?.summary?.todayActions || 0 }}</p>
                </div>
                <div class="rounded-xl bg-white p-4 shadow-md">
                  <p class="text-xs uppercase tracking-wide text-slate-500">Total Actions</p>
                  <p class="mt-1 text-2xl font-bold text-slate-900">{{ activitySummary()?.summary?.totalActions || 0 }}</p>
                </div>
                <div class="rounded-xl bg-white p-4 shadow-md">
                  <p class="text-xs uppercase tracking-wide text-slate-500">Last Login</p>
                  <p class="mt-1 text-sm font-semibold text-slate-900">{{ formatDateTime(activitySummary()?.summary?.lastLogin) }}</p>
                </div>
                <div class="rounded-xl bg-white p-4 shadow-md">
                  <p class="text-xs uppercase tracking-wide text-slate-500">Last Activity</p>
                  <p class="mt-1 text-sm font-semibold text-slate-900">{{ formatDateTime(activitySummary()?.summary?.lastActivityAt) }}</p>
                </div>
              </div>

              <div class="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-md">
                  <p class="font-semibold text-slate-900">Allowed Modules</p>
                  <div class="mt-3 flex flex-wrap gap-2">
                    @for (module of selectedStaff()?.allowedModules || []; track module) {
                      <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{{ formatLabel(module) }}</span>
                    }
                  </div>
                </div>

                <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-md">
                  <p class="font-semibold text-slate-900">Allowed Areas</p>
                  <div class="mt-3 flex flex-wrap gap-2">
                    @for (area of selectedStaff()?.allowedAreas || []; track area) {
                      <span class="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">{{ formatLabel(area) }}</span>
                    }
                  </div>
                </div>
              </div>

              <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-md">
                <div class="flex items-center justify-between">
                  <p class="font-semibold text-slate-900">Recent Activities</p>
                  @if (isLoadingActivity()) {
                    <span class="text-sm text-slate-500">Loading...</span>
                  }
                </div>
                @if (!isLoadingActivity() && (activitySummary()?.recentActivities || []).length === 0) {
                  <p class="mt-3 text-sm text-slate-500">No recent activities recorded yet.</p>
                } @else {
                  <div class="mt-3 space-y-3">
                    @for (activity of activitySummary()?.recentActivities || []; track activity._id) {
                      <div class="rounded-lg bg-slate-50 p-3">
                        <div class="flex items-center justify-between gap-3">
                          <p class="text-sm font-medium text-slate-900">{{ formatLabel(activity.action) }}</p>
                          <span
                            class="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                            [ngClass]="{
                              'bg-emerald-100 text-emerald-700': activity.status === 'success',
                              'bg-yellow-100 text-yellow-700': activity.status === 'pending',
                              'bg-red-100 text-red-700': activity.status === 'failed'
                            }"
                          >
                            {{ formatLabel(activity.status) }}
                          </span>
                        </div>
                        <p class="mt-1 text-sm text-slate-600">{{ activity.description }}</p>
                        <p class="mt-2 text-xs text-slate-400">{{ formatDateTime(activity.timestamp) }}</p>
                      </div>
                    }
                  </div>
                }
              </div>
            } @else {
              <div class="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-md">
                <p class="text-lg font-semibold text-slate-900">Select a staff member</p>
                <p class="mt-2 text-sm text-slate-500">Choose someone from the list to review activity and access details.</p>
              </div>
            }
          </div>
        </div>
      }

      @if (activeView() === 'keys' && isHotelAdmin()) {
        <div class="grid grid-cols-1 gap-4 xl:grid-cols-[360px,1fr]">
          <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div class="mb-5">
              <h2 class="text-xl font-bold text-slate-900">Assign Electronic Key</h2>
              <p class="mt-1 text-sm text-slate-600">
                Issue temporary smart-lock access to eligible staff for contactless-ready rooms.
              </p>
            </div>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <div class="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p class="text-xs uppercase tracking-wide text-blue-700">Contactless Rooms</p>
                <p class="mt-2 text-2xl font-bold text-slate-900">{{ contactlessRooms().length }}</p>
              </div>
              <div class="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <p class="text-xs uppercase tracking-wide text-emerald-700">Eligible Staff</p>
                <p class="mt-2 text-2xl font-bold text-slate-900">{{ eligibleStaffForKeys().length }}</p>
              </div>
              <div class="rounded-xl border border-amber-100 bg-amber-50 p-4">
                <p class="text-xs uppercase tracking-wide text-amber-700">Active Keys</p>
                <p class="mt-2 text-2xl font-bold text-slate-900">{{ activeKeyGrants().length }}</p>
              </div>
            </div>

            <div class="mt-6 space-y-4">
              <div>
                <label class="mb-2 block text-sm font-semibold text-slate-700">Staff Member</label>
                <select
                  [(ngModel)]="keyAccessForm.staffId"
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                >
                  <option value="">Select staff member</option>
                  @for (member of eligibleStaffForKeys(); track member._id) {
                    <option [value]="member._id">{{ member.name }} · {{ member.position }}</option>
                  }
                </select>
              </div>

              <div>
                <label class="mb-2 block text-sm font-semibold text-slate-700">Room</label>
                <select
                  [(ngModel)]="keyAccessForm.roomId"
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                >
                  <option value="">Select contactless-ready room</option>
                  @for (room of contactlessRooms(); track room._id) {
                    <option [value]="room._id">Room {{ room.roomNumber }} · {{ room.roomType }}</option>
                  }
                </select>
              </div>

              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                <div>
                  <label class="mb-2 block text-sm font-semibold text-slate-700">Valid From</label>
                  <input
                    type="datetime-local"
                    [(ngModel)]="keyAccessForm.validFrom"
                    class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label class="mb-2 block text-sm font-semibold text-slate-700">Valid Until</label>
                  <input
                    type="datetime-local"
                    [(ngModel)]="keyAccessForm.validUntil"
                    class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label class="mb-2 block text-sm font-semibold text-slate-700">Notes</label>
                <textarea
                  [(ngModel)]="keyAccessForm.notes"
                  rows="3"
                  placeholder="Optional shift, floor, or access notes"
                  class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                ></textarea>
              </div>

              <button
                (click)="assignStaffKeyAccess()"
                [disabled]="isAssigningKeyAccess()"
                class="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {{ isAssigningKeyAccess() ? 'Assigning Key…' : 'Assign Electronic Key' }}
              </button>
            </div>
          </div>

          <div class="space-y-4">
            <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div class="flex items-center justify-between gap-4">
                <div>
                  <h2 class="text-xl font-bold text-slate-900">Active Staff Keys</h2>
                  <p class="mt-1 text-sm text-slate-600">
                    Revoke any key immediately if staffing or room assignments change.
                  </p>
                </div>
                <button
                  (click)="loadKeyAccessData()"
                  class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Refresh
                </button>
              </div>

              @if (isLoadingKeyAccess()) {
                <div class="py-10 text-center text-sm text-slate-500">Loading key access data…</div>
              } @else if (activeKeyGrants().length === 0) {
                <div class="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">
                  No active staff keys issued yet.
                </div>
              } @else {
                <div class="mt-5 space-y-3">
                  @for (grant of activeKeyGrants(); track grant._id) {
                    <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <p class="font-semibold text-slate-900">
                            {{ grant.subjectStaff?.name || 'Staff member' }} · Room {{ grant.room?.roomNumber || 'N/A' }}
                          </p>
                          <p class="mt-1 text-sm text-slate-600">
                            {{ grant.subjectStaff?.position || 'Staff' }} · Lock {{ grant.device?.deviceId || 'N/A' }}
                          </p>
                          <p class="mt-2 text-sm text-slate-700">
                            Code:
                            <span class="rounded bg-white px-2 py-1 font-mono text-slate-900 shadow-sm">{{ grant.accessCode }}</span>
                          </p>
                          <p class="mt-2 text-xs text-slate-500">
                            {{ formatDateTime(grant.validFrom) }} to {{ formatDateTime(grant.validUntil) }}
                          </p>
                          @if (grant.metadata?.notes) {
                            <p class="mt-2 text-xs text-slate-500">{{ grant.metadata?.notes }}</p>
                          }
                        </div>
                        <button
                          (click)="revokeStaffKeyAccess(grant._id)"
                          [disabled]="isRevokingKeyAccess()"
                          class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                        >
                          {{ isRevokingKeyAccess() ? 'Revoking…' : 'Revoke Key' }}
                        </button>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>

            <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 class="text-xl font-bold text-slate-900">Eligible Rooms</h2>
              <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                @for (room of contactlessRooms(); track room._id) {
                  <div class="rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <p class="font-semibold text-slate-900">Room {{ room.roomNumber }}</p>
                    <p class="mt-1 text-sm text-slate-600">{{ room.roomType }}</p>
                    <p class="mt-2 text-xs font-medium text-blue-700">
                      {{ room.accessMode === 'hybrid' ? 'Smart lock + monitoring' : 'Smart lock enabled' }}
                    </p>
                    <p class="mt-2 text-xs text-slate-500">Lock {{ room.smartLockDevice?.deviceId || 'N/A' }}</p>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      }

      @if (activeView() === 'team' && showOperationsDrawer()) {
        <div class="fixed inset-0 z-40 bg-black/40" (click)="closeOperationsDrawer()"></div>
        <aside class="fixed inset-y-0 right-0 z-50 w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
          <div class="border-b border-slate-200 px-6 py-5">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h2 class="text-2xl font-bold text-slate-900">{{ selectedStaff()?.name }}</h2>
                <p class="mt-1 text-sm text-slate-500">{{ formatLabel(selectedStaff()?.position || '') }} · {{ selectedStaff()?.department }}</p>
              </div>
              <button (click)="closeOperationsDrawer()" class="text-xl text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <div class="mt-4 flex items-center gap-2">
              <span class="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                {{ formatLabel(selectedStaff()?.accessRole || '') }}
              </span>
              @if (selectedStaff()?.mustChangePassword) {
                <span class="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">Must change password</span>
              }
            </div>
          </div>

          <div class="space-y-5 p-6">
            <div class="grid grid-cols-2 gap-3">
              <div class="rounded-lg bg-slate-50 p-3">
                <p class="text-xs uppercase tracking-wide text-slate-500">Today</p>
                <p class="mt-1 text-2xl font-bold text-slate-900">{{ activitySummary()?.summary?.todayActions || 0 }}</p>
                <p class="text-xs text-slate-500">actions logged</p>
              </div>
              <div class="rounded-lg bg-slate-50 p-3">
                <p class="text-xs uppercase tracking-wide text-slate-500">Total</p>
                <p class="mt-1 text-2xl font-bold text-slate-900">{{ activitySummary()?.summary?.totalActions || 0 }}</p>
                <p class="text-xs text-slate-500">recorded activities</p>
              </div>
            </div>

            <div class="rounded-xl border border-slate-200 p-4">
              <p class="font-semibold text-slate-900">Allowed Modules</p>
              <div class="mt-3 flex flex-wrap gap-2">
                @for (module of selectedStaff()?.allowedModules || []; track module) {
                  <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{{ formatLabel(module) }}</span>
                }
              </div>
            </div>

            <div class="rounded-xl border border-slate-200 p-4">
              <p class="font-semibold text-slate-900">Allowed Areas</p>
              <div class="mt-3 flex flex-wrap gap-2">
                @for (area of selectedStaff()?.allowedAreas || []; track area) {
                  <span class="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">{{ formatLabel(area) }}</span>
                }
              </div>
            </div>

            <div class="rounded-xl border border-slate-200 p-4">
              <div class="flex items-center justify-between">
                <p class="font-semibold text-slate-900">Access & Onboarding</p>
                <button (click)="selectedStaff() && resetPassword(selectedStaff()!)" class="text-sm font-medium text-orange-600 hover:text-orange-700">Reset Access</button>
              </div>
              <div class="mt-3 space-y-2 text-sm text-slate-600">
                <p>Last login: {{ formatDateTime(activitySummary()?.summary?.lastLogin) }}</p>
                <p>Last activity: {{ formatDateTime(activitySummary()?.summary?.lastActivityAt) }}</p>
                <p>Password issued: {{ formatDateTime(selectedStaff()?.temporaryPasswordIssuedAt) }}</p>
              </div>
            </div>

            <div class="rounded-xl border border-slate-200 p-4">
              <div class="flex items-center justify-between">
                <p class="font-semibold text-slate-900">Recent Activities</p>
                @if (isLoadingActivity()) {
                  <span class="text-sm text-slate-500">Loading...</span>
                }
              </div>
              @if (!isLoadingActivity() && (activitySummary()?.recentActivities || []).length === 0) {
                <p class="mt-3 text-sm text-slate-500">No recent activities recorded yet.</p>
              } @else {
                <div class="mt-3 space-y-3">
                  @for (activity of activitySummary()?.recentActivities || []; track activity._id) {
                    <div class="rounded-lg bg-slate-50 p-3">
                      <div class="flex items-center justify-between gap-3">
                        <p class="text-sm font-medium text-slate-900">{{ formatLabel(activity.action) }}</p>
                        <span
                          class="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                          [ngClass]="{
                            'bg-emerald-100 text-emerald-700': activity.status === 'success',
                            'bg-yellow-100 text-yellow-700': activity.status === 'pending',
                            'bg-red-100 text-red-700': activity.status === 'failed'
                          }"
                        >
                          {{ formatLabel(activity.status) }}
                        </span>
                      </div>
                      <p class="mt-1 text-sm text-slate-600">{{ activity.description }}</p>
                      <p class="mt-2 text-xs text-slate-400">{{ formatDateTime(activity.timestamp) }}</p>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </aside>
      }

      @if (showStaffModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div class="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h2 class="text-2xl font-bold text-slate-900">{{ isEditing() ? 'Edit Staff Access' : 'Add New Staff Member' }}</h2>
                <p class="mt-1 text-sm text-slate-500">
                  {{ isEditing() ? 'Update profile, access, and operational areas.' : 'A temporary password will be generated automatically for first login.' }}
                </p>
              </div>
              <button (click)="closeStaffModal()" class="text-xl text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form (ngSubmit)="saveStaff()" class="mt-6 space-y-8">
              <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div class="space-y-5">
                  <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                      <label class="mb-2 block text-sm font-medium text-slate-700">Full Name *</label>
                      <input [(ngModel)]="newStaff.name" name="name" required class="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label class="mb-2 block text-sm font-medium text-slate-700">Email *</label>
                      <input [(ngModel)]="newStaff.email" name="email" type="email" required class="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label class="mb-2 block text-sm font-medium text-slate-700">Phone *</label>
                      <input [(ngModel)]="newStaff.phone" name="phone" required class="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label class="mb-2 block text-sm font-medium text-slate-700">Position *</label>
                      <select
                        [(ngModel)]="newStaff.position"
                        name="position"
                        required
                        (change)="applyDefaultAccess()"
                        class="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        @for (position of positionOptions; track position) {
                          <option [value]="position">{{ formatLabel(position) }}</option>
                        }
                      </select>
                    </div>
                    <div>
                      <label class="mb-2 block text-sm font-medium text-slate-700">Department *</label>
                      <input [(ngModel)]="newStaff.department" name="department" required class="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label class="mb-2 block text-sm font-medium text-slate-700">Monthly Salary</label>
                      <input [(ngModel)]="newStaff.salary" name="salary" type="number" class="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label class="mb-2 block text-sm font-medium text-slate-700">Hire Date *</label>
                      <input [(ngModel)]="newStaff.hireDate" name="hireDate" type="date" required class="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label class="mb-2 block text-sm font-medium text-slate-700">Status *</label>
                      <select [(ngModel)]="newStaff.status" name="status" required class="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="on-leave">On Leave</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label class="mb-2 block text-sm font-medium text-slate-700">Access Role</label>
                    <select [(ngModel)]="newStaff.accessRole" name="accessRole" class="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      @for (role of accessRoleOptions; track role) {
                        <option [value]="role">{{ formatLabel(role) }}</option>
                      }
                    </select>
                  </div>

                  <div class="rounded-xl border border-slate-200 p-4">
                    <p class="font-semibold text-slate-900">Permissions</p>
                    <div class="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                      <label class="flex items-center gap-3"><input type="checkbox" [(ngModel)]="newStaff.permissions.canManageBookings" name="canManageBookings" /> Manage bookings</label>
                      <label class="flex items-center gap-3"><input type="checkbox" [(ngModel)]="newStaff.permissions.canManageRooms" name="canManageRooms" /> Manage rooms</label>
                      <label class="flex items-center gap-3"><input type="checkbox" [(ngModel)]="newStaff.permissions.canManageOrders" name="canManageOrders" /> Manage orders</label>
                      <label class="flex items-center gap-3"><input type="checkbox" [(ngModel)]="newStaff.permissions.canViewRevenue" name="canViewRevenue" /> View revenue</label>
                      <label class="flex items-center gap-3"><input type="checkbox" [(ngModel)]="newStaff.permissions.canViewAnalytics" name="canViewAnalytics" /> View analytics</label>
                      <label class="flex items-center gap-3"><input type="checkbox" [(ngModel)]="newStaff.permissions.canManageStaff" name="canManageStaff" /> Manage staff</label>
                      <label class="flex items-center gap-3"><input type="checkbox" [(ngModel)]="newStaff.permissions.canHandleMaintenance" name="canHandleMaintenance" /> Handle maintenance</label>
                    </div>
                  </div>
                </div>

                <div class="space-y-5">
                  <div class="rounded-xl border border-slate-200 p-4">
                    <p class="font-semibold text-slate-900">Allowed Modules</p>
                    <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
                      @for (module of moduleOptions; track module.value) {
                        <label class="flex items-center gap-3">
                          <input
                            type="checkbox"
                            [checked]="isSelected(newStaff.allowedModules, module.value)"
                            (change)="toggleSelection(newStaff.allowedModules, module.value, $any($event.target).checked)"
                          />
                          {{ module.label }}
                        </label>
                      }
                    </div>
                  </div>

                  <div class="rounded-xl border border-slate-200 p-4">
                    <p class="font-semibold text-slate-900">Allowed Areas</p>
                    <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
                      @for (area of areaOptions; track area.value) {
                        <label class="flex items-center gap-3">
                          <input
                            type="checkbox"
                            [checked]="isSelected(newStaff.allowedAreas, area.value)"
                            (change)="toggleSelection(newStaff.allowedAreas, area.value, $any($event.target).checked)"
                          />
                          {{ area.label }}
                        </label>
                      }
                    </div>
                  </div>

                  <div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <p class="font-semibold text-blue-900">Onboarding Notes</p>
                    <ul class="mt-3 space-y-2 text-sm text-blue-800">
                      <li>Temporary password is generated when the staff profile is created or reset.</li>
                      <li>Set the access role first, then fine-tune modules and areas if needed.</li>
                      <li>Schedule, shifts, and timesheets can plug into this profile later.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div class="flex justify-end gap-3">
                <button type="button" (click)="closeStaffModal()" class="rounded-lg border border-slate-300 px-6 py-2 font-medium text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" [disabled]="isLoading()" class="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                  {{ isEditing() ? 'Update Staff' : 'Create Staff' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      @if (successMessage()) {
        <div class="fixed bottom-4 right-4 rounded-lg border border-emerald-400 bg-emerald-100 px-6 py-4 text-emerald-700 shadow-lg">
          {{ successMessage() }}
        </div>
      }

      @if (showScheduleEditor()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div class="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h3 class="text-xl font-bold text-slate-900">Edit Schedule Entry</h3>
                <p class="mt-1 text-sm text-slate-500">Update shift details, change assigned area, or reassign this shift to another staff member.</p>
              </div>
              <button (click)="closeScheduleEditor()" class="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                Close
              </button>
            </div>

            <div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700">Assigned Staff</label>
                <select [(ngModel)]="scheduleEditorForm.staffId" class="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  @for (member of staff(); track member._id) {
                    <option [value]="member._id">{{ member.name }} · {{ formatLabel(member.position) }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700">Shift Date</label>
                <input [(ngModel)]="scheduleEditorForm.date" type="date" class="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700">Shift Type</label>
                <select [(ngModel)]="scheduleEditorForm.shiftType" (ngModelChange)="applyShiftWindow($event)" class="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  @for (shiftType of shiftTypeOptions; track shiftType) {
                    <option [value]="shiftType">{{ formatLabel(shiftType) }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700">Assigned Area</label>
                <select [(ngModel)]="scheduleEditorForm.assignedArea" class="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  @for (area of areaOptions; track area.value) {
                    <option [value]="area.value">{{ area.label }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700">Start Time</label>
                <input [(ngModel)]="scheduleEditorForm.startTime" type="time" class="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700">End Time</label>
                <input [(ngModel)]="scheduleEditorForm.endTime" type="time" class="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div class="md:col-span-2">
                <label class="mb-2 block text-sm font-medium text-slate-700">Notes</label>
                <textarea [(ngModel)]="scheduleEditorForm.notes" rows="3" class="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
              </div>
            </div>

            <div class="mt-6 flex flex-wrap items-center justify-between gap-3">
              <button
                (click)="deleteScheduleEntry(editingScheduleEntry())"
                [disabled]="isDeletingScheduleEntry()"
                class="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {{ isDeletingScheduleEntry() ? 'Deleting...' : 'Delete Shift' }}
              </button>
              <div class="flex items-center gap-2">
                <button
                  (click)="closeScheduleEditor()"
                  class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  (click)="saveScheduleEntry()"
                  [disabled]="isSavingScheduleEntry()"
                  class="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {{ isSavingScheduleEntry() ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      }
      @if (confirmAction()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div class="flex items-start gap-4">
              <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                <span class="text-xl">!</span>
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="text-lg font-bold text-slate-900">{{ confirmAction()?.title }}</h3>
                <p class="mt-2 text-sm leading-6 text-slate-600">{{ confirmAction()?.message }}</p>
              </div>
            </div>

            <div class="mt-6 flex items-center justify-end gap-3">
              <button
                (click)="closeConfirmAction()"
                class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                (click)="confirmPendingAction()"
                class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                {{ confirmAction()?.confirmLabel }}
              </button>
            </div>
          </div>
        </div>
      }
      @if (errorMessage()) {
        <div class="fixed bottom-4 right-4 rounded-lg border border-red-400 bg-red-100 px-6 py-4 text-red-700 shadow-lg">
          {{ errorMessage() }}
        </div>
      }
    </div>
  `
})
export class HotelStaffComponent implements OnInit {
  staff = signal<Staff[]>([]);
  filteredStaff = signal<Staff[]>([]);
  schedules = signal<GeneratedStaffSchedule[]>([]);
  selectedStaff = signal<Staff | null>(null);
  activitySummary = signal<StaffActivitySummary | null>(null);
  showStaffModal = signal(false);
  showOperationsDrawer = signal(false);
  isEditing = signal(false);
  successMessage = signal('');
  errorMessage = signal('');
  isLoading = signal(false);
  isLoadingActivity = signal(false);
  isLoadingSchedule = signal(false);
  isGeneratingSchedule = signal(false);
  isSavingScheduleEntry = signal(false);
  isDeletingScheduleEntry = signal(false);
  isDeletingScheduleWeek = signal(false);
  credentialPreview = signal<StaffCredentialPreview | null>(null);
  skippedScheduleWeeks = signal<Array<{ weekStart: string; weekEnd: string; reason: string }>>([]);
  showScheduleEditor = signal(false);
  editingScheduleEntry = signal<GeneratedScheduleEntry | null>(null);
  confirmAction = signal<ConfirmActionState | null>(null);
  activeView = signal<StaffManagementView>('team');
  contactlessRooms = signal<ContactlessRoomOption[]>([]);
  keyAccessGrants = signal<SmartAccessGrant[]>([]);
  isLoadingKeyAccess = signal(false);
  isAssigningKeyAccess = signal(false);
  isRevokingKeyAccess = signal(false);

  searchQuery = '';
  selectedPosition = '';
  selectedStatus = '';
  selectedAccessRole = '';
  scheduleWeekStart = this.getDefaultScheduleWeekStart();
  scheduleWeekEnd = this.getDefaultScheduleWeekEnd();
  scheduleNotes = '';
  staffPage = 1;
  readonly staffItemsPerPage = 10;
  schedulePage = 1;
  readonly scheduleItemsPerPage = 12;

  readonly positionOptions: StaffPosition[] = ['manager', 'receptionist', 'housekeeping', 'housekeeper', 'chef', 'waiter', 'maintenance', 'security', 'other'];
  readonly accessRoleOptions: AccessRole[] = ['admin', 'operations', 'front-desk', 'housekeeping', 'food-service', 'maintenance', 'security', 'custom'];
  readonly moduleOptions = MODULE_OPTIONS;
  readonly areaOptions = AREA_OPTIONS;
  readonly shiftTypeOptions: Array<'morning' | 'evening' | 'night'> = ['morning', 'evening', 'night'];

  newStaff: Staff = this.getEmptyStaff();
  scheduleEditorForm: ScheduleEditorForm = this.getEmptyScheduleEditorForm();
  keyAccessForm: StaffKeyAccessForm = this.getEmptyKeyAccessForm();

  constructor(private hotelService: HotelService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadStaff();
    if (this.isHotelAdmin()) {
      this.loadSchedule();
      this.loadKeyAccessData();
    }
  }

  setActiveView(view: StaffManagementView): void {
    this.activeView.set(view);
    if (view === 'keys' && this.isHotelAdmin()) {
      this.loadKeyAccessData();
    }
    if (view === 'activity' && !this.selectedStaff() && this.filteredStaff().length > 0) {
      this.selectStaff(this.filteredStaff()[0]);
    }
    if (view !== 'team') {
      this.closeOperationsDrawer();
    }
  }

  loadStaff(): void {
    this.isLoading.set(true);
    this.hotelService.getStaff(1, 100).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        if (response.status === 'success' && Array.isArray(response.data)) {
          const staff = response.data.map((member: any) => this.normalizeStaff(member));
          this.staff.set(staff);
          this.filterStaff();
          if (this.isHotelAdmin()) {
            this.loadKeyAccessData();
          }
          return;
        }

        this.staff.set([]);
        this.filteredStaff.set([]);
      },
      error: (error: any) => {
        this.isLoading.set(false);
        console.error('Error loading staff:', error);
        this.errorMessage.set('Failed to load staff. Please try again later.');
      }
    });
  }

  loadKeyAccessData(): void {
    if (!this.isHotelAdmin()) {
      return;
    }

    this.isLoadingKeyAccess.set(true);
    this.hotelService.getStaffKeyAccessWorkspaceData().subscribe({
      next: (workspaceResponse: any) => {
        this.isLoadingKeyAccess.set(false);

        if (workspaceResponse.status === 'success' && workspaceResponse.data) {
          this.contactlessRooms.set(
            Array.isArray(workspaceResponse.data.contactlessRooms)
              ? workspaceResponse.data.contactlessRooms.map((room: any) => ({
                  _id: room._id,
                  roomNumber: room.roomNumber,
                  roomType: room.roomType,
                  accessMode: room.accessMode || 'smart_lock',
                  smartLockDevice: room.smartLockDevice
                }))
              : []
          );
          this.keyAccessGrants.set(
            Array.isArray(workspaceResponse.data.grants) ? workspaceResponse.data.grants : []
          );
          return;
        }

        this.contactlessRooms.set([]);
        this.keyAccessGrants.set([]);
      },
      error: (error: any) => {
        this.isLoadingKeyAccess.set(false);
        console.error('Error loading staff key access workspace:', error);
        this.contactlessRooms.set([]);
        this.keyAccessGrants.set([]);
      }
    });
  }

  eligibleStaffForKeys(): Staff[] {
    const eligiblePositions: StaffPosition[] = ['manager', 'receptionist', 'housekeeping', 'housekeeper', 'maintenance', 'security'];
    return this.staff().filter((member) =>
      !!member._id &&
      member.status === 'active' &&
      eligiblePositions.includes(member.position)
    );
  }

  activeKeyGrants(): SmartAccessGrant[] {
    return this.keyAccessGrants().filter((grant) => grant.status === 'active');
  }

  getScheduleEntryKeyGrants(entry: GeneratedScheduleEntry): SmartAccessGrant[] {
    const entryId = entry._id?.toString();
    const scheduleId = entry.scheduleId?.toString();
    const entryStaff = entry.staff;
    const staffId = entry.staffId
      || (typeof entryStaff === 'string' ? entryStaff : entryStaff?._id?.toString?.())
      || undefined;

    return this.activeKeyGrants().filter((grant) => {
      const grantEntryId = grant.scheduleEntryId?.toString();
      const grantScheduleId = grant.scheduleId?.toString();
      const grantStaffId = grant.subjectStaff?._id?.toString?.();

      if (entryId && grantEntryId) {
        return grantEntryId === entryId;
      }

      return !!scheduleId && !!staffId && grantScheduleId === scheduleId && grantStaffId === staffId;
    });
  }

  assignStaffKeyAccess(): void {
    if (!this.keyAccessForm.staffId || !this.keyAccessForm.roomId || !this.keyAccessForm.validFrom || !this.keyAccessForm.validUntil) {
      this.errorMessage.set('Select a staff member, room, and access window before assigning a key.');
      this.clearFlashMessage(this.errorMessage);
      return;
    }

    this.isAssigningKeyAccess.set(true);
    this.hotelService.assignStaffSmartAccess({
      staffId: this.keyAccessForm.staffId,
      roomId: this.keyAccessForm.roomId,
      validFrom: new Date(this.keyAccessForm.validFrom).toISOString(),
      validUntil: new Date(this.keyAccessForm.validUntil).toISOString(),
      notes: this.keyAccessForm.notes
    }).subscribe({
      next: (response: any) => {
        this.isAssigningKeyAccess.set(false);
        if (response.status === 'success') {
          this.successMessage.set('Electronic key assigned successfully.');
          this.clearFlashMessage(this.successMessage);
          this.keyAccessForm = this.getEmptyKeyAccessForm();
          this.loadKeyAccessData();
          return;
        }

        this.errorMessage.set(response.message || 'Failed to assign electronic key.');
        this.clearFlashMessage(this.errorMessage);
      },
      error: (error: any) => {
        this.isAssigningKeyAccess.set(false);
        console.error('Error assigning staff key access:', error);
        this.errorMessage.set('Failed to assign electronic key.');
        this.clearFlashMessage(this.errorMessage);
      }
    });
  }

  revokeStaffKeyAccess(grantId: string): void {
    this.isRevokingKeyAccess.set(true);
    this.hotelService.revokeSmartAccessGrant(grantId).subscribe({
      next: (response: any) => {
        this.isRevokingKeyAccess.set(false);
        if (response.status === 'success') {
          this.successMessage.set('Electronic key revoked successfully.');
          this.clearFlashMessage(this.successMessage);
          this.loadKeyAccessData();
          return;
        }

        this.errorMessage.set(response.message || 'Failed to revoke electronic key.');
        this.clearFlashMessage(this.errorMessage);
      },
      error: (error: any) => {
        this.isRevokingKeyAccess.set(false);
        console.error('Error revoking staff key access:', error);
        this.errorMessage.set('Failed to revoke electronic key.');
        this.clearFlashMessage(this.errorMessage);
      }
    });
  }

  openOperationsDrawer(member: Staff): void {
    this.showOperationsDrawer.set(true);
    this.selectStaff(member);
  }

  closeOperationsDrawer(): void {
    this.showOperationsDrawer.set(false);
  }

  selectStaff(member: Staff): void {
    this.selectedStaff.set(member);
    if (!member._id) {
      this.activitySummary.set(null);
      return;
    }

    this.isLoadingActivity.set(true);
    this.hotelService.getStaffActivitySummary(member._id).subscribe({
      next: (response: any) => {
        this.isLoadingActivity.set(false);
        if (response.status === 'success' && response.data) {
          this.activitySummary.set(response.data);
          return;
        }
        this.activitySummary.set(null);
      },
      error: (error: any) => {
        this.isLoadingActivity.set(false);
        console.error('Error loading activity summary:', error);
        this.activitySummary.set(null);
      }
    });
  }

  filterStaff(): void {
    let filtered = [...this.staff()];

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.trim().toLowerCase();
      filtered = filtered.filter((member) =>
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query)
      );
    }

    if (this.selectedPosition) {
      filtered = filtered.filter((member) => member.position === this.selectedPosition);
    }

    if (this.selectedStatus) {
      filtered = filtered.filter((member) => member.status === this.selectedStatus);
    }

    if (this.selectedAccessRole) {
      filtered = filtered.filter((member) => member.accessRole === this.selectedAccessRole);
    }

    this.filteredStaff.set(filtered);
    this.staffPage = 1;

    if (this.selectedStaff()?._id && !filtered.some((member) => member._id === this.selectedStaff()?._id)) {
      this.closeOperationsDrawer();
    }
  }

  paginatedStaff(): Staff[] {
    const startIndex = (this.staffPage - 1) * this.staffItemsPerPage;
    return this.filteredStaff().slice(startIndex, startIndex + this.staffItemsPerPage);
  }

  staffTotalPages(): number {
    return Math.max(1, Math.ceil(this.filteredStaff().length / this.staffItemsPerPage));
  }

  changeStaffPage(direction: number): void {
    this.staffPage = Math.min(this.staffTotalPages(), Math.max(1, this.staffPage + direction));
  }

  staffPaginationLabel(): string {
    if (this.filteredStaff().length === 0) {
      return 'Showing 0 of 0 staff members';
    }

    const start = (this.staffPage - 1) * this.staffItemsPerPage + 1;
    const end = Math.min(this.filteredStaff().length, this.staffPage * this.staffItemsPerPage);
    return `Showing ${start}-${end} of ${this.filteredStaff().length} staff members`;
  }

  onScheduleRangeChange(): void {
    if (this.scheduleWeekEnd < this.scheduleWeekStart) {
      this.scheduleWeekEnd = this.scheduleWeekStart;
    }
    this.schedulePage = 1;
    this.loadSchedule();
  }

  loadSchedule(): void {
    if (!this.isHotelAdmin()) return;

    this.isLoadingSchedule.set(true);
    this.hotelService.getStaffSchedule(this.scheduleWeekStart, this.scheduleWeekEnd).subscribe({
      next: (response: any) => {
        this.isLoadingSchedule.set(false);
        this.schedules.set(response.status === 'success' && Array.isArray(response.data) ? response.data : []);
        this.schedulePage = 1;
        this.loadKeyAccessData();
      },
      error: (error: any) => {
        this.isLoadingSchedule.set(false);
        console.error('Error loading schedule:', error);
        this.schedules.set([]);
        this.loadKeyAccessData();
      }
    });
  }

  generateSchedule(): void {
    if (!this.isHotelAdmin()) return;

    this.isGeneratingSchedule.set(true);
    this.hotelService.generateStaffSchedule({
      weekStart: this.scheduleWeekStart,
      weekEnd: this.scheduleWeekEnd,
      notes: this.scheduleNotes,
      generatedBy: this.authService.getCurrentUser()?.email || 'hotel-admin'
    }).subscribe({
      next: (response: any) => {
        this.isGeneratingSchedule.set(false);
        if (response.status !== 'success' || !response.data) {
          this.flashError('Failed to generate staff schedule.');
          return;
        }

        this.schedules.set(Array.isArray(response.data.schedules) ? response.data.schedules : []);
        this.skippedScheduleWeeks.set(Array.isArray(response.data.skippedSchedules) ? response.data.skippedSchedules : []);
        this.schedulePage = 1;
        this.loadKeyAccessData();
        this.flashSuccess(response.message || 'Staff schedules generated successfully.');
      },
      error: (error: any) => {
        this.isGeneratingSchedule.set(false);
        console.error('Error generating schedule:', error);
        this.flashError(error.error?.message || 'Failed to generate staff schedule.');
      }
    });
  }

  openScheduleEditor(entry: GeneratedScheduleEntry): void {
    if (!entry._id || !entry.scheduleId) {
      this.flashError('Schedule entry is missing identifiers.');
      return;
    }

    const staffId = entry.staffId || (typeof entry.staff === 'string' ? entry.staff : entry.staff?._id) || '';
    this.editingScheduleEntry.set(entry);
    this.scheduleEditorForm = {
      scheduleId: entry.scheduleId,
      entryId: entry._id,
      staffId,
      date: this.toDateInputValue(entry.date),
      shiftType: entry.shiftType,
      startTime: entry.startTime,
      endTime: entry.endTime,
      assignedArea: entry.assignedArea || '',
      notes: entry.notes || '',
      status: entry.status
    };
    this.showScheduleEditor.set(true);
  }

  closeScheduleEditor(): void {
    this.showScheduleEditor.set(false);
    this.editingScheduleEntry.set(null);
    this.scheduleEditorForm = this.getEmptyScheduleEditorForm();
  }

  applyShiftWindow(shiftType: 'morning' | 'evening' | 'night'): void {
    const windows: Record<'morning' | 'evening' | 'night', { startTime: string; endTime: string }> = {
      morning: { startTime: '07:00', endTime: '15:00' },
      evening: { startTime: '15:00', endTime: '23:00' },
      night: { startTime: '23:00', endTime: '07:00' }
    };

    const nextWindow = windows[shiftType];
    this.scheduleEditorForm = {
      ...this.scheduleEditorForm,
      shiftType,
      startTime: nextWindow.startTime,
      endTime: nextWindow.endTime
    };
  }

  saveScheduleEntry(): void {
    const form = this.scheduleEditorForm;
    if (!form.scheduleId || !form.entryId || !form.staffId || !form.date || !form.assignedArea) {
      this.flashError('Staff, date, and assigned area are required.');
      return;
    }

    this.isSavingScheduleEntry.set(true);
    this.hotelService.updateStaffScheduleEntry(form.scheduleId, form.entryId, {
      staffId: form.staffId,
      date: form.date,
      shiftType: form.shiftType,
      startTime: form.startTime,
      endTime: form.endTime,
      assignedArea: form.assignedArea,
      notes: form.notes,
      status: form.status
    }).subscribe({
      next: (response: any) => {
        this.isSavingScheduleEntry.set(false);
        if (response.status !== 'success' || !response.data) {
          this.flashError('Failed to update schedule entry.');
          return;
        }

        this.upsertSchedule(response.data);
        this.loadKeyAccessData();
        this.closeScheduleEditor();
        this.flashSuccess(response.message || 'Schedule entry updated successfully.');
      },
      error: (error: any) => {
        this.isSavingScheduleEntry.set(false);
        console.error('Error updating schedule entry:', error);
        this.flashError(error.error?.message || 'Failed to update schedule entry.');
      }
    });
  }

  deleteScheduleEntry(entry: GeneratedScheduleEntry | null): void {
    if (!entry?._id || !entry.scheduleId) return;
    this.confirmAction.set({
      type: 'delete-schedule-entry',
      title: 'Delete Shift',
      message: `Delete the shift for ${entry.staffName} on ${this.formatDateOnly(entry.date)}? This cannot be undone.`,
      confirmLabel: 'Delete Shift',
      tone: 'danger',
      payload: {
        scheduleId: entry.scheduleId,
        entryId: entry._id
      }
    });
  }

  private performDeleteScheduleEntry(scheduleId: string, entryId: string): void {
    const entry = this.scheduleEntries().find((item) => item._id === entryId && item.scheduleId === scheduleId) || null;

    this.isDeletingScheduleEntry.set(true);
    this.hotelService.deleteStaffScheduleEntry(scheduleId, entryId).subscribe({
      next: (response: any) => {
        this.isDeletingScheduleEntry.set(false);
        if (response.status !== 'success') {
          this.flashError('Failed to delete schedule entry.');
          return;
        }

        if (response.data) {
          this.upsertSchedule(response.data);
        } else {
          this.schedules.set(this.schedules().filter((schedule) => schedule._id !== scheduleId));
        }
        this.loadKeyAccessData();
        if (this.editingScheduleEntry()?._id === entryId) {
          this.closeScheduleEditor();
        }
        this.flashSuccess(response.message || 'Schedule entry deleted successfully.');
      },
      error: (error: any) => {
        this.isDeletingScheduleEntry.set(false);
        console.error('Error deleting schedule entry:', error);
        this.flashError(error.error?.message || 'Failed to delete schedule entry.');
      }
    });
  }

  deleteLoadedScheduleWeeks(): void {
    const schedules = this.schedules();
    if (!schedules.length) {
      this.flashError('There are no generated schedule weeks to delete.');
      return;
    }
    this.confirmAction.set({
      type: 'delete-schedule-weeks',
      title: 'Delete Loaded Schedule Weeks',
      message: `Delete ${schedules.length} loaded schedule week${schedules.length === 1 ? '' : 's'} for the selected range? This will remove every generated shift currently shown.`,
      confirmLabel: 'Delete Weeks',
      tone: 'danger'
    });
  }

  private performDeleteLoadedScheduleWeeks(): void {
    const schedules = this.schedules();
    this.isDeletingScheduleWeek.set(true);
    const queue = [...schedules];

    const deleteNext = () => {
      const current = queue.shift();
      if (!current?._id) {
        if (queue.length === 0) {
          this.isDeletingScheduleWeek.set(false);
          this.flashSuccess('Loaded schedule weeks deleted successfully.');
          this.loadSchedule();
        } else {
          deleteNext();
        }
        return;
      }

      this.hotelService.deleteStaffScheduleWeek(current._id).subscribe({
        next: () => {
          if (queue.length === 0) {
            this.isDeletingScheduleWeek.set(false);
            this.closeScheduleEditor();
            this.loadKeyAccessData();
            this.flashSuccess('Loaded schedule weeks deleted successfully.');
            this.loadSchedule();
          } else {
            deleteNext();
          }
        },
        error: (error: any) => {
          this.isDeletingScheduleWeek.set(false);
          console.error('Error deleting schedule week:', error);
          this.flashError(error.error?.message || 'Failed to delete schedule weeks.');
        }
      });
    };

    deleteNext();
  }

  scheduleEntries(): GeneratedScheduleEntry[] {
    return this.schedules().flatMap((schedule) =>
      (schedule.entries || []).map((entry) => ({
        ...entry,
        scheduleId: schedule._id,
        staffId: typeof entry.staff === 'string' ? entry.staff : entry.staff?._id,
        scheduleWeekStart: schedule.weekStart,
        scheduleWeekEnd: schedule.weekEnd
      }))
    );
  }

  paginatedScheduleEntries(): GeneratedScheduleEntry[] {
    const entries = this.scheduleEntries();
    const startIndex = (this.schedulePage - 1) * this.scheduleItemsPerPage;
    return entries.slice(startIndex, startIndex + this.scheduleItemsPerPage);
  }

  scheduleTotalPages(): number {
    return Math.max(1, Math.ceil(this.scheduleEntries().length / this.scheduleItemsPerPage));
  }

  changeSchedulePage(direction: number): void {
    this.schedulePage = Math.min(this.scheduleTotalPages(), Math.max(1, this.schedulePage + direction));
  }

  schedulePaginationLabel(): string {
    const entries = this.scheduleEntries();
    if (entries.length === 0) {
      return 'Showing 0 of 0 schedule entries';
    }

    const start = (this.schedulePage - 1) * this.scheduleItemsPerPage + 1;
    const end = Math.min(entries.length, this.schedulePage * this.scheduleItemsPerPage);
    return `Showing ${start}-${end} of ${entries.length} schedule entries`;
  }

  uniqueScheduledStaffCount(): number {
    return new Set(this.scheduleEntries().map((entry) => entry.staffName)).size;
  }

  skippedScheduleLabels(): string {
    return this.skippedScheduleWeeks()
      .map((item) => `${this.formatDateOnly(item.weekStart)} - ${this.formatDateOnly(item.weekEnd)}`)
      .join(', ');
  }

  selectedScheduleRangeLabel(): string {
    return `${this.formatDateOnly(this.scheduleWeekStart)} - ${this.formatDateOnly(this.scheduleWeekEnd)}`;
  }

  openAddStaffModal(): void {
    this.isEditing.set(false);
    this.newStaff = this.getEmptyStaff();
    this.showStaffModal.set(true);
  }

  editStaff(member: Staff): void {
    this.isEditing.set(true);
    this.newStaff = this.normalizeStaff(member);
    this.showStaffModal.set(true);
  }

  closeStaffModal(): void {
    this.showStaffModal.set(false);
    this.isEditing.set(false);
    this.newStaff = this.getEmptyStaff();
  }

  saveStaff(): void {
    if (!this.newStaff.name || !this.newStaff.email || !this.newStaff.position || !this.newStaff.department) {
      this.flashError('Please fill in all required fields.');
      return;
    }

    const payload = {
      ...this.newStaff,
      hireDate: this.newStaff.hireDate
    };

    this.isLoading.set(true);
    const request$ = this.isEditing() && this.newStaff._id
      ? this.hotelService.updateStaff(this.newStaff._id, payload)
      : this.hotelService.createStaff(payload);

    request$.subscribe({
      next: (response: any) => {
        this.isLoading.set(false);

        if (response.status !== 'success' || !response.data) {
          this.flashError(this.isEditing() ? 'Failed to update staff member.' : 'Failed to add staff member.');
          return;
        }

        const savedStaff = this.normalizeStaff(response.data);
        if (this.isEditing() && savedStaff._id) {
          this.staff.set(this.staff().map((member) => member._id === savedStaff._id ? savedStaff : member));
          this.flashSuccess('Staff member updated successfully.');
        } else {
          this.staff.set([savedStaff, ...this.staff()]);
          if (response.data.temporaryPassword) {
            this.credentialPreview.set({
              staffName: savedStaff.name,
              email: savedStaff.email,
              temporaryPassword: response.data.temporaryPassword
            });
          }
          this.flashSuccess('Staff member added successfully.');
        }

        this.filterStaff();
        this.closeStaffModal();
        this.openOperationsDrawer(savedStaff);
      },
      error: (error: any) => {
        this.isLoading.set(false);
        console.error('Error saving staff member:', error);
        this.flashError(error.error?.message || 'Failed to save staff member.');
      }
    });
  }

  resetPassword(member: Staff): void {
    if (!member._id) return;

    this.hotelService.resetStaffPassword(member._id).subscribe({
      next: (response: any) => {
        if (response.status !== 'success' || !response.data) {
          this.flashError('Failed to reset temporary password.');
          return;
        }

        const updatedStaff = this.normalizeStaff(response.data);
        this.staff.set(this.staff().map((staffMember) => staffMember._id === updatedStaff._id ? updatedStaff : staffMember));
        this.filterStaff();
        this.credentialPreview.set({
          staffName: updatedStaff.name,
          email: updatedStaff.email,
          temporaryPassword: response.data.temporaryPassword
        });
        this.flashSuccess(`Temporary password reset for ${updatedStaff.name}.`);

        if (this.selectedStaff()?._id === updatedStaff._id) {
          this.openOperationsDrawer(updatedStaff);
        }
      },
      error: (error: any) => {
        console.error('Error resetting password:', error);
        this.flashError(error.error?.message || 'Failed to reset temporary password.');
      }
    });
  }

  deleteStaff(staffId?: string): void {
    if (!staffId) return;
    this.confirmAction.set({
      type: 'delete-staff',
      title: 'Remove Staff Member',
      message: 'Remove this staff member from the hotel team? Their account and access configuration will be deleted.',
      confirmLabel: 'Remove Staff',
      tone: 'danger',
      payload: { staffId }
    });
  }

  private performDeleteStaff(staffId: string): void {

    this.isLoading.set(true);
    this.hotelService.deleteStaff(staffId).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        if (response.status !== 'success') {
          this.flashError('Failed to delete staff member.');
          return;
        }

        this.staff.set(this.staff().filter((member) => member._id !== staffId));
        this.filterStaff();

        if (this.selectedStaff()?._id === staffId) {
          this.selectedStaff.set(null);
          this.activitySummary.set(null);
          this.closeOperationsDrawer();
        }

        this.flashSuccess('Staff member deleted successfully.');
      },
      error: (error: any) => {
        this.isLoading.set(false);
        console.error('Error deleting staff member:', error);
        this.flashError(error.error?.message || 'Failed to delete staff member.');
      }
    });
  }

  closeConfirmAction(): void {
    this.confirmAction.set(null);
  }

  confirmPendingAction(): void {
    const action = this.confirmAction();
    if (!action) return;

    this.confirmAction.set(null);

    if (action.type === 'delete-staff' && action.payload?.staffId) {
      this.performDeleteStaff(action.payload.staffId);
      return;
    }

    if (action.type === 'delete-schedule-entry' && action.payload?.scheduleId && action.payload?.entryId) {
      this.performDeleteScheduleEntry(action.payload.scheduleId, action.payload.entryId);
      return;
    }

    if (action.type === 'delete-schedule-weeks') {
      this.performDeleteLoadedScheduleWeeks();
    }
  }

  applyDefaultAccess(): void {
    const defaults = this.getEmptyStaff(this.newStaff.position);
    this.newStaff.accessRole = defaults.accessRole;
    this.newStaff.allowedModules = [...defaults.allowedModules];
    this.newStaff.allowedAreas = [...defaults.allowedAreas];
    this.newStaff.permissions = { ...defaults.permissions };
  }

  toggleSelection(collection: string[], value: string, checked: boolean): void {
    const current = new Set(collection);
    if (checked) {
      current.add(value);
    } else {
      current.delete(value);
    }

    const next = [...current];
    if (collection === this.newStaff.allowedModules) {
      this.newStaff.allowedModules = next;
    } else {
      this.newStaff.allowedAreas = next;
    }
  }

  isSelected(collection: string[], value: string): boolean {
    return collection.includes(value);
  }

  countByStatus(status: StaffStatus): number {
    return this.staff().filter((member) => member.status === status).length;
  }

  countMustChangePassword(): number {
    return this.staff().filter((member) => member.mustChangePassword).length;
  }

  countPrivilegedStaff(): number {
    return this.staff().filter((member) => ['admin', 'operations'].includes(member.accessRole)).length;
  }

  isHotelAdmin(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.userType === 'vendor' && user?.vendorType === 'hotel';
  }

  formatDateOnly(value?: string | null): string {
    if (!value) return 'N/A';
    return new Date(value).toLocaleDateString('en-NG', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  formatLabel(value: string): string {
    return value
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  formatDateTime(value?: string | null): string {
    if (!value) return 'Not recorded';
    return new Date(value).toLocaleString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private flashSuccess(message: string): void {
    this.successMessage.set(message);
    setTimeout(() => this.successMessage.set(''), 3000);
  }

  private flashError(message: string): void {
    this.errorMessage.set(message);
    setTimeout(() => this.errorMessage.set(''), 3000);
  }

  private clearFlashMessage(target: { set: (value: string) => void }): void {
    setTimeout(() => target.set(''), 3000);
  }

  private upsertSchedule(schedule: GeneratedStaffSchedule): void {
    const normalized = {
      ...schedule,
      entries: Array.isArray(schedule.entries) ? schedule.entries : []
    };
    const existing = this.schedules();
    const next = existing.some((item) => item._id === normalized._id)
      ? existing.map((item) => item._id === normalized._id ? normalized : item)
      : [...existing, normalized];

    next.sort((a, b) => new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime());
    this.schedules.set(next);
    this.schedulePage = 1;
  }

  private getEmptyScheduleEditorForm(): ScheduleEditorForm {
    return {
      scheduleId: '',
      entryId: '',
      staffId: '',
      date: '',
      shiftType: 'morning',
      startTime: '07:00',
      endTime: '15:00',
      assignedArea: 'guest-rooms',
      notes: '',
      status: 'pending-acceptance'
    };
  }

  private getEmptyKeyAccessForm(): StaffKeyAccessForm {
    const now = new Date();
    const validFrom = new Date(now.getTime() + 15 * 60 * 1000);
    const validUntil = new Date(now.getTime() + 8 * 60 * 60 * 1000);

    return {
      staffId: '',
      roomId: '',
      validFrom: validFrom.toISOString().slice(0, 16),
      validUntil: validUntil.toISOString().slice(0, 16),
      notes: ''
    };
  }

  private toDateInputValue(value?: string | null): string {
    if (!value) return '';
    return new Date(value).toISOString().slice(0, 10);
  }

  private normalizeStaff(member: any): Staff {
    const base = this.getEmptyStaff(member.position || 'receptionist');
    return {
      ...base,
      ...member,
      hireDate: member.hireDate
        ? new Date(member.hireDate).toISOString().slice(0, 10)
        : member.joinDate
          ? new Date(member.joinDate).toISOString().slice(0, 10)
          : base.hireDate,
      allowedModules: Array.isArray(member.allowedModules) ? member.allowedModules : [...base.allowedModules],
      allowedAreas: Array.isArray(member.allowedAreas) ? member.allowedAreas : [...base.allowedAreas],
      permissions: {
        ...base.permissions,
        ...(member.permissions || {})
      }
    };
  }

  private getEmptyStaff(position: StaffPosition = 'receptionist'): Staff {
    const accessDefaults = this.getAccessDefaults(position);
    return {
      name: '',
      email: '',
      phone: '',
      position,
      department: '',
      salary: 0,
      hireDate: new Date().toISOString().slice(0, 10),
      status: 'active',
      accessRole: accessDefaults.accessRole,
      allowedModules: [...accessDefaults.allowedModules],
      allowedAreas: [...accessDefaults.allowedAreas],
      permissions: { ...accessDefaults.permissions }
    };
  }

  private getAccessDefaults(position: StaffPosition): Pick<Staff, 'accessRole' | 'allowedModules' | 'allowedAreas' | 'permissions'> {
    const defaults: Record<string, Pick<Staff, 'accessRole' | 'allowedModules' | 'allowedAreas' | 'permissions'>> = {
      manager: {
        accessRole: 'admin',
        allowedModules: ['overview', 'bookings', 'rooms', 'guests', 'chat', 'revenue', 'analytics', 'food-orders', 'maintenance', 'staff', 'services', 'pre-checkin'],
        allowedAreas: ['front-desk', 'lobby', 'guest-rooms', 'restaurant', 'kitchen', 'maintenance', 'admin-office'],
        permissions: {
          canManageBookings: true,
          canManageRooms: true,
          canManageOrders: true,
          canViewRevenue: true,
          canViewAnalytics: true,
          canManageStaff: true,
          canHandleMaintenance: true
        }
      },
      receptionist: {
        accessRole: 'front-desk',
        allowedModules: ['overview', 'bookings', 'rooms', 'guests', 'chat', 'pre-checkin'],
        allowedAreas: ['front-desk', 'lobby', 'guest-rooms'],
        permissions: {
          canManageBookings: true,
          canManageRooms: true,
          canManageOrders: false,
          canViewRevenue: false,
          canViewAnalytics: false,
          canManageStaff: false,
          canHandleMaintenance: false
        }
      },
      housekeeping: {
        accessRole: 'housekeeping',
        allowedModules: ['overview', 'rooms', 'housekeeping'],
        allowedAreas: ['guest-rooms', 'lobby'],
        permissions: {
          canManageBookings: false,
          canManageRooms: true,
          canManageOrders: false,
          canViewRevenue: false,
          canViewAnalytics: false,
          canManageStaff: false,
          canHandleMaintenance: false
        }
      },
      housekeeper: {
        accessRole: 'housekeeping',
        allowedModules: ['overview', 'rooms', 'housekeeping'],
        allowedAreas: ['guest-rooms', 'lobby'],
        permissions: {
          canManageBookings: false,
          canManageRooms: true,
          canManageOrders: false,
          canViewRevenue: false,
          canViewAnalytics: false,
          canManageStaff: false,
          canHandleMaintenance: false
        }
      },
      chef: {
        accessRole: 'food-service',
        allowedModules: ['overview', 'food-orders', 'food-menu'],
        allowedAreas: ['kitchen', 'restaurant'],
        permissions: {
          canManageBookings: false,
          canManageRooms: false,
          canManageOrders: true,
          canViewRevenue: false,
          canViewAnalytics: false,
          canManageStaff: false,
          canHandleMaintenance: false
        }
      },
      waiter: {
        accessRole: 'food-service',
        allowedModules: ['overview', 'food-orders', 'services'],
        allowedAreas: ['restaurant', 'lobby'],
        permissions: {
          canManageBookings: false,
          canManageRooms: false,
          canManageOrders: true,
          canViewRevenue: false,
          canViewAnalytics: false,
          canManageStaff: false,
          canHandleMaintenance: false
        }
      },
      maintenance: {
        accessRole: 'maintenance',
        allowedModules: ['overview', 'maintenance', 'rooms'],
        allowedAreas: ['guest-rooms', 'maintenance', 'lobby'],
        permissions: {
          canManageBookings: false,
          canManageRooms: true,
          canManageOrders: false,
          canViewRevenue: false,
          canViewAnalytics: false,
          canManageStaff: false,
          canHandleMaintenance: true
        }
      },
      security: {
        accessRole: 'security',
        allowedModules: ['overview', 'guests'],
        allowedAreas: ['security', 'lobby', 'guest-rooms'],
        permissions: {
          canManageBookings: false,
          canManageRooms: false,
          canManageOrders: false,
          canViewRevenue: false,
          canViewAnalytics: false,
          canManageStaff: false,
          canHandleMaintenance: false
        }
      },
      other: {
        accessRole: 'custom',
        allowedModules: ['overview'],
        allowedAreas: ['lobby'],
        permissions: {
          canManageBookings: false,
          canManageRooms: false,
          canManageOrders: false,
          canViewRevenue: false,
          canViewAnalytics: false,
          canManageStaff: false,
          canHandleMaintenance: false
        }
      }
    };

    return defaults[position] || defaults['other'];
  }

  private getDefaultScheduleWeekStart(): string {
    const today = new Date();
    const day = today.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    today.setDate(today.getDate() + diffToMonday);
    return today.toISOString().slice(0, 10);
  }

  private getDefaultScheduleWeekEnd(): string {
    const start = new Date(this.getDefaultScheduleWeekStart());
    start.setDate(start.getDate() + 6);
    return start.toISOString().slice(0, 10);
  }
}
