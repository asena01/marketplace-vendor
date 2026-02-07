import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../../../core/services/product.service';
import { Product } from '../../../../core/models/product.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss'
})
export class ProductFormComponent implements OnInit {
  productForm!: FormGroup;
  isEditing = false;
  productId: string | null = null;
  categories = ['Electronics', 'Clothing', 'Home', 'Sports', 'Beauty'];
  imagePreview: string | ArrayBuffer | null = null;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditing = true;
        this.productId = params['id'];
        this.loadProduct();
      }
    });
  }

  initializeForm() {
    this.productForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: ['', [Validators.required, Validators.min(0.01)]],
      cost: ['', [Validators.required, Validators.min(0)]],
      category: ['Electronics', Validators.required],
      stock: ['', [Validators.required, Validators.min(0)]],
      sku: ['', Validators.required],
      image: ['', Validators.required],
      rating: ['', [Validators.required, Validators.min(0), Validators.max(5)]],
      reviews: ['', [Validators.required, Validators.min(0)]]
    });
  }

  loadProduct() {
    if (this.productId) {
      this.productService.getProductById(this.productId).subscribe(product => {
        this.productForm.patchValue(product);
        this.imagePreview = product.image;
      });
    }
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result || null;
        this.productForm.patchValue({ image: this.imagePreview });
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.productForm.invalid) {
      this.errorMessage = 'Please fill all required fields correctly';
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const formData = this.productForm.value;

    if (this.isEditing && this.productId) {
      this.productService.updateProduct(this.productId, formData).subscribe(
        () => {
          this.isLoading = false;
          this.successMessage = 'Product updated successfully!';
          setTimeout(() => this.router.navigate(['/products']), 1500);
        },
        (error) => {
          this.isLoading = false;
          this.errorMessage = 'Failed to update product';
        }
      );
    } else {
      this.productService.createProduct(formData).subscribe(
        () => {
          this.isLoading = false;
          this.successMessage = 'Product created successfully!';
          setTimeout(() => this.router.navigate(['/products']), 1500);
        },
        (error) => {
          this.isLoading = false;
          this.errorMessage = 'Failed to create product';
        }
      );
    }
  }

  onCancel() {
    this.router.navigate(['/products']);
  }

  clearMessages() {
    this.successMessage = '';
    this.errorMessage = '';
  }
}
