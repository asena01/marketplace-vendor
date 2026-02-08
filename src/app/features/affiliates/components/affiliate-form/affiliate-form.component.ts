import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AffiliateService } from '../../../../core/services/affiliate.service';

@Component({
  selector: 'app-affiliate-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './affiliate-form.component.html',
  styleUrl: './affiliate-form.component.scss'
})
export class AffiliateFormComponent implements OnInit {
  affiliateForm!: FormGroup;
  isEditing = false;
  affiliateId: string | null = null;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private affiliateService: AffiliateService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditing = true;
        this.affiliateId = params['id'];
      }
    });
  }

  initializeForm() {
    this.affiliateForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      website: [''],
      commissionRate: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      instagram: [''],
      tiktok: [''],
      youtube: [''],
      twitter: [''],
      accountHolder: ['', Validators.required],
      bankName: ['', Validators.required],
      accountNumber: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.affiliateForm.invalid) {
      this.errorMessage = 'Please fill all required fields correctly';
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const formData = this.affiliateForm.value;

    if (this.isEditing && this.affiliateId) {
      this.affiliateService.updateAffiliate(this.affiliateId, formData).subscribe(
        () => {
          this.isLoading = false;
          this.successMessage = 'Affiliate updated successfully!';
          setTimeout(() => this.router.navigate(['/affiliates']), 1500);
        },
        () => {
          this.isLoading = false;
          this.errorMessage = 'Failed to update affiliate';
        }
      );
    } else {
      this.affiliateService.createAffiliate(formData).subscribe(
        () => {
          this.isLoading = false;
          this.successMessage = 'Affiliate created successfully!';
          setTimeout(() => this.router.navigate(['/affiliates']), 1500);
        },
        () => {
          this.isLoading = false;
          this.errorMessage = 'Failed to create affiliate';
        }
      );
    }
  }

  onCancel() {
    this.router.navigate(['/affiliates']);
  }
}
