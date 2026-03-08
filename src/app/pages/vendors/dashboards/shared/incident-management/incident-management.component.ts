import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  category: string;
  reportedBy: string;
  assignedTo: string;
  createdDate: string;
  resolvedDate?: string;
  priority: number;
  attachments?: number;
}

@Component({
  selector: 'app-incident-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Incident Management</h1>
          <p class="text-slate-600 mt-2">Track and manage operational incidents</p>
        </div>
        <button class="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
          + Report Incident
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-red-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Critical</p>
          <p class="text-3xl font-bold text-red-600">{{ getCriticalIncidents() }}</p>
          <p class="mt-2 text-sm text-red-600">Needs immediate action</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-orange-500">
          <p class="text-slate-600 text-sm font-medium mb-1">High Priority</p>
          <p class="text-3xl font-bold text-orange-600">{{ getHighPriorityIncidents() }}</p>
          <p class="mt-2 text-sm text-orange-600">{{ getOpenIncidents() }} open</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500">
          <p class="text-slate-600 text-sm font-medium mb-1">In Progress</p>
          <p class="text-3xl font-bold text-blue-600">{{ getInProgressIncidents() }}</p>
          <p class="mt-2 text-sm text-blue-600">Being handled</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-emerald-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Resolved</p>
          <p class="text-3xl font-bold text-emerald-600">{{ getResolvedIncidents() }}</p>
          <p class="mt-2 text-sm text-emerald-600">{{ getResolutionRate() }}% resolution rate</p>
        </div>
      </div>

      <!-- Filter -->
      <div class="bg-white rounded-lg p-4 shadow-md flex gap-4">
        <select 
          [(ngModel)]="filterStatus"
          class="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>

        <select 
          [(ngModel)]="filterSeverity"
          class="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
        >
          <option value="">All Severity</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <input 
          type="text" 
          placeholder="Search incidents..." 
          [(ngModel)]="searchQuery"
          class="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
        >
      </div>

      <!-- Incidents List -->
      <div class="space-y-4">
        @for (incident of getFilteredIncidents(); track incident.id) {
          <div class="bg-white rounded-lg p-6 shadow-md border-l-4" [ngClass]="{
            'border-red-500': incident.severity === 'critical',
            'border-orange-500': incident.severity === 'high',
            'border-yellow-500': incident.severity === 'medium',
            'border-blue-500': incident.severity === 'low'
          }">
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-lg font-bold text-slate-900">{{ incident.title }}</h3>
                  <span [ngClass]="{
                    'bg-red-100 text-red-700': incident.severity === 'critical',
                    'bg-orange-100 text-orange-700': incident.severity === 'high',
                    'bg-yellow-100 text-yellow-700': incident.severity === 'medium',
                    'bg-blue-100 text-blue-700': incident.severity === 'low'
                  }" class="px-3 py-1 rounded-full text-xs font-medium">
                    {{ incident.severity | titlecase }}
                  </span>
                  <span [ngClass]="{
                    'bg-red-100 text-red-700': incident.status === 'open',
                    'bg-blue-100 text-blue-700': incident.status === 'in-progress',
                    'bg-emerald-100 text-emerald-700': incident.status === 'resolved',
                    'bg-slate-100 text-slate-700': incident.status === 'closed'
                  }" class="px-3 py-1 rounded-full text-xs font-medium">
                    {{ incident.status | titlecase }}
                  </span>
                </div>
                <p class="text-sm text-slate-600">ID: {{ incident.id }} • Created: {{ incident.createdDate }}</p>
              </div>
              <div class="text-right">
                <div class="bg-slate-100 px-3 py-1 rounded font-medium text-slate-900">Priority: {{ incident.priority }}</div>
              </div>
            </div>

            <p class="text-slate-700 mb-4">{{ incident.description }}</p>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-slate-200 text-sm">
              <div>
                <span class="text-slate-600">Category:</span>
                <p class="font-medium text-slate-900">{{ incident.category }}</p>
              </div>
              <div>
                <span class="text-slate-600">Reported By:</span>
                <p class="font-medium text-slate-900">{{ incident.reportedBy }}</p>
              </div>
              <div>
                <span class="text-slate-600">Assigned To:</span>
                <p class="font-medium text-slate-900">{{ incident.assignedTo }}</p>
              </div>
              @if (incident.resolvedDate) {
                <div>
                  <span class="text-slate-600">Resolved:</span>
                  <p class="font-medium text-slate-900">{{ incident.resolvedDate }}</p>
                </div>
              }
            </div>

            <div class="flex items-center justify-between">
              @if (incident.attachments) {
                <span class="text-sm text-slate-600">📎 {{ incident.attachments }} attachment(s)</span>
              } @else {
                <span></span>
              }
              @if (incident.status !== 'closed') {
                <div class="flex gap-2">
                  <button class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">
                    Update Status
                  </button>
                  <button class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
                    View Details
                  </button>
                </div>
              } @else {
                <button class="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
                  View Details
                </button>
              }
            </div>
          </div>
        }
        @if (getFilteredIncidents().length === 0) {
          <div class="bg-white rounded-lg p-12 shadow-md text-center">
            <p class="text-slate-600 text-lg">No incidents found matching your filters</p>
          </div>
        }
      </div>

      <!-- Incident Summary by Category -->
      <div class="bg-white rounded-lg p-6 shadow-md">
        <h2 class="text-xl font-bold text-slate-900 mb-6">Incidents by Category</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-3">
            <h3 class="font-medium text-slate-900 mb-4">Open & In Progress</h3>
            @for (category of getIncidentCategories(); track category) {
              <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span class="text-slate-700">{{ category }}</span>
                <span class="font-bold text-slate-900">{{ getIncidentsByCategory(category) }}</span>
              </div>
            }
          </div>
          <div class="space-y-3">
            <h3 class="font-medium text-slate-900 mb-4">Severity Breakdown</h3>
            @for (severity of ['critical', 'high', 'medium', 'low']; track severity) {
              <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span class="text-slate-700 capitalize">{{ severity }}</span>
                <span class="font-bold" [ngClass]="{
                  'text-red-600': severity === 'critical',
                  'text-orange-600': severity === 'high',
                  'text-yellow-600': severity === 'medium',
                  'text-blue-600': severity === 'low'
                }">{{ getIncidentsBySeverity(severity) }}</span>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-white rounded-lg p-6 shadow-md">
        <h2 class="text-xl font-bold text-slate-900 mb-6">Recent Activity</h2>
        <div class="space-y-3">
          <div class="flex items-center gap-4 pb-3 border-b border-slate-200">
            <div class="w-2 h-2 rounded-full bg-red-500"></div>
            <div class="flex-1">
              <p class="font-medium text-slate-900">Critical incident reported</p>
              <p class="text-sm text-slate-600">System outage in Room 301 • 2 hours ago</p>
            </div>
          </div>
          <div class="flex items-center gap-4 pb-3 border-b border-slate-200">
            <div class="w-2 h-2 rounded-full bg-blue-500"></div>
            <div class="flex-1">
              <p class="font-medium text-slate-900">Incident assigned</p>
              <p class="text-sm text-slate-600">INC-0042 assigned to John Smith • 1 hour ago</p>
            </div>
          </div>
          <div class="flex items-center gap-4 pb-3 border-b border-slate-200">
            <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
            <div class="flex-1">
              <p class="font-medium text-slate-900">Incident resolved</p>
              <p class="text-sm text-slate-600">INC-0041 resolved • 30 minutes ago</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="w-2 h-2 rounded-full bg-slate-500"></div>
            <div class="flex-1">
              <p class="font-medium text-slate-900">Incident closed</p>
              <p class="text-sm text-slate-600">INC-0040 closed • 15 minutes ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class IncidentManagementComponent implements OnInit {
  incidents = signal<Incident[]>([]);

  filterStatus = '';
  filterSeverity = '';
  searchQuery = '';

  ngOnInit(): void {
    // Load incidents
  }

  getOpenIncidents(): number {
    return this.incidents().filter(i => i.status === 'open').length;
  }

  getInProgressIncidents(): number {
    return this.incidents().filter(i => i.status === 'in-progress').length;
  }

  getResolvedIncidents(): number {
    return this.incidents().filter(i => i.status === 'resolved').length;
  }

  getCriticalIncidents(): number {
    return this.incidents().filter(i => i.severity === 'critical' && i.status !== 'closed').length;
  }

  getHighPriorityIncidents(): number {
    return this.incidents().filter(i => (i.severity === 'high' || i.priority <= 2) && i.status !== 'closed').length;
  }

  getResolutionRate(): number {
    const resolved = this.getResolvedIncidents();
    const total = this.incidents().length;
    return Math.round((resolved / total) * 100);
  }

  getIncidentCategories(): string[] {
    const categories = new Set(this.incidents().map(i => i.category));
    return Array.from(categories);
  }

  getIncidentsByCategory(category: string): number {
    return this.incidents().filter(i => i.category === category && (i.status === 'open' || i.status === 'in-progress')).length;
  }

  getIncidentsBySeverity(severity: string): number {
    return this.incidents().filter(i => i.severity === severity).length;
  }

  getFilteredIncidents(): Incident[] {
    let filtered = this.incidents();

    if (this.filterStatus) {
      filtered = filtered.filter(i => i.status === this.filterStatus);
    }

    if (this.filterSeverity) {
      filtered = filtered.filter(i => i.severity === this.filterSeverity);
    }

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(i =>
        i.title.toLowerCase().includes(query) ||
        i.description.toLowerCase().includes(query) ||
        i.id.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => a.priority - b.priority);
  }
}
