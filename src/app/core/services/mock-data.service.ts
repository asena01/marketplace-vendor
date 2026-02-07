import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';
import { Order } from '../models/order.model';
import { Vendor } from '../models/vendor.model';
import { Affiliate } from '../models/affiliate.model';
import { AffiliateLink } from '../models/affiliate-link.model';
import { Commission } from '../models/commission.model';
import { Payout } from '../models/payout.model';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  getMockVendor(): Vendor {
    return {
      id: 'v001',
      name: 'John Doe',
      email: 'john@marketplace.com',
      phone: '+1-555-0100',
      storeName: 'TechHub Store',
      storeDescription: 'Quality electronics at affordable prices',
      avatar: 'https://via.placeholder.com/100',
      banner: 'https://via.placeholder.com/1200x400',
      rating: 4.7,
      totalReviews: 1250,
      status: 'active',
      location: { country: 'USA', city: 'New York' },
      bankDetails: {
        accountHolder: 'John Doe',
        accountNumber: '****1234',
        bankName: 'First National Bank'
      },
      affiliateSettings: {
        defaultCommissionRate: 10,
        minWithdrawal: 100,
        payoutFrequency: 'monthly',
        requireApproval: true
      },
      createdAt: new Date('2023-01-01'),
    };
  }

  getMockProducts(): Product[] {
    return [
      {
        id: 'p001',
        name: 'Wireless Earbuds Pro',
        sku: 'WE-001',
        description: 'High-quality wireless earbuds with active noise cancellation',
        category: 'Electronics',
        subcategory: 'Audio',
        images: ['https://via.placeholder.com/300', 'https://via.placeholder.com/300'],
        price: 29.99,
        originalPrice: 49.99,
        discount: 40,
        stock: 150,
        rating: 4.5,
        reviews: 234,
        status: 'active',
        tags: ['wireless', 'audio', 'electronics'],
        specifications: { 'Battery Life': '8 hours', 'Connectivity': 'Bluetooth 5.0' },
        shipping: { weight: 0.1, dimensions: '10x5x5', shippingCost: 5.99 },
        affiliateCommissionRate: 10,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
        vendorId: 'v001'
      },
      {
        id: 'p002',
        name: 'USB-C Fast Charger',
        sku: 'CH-001',
        description: 'Super fast 65W USB-C charger',
        category: 'Electronics',
        subcategory: 'Chargers',
        images: ['https://via.placeholder.com/300'],
        price: 12.99,
        originalPrice: 19.99,
        discount: 35,
        stock: 200,
        rating: 4.8,
        reviews: 567,
        status: 'active',
        tags: ['charger', 'usb-c', 'fast-charging'],
        specifications: { 'Power': '65W', 'Ports': '1 USB-C' },
        shipping: { weight: 0.2, dimensions: '8x6x4', shippingCost: 2.99 },
        affiliateCommissionRate: 12,
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-20'),
        vendorId: 'v001'
      },
      {
        id: 'p003',
        name: 'Portable Phone Stand',
        sku: 'ST-001',
        description: 'Adjustable portable phone stand for desk',
        category: 'Accessories',
        subcategory: 'Phone Accessories',
        images: ['https://via.placeholder.com/300'],
        price: 7.99,
        originalPrice: 14.99,
        discount: 47,
        stock: 300,
        rating: 4.3,
        reviews: 189,
        status: 'active',
        tags: ['stand', 'phone', 'accessories'],
        specifications: { 'Material': 'Aluminum', 'Compatibility': 'Universal' },
        shipping: { weight: 0.15, dimensions: '15x10x2', shippingCost: 1.99 },
        affiliateCommissionRate: 15,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-18'),
        vendorId: 'v001'
      }
    ];
  }

  getMockOrders(): Order[] {
    return [
      {
        id: 'o001',
        orderNumber: 'ORD-2024-001',
        customerId: 'c001',
        customerName: 'Alice Johnson',
        items: [
          { productId: 'p001', productName: 'Wireless Earbuds Pro', quantity: 1, price: 29.99, image: 'https://via.placeholder.com/100' }
        ],
        totalAmount: 34.99,
        shippingAddress: {
          fullName: 'Alice Johnson',
          phone: '+1-555-0101',
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'USA'
        },
        status: 'shipped',
        paymentStatus: 'paid',
        paymentMethod: 'credit_card',
        shippingTrackingNumber: 'TRACK001',
        affiliateLinkId: 'link001',
        affiliateId: 'aff001',
        notes: 'Gift wrapping requested',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-22'),
        expectedDelivery: new Date('2024-02-01')
      },
      {
        id: 'o002',
        orderNumber: 'ORD-2024-002',
        customerId: 'c002',
        customerName: 'Bob Smith',
        items: [
          { productId: 'p002', productName: 'USB-C Fast Charger', quantity: 2, price: 12.99, image: 'https://via.placeholder.com/100' }
        ],
        totalAmount: 28.98,
        shippingAddress: {
          fullName: 'Bob Smith',
          phone: '+1-555-0102',
          street: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          postalCode: '90001',
          country: 'USA'
        },
        status: 'processing',
        paymentStatus: 'paid',
        paymentMethod: 'debit_card',
        notes: '',
        createdAt: new Date('2024-01-21'),
        updatedAt: new Date('2024-01-23'),
        expectedDelivery: new Date('2024-02-02')
      }
    ];
  }

  getMockAffiliates(): Affiliate[] {
    return [
      {
        id: 'aff001',
        vendorId: 'v001',
        name: 'Marketing Pro',
        email: 'pro@marketing.com',
        phone: '+1-555-1001',
        website: 'https://marketingblog.com',
        socialMedia: { instagram: '@marketingpro', tiktok: '@marketingpro', youtube: 'MarketingProChannel' },
        commissionRate: 10,
        tier: 'gold',
        status: 'active',
        totalEarnings: 5234.50,
        totalClicks: 2400,
        totalConversions: 147,
        conversionRate: 6.13,
        totalReferredSales: 4850.00,
        lastPaymentAmount: 850.00,
        lastPaymentDate: new Date('2024-01-15'),
        nextPaymentDue: 1250.75,
        bankDetails: { accountHolder: 'Marketing Pro', accountNumber: '****5678', bankName: 'Tech Bank' },
        notes: 'Top performer',
        createdAt: new Date('2023-06-01'),
        approvedAt: new Date('2023-06-05'),
      },
      {
        id: 'aff002',
        vendorId: 'v001',
        name: 'Tech Reviewer',
        email: 'reviewer@techblog.com',
        phone: '+1-555-1002',
        website: 'https://techreviewblog.com',
        socialMedia: { youtube: 'TechReviewerChannel', twitter: '@tech_reviewer' },
        commissionRate: 12,
        tier: 'platinum',
        status: 'active',
        totalEarnings: 8945.00,
        totalClicks: 5200,
        totalConversions: 412,
        conversionRate: 7.92,
        totalReferredSales: 8650.00,
        lastPaymentAmount: 1500.00,
        lastPaymentDate: new Date('2024-01-10'),
        nextPaymentDue: 2180.00,
        bankDetails: { accountHolder: 'Tech Reviewer', accountNumber: '****9012', bankName: 'Premier Bank' },
        notes: 'Excellent engagement',
        createdAt: new Date('2023-03-15'),
        approvedAt: new Date('2023-03-20'),
      }
    ];
  }

  getMockAffiliateLinks(): AffiliateLink[] {
    return [
      {
        id: 'link001',
        affiliateId: 'aff001',
        vendorId: 'v001',
        productId: 'p001',
        uniqueCode: 'aff_mk_pro_001',
        fullLink: 'https://marketplace.com/product/p001?ref=aff_mk_pro_001',
        clicks: 450,
        conversions: 28,
        earnings: 840.00,
        conversionRate: 6.22,
        status: 'active',
        createdAt: new Date('2024-01-15')
      }
    ];
  }

  getMockCommissions(): Commission[] {
    return [
      {
        id: 'comm001',
        affiliateId: 'aff001',
        orderId: 'o001',
        productId: 'p001',
        vendorId: 'v001',
        saleAmount: 34.99,
        commissionRate: 10,
        commissionAmount: 3.50,
        status: 'approved',
        createdAt: new Date('2024-01-20'),
        approvedAt: new Date('2024-01-22'),
      }
    ];
  }

  getMockPayouts(): Payout[] {
    return [
      {
        id: 'payout001',
        affiliateId: 'aff001',
        vendorId: 'v001',
        amount: 1250.75,
        commissions: [],
        status: 'completed',
        paymentMethod: 'bank_transfer',
        transactionId: 'TXN-2024-001',
        createdAt: new Date('2024-01-25'),
        scheduledDate: new Date('2024-02-01'),
        completedAt: new Date('2024-02-01')
      }
    ];
  }
}