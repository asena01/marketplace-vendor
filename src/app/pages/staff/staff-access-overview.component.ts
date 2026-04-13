import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-staff-access-overview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8 space-y-6">
      <div>
        <h1 class="text-3xl font-bold text-slate-900">Access Overview</h1>
        <p class="mt-1 text-slate-600">Basic view of the modules and areas your role gives you access to.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="rounded-2xl bg-white p-6 shadow-sm">
          <h2 class="text-lg font-bold text-slate-900">Modules</h2>
          <div class="mt-4 flex flex-wrap gap-2">
            @for (module of user()?.allowedModules || []; track module) {
              <span class="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">{{ formatLabel(module) }}</span>
            }
          </div>
        </div>
        <div class="rounded-2xl bg-white p-6 shadow-sm">
          <h2 class="text-lg font-bold text-slate-900">Areas</h2>
          <div class="mt-4 flex flex-wrap gap-2">
            @for (area of user()?.allowedAreas || []; track area) {
              <span class="rounded-full bg-sky-50 px-3 py-1 text-sm text-sky-700">{{ formatLabel(area) }}</span>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class StaffAccessOverviewComponent {
  constructor(private authService: AuthService, private router: Router) {
    if (!this.authService.isStaff()) {
      this.router.navigateByUrl('/staff-login');
    }
  }

  user() {
    return this.authService.currentUser();
  }

  formatLabel(value: string): string {
    return value.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  }
}
