import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-service-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8">
      <h1 class="text-3xl font-bold text-slate-900 mb-6">📈 Reports</h1>
      
      @if (isLoading()) {
        <div class="text-center py-12">
          <div class="inline-block animate-spin text-4xl mb-4">⏳</div>
          <p class="text-gray-600">Loading reports...</p>
        </div>
      } @else {
        <div class="bg-white rounded-lg shadow-md p-6">
          <p class="text-gray-600">Reports and analytics page</p>
          <p class="text-gray-500 text-sm mt-2">Generate and view your reports here</p>
        </div>
      }
    </div>
  `
})
export class ServiceReportsComponent implements OnInit {
  isLoading = signal(false);

  ngOnInit(): void {
    // TODO: Load reports from API
  }
}
