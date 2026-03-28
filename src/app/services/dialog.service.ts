import { Injectable, signal } from '@angular/core';

export interface DialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'confirm' | 'warning' | 'danger';
}

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  isOpen = signal(false);
  options = signal<DialogOptions>({
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'confirm'
  });
  
  private resolveCallback: ((confirmed: boolean) => void) | null = null;

  confirm(options: DialogOptions): Promise<boolean> {
    return new Promise(resolve => {
      this.options.set({
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        type: 'confirm',
        ...options
      });
      this.isOpen.set(true);
      this.resolveCallback = resolve;
    });
  }

  onConfirm() {
    this.close(true);
  }

  onCancel() {
    this.close(false);
  }

  private close(confirmed: boolean) {
    this.isOpen.set(false);
    if (this.resolveCallback) {
      this.resolveCallback(confirmed);
      this.resolveCallback = null;
    }
  }
}
