import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

@Injectable({
  providedIn: 'root'
})
export class TestDataService {
  // ⚠️ REPLACED: Firebase Cloud Functions endpoint with local backend API
  // OLD: 'https://us-central1-uni-backend01.cloudfunctions.net/api'
  // NEW: Local Node.js/Express backend
  private apiUrl = 'http://localhost:5001';
  //private apiUrl = 'https://api-qpczzmaezq-uc.a.run.app';
  constructor(private http: HttpClient) {}

  /**
   * Create a test store/vendor
   */
  createTestVendor(): Observable<ApiResponse<any>> {
    const vendorData = {
      storeName: 'Demo Store',
      email: `demo-store-${Date.now()}@test.com`,
      password: 'testpass123',
      phone: '+234-800-0000-000',
      businessType: 'retail',
      description: 'Demo store for testing products',
      address: {
        street: '123 Demo Street',
        city: 'Test City',
        state: 'TC',
        zipCode: '00000'
      },
      contactPerson: 'Demo Admin'
    };

    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/vendors/register`, vendorData);
  }

  /**
   * Add test products to a store/vendor
   */
  addTestProducts(vendorId: string): Observable<ApiResponse<any>> {
    const testProducts = [
      {
        name: 'Premium Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 15999,
        originalPrice: 29999,
        category: 'Electronics',
        categoryId: 'electronics-001',
        images: ['https://via.placeholder.com/400x400?text=Headphones'],
        thumbnail: 'https://via.placeholder.com/400x400?text=Headphones',
        icon: '🎧',
        rating: 4.8,
        reviews: 234,
        sold: 1200,
        discount: 47,
        inStock: true,
        isFreeShipping: true,
        stock: 50,
        sku: 'WH-001'
      },
      {
        name: 'Smartphone Stand',
        description: 'Adjustable phone stand for desk and tables',
        price: 2499,
        originalPrice: 4999,
        category: 'Accessories',
        categoryId: 'accessories-001',
        images: ['https://via.placeholder.com/400x400?text=Phone+Stand'],
        thumbnail: 'https://via.placeholder.com/400x400?text=Phone+Stand',
        icon: '📱',
        rating: 4.6,
        reviews: 145,
        sold: 890,
        discount: 50,
        inStock: true,
        isFreeShipping: true,
        stock: 100,
        sku: 'PS-001'
      },
      {
        name: 'USB-C Charging Cable',
        description: 'Durable USB-C cable for fast charging',
        price: 1499,
        originalPrice: 2999,
        category: 'Cables',
        categoryId: 'cables-001',
        images: ['https://via.placeholder.com/400x400?text=USB+Cable'],
        thumbnail: 'https://via.placeholder.com/400x400?text=USB+Cable',
        icon: '🔌',
        rating: 4.7,
        reviews: 567,
        sold: 3450,
        discount: 50,
        inStock: true,
        isFreeShipping: true,
        stock: 200,
        sku: 'UC-001'
      },
      {
        name: 'Portable Power Bank',
        description: '20000mAh power bank with fast charging',
        price: 8999,
        originalPrice: 15999,
        category: 'Electronics',
        categoryId: 'electronics-001',
        images: ['https://via.placeholder.com/400x400?text=Power+Bank'],
        thumbnail: 'https://via.placeholder.com/400x400?text=Power+Bank',
        icon: '🔋',
        rating: 4.5,
        reviews: 312,
        sold: 2100,
        discount: 44,
        inStock: true,
        isFreeShipping: true,
        stock: 75,
        sku: 'PB-001'
      },
      {
        name: 'Tempered Glass Screen Protector',
        description: 'Premium tempered glass with anti-scratch coating',
        price: 999,
        originalPrice: 2499,
        category: 'Accessories',
        categoryId: 'accessories-001',
        images: ['https://via.placeholder.com/400x400?text=Screen+Protector'],
        thumbnail: 'https://via.placeholder.com/400x400?text=Screen+Protector',
        icon: '🛡️',
        rating: 4.9,
        reviews: 890,
        sold: 5600,
        discount: 60,
        inStock: true,
        isFreeShipping: true,
        stock: 300,
        sku: 'SP-001'
      },
      {
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse with 2.4GHz connection',
        price: 3999,
        originalPrice: 7999,
        category: 'Accessories',
        categoryId: 'accessories-001',
        images: ['https://via.placeholder.com/400x400?text=Wireless+Mouse'],
        thumbnail: 'https://via.placeholder.com/400x400?text=Wireless+Mouse',
        icon: '🖱️',
        rating: 4.6,
        reviews: 234,
        sold: 1450,
        discount: 50,
        inStock: true,
        isFreeShipping: true,
        stock: 120,
        sku: 'WM-001'
      },
      {
        name: 'Bluetooth Speaker',
        description: 'Portable 360° stereo Bluetooth speaker',
        price: 12999,
        originalPrice: 24999,
        category: 'Electronics',
        categoryId: 'electronics-001',
        images: ['https://via.placeholder.com/400x400?text=Bluetooth+Speaker'],
        thumbnail: 'https://via.placeholder.com/400x400?text=Bluetooth+Speaker',
        icon: '🔊',
        rating: 4.7,
        reviews: 478,
        sold: 2890,
        discount: 48,
        inStock: true,
        isFreeShipping: true,
        stock: 60,
        sku: 'BS-001'
      },
      {
        name: 'Phone Case Protection',
        description: 'Shock-resistant phone case with corner protection',
        price: 2999,
        originalPrice: 5999,
        category: 'Accessories',
        categoryId: 'accessories-001',
        images: ['https://via.placeholder.com/400x400?text=Phone+Case'],
        thumbnail: 'https://via.placeholder.com/400x400?text=Phone+Case',
        icon: '📦',
        rating: 4.8,
        reviews: 645,
        sold: 3890,
        discount: 50,
        inStock: true,
        isFreeShipping: true,
        stock: 180,
        sku: 'PC-001'
      },
      {
        name: 'Car Phone Mount',
        description: 'Dashboard phone mount with strong suction cup',
        price: 1999,
        originalPrice: 3999,
        category: 'Accessories',
        categoryId: 'accessories-001',
        images: ['https://via.placeholder.com/400x400?text=Car+Mount'],
        thumbnail: 'https://via.placeholder.com/400x400?text=Car+Mount',
        icon: '🚗',
        rating: 4.5,
        reviews: 289,
        sold: 1670,
        discount: 50,
        inStock: true,
        isFreeShipping: true,
        stock: 140,
        sku: 'CM-001'
      },
      {
        name: 'LED Ring Light',
        description: '10\" LED ring light for photography and streaming',
        price: 9999,
        originalPrice: 19999,
        category: 'Electronics',
        categoryId: 'electronics-001',
        images: ['https://via.placeholder.com/400x400?text=Ring+Light'],
        thumbnail: 'https://via.placeholder.com/400x400?text=Ring+Light',
        icon: '💡',
        rating: 4.7,
        reviews: 356,
        sold: 1200,
        discount: 50,
        inStock: true,
        isFreeShipping: true,
        stock: 45,
        sku: 'RL-001'
      }
    ];

    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/vendors/${vendorId}/products/bulk`,
      { products: testProducts },
      { headers: this.getVendorHeaders(vendorId) }
    );
  }

  /**
   * Create vendor and add test products in one call
   */
  createVendorWithProducts(): Observable<ApiResponse<any>> {
    const vendorData = {
      storeName: 'TechHub Store',
      email: `techhub-${Date.now()}@demo.com`,
      password: 'demo123456',
      phone: '+234-701-234-5678',
      businessType: 'retail',
      description: 'Premium electronics and accessories store',
      address: {
        street: '456 Tech Avenue',
        city: 'Lagos',
        state: 'LA',
        zipCode: '100001'
      },
      contactPerson: 'Store Manager',
      products: [
        {
          name: 'Premium Wireless Headphones',
          description: 'High-quality wireless headphones with noise cancellation',
          price: 15999,
          originalPrice: 29999,
          category: 'Electronics',
          categoryId: 'electronics-001',
          images: ['https://via.placeholder.com/400x400?text=Headphones'],
          thumbnail: 'https://via.placeholder.com/400x400?text=Headphones',
          icon: '🎧',
          rating: 4.8,
          reviews: 234,
          sold: 1200,
          discount: 47,
          inStock: true,
          isFreeShipping: true,
          stock: 50,
          sku: 'WH-001'
        },
        {
          name: 'Smartphone Stand',
          description: 'Adjustable phone stand for desk and tables',
          price: 2499,
          originalPrice: 4999,
          category: 'Accessories',
          categoryId: 'accessories-001',
          images: ['https://via.placeholder.com/400x400?text=Phone+Stand'],
          thumbnail: 'https://via.placeholder.com/400x400?text=Phone+Stand',
          icon: '📱',
          rating: 4.6,
          reviews: 145,
          sold: 890,
          discount: 50,
          inStock: true,
          isFreeShipping: true,
          stock: 100,
          sku: 'PS-001'
        },
        {
          name: 'USB-C Charging Cable',
          description: 'Durable USB-C cable for fast charging',
          price: 1499,
          originalPrice: 2999,
          category: 'Cables',
          categoryId: 'cables-001',
          images: ['https://via.placeholder.com/400x400?text=USB+Cable'],
          thumbnail: 'https://via.placeholder.com/400x400?text=USB+Cable',
          icon: '🔌',
          rating: 4.7,
          reviews: 567,
          sold: 3450,
          discount: 50,
          inStock: true,
          isFreeShipping: true,
          stock: 200,
          sku: 'UC-001'
        },
        {
          name: 'Portable Power Bank',
          description: '20000mAh power bank with fast charging',
          price: 8999,
          originalPrice: 15999,
          category: 'Electronics',
          categoryId: 'electronics-001',
          images: ['https://via.placeholder.com/400x400?text=Power+Bank'],
          thumbnail: 'https://via.placeholder.com/400x400?text=Power+Bank',
          icon: '🔋',
          rating: 4.5,
          reviews: 312,
          sold: 2100,
          discount: 44,
          inStock: true,
          isFreeShipping: true,
          stock: 75,
          sku: 'PB-001'
        },
        {
          name: 'Tempered Glass Screen Protector',
          description: 'Premium tempered glass with anti-scratch coating',
          price: 999,
          originalPrice: 2499,
          category: 'Accessories',
          categoryId: 'accessories-001',
          images: ['https://via.placeholder.com/400x400?text=Screen+Protector'],
          thumbnail: 'https://via.placeholder.com/400x400?text=Screen+Protector',
          icon: '🛡️',
          rating: 4.9,
          reviews: 890,
          sold: 5600,
          discount: 60,
          inStock: true,
          isFreeShipping: true,
          stock: 300,
          sku: 'SP-001'
        },
        {
          name: 'Wireless Mouse',
          description: 'Ergonomic wireless mouse with 2.4GHz connection',
          price: 3999,
          originalPrice: 7999,
          category: 'Accessories',
          categoryId: 'accessories-001',
          images: ['https://via.placeholder.com/400x400?text=Wireless+Mouse'],
          thumbnail: 'https://via.placeholder.com/400x400?text=Wireless+Mouse',
          icon: '🖱️',
          rating: 4.6,
          reviews: 234,
          sold: 1450,
          discount: 50,
          inStock: true,
          isFreeShipping: true,
          stock: 120,
          sku: 'WM-001'
        },
        {
          name: 'Bluetooth Speaker',
          description: 'Portable 360° stereo Bluetooth speaker',
          price: 12999,
          originalPrice: 24999,
          category: 'Electronics',
          categoryId: 'electronics-001',
          images: ['https://via.placeholder.com/400x400?text=Bluetooth+Speaker'],
          thumbnail: 'https://via.placeholder.com/400x400?text=Bluetooth+Speaker',
          icon: '🔊',
          rating: 4.7,
          reviews: 478,
          sold: 2890,
          discount: 48,
          inStock: true,
          isFreeShipping: true,
          stock: 60,
          sku: 'BS-001'
        },
        {
          name: 'Phone Case Protection',
          description: 'Shock-resistant phone case with corner protection',
          price: 2999,
          originalPrice: 5999,
          category: 'Accessories',
          categoryId: 'accessories-001',
          images: ['https://via.placeholder.com/400x400?text=Phone+Case'],
          thumbnail: 'https://via.placeholder.com/400x400?text=Phone+Case',
          icon: '📦',
          rating: 4.8,
          reviews: 645,
          sold: 3890,
          discount: 50,
          inStock: true,
          isFreeShipping: true,
          stock: 180,
          sku: 'PC-001'
        },
        {
          name: 'Car Phone Mount',
          description: 'Dashboard phone mount with strong suction cup',
          price: 1999,
          originalPrice: 3999,
          category: 'Accessories',
          categoryId: 'accessories-001',
          images: ['https://via.placeholder.com/400x400?text=Car+Mount'],
          thumbnail: 'https://via.placeholder.com/400x400?text=Car+Mount',
          icon: '🚗',
          rating: 4.5,
          reviews: 289,
          sold: 1670,
          discount: 50,
          inStock: true,
          isFreeShipping: true,
          stock: 140,
          sku: 'CM-001'
        },
        {
          name: 'LED Ring Light',
          description: '10\" LED ring light for photography and streaming',
          price: 9999,
          originalPrice: 19999,
          category: 'Electronics',
          categoryId: 'electronics-001',
          images: ['https://via.placeholder.com/400x400?text=Ring+Light'],
          thumbnail: 'https://via.placeholder.com/400x400?text=Ring+Light',
          icon: '💡',
          rating: 4.7,
          reviews: 356,
          sold: 1200,
          discount: 50,
          inStock: true,
          isFreeShipping: true,
          stock: 45,
          sku: 'RL-001'
        }
      ]
    };

    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/vendors/register-with-products`,
      vendorData
    );
  }

  private getVendorHeaders(vendorId: string): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'x-vendor-id': vendorId
    });
  }
}
