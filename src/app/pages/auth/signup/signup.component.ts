import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

interface VendorType {
  id: string;
  name: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  step = signal<'role' | 'vendor-type' | 'form'>('role');
  userType = signal<'customer' | 'vendor' | ''>('');
  vendorType = signal<string>('');
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  signupForm: FormGroup;

  vendorTypes: VendorType[] = [
    { id: 'restaurant', name: 'Restaurant', icon: '🍽️', description: 'Food & Beverage Business' },
    { id: 'hotel', name: 'Hotel/Accommodation', icon: '🏨', description: 'Hotel, BnB, or Apartment' },
    { id: 'clothing-store', name: 'Clothing Store', icon: '👕', description: 'Apparel & Fashion' },
    { id: 'jewelry', name: 'Jewelry Store', icon: '💍', description: 'Jewelry & Accessories' },
    { id: 'supermarket', name: 'Supermarket', icon: '🛒', description: 'Grocery & General Store' },
    { id: 'furniture', name: 'Furniture Store', icon: '🛋️', description: 'Furniture & Home Decor' },
    { id: 'hair-salon', name: 'Hair Salon', icon: '💇', description: 'Hair & Beauty Services' },
    { id: 'pet-store', name: 'Pet Store', icon: '🐾', description: 'Pet Supplies & Services' },
    { id: 'gym', name: 'Gym/Fitness', icon: '🏋️', description: 'Fitness & Gym Equipment' },
    { id: 'tour-operator', name: 'Tour Operator', icon: '✈️', description: 'Tours & Travel Services' },
    { id: 'car-rental', name: 'Car Rental', icon: '🚗', description: 'Vehicle Rental Services' },
    { id: 'salon-spa', name: 'Salon & Spa', icon: '💅', description: 'Beauty & Wellness Services' },
    { id: 'event-center', name: 'Event Center', icon: '🎉', description: 'Event Venue & Planning' },
    { id: 'general', name: 'General Vendor', icon: '🏪', description: 'General Marketplace' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      businessName: [''],
      businessDescription: [''],
      phone: ['', Validators.required],
      agreeToTerms: [false, Validators.requiredTrue],
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  selectRole(role: 'customer' | 'vendor') {
    this.userType.set(role);
    if (role === 'customer') {
      this.step.set('form');
    } else {
      this.step.set('vendor-type');
    }
    this.errorMessage.set('');
  }

  selectVendorType(vendorTypeId: string) {
    // Redirect to specialized tours signup for tour operators
    if (vendorTypeId === 'tour-operator') {
      this.router.navigate(['/tours-signup']);
      return;
    }

    this.vendorType.set(vendorTypeId);
    this.step.set('form');
    this.errorMessage.set('');
  }

  goBack() {
    if (this.step() === 'form') {
      if (this.userType() === 'vendor') {
        this.step.set('vendor-type');
      } else {
        this.step.set('role');
      }
    } else if (this.step() === 'vendor-type') {
      this.step.set('role');
    }
    this.errorMessage.set('');
  }

  async onSubmit() {
    if (this.signupForm.invalid) {
      this.errorMessage.set('Please fill in all required fields correctly');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const formData = {
      name: this.signupForm.value.name,
      email: this.signupForm.value.email,
      password: this.signupForm.value.password,
      phone: this.signupForm.value.phone,
      userType: this.userType(),
      ...(this.userType() === 'vendor' && {
        vendorType: this.vendorType(),
        businessName: this.signupForm.value.businessName,
        businessDescription: this.signupForm.value.businessDescription,
      }),
    };

    try {
      const response: any = await this.authService.signup(formData).toPromise();
      
      if (response.success) {
        this.successMessage.set('Registration successful! Redirecting...');
        
        // Store token and user data
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Redirect based on user type
        setTimeout(() => {
          if (this.userType() === 'vendor') {
            this.router.navigate([`/vendor-dashboard/${this.vendorType()}`]);
          } else {
            this.router.navigate(['/']);
          }
        }, 1500);
      }
    } catch (error: any) {
      console.error('Registration error:', error);

      let errorMsg = 'Registration failed. Please try again.';

      if (error.error?.message) {
        errorMsg = error.error.message;
      } else if (error.status === 409) {
        errorMsg = 'This email is already registered. Please use a different email.';
      } else if (error.status === 400) {
        errorMsg = 'Please check all fields and try again.';
      } else if (error.status === 0) {
        errorMsg = 'Cannot connect to server. Make sure the backend is running on http://localhost:5000';
      } else if (error.message) {
        errorMsg = error.message;
      }

      this.errorMessage.set(errorMsg);
    } finally {
      this.isLoading.set(false);
    }
  }

  getVendorTypeLabel(): string {
    const vendor = this.vendorTypes.find(v => v.id === this.vendorType());
    return vendor ? vendor.name : '';
  }
}
