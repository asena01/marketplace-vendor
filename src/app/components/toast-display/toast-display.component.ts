import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          [ngClass]="{
            'bg-green-50 border border-green-200 text-green-700': toast.type === 'success',
            'bg-red-50 border border-red-200 text-red-700': toast.type === 'error',
            'bg-yellow-50 border border-yellow-200 text-yellow-700': toast.type === 'warning',
            'bg-blue-50 border border-blue-200 text-blue-700': toast.type === 'info'
          }"
          class="px-4 py-3 rounded-lg shadow-lg animate-slide-in pointer-events-auto max-w-md"
        >
          <div class="flex items-start gap-3">
            <span class="text-xl flex-shrink-0">
              @switch (toast.type) {
                @case ('success') { ✅ }
                @case ('error') { ❌ }
                @case ('warning') { ⚠️ }
                @case ('info') { ℹ️ }
              }
            </span>
            <div class="flex-1">
              <p class="font-semibold">
                @switch (toast.type) {
                  @case ('success') { Success }
                  @case ('error') { Error }
                  @case ('warning') { Warning }
                  @case ('info') { Info }
                }
              </p>
              <p class="text-sm mt-1">{{ toast.message }}</p>
            </div>
            <button
              (click)="toastService.dismiss(toast.id)"
              class="text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              ✕
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .animate-slide-in {
      animation: slideIn 0.3s ease-out;
    }
  `]
})
export class ToastDisplayComponent {
  constructor(public toastService: ToastService) {}
}
