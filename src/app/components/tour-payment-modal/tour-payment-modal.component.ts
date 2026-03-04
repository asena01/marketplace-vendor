import { Component, OnInit, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TourBookingService } from '../../services/tour-booking.service';

@Component({
  selector: 'app-tour-payment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tour-payment-modal.component.html',
  styleUrl: './tour-payment-modal.component.css'
})
export class TourPaymentModalComponent implements OnInit {
  @Input() isOpen = signal(false);
  @Input() tour: any;
  @Input() numberOfParticipants = 1;
  @Output() onClose = new EventEmitter<void>();
  @Output() onPaymentSuccess = new EventEmitter<any>();

  // Form data
  customerName = '';
  customerEmail = '';
  customerPhone = '';
  paymentMethod: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' = 'credit_card';
  
  // Card details
  cardholderName = '';
  cardNumber = '';
  expiryMonth = '';
  expiryYear = '';
  cvv = '';
  
  // Billing address
  billingStreet = '';
  billingCity = '';
  billingState = '';
  billingCountry = '';
  billingZipCode = '';
  
  // UI state
  isProcessing = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  currentStep = signal<'details' | 'payment' | 'confirmation'>('details');
  
  // Pricing
  subtotal = 0;
  tax = 0;
  totalPrice = 0;

  constructor(private tourBookingService: TourBookingService) {}

  ngOnInit(): void {
    this.calculatePricing();
  }

  calculatePricing(): void {
    if (this.tour && this.numberOfParticipants > 0) {
      const price = typeof this.tour.price === 'number' ? this.tour.price : 899;
      this.subtotal = price * this.numberOfParticipants;
      this.tax = Math.round(this.subtotal * 0.1 * 100) / 100;
      this.totalPrice = this.subtotal + this.tax;
    }
  }

  closeModal(): void {
    this.resetForm();
    this.onClose.emit();
  }

  goToPayment(): void {
    this.errorMessage.set('');
    
    // Validate details step
    if (!this.customerName || !this.customerEmail || !this.customerPhone) {
      this.errorMessage.set('Please fill in all customer details');
      return;
    }

    if (!this.isValidEmail(this.customerEmail)) {
      this.errorMessage.set('Please enter a valid email address');
      return;
    }

    this.currentStep.set('payment');
  }

  goBackToDetails(): void {
    this.errorMessage.set('');
    this.currentStep.set('details');
  }

  submitPayment(): void {
    this.errorMessage.set('');

    // Validate payment method
    if (this.paymentMethod === 'credit_card' || this.paymentMethod === 'debit_card') {
      if (!this.validateCardDetails()) {
        return;
      }
    } else if (this.paymentMethod === 'paypal') {
      if (!this.customerEmail) {
        this.errorMessage.set('PayPal email is required');
        return;
      }
    }

    // Validate billing address
    if (!this.billingStreet || !this.billingCity || !this.billingCountry || !this.billingZipCode) {
      this.errorMessage.set('Please fill in your billing address');
      return;
    }

    this.processPayment();
  }

  private validateCardDetails(): boolean {
    if (!this.cardholderName) {
      this.errorMessage.set('Cardholder name is required');
      return false;
    }

    if (!this.cardNumber || !this.tourBookingService.validateCardNumber(this.cardNumber)) {
      this.errorMessage.set('Please enter a valid card number');
      return false;
    }

    if (!this.expiryMonth || !this.expiryYear || !this.tourBookingService.validateExpiryDate(this.expiryMonth, this.expiryYear)) {
      this.errorMessage.set('Please enter a valid expiry date (MM/YY)');
      return false;
    }

    if (!this.cvv || !/^\d{3,4}$/.test(this.cvv)) {
      this.errorMessage.set('Please enter a valid CVV (3-4 digits)');
      return false;
    }

    return true;
  }

  private processPayment(): void {
    this.isProcessing.set(true);
    this.errorMessage.set('');

    const bookingData = {
      tourId: this.tour.id || this.tour._id,
      customerId: 'temp-customer-id', // In production, use actual user ID
      customerName: this.customerName,
      customerEmail: this.customerEmail,
      customerPhone: this.customerPhone,
      numberOfParticipants: this.numberOfParticipants,
      pricePerPerson: typeof this.tour.price === 'number' ? this.tour.price : 899,
      numberOfDays: this.tour.duration,
      paymentMethod: this.paymentMethod,
      cardholderName: this.cardholderName,
      cardNumber: this.cardNumber,
      expiryMonth: this.expiryMonth,
      expiryYear: this.expiryYear,
      cvv: this.cvv,
      billingAddress: {
        street: this.billingStreet,
        city: this.billingCity,
        state: this.billingState,
        country: this.billingCountry,
        zipCode: this.billingZipCode
      }
    };

    this.tourBookingService.createTourBooking(bookingData).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.successMessage.set('Payment successful! Booking confirmed.');
          this.currentStep.set('confirmation');
          this.isProcessing.set(false);

          // Emit success event
          const timeoutId: ReturnType<typeof setTimeout> = setTimeout(() => {
            this.onPaymentSuccess.emit(response.data);
            this.resetForm();
            this.onClose.emit();
          }, 2000);
        } else {
          this.errorMessage.set(response.message || 'Payment processing failed');
          this.isProcessing.set(false);
        }
      },
      error: (error: any) => {
        this.errorMessage.set('Payment processing error: ' + error.message);
        this.isProcessing.set(false);
      }
    });
  }

  formatCardNumber(event: Event): void {
    const target = event.target as HTMLInputElement;
    let value: string = target.value.replace(/\s/g, '');
    let formattedValue: string = '';
    for (let i: number = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formattedValue += ' ';
      }
      formattedValue += value[i];
    }
    this.cardNumber = formattedValue;
  }

  maskCardForDisplay(): string {
    return this.tourBookingService.maskCardNumber(this.cardNumber);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private resetForm(): void {
    this.customerName = '';
    this.customerEmail = '';
    this.customerPhone = '';
    this.cardholderName = '';
    this.cardNumber = '';
    this.expiryMonth = '';
    this.expiryYear = '';
    this.cvv = '';
    this.billingStreet = '';
    this.billingCity = '';
    this.billingState = '';
    this.billingCountry = '';
    this.billingZipCode = '';
    this.currentStep.set('details');
    this.errorMessage.set('');
    this.successMessage.set('');
  }
}
