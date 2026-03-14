import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiceBookingService, ServiceBookingRequest } from '../../services/service-booking.service';
import { ServiceFeatures } from '../../services/service.service';

@Component({
  selector: 'app-service-booking-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './service-booking-modal.component.html',
  styleUrl: './service-booking-modal.component.css'
})
export class ServiceBookingModalComponent {
  @Input() set isOpen(value: boolean | any) {
    this._isOpen.set(typeof value === 'boolean' ? value : value?.());
  }
  private _isOpen = signal(false);

  isOpenSignal() {
    return this._isOpen();
  }

  @Input() service: ServiceFeatures | null = null;
  @Input() numberOfUnits = 1;
  @Output() onClose = new EventEmitter<void>();
  @Output() onPaymentSuccess = new EventEmitter<any>();

  // Form data
  customerName = '';
  customerEmail = '';
  customerPhone = '';
  bookingDate = '';
  startTime = '09:00';
  serviceLocation = {
    address: '',
    city: '',
    area: '',
    zipCode: '',
    notes: ''
  };
  paymentMethod: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' = 'credit_card';
  cardholderName = '';
  cardNumber = '';
  expiryMonth = '';
  expiryYear = '';
  cvv = '';
  billingAddress = {
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: ''
  };

  // UI state
  isProcessing = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  currentStep: 'details' | 'payment' | 'confirmation' = 'details';

  // Pricing
  subtotal = 0;
  tax = 0;
  totalPrice = 0;

  constructor(private serviceBookingService: ServiceBookingService) {}

  ngOnInit() {
    this.calculatePricing();
  }

  calculatePricing(): void {
    if (this.service) {
      const basePrice = this.service.basePrice || 0;
      const quantity = this.numberOfUnits || 1;
      this.subtotal = Math.round(basePrice * quantity * 100) / 100;
      this.tax = Math.round(this.subtotal * 0.1 * 100) / 100;
      this.totalPrice = this.subtotal + this.tax;
    }
  }

  goToPayment(): void {
    this.errorMessage.set('');

    if (!this.customerName.trim()) {
      this.errorMessage.set('Name is required');
      return;
    }

    if (!this.isValidEmail()) {
      this.errorMessage.set('Valid email is required');
      return;
    }

    if (!this.customerPhone.trim()) {
      this.errorMessage.set('Phone number is required');
      return;
    }

    if (!this.bookingDate) {
      this.errorMessage.set('Service date is required');
      return;
    }

    if (!this.serviceLocation.address.trim()) {
      this.errorMessage.set('Service location is required');
      return;
    }

    this.currentStep = 'payment';
  }

  goBackToDetails(): void {
    this.currentStep = 'details';
    this.errorMessage.set('');
  }

  submitPayment(): void {
    this.errorMessage.set('');

    if (this.paymentMethod === 'credit_card' || this.paymentMethod === 'debit_card') {
      if (!this.validateCardDetails()) {
        return;
      }
    }

    this.processPayment();
  }

  validateCardDetails(): boolean {
    if (!this.cardholderName.trim()) {
      this.errorMessage.set('Cardholder name is required');
      return false;
    }

    if (!this.serviceBookingService.validateCardNumber(this.cardNumber)) {
      this.errorMessage.set('Invalid card number');
      return false;
    }

    if (!this.serviceBookingService.validateExpiryDate(this.expiryMonth, this.expiryYear)) {
      this.errorMessage.set('Card has expired or invalid expiry date');
      return false;
    }

    if (!/^\d{3,4}$/.test(this.cvv)) {
      this.errorMessage.set('Invalid CVV');
      return false;
    }

    if (!this.billingAddress.street.trim()) {
      this.errorMessage.set('Billing address is required');
      return false;
    }

    if (!this.billingAddress.city.trim()) {
      this.errorMessage.set('Billing city is required');
      return false;
    }

    if (!this.billingAddress.zipCode.trim()) {
      this.errorMessage.set('Billing zip code is required');
      return false;
    }

    return true;
  }

  processPayment(): void {
    this.isProcessing.set(true);

    const bookingRequest: ServiceBookingRequest = {
      service: this.service?._id || this.service?.id || '',
      customerId: 'customer-id', // In real app, get from auth service
      customerName: this.customerName,
      customerEmail: this.customerEmail,
      customerPhone: this.customerPhone,
      bookingDate: this.bookingDate,
      startTime: this.startTime,
      serviceLocation: this.serviceLocation,
      quantity: this.numberOfUnits,
      paymentMethod: this.paymentMethod,
      cardholderName: this.cardholderName,
      cardNumber: this.cardNumber,
      expiryMonth: this.expiryMonth,
      expiryYear: this.expiryYear,
      cvv: this.cvv,
      billingAddress: this.billingAddress
    };

    this.serviceBookingService.createServiceBooking(bookingRequest).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.currentStep = 'confirmation';
          this.successMessage.set('Service booked successfully!');
          this.onPaymentSuccess.emit(response.data);
        } else {
          this.errorMessage.set(response.message || 'Booking failed');
        }
        this.isProcessing.set(false);
      },
      error: (error: any) => {
        this.errorMessage.set(error.message || 'An error occurred during booking');
        this.isProcessing.set(false);
      }
    });
  }

  isValidEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.customerEmail);
  }

  formatCardNumber(event: Event): void {
    const target = event.target as HTMLInputElement;
    let value = target.value.replace(/\s/g, '');
    const parts = [];

    for (let i = 0; i < value.length; i += 4) {
      parts.push(value.substring(i, i + 4));
    }

    this.cardNumber = parts.join(' ');
    target.value = this.cardNumber;
  }

  close(): void {
    this.resetForm();
    this.onClose.emit();
  }

  resetForm(): void {
    this.customerName = '';
    this.customerEmail = '';
    this.customerPhone = '';
    this.bookingDate = '';
    this.serviceLocation = { address: '', city: '', area: '', zipCode: '', notes: '' };
    this.paymentMethod = 'credit_card';
    this.cardholderName = '';
    this.cardNumber = '';
    this.expiryMonth = '';
    this.expiryYear = '';
    this.cvv = '';
    this.billingAddress = { street: '', city: '', state: '', country: '', zipCode: '' };
    this.currentStep = 'details';
    this.errorMessage.set('');
    this.successMessage.set('');
  }
}
