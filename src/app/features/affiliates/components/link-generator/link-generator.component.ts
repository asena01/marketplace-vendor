import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AffiliateService } from '../../../../core/services/affiliate.service';
import { ProductService } from '../../../../core/services/product.service';
import { Product } from '../../../../core/models/product.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-link-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './link-generator.component.html',
  styleUrl: './link-generator.component.scss'
})
export class LinkGeneratorComponent implements OnInit {
  products$!: Observable<Product[]>;
  selectedProduct: Product | null = null;
  generatedLink: string = '';
  generatedCode: string = '';
  linkCopied = false;
  codeCopied = false;

  constructor(
    private affiliateService: AffiliateService,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.products$ = this.productService.getProducts();
  }

  onProductSelect(product: Product) {
    this.selectedProduct = product;
    this.generateLink();
  }

  generateLink() {
    if (!this.selectedProduct) return;

    this.generatedCode = this.generateCode();
    const baseUrl = window.location.origin;
    this.generatedLink = `${baseUrl}?ref=${this.generatedCode}&product=${this.selectedProduct.id}`;
  }

  private generateCode(): string {
    return 'AFF' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  copyLink() {
    navigator.clipboard.writeText(this.generatedLink);
    this.linkCopied = true;
    setTimeout(() => { this.linkCopied = false; }, 2000);
  }

  copyCode() {
    navigator.clipboard.writeText(this.generatedCode);
    this.codeCopied = true;
    setTimeout(() => { this.codeCopied = false; }, 2000);
  }

  shareOnSocial(platform: string) {
    const text = `Check out this product: ${this.selectedProduct?.name}`;
    const urls: { [key: string]: string } = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(this.generatedLink)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.generatedLink)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + this.generatedLink)}`
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank');
    }
  }
}
