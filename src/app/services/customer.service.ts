import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Customer {
  _id?: string;
  businessId: string;
  businessType: string;
  userId?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  totalPurchases: number;
  totalSpent: number;
  averageOrderValue: number;
  lastPurchaseDate?: string;
  firstPurchaseDate?: string;
  status: 'active' | 'inactive' | 'vip' | 'blocked';
  notes?: string;
  preferences?: {
    newsletter: boolean;
    notifications: boolean;
  };
  createdAt?: string;
}

export interface CustomerResponse<T> {
  success: boolean;
  data?: T;
  stats?: {
    totalCustomers: number;
    totalRevenue: number;
    averageSpent: number;
    vipCount: number;
    activeCount: number;
  };
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = 'http://localhost:5001/customers';

  constructor(private http: HttpClient) {}

  // Get business customers
  getBusinessCustomers(
    businessId: string,
    businessType: string,
    page: number = 1,
    limit: number = 20,
    status?: string,
    sortBy: string = 'recent',
    search?: string
  ): Observable<CustomerResponse<Customer[]>> {
    let url = `${this.apiUrl}/business/${businessId}?businessType=${businessType}&page=${page}&limit=${limit}&sortBy=${sortBy}`;
    if (status) url += `&status=${status}`;
    if (search) url += `&search=${search}`;
    return this.http.get<CustomerResponse<Customer[]>>(url);
  }

  // Get top customers
  getTopCustomers(
    businessId: string,
    businessType: string,
    limit: number = 10
  ): Observable<CustomerResponse<Customer[]>> {
    return this.http.get<CustomerResponse<Customer[]>>(
      `${this.apiUrl}/business/${businessId}/top?businessType=${businessType}&limit=${limit}`
    );
  }

  // Get single customer
  getCustomer(customerId: string): Observable<CustomerResponse<Customer>> {
    return this.http.get<CustomerResponse<Customer>>(
      `${this.apiUrl}/${customerId}`
    );
  }

  // Create customer
  createCustomer(customerData: Partial<Customer>): Observable<CustomerResponse<Customer>> {
    return this.http.post<CustomerResponse<Customer>>(
      this.apiUrl,
      customerData
    );
  }

  // Update customer
  updateCustomer(customerId: string, updates: Partial<Customer>): Observable<CustomerResponse<Customer>> {
    return this.http.put<CustomerResponse<Customer>>(
      `${this.apiUrl}/${customerId}`,
      updates
    );
  }

  // Update customer purchase stats
  updateCustomerPurchases(customerId: string, orderAmount: number): Observable<CustomerResponse<Customer>> {
    return this.http.put<CustomerResponse<Customer>>(
      `${this.apiUrl}/${customerId}/purchases`,
      { orderAmount }
    );
  }

  // Delete customer
  deleteCustomer(customerId: string): Observable<CustomerResponse<any>> {
    return this.http.delete<CustomerResponse<any>>(
      `${this.apiUrl}/${customerId}`
    );
  }
}
