import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FinanceService } from '../../../../../services/finance.service';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8 space-y-8">
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-slate-900">Finance & Banking Management</h1>
      </div>

      @if (isLoading()) {
        <div class="bg-blue-50 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">Loading financial data...</p>
        </div>
      }

      @if (successMessage()) {
        <div class="bg-emerald-50 border border-emerald-300 text-emerald-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">{{ successMessage() }}</p>
        </div>
      }

      @if (errorMessage()) {
        <div class="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          <p class="font-semibold">{{ errorMessage() }}</p>
        </div>
      }

      <!-- Financial Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-green-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Bank Status</p>
          @if (financeData().bankDetails?.verificationStatus === 'verified') {
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 bg-green-500 rounded-full"></span>
              <p class="text-lg font-bold text-slate-900">Verified</p>
            </div>
          } @else {
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 bg-yellow-500 rounded-full"></span>
              <p class="text-lg font-bold text-slate-900">Pending</p>
            </div>
          }
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Tax Filing</p>
          @if (financeData().taxDetails?.taxFilingStatus === 'filed') {
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 bg-green-500 rounded-full"></span>
              <p class="text-lg font-bold text-slate-900">Filed</p>
            </div>
          } @else {
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 bg-red-500 rounded-full"></span>
              <p class="text-lg font-bold text-slate-900">{{ financeData().taxDetails?.taxFilingStatus || 'Pending' }}</p>
            </div>
          }
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-purple-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Total Revenue</p>
          <p class="text-3xl font-bold text-slate-900">{{ financeData().revenue?.totalRevenue | currency }}</p>
          <p class="mt-1 text-sm text-slate-500">{{ financeData().revenue?.averageMonthlyRevenue | currency }}/month</p>
        </div>

        <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-orange-500">
          <p class="text-slate-600 text-sm font-medium mb-1">Business ID</p>
          <p class="text-2xl font-bold text-slate-900">{{ financeData().businessInfo?.businessId || 'Not set' }}</p>
          <p class="mt-1 text-sm text-slate-500">License: {{ financeData().businessInfo?.licenseNumber || 'N/A' }}</p>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="bg-white rounded-lg shadow-md">
        <div class="border-b border-slate-200">
          <div class="flex gap-0">
            @for (tab of tabs; track tab) {
              <button
                (click)="activeTab.set(tab)"
                [class]="'flex-1 px-6 py-4 font-medium text-sm transition border-b-2 ' + 
                         (activeTab() === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-900')"
              >
                {{ tab }}
              </button>
            }
          </div>
        </div>

        <!-- Bank Details Tab -->
        @if (activeTab() === 'Bank Details') {
          <div class="p-8">
            <h3 class="text-2xl font-bold text-slate-900 mb-6">Bank Account Information</h3>
            <div class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Account Holder Name</label>
                  <input
                    [(ngModel)]="bankForm.accountHolderName"
                    type="text"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Account Number</label>
                  <input
                    [(ngModel)]="bankForm.accountNumber"
                    type="text"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Bank Name</label>
                  <input
                    [(ngModel)]="bankForm.bankName"
                    type="text"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Bank Code</label>
                  <input
                    [(ngModel)]="bankForm.bankCode"
                    type="text"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">SWIFT Code</label>
                  <input
                    [(ngModel)]="bankForm.swiftCode"
                    type="text"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">IBAN</label>
                  <input
                    [(ngModel)]="bankForm.iban"
                    type="text"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Account Type</label>
                  <select
                    [(ngModel)]="bankForm.accountType"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="savings">Savings</option>
                    <option value="checking">Checking</option>
                    <option value="business">Business</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Currency</label>
                  <input
                    [(ngModel)]="bankForm.currency"
                    type="text"
                    placeholder="USD"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <button
                (click)="saveBankDetails()"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition"
              >
                Save Bank Details
              </button>
            </div>
          </div>
        }

        <!-- Tax Details Tab -->
        @if (activeTab() === 'Tax Details') {
          <div class="p-8">
            <h3 class="text-2xl font-bold text-slate-900 mb-6">Tax Information</h3>
            <div class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Tax ID</label>
                  <input
                    [(ngModel)]="taxForm.taxId"
                    type="text"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Tax Name</label>
                  <input
                    [(ngModel)]="taxForm.taxName"
                    type="text"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Business Registration Number</label>
                <input
                  [(ngModel)]="taxForm.businessRegistrationNumber"
                  type="text"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Business Registration Type</label>
                  <select
                    [(ngModel)]="taxForm.businessRegistrationType"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="sole_proprietor">Sole Proprietor</option>
                    <option value="partnership">Partnership</option>
                    <option value="corporation">Corporation</option>
                    <option value="llc">LLC</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Tax Filing Status</label>
                  <select
                    [(ngModel)]="taxForm.taxFilingStatus"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="filed">Filed</option>
                    <option value="pending">Pending</option>
                    <option value="not_filed">Not Filed</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Tax Rate (%)</label>
                  <input
                    [(ngModel)]="taxForm.taxRate"
                    type="number"
                    step="0.01"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Next Filing Due Date</label>
                  <input
                    [(ngModel)]="taxForm.nextFilingDueDate"
                    type="date"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <button
                (click)="saveTaxDetails()"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition"
              >
                Save Tax Details
              </button>
            </div>
          </div>
        }

        <!-- Business Information Tab -->
        @if (activeTab() === 'Business Info') {
          <div class="p-8">
            <h3 class="text-2xl font-bold text-slate-900 mb-6">Business Information</h3>
            <div class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Business Name</label>
                  <input
                    [(ngModel)]="businessForm.businessName"
                    type="text"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Business Legal Name</label>
                  <input
                    [(ngModel)]="businessForm.businessLegalName"
                    type="text"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Business ID</label>
                  <input
                    [(ngModel)]="businessForm.businessId"
                    type="text"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">License Number</label>
                  <input
                    [(ngModel)]="businessForm.licenseNumber"
                    type="text"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">License Expiry Date</label>
                  <input
                    [(ngModel)]="businessForm.licenseExpiry"
                    type="date"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Years in Business</label>
                  <input
                    [(ngModel)]="businessForm.yearsInBusiness"
                    type="number"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Number of Employees</label>
                <input
                  [(ngModel)]="businessForm.numberOfEmployees"
                  type="number"
                  class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <button
                (click)="saveBusinessInfo()"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition"
              >
                Save Business Information
              </button>
            </div>
          </div>
        }

        <!-- Revenue Tab -->
        @if (activeTab() === 'Revenue') {
          <div class="p-8">
            <h3 class="text-2xl font-bold text-slate-900 mb-6">Monthly Revenue Tracking</h3>
            
            <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-8">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p class="text-sm text-slate-600 font-medium">Total Revenue</p>
                  <p class="text-3xl font-bold text-slate-900">{{ financeData().revenue?.totalRevenue | currency }}</p>
                </div>
                <div>
                  <p class="text-sm text-slate-600 font-medium">Average Monthly</p>
                  <p class="text-3xl font-bold text-slate-900">{{ financeData().revenue?.averageMonthlyRevenue | currency }}</p>
                </div>
                <div>
                  <p class="text-sm text-slate-600 font-medium">Last Updated</p>
                  <p class="text-lg font-medium text-slate-700">{{ (financeData().revenue?.lastRevenueUpdate | date) || 'Never' }}</p>
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <h4 class="text-lg font-semibold text-slate-900">Add Monthly Revenue</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Month</label>
                  <select
                    [(ngModel)]="revenueForm.month"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Select Month</option>
                    @for (m of months; track m.value) {
                      <option [value]="m.value">{{ m.label }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Year</label>
                  <input
                    [(ngModel)]="revenueForm.year"
                    type="number"
                    [value]="currentYear"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Amount</label>
                  <input
                    [(ngModel)]="revenueForm.amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Category (Optional)</label>
                  <input
                    [(ngModel)]="revenueForm.category"
                    type="text"
                    placeholder="e.g., Room Bookings"
                    class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <button
                (click)="addMonthlyRevenue()"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition"
              >
                Add Revenue Record
              </button>
            </div>

            @if (financeData().revenue?.monthlyRevenue && (financeData().revenue?.monthlyRevenue | keyvalue).length > 0) {
              <div class="mt-8">
                <h4 class="text-lg font-semibold text-slate-900 mb-4">Revenue History</h4>
                <div class="bg-white rounded-lg overflow-hidden">
                  <table class="w-full">
                    <thead class="bg-slate-100 border-b border-slate-200">
                      <tr>
                        <th class="px-6 py-3 text-left text-sm font-semibold text-slate-900">Month</th>
                        <th class="px-6 py-3 text-left text-sm font-semibold text-slate-900">Revenue</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-200">
                      @for (entry of (financeData().revenue?.monthlyRevenue | keyvalue); track entry.key) {
                        <tr class="hover:bg-slate-50">
                          <td class="px-6 py-3 text-slate-900 font-medium">{{ entry.key }}</td>
                          <td class="px-6 py-3 text-slate-900 font-medium">{{ $any(entry.value) | currency }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }
          </div>
        }

        <!-- Compliance Tab -->
        @if (activeTab() === 'Compliance') {
          <div class="p-8">
            <h3 class="text-2xl font-bold text-slate-900 mb-6">Compliance & Verification</h3>
            <div class="space-y-6">
              <div class="bg-slate-50 rounded-lg p-6">
                <h4 class="font-semibold text-slate-900 mb-4">Compliance Status</h4>
                <div class="space-y-4">
                  <div class="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                    <div>
                      <p class="font-medium text-slate-900">KYC Verification</p>
                      <p class="text-sm text-slate-600">Know Your Customer verification status</p>
                    </div>
                    <span
                      [class]="'px-3 py-1 rounded-full text-xs font-medium ' +
                               (financeData().compliance?.kycStatus === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700')"
                    >
                      {{ financeData().compliance?.kycStatus || 'Pending' }}
                    </span>
                  </div>

                  <div class="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                    <div>
                      <p class="font-medium text-slate-900">AML Check</p>
                      <p class="text-sm text-slate-600">Anti-Money Laundering check status</p>
                    </div>
                    <span
                      [class]="'px-3 py-1 rounded-full text-xs font-medium ' +
                               (financeData().compliance?.amlCheckStatus === 'passed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700')"
                    >
                      {{ financeData().compliance?.amlCheckStatus || 'Pending' }}
                    </span>
                  </div>

                  <div class="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                    <div>
                      <p class="font-medium text-slate-900">Account Status</p>
                      <p class="text-sm text-slate-600">Current account status</p>
                    </div>
                    <span
                      [class]="'px-3 py-1 rounded-full text-xs font-medium ' +
                               (financeData().summary?.accountStatus === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')"
                    >
                      {{ financeData().summary?.accountStatus || 'Inactive' }}
                    </span>
                  </div>

                  <div class="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                    <div>
                      <p class="font-medium text-slate-900">Risk Level</p>
                      <p class="text-sm text-slate-600">Current risk assessment</p>
                    </div>
                    <span
                      [class]="'px-3 py-1 rounded-full text-xs font-medium ' +
                               (financeData().summary?.riskLevel === 'low' ? 'bg-green-100 text-green-700' : financeData().summary?.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700')"
                    >
                      {{ financeData().summary?.riskLevel || 'Unknown' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: []
})
export class FinanceComponent implements OnInit {
  financeData = signal<any>({});
  activeTab = signal('Bank Details');
  isLoading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');
  vendorId = '';

  tabs = ['Bank Details', 'Tax Details', 'Business Info', 'Revenue', 'Compliance'];

  bankForm = {
    accountHolderName: '',
    accountNumber: '',
    bankName: '',
    bankCode: '',
    branchName: '',
    swiftCode: '',
    iban: '',
    accountType: 'business',
    currency: 'USD'
  };

  taxForm = {
    taxId: '',
    taxName: '',
    businessRegistrationNumber: '',
    businessRegistrationType: 'corporation',
    taxFilingStatus: 'pending',
    taxRate: 0,
    nextFilingDueDate: ''
  };

  businessForm = {
    businessName: '',
    businessLegalName: '',
    businessId: '',
    licenseNumber: '',
    licenseExpiry: '',
    yearsInBusiness: 0,
    numberOfEmployees: 0
  };

  revenueForm = {
    month: '',
    year: new Date().getFullYear(),
    amount: 0,
    category: ''
  };

  months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  currentYear = new Date().getFullYear();

  constructor(
    private financeService: FinanceService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadFinanceData();
  }

  loadFinanceData(): void {
    this.isLoading.set(true);

    const user = this.authService.getCurrentUser();
    if (user) {
      this.vendorId = (user as any)._id || (user as any).id;

      this.financeService.getFinanceDetails(this.vendorId).subscribe({
        next: (response: any) => {
          if (response.status === 'success' && response.data) {
            this.financeData.set(response.data);
            this.populateForms(response.data);
          }
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading finance data:', error);
          this.isLoading.set(false);
        }
      });
    }
  }

  populateForms(data: any): void {
    if (data.bankDetails) {
      this.bankForm = { ...this.bankForm, ...data.bankDetails };
    }
    if (data.taxDetails) {
      this.taxForm = { ...this.taxForm, ...data.taxDetails };
    }
    if (data.businessInfo) {
      this.businessForm = { ...this.businessForm, ...data.businessInfo };
    }
  }

  saveBankDetails(): void {
    this.financeService.updateBankDetails(this.vendorId, this.bankForm).subscribe({
      next: () => {
        this.successMessage.set('Bank details saved successfully');
        this.loadFinanceData();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        this.errorMessage.set('Failed to save bank details');
        setTimeout(() => this.errorMessage.set(''), 3000);
      }
    });
  }

  saveTaxDetails(): void {
    this.financeService.updateTaxDetails(this.vendorId, this.taxForm).subscribe({
      next: () => {
        this.successMessage.set('Tax details saved successfully');
        this.loadFinanceData();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        this.errorMessage.set('Failed to save tax details');
        setTimeout(() => this.errorMessage.set(''), 3000);
      }
    });
  }

  saveBusinessInfo(): void {
    this.financeService.updateBusinessInfo(this.vendorId, this.businessForm).subscribe({
      next: () => {
        this.successMessage.set('Business information saved successfully');
        this.loadFinanceData();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        this.errorMessage.set('Failed to save business information');
        setTimeout(() => this.errorMessage.set(''), 3000);
      }
    });
  }

  addMonthlyRevenue(): void {
    if (!this.revenueForm.month || !this.revenueForm.amount) {
      this.errorMessage.set('Please fill in month and amount');
      return;
    }

    this.financeService.addMonthlyRevenue(this.vendorId, this.revenueForm).subscribe({
      next: () => {
        this.successMessage.set('Revenue record added successfully');
        this.revenueForm = { month: '', year: new Date().getFullYear(), amount: 0, category: '' };
        this.loadFinanceData();
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        this.errorMessage.set('Failed to add revenue record');
        setTimeout(() => this.errorMessage.set(''), 3000);
      }
    });
  }
}
