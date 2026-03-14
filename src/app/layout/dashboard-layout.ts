import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex h-screen bg-slate-50">
      <!-- Sidebar -->
      <aside class="w-64 bg-slate-900 text-white shadow-lg flex flex-col">
        <!-- Logo -->
        <div class="p-6 border-b border-slate-700">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-primary-500 flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 class="text-xl font-bold">Dashboard</h1>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-4 py-6 space-y-2">
          <a
            routerLink="/dashboard"
            routerLinkActive="bg-primary-600"
            [routerLinkActiveOptions]="{ exact: true }"
            class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 4l4 2m-8-4l4-2" />
            </svg>
            <span class="font-medium">Dashboard</span>
          </a>

          <a
            routerLink="/vendor"
            routerLinkActive="bg-primary-600"
            class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span class="font-medium">Vendors</span>
          </a>

          <a
            routerLink="/analytics"
            routerLinkActive="bg-primary-600"
            class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span class="font-medium">Analytics</span>
          </a>

          <a
            routerLink="/reports"
            routerLinkActive="bg-primary-600"
            class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span class="font-medium">Reports</span>
          </a>

          <a
            routerLink="/settings"
            routerLinkActive="bg-primary-600"
            class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span class="font-medium">Settings</span>
          </a>
        </nav>

        <!-- Footer -->
        <div class="p-4 border-t border-slate-700">
          <div class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
            <div class="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-sm font-bold">
              U
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">User</p>
              <p class="text-xs text-slate-400 truncate">user&#64;example.com</p>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col overflow-hidden">
        <!-- Header -->
        <header class="bg-white border-b border-slate-200 px-8 py-4 shadow-sm">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-slate-900">{{ pageTitle() }}</h2>
            <div class="flex items-center gap-4">
              <button class="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <button class="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <div class="flex-1 overflow-auto">
          <div class="p-8">
            <router-outlet />
          </div>
        </div>
      </main>
    </div>
  `,
  styles: `
    :host {
      display: contents;
    }
  `
})
export class DashboardLayoutComponent {
  pageTitle = signal('Dashboard');
}
