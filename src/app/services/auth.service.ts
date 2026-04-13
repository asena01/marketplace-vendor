import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  _id: string;
  name: string;
  email: string;
  userType: 'customer' | 'vendor' | 'admin' | 'staff';
  vendorType?: string;
  hotelId?: string;
  hotelName?: string;
  staffPosition?: string;
  accessRole?: string;
  allowedModules?: string[];
  allowedAreas?: string[];
  permissions?: any;
  mustChangePassword?: boolean;
  businessName?: string;
  businessDescription?: string;
  phone: string;
  profileImage?: string;
  isVerified: boolean;
  createdAt: string;
  address?: string;
  city?: string;
  country?: string;
  website?: string;
  openingTime?: string;
  closingTime?: string;
  deliveryPartnerId?: string;
  adminRole?: string; // Admin role for access control
  adminPermissions?: any; // Admin permissions
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // ⚠️ REPLACED: Firebase Cloud Functions endpoint with local backend API
  // OLD: 'https://us-central1-uni-backend01.cloudfunctions.net/api'
  // NEW: Local Node.js/Express backend
  //private apiUrl = 'http://localhost:5001';
  private apiUrl = 'https://api-qpczzmaezq-uc.a.run.app';
  private tokenKey = 'token';
  private userKey = 'user';

  // Signals for reactive state
  isAuthenticated = signal(this.hasToken());
  currentUser = signal<User | null>(this.getStoredUser());
  userType = signal<'customer' | 'vendor' | 'admin' | 'staff' | null>(this.getStoredUser()?.userType || null);

  private authSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  public auth$ = this.authSubject.asObservable();

  constructor(private http: HttpClient) {
    // Initialize on service creation
    this.checkAuth();
  }

  /**
   * Register a new user
   */
  signup(userData: any): Observable<any> {
    console.log('📝 Signing up with:', userData);
    console.log('🔗 API URL:', this.apiUrl);

    return this.http.post(`${this.apiUrl}/auth/register`, userData).pipe(
      tap((response: any) => {
        console.log('=== 📨 SIGNUP RESPONSE ===');
        console.log('Full response:', response);
        console.log('response.success:', response.success);
        console.log('response.token:', response.token ? '✅ exists' : '❌ missing');
        console.log('response.user:', response.user);
        console.log('response.businessIds:', response.businessIds);
        console.log('=========================');

        if (response.success && response.token) {
          this.setToken(response.token);
          this.setUser(response.user);
          this.updateAuthState(response.user);

          // Store userId for all users
          localStorage.setItem('userId', response.user._id);
          console.log('✅ Stored userId:', response.user._id);

          // Store user email and basic info
          if (response.user.email) {
            localStorage.setItem('email', response.user.email);
          }
          if (response.user.phone) {
            localStorage.setItem('phone', response.user.phone);
          }
          if (response.user.businessName) {
            localStorage.setItem('businessName', response.user.businessName);
          }


          // Set business ID from signup response for vendors
          if (response.user.userType === 'vendor') {
            const userId = response.user._id;
            const vendorType = response.user.vendorType;
            const businessIds = response.businessIds || {};
            console.log('🏢 VENDOR SIGNUP DETECTED');
            console.log('  vendorType:', vendorType);
            console.log('  businessIds:', businessIds);
            console.log('  businessIds.hotelId:', businessIds.hotelId);
            console.log('✅ Signup: Setting business IDs for vendor type:', vendorType, businessIds);

            // Store vendorType for all vendors
            localStorage.setItem('vendorType', vendorType);

            // Map vendor types to their business IDs from response
            const retailVendorTypes = [
              'retail', 'clothing-store', 'jewelry', 'supermarket',
              'furniture', 'pet-store', 'gym', 'salon-spa',
              'car-rental', 'event-center', 'general'
            ];

            if (vendorType === 'hotel' && businessIds.hotelId) {
              localStorage.setItem('hotelId', businessIds.hotelId);
              console.log('✅ Hotel ID stored:', businessIds.hotelId);
            } else if (vendorType === 'tour-operator' && businessIds.agencyId) {
              localStorage.setItem('agencyId', businessIds.agencyId);
              console.log('✅ Agency ID stored:', businessIds.agencyId);
            } else if (vendorType === 'restaurant' && businessIds.restaurantId) {
              localStorage.setItem('restaurantId', businessIds.restaurantId);
              console.log('✅ Restaurant ID stored:', businessIds.restaurantId);
            } else if (vendorType === 'hair-salon' || vendorType === 'service') {
              localStorage.setItem('serviceProviderId', userId);
              console.log('✅ Service Provider ID stored:', userId);
            } else if (retailVendorTypes.includes(vendorType)) {
              // All retail types use storeId
              localStorage.setItem('storeId', userId);
              console.log('✅ Store ID stored for vendor type:', vendorType, userId);
            } else if (vendorType === 'delivery') {
              const deliveryId = response.user.deliveryPartnerId || userId;
              localStorage.setItem('deliveryId', deliveryId);
              console.log('✅ Delivery ID stored:', deliveryId);
            }
          }
        }
      })
    );
  }

  /**
   * Login user
   */
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap((response: any) => {
        if (response.success && response.token) {
          this.setToken(response.token);
          this.setUser(response.user);
          this.updateAuthState(response.user);

          // Store userId for all users
          localStorage.setItem('userId', response.user._id);

          // Store user email and basic info
          if (response.user.email) {
            localStorage.setItem('email', response.user.email);
          }
          if (response.user.phone) {
            localStorage.setItem('phone', response.user.phone);
          }
          if (response.user.businessName) {
            localStorage.setItem('businessName', response.user.businessName);
          }

          // Store admin role if admin user
          if (response.user.userType === 'admin') {
            localStorage.setItem('adminRole', response.user.adminRole || 'admin');
            console.log('✅ Admin logged in with role:', response.user.adminRole || 'admin');
          }

          // Set business ID from login response for vendors
          if (response.user.userType === 'vendor') {
            const vendorType = response.user.vendorType;
            const businessIds = response.businessIds || {};
            localStorage.setItem('vendorType', vendorType || 'vendor-type-default');
            console.log('🔑 Login: Vendor Type set to:', vendorType);
            console.log('🔑 Login: Business IDs from response:', businessIds);

            if (vendorType === 'hotel' && businessIds.hotelId) {
              localStorage.setItem('hotelId', businessIds.hotelId);
              console.log('✅ Hotel ID stored from login:', businessIds.hotelId);
            } else if (vendorType === 'tour-operator' && businessIds.agencyId) {
              localStorage.setItem('agencyId', businessIds.agencyId);
              console.log('✅ Agency ID stored from login:', businessIds.agencyId);
            } else if (vendorType === 'restaurant' && businessIds.restaurantId) {
              localStorage.setItem('restaurantId', businessIds.restaurantId);
              console.log('✅ Restaurant ID stored from login:', businessIds.restaurantId);
            } else if (vendorType === 'retail' && businessIds.storeId) {
              localStorage.setItem('storeId', businessIds.storeId);
              console.log('✅ Store ID stored from login:', businessIds.storeId);
            } else if (vendorType === 'delivery') {
              const deliveryId = businessIds.deliveryId || response.user.deliveryPartnerId || response.user._id;
              localStorage.setItem('deliveryId', deliveryId);
              console.log('✅ Delivery ID stored from login:', deliveryId);
            }
          }
        }
      })
    );
  }

  loginStaff(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/staff-login`, { email, password }).pipe(
      tap((response: any) => {
        if (response.success && response.token) {
          this.setToken(response.token);
          this.setUser(response.user);
          this.updateAuthState(response.user);
          localStorage.setItem('userId', response.user._id);
          localStorage.setItem('userType', response.user.userType);
          if (response.user.hotelId) {
            localStorage.setItem('hotelId', response.user.hotelId);
          }
        }
      })
    );
  }

  changeStaffPassword(staffId: string, currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/staff-change-password`, {
      staffId,
      currentPassword,
      newPassword
    });
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem('userType');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('hotelId');
    localStorage.removeItem('restaurantId');
    localStorage.removeItem('storeId');
    localStorage.removeItem('agencyId');
    localStorage.removeItem('deliveryId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('vendorType');
    localStorage.removeItem('email');
    localStorage.removeItem('phone');
    localStorage.removeItem('businessName');
    localStorage.removeItem('serviceProviderId');
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.userType.set(null);
    this.authSubject.next(null);
  }

  /**
   * Check if user is authenticated
   */
  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Get stored user data
   */
  getStoredUser(): User | null {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  /**
   * Set token in localStorage
   */
  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  /**
   * Set user in localStorage
   */
  private setUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
    // Also store userType separately for quick access in guards
    localStorage.setItem('userType', user.userType);
    // Store email and name for payment and other uses
    if (user.email) localStorage.setItem('userEmail', user.email);
    if (user.name) {
      localStorage.setItem('userName', user.name);
    }
  }

  /**
   * Update authentication state
   */
  private updateAuthState(user: User): void {
    this.isAuthenticated.set(true);
    this.currentUser.set(user);
    this.userType.set(user.userType);
    this.authSubject.next(user);
  }

  /**
   * Check if user is authenticated
   */
  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUser();
  }

  updateStoredUser(patch: Partial<User>): void {
    const current = this.getCurrentUser();
    if (!current) return;
    const nextUser = { ...current, ...patch } as User;
    this.setUser(nextUser);
    this.updateAuthState(nextUser);
  }

  /**
   * Get user type
   */
  getUserType(): string | null {
    return this.userType();
  }

  /**
   * Check if user is vendor
   */
  isVendor(): boolean {
    return this.userType() === 'vendor';
  }

  isStaff(): boolean {
    return this.userType() === 'staff';
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.userType() === 'admin';
  }

  /**
   * Check if user is customer
   */
  isCustomer(): boolean {
    return this.userType() === 'customer';
  }

  /**
   * Get vendor type (for vendors only)
   */
  getVendorType(): string | null {
    const user = this.currentUser();
    return user?.vendorType || null;
  }

  /**
   * Get admin role (for admins only)
   */
  getAdminRole(): string | null {
    // First check from localStorage (set during login)
    const adminRole = localStorage.getItem('adminRole');
    if (adminRole) {
      return adminRole;
    }

    // Fallback to user object adminRole if available
    const user = this.currentUser();
    if (user && (user as any).adminRole) {
      return (user as any).adminRole;
    }

    return null;
  }

  /**
   * Get JWT token header
   */
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Verify token and check authentication
   */
  private checkAuth(): void {
    const user = this.getStoredUser();
    if (user && this.hasToken()) {
      this.updateAuthState(user);
    }
  }

  /**
   * Refresh user data from server (optional)
   */
  refreshUser(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${userId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap((response: any) => {
        if (response.data) {
          this.setUser(response.data);
          this.updateAuthState(response.data);
        }
      })
    );
  }

  /**
   * Update user profile information
   */
  updateProfile(userId: string, profileData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}`, profileData, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap((response: any) => {
        if (response.success && response.data) {
          this.setUser(response.data);
          this.updateAuthState(response.data);
        }
      })
    );
  }

  /**
   * Change user password
   */
  changePassword(userId: string, oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${userId}/change-password`, {
      oldPassword,
      newPassword
    }, {
      headers: this.getAuthHeaders()
    });
  }
}
