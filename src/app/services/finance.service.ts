import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';

export interface FinanceData {
  vendor?: string;
  vendorType?: string;
  bankDetails?: {
    accountHolderName?: string;
    accountNumber?: string;
    bankName?: string;
    bankCode?: string;
    branchName?: string;
    swiftCode?: string;
    iban?: string;
    accountType?: string;
    currency?: string;
    verificationStatus?: string;
  };
  taxDetails?: {
    taxId?: string;
    taxName?: string;
    businessRegistrationNumber?: string;
    businessRegistrationType?: string;
    taxFilingStatus?: string;
    taxFilingDate?: Date;
    nextFilingDueDate?: Date;
    taxRate?: number;
    country?: string;
    state?: string;
    city?: string;
    businessAddress?: string;
  };
  businessInfo?: {
    businessName?: string;
    businessLegalName?: string;
    businessId?: string;
    licenseNumber?: string;
    licenseExpiry?: Date;
    yearsInBusiness?: number;
    numberOfEmployees?: number;
    businessRegistrationDate?: Date;
  };
}

@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  //private apiUrl = 'http://localhost:5001/finance';
  private apiUrl = 'https://api-qpczzmaezq-uc.a.run.app/finance';
  constructor(private http: HttpClient) {}

  /**
   * Get finance details for a vendor
   */
  getFinanceDetails(vendorId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${vendorId}`).pipe(
      catchError((error) => {
        console.error('Error fetching finance details:', error);
        return of({ status: 'error', data: null });
      })
    );
  }

  /**
   * Get financial summary
   */
  getFinancialSummary(vendorId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${vendorId}/summary`).pipe(
      catchError((error) => {
        console.error('Error fetching financial summary:', error);
        return of({ status: 'error', data: null });
      })
    );
  }

  /**
   * Get revenue data
   */
  getRevenueData(vendorId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${vendorId}/revenue`).pipe(
      catchError((error) => {
        console.error('Error fetching revenue data:', error);
        return of({ status: 'error', data: null });
      })
    );
  }

  /**
   * Create finance record
   */
  createFinanceRecord(vendorId: string, financeData: FinanceData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${vendorId}`, financeData).pipe(
      catchError((error) => {
        console.error('Error creating finance record:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  /**
   * Update bank details
   */
  updateBankDetails(vendorId: string, bankDetails: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${vendorId}/bank`, bankDetails).pipe(
      catchError((error) => {
        console.error('Error updating bank details:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  /**
   * Update tax details
   */
  updateTaxDetails(vendorId: string, taxDetails: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${vendorId}/tax`, taxDetails).pipe(
      catchError((error) => {
        console.error('Error updating tax details:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  /**
   * Update business information
   */
  updateBusinessInfo(vendorId: string, businessInfo: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${vendorId}/business`, businessInfo).pipe(
      catchError((error) => {
        console.error('Error updating business info:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  /**
   * Update payment processing info
   */
  updatePaymentProcessing(vendorId: string, paymentData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${vendorId}/payment`, paymentData).pipe(
      catchError((error) => {
        console.error('Error updating payment processing:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  /**
   * Update compliance information
   */
  updateCompliance(vendorId: string, complianceData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${vendorId}/compliance`, complianceData).pipe(
      catchError((error) => {
        console.error('Error updating compliance:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  /**
   * Add monthly revenue
   */
  addMonthlyRevenue(vendorId: string, revenueData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${vendorId}/revenue/monthly`, revenueData).pipe(
      catchError((error) => {
        console.error('Error adding monthly revenue:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }

  /**
   * Delete finance record
   */
  deleteFinanceRecord(vendorId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${vendorId}`).pipe(
      catchError((error) => {
        console.error('Error deleting finance record:', error);
        return of({ status: 'error', message: error.message });
      })
    );
  }
}
