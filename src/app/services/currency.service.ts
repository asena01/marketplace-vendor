import { Injectable } from '@angular/core';
import { signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  exchangeRate: number; // Rate compared to base currency (NGN = 1)
}

export interface CountryInfo {
  countryCode: string;
  countryName: string;
  currency: Currency;
}

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  // Currency list with exchange rates (base: NGN)
  private currencyMap: Map<string, Currency> = new Map([
    ['NGN', { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', exchangeRate: 1 }],
    ['USD', { code: 'USD', symbol: '$', name: 'US Dollar', exchangeRate: 0.0006 }],
    ['EUR', { code: 'EUR', symbol: '€', name: 'Euro', exchangeRate: 0.00055 }],
    ['GBP', { code: 'GBP', symbol: '£', name: 'British Pound', exchangeRate: 0.00044 }],
    ['GHS', { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi', exchangeRate: 0.0089 }],
    ['KES', { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', exchangeRate: 0.0077 }],
    ['ZAR', { code: 'ZAR', symbol: 'R', name: 'South African Rand', exchangeRate: 0.011 }],
    ['EGP', { code: 'EGP', symbol: '£', name: 'Egyptian Pound', exchangeRate: 0.012 }],
    ['INR', { code: 'INR', symbol: '₹', name: 'Indian Rupee', exchangeRate: 0.049 }],
    ['PKR', { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', exchangeRate: 0.16 }],
    ['BDT', { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', exchangeRate: 0.063 }],
    ['PHP', { code: 'PHP', symbol: '₱', name: 'Philippine Peso', exchangeRate: 0.033 }],
    ['THB', { code: 'THB', symbol: '฿', name: 'Thai Baht', exchangeRate: 0.021 }],
    ['MYR', { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', exchangeRate: 0.0025 }],
    ['IDR', { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', exchangeRate: 9.5 }],
    ['VND', { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', exchangeRate: 15.2 }],
    ['CNY', { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', exchangeRate: 0.0042 }],
    ['JPY', { code: 'JPY', symbol: '¥', name: 'Japanese Yen', exchangeRate: 0.088 }],
    ['CAD', { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', exchangeRate: 0.00082 }],
    ['AUD', { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', exchangeRate: 0.00091 }],
  ]);

  // Country to currency mapping
  private countryToCurrency: Map<string, string> = new Map([
    ['NG', 'NGN'], ['US', 'USD'], ['GB', 'GBP'], ['CA', 'CAD'], ['AU', 'AUD'],
    ['DE', 'EUR'], ['FR', 'EUR'], ['IT', 'EUR'], ['ES', 'EUR'],
    ['GH', 'GHS'], ['KE', 'KES'], ['ZA', 'ZAR'], ['EG', 'EGP'],
    ['IN', 'INR'], ['PK', 'PKR'], ['BD', 'BDT'],
    ['PH', 'PHP'], ['TH', 'THB'], ['MY', 'MYR'], ['ID', 'IDR'], ['VN', 'VND'],
    ['CN', 'CNY'], ['JP', 'JPY'],
  ]);

  // Signals for reactive state
  private currentCurrency = signal<Currency>(this.currencyMap.get('NGN')!);
  private userCountry = signal<string | null>(null);
  private isDetectingLocation = signal<boolean>(false);

  // Computed values
  currencyCode = computed(() => this.currentCurrency().code);
  currencySymbol = computed(() => this.currentCurrency().symbol);
  currencyName = computed(() => this.currentCurrency().name);

  constructor(private http: HttpClient) {
    // Load saved currency or detect from location
    const savedCurrency = localStorage.getItem('preferredCurrency');
    if (savedCurrency && this.currencyMap.has(savedCurrency)) {
      this.currentCurrency.set(this.currencyMap.get(savedCurrency)!);
    } else {
      this.detectLocationAndSetCurrency();
    }
  }

  /**
   * Detect user's location based on IP and set currency accordingly
   */
  detectLocationAndSetCurrency(): void {
    this.isDetectingLocation.set(true);

    // Try to get location from browser geolocation API first
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Get country from coordinates using reverse geocoding
          this.getCountryFromCoordinates(position.coords.latitude, position.coords.longitude)
            .subscribe({
              next: (country) => {
                this.setLocationAndCurrency(country);
              },
              error: () => {
                // Fallback to IP-based detection
                this.getCountryFromIP();
              }
            });
        },
        () => {
          // User denied location access, use IP-based detection
          this.getCountryFromIP();
        }
      );
    } else {
      // Browser doesn't support geolocation, use IP-based detection
      this.getCountryFromIP();
    }
  }

  /**
   * Detect country from IP address
   */
  private getCountryFromIP(): void {
    // Using free IP geolocation service
    this.http.get<any>('https://ipapi.co/json/')
      .pipe(
        map(data => data.country_code),
        catchError(() => {
          // Fallback to default currency
          return of('NG');
        })
      )
      .subscribe({
        next: (countryCode) => {
          this.setLocationAndCurrency(countryCode);
        }
      });
  }

  /**
   * Get country from geographic coordinates
   */
  private getCountryFromCoordinates(lat: number, lng: number): Observable<string> {
    // Using OpenStreetMap nominatim reverse geocoding (free, no key needed)
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    return this.http.get<any>(url)
      .pipe(
        map(data => data.address?.country_code?.toUpperCase() || 'NG'),
        catchError(() => of('NG'))
      );
  }

  /**
   * Set location and update currency based on country code
   */
  private setLocationAndCurrency(countryCode: string): void {
    const upperCountryCode = countryCode.toUpperCase();
    this.userCountry.set(upperCountryCode);

    const currencyCode = this.countryToCurrency.get(upperCountryCode) || 'NGN';
    const currency = this.currencyMap.get(currencyCode);

    if (currency) {
      this.currentCurrency.set(currency);
      localStorage.setItem('userCountry', upperCountryCode);
      localStorage.setItem('preferredCurrency', currencyCode);
      console.log(`✅ Detected location: ${upperCountryCode}, Currency: ${currencyCode}`);
    }

    this.isDetectingLocation.set(false);
  }

  /**
   * Set currency manually
   */
  setCurrency(currencyCode: string): void {
    const currency = this.currencyMap.get(currencyCode.toUpperCase());
    if (currency) {
      this.currentCurrency.set(currency);
      localStorage.setItem('preferredCurrency', currencyCode.toUpperCase());
      console.log(`✅ Currency changed to: ${currencyCode}`);
    } else {
      console.error(`❌ Currency ${currencyCode} not found`);
    }
  }

  /**
   * Get all available currencies
   */
  getAvailableCurrencies(): Currency[] {
    return Array.from(this.currencyMap.values());
  }

  /**
   * Get current currency
   */
  getCurrentCurrency(): Currency {
    return this.currentCurrency();
  }

  /**
   * Format price with current currency
   */
  formatPrice(amount: number): string {
    const currency = this.currentCurrency();
    const convertedAmount = amount * currency.exchangeRate;

    // Format based on currency
    if (currency.code === 'JPY') {
      return `${currency.symbol}${Math.round(convertedAmount).toLocaleString()}`;
    } else if (currency.code === 'IDR' || currency.code === 'VND') {
      return `${currency.symbol}${Math.round(convertedAmount).toLocaleString()}`;
    } else {
      return `${currency.symbol}${convertedAmount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    }
  }

  /**
   * Convert amount from one currency to another
   */
  convertCurrency(amount: number, fromCode: string, toCode: string): number {
    const fromCurrency = this.currencyMap.get(fromCode.toUpperCase());
    const toCurrency = this.currencyMap.get(toCode.toUpperCase());

    if (!fromCurrency || !toCurrency) {
      return amount;
    }

    // Convert to base currency (NGN) then to target currency
    const inNGN = amount / fromCurrency.exchangeRate;
    return inNGN * toCurrency.exchangeRate;
  }

  /**
   * Get user's detected country
   */
  getUserCountry(): string | null {
    return this.userCountry();
  }

  /**
   * Check if location detection is in progress
   */
  isDetecting(): boolean {
    return this.isDetectingLocation();
  }
}
