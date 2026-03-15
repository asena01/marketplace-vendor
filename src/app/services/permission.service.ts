import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  //private apiUrl = 'http://localhost:5001/admin';
  private apiUrl = 'https://api-qpczzmaezq-uc.a.run.app/admin';
  userPermissions = signal<string[]>([]);
  userRole = signal<any>(null);
  isLoading = signal(false);

  private permissionsSubject = new BehaviorSubject<string[]>([]);
  permissions$ = this.permissionsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Load user permissions from backend
   */
  loadUserPermissions(userId: string): Observable<any> {
    this.isLoading.set(true);

    return new Observable((observer) => {
      this.http
        .get<any>(`${this.apiUrl}/users/${userId}/permissions`, {
          headers: {
            'x-user-id': userId
          }
        })
        .subscribe({
          next: (response) => {
            if (response.status === 'success' && response.data) {
              this.userPermissions.set(response.data.permissions || []);
              this.userRole.set(response.data.role);
              this.permissionsSubject.next(response.data.permissions || []);
            }
            this.isLoading.set(false);
            observer.next(response);
            observer.complete();
          },
          error: (error) => {
            console.error('Error loading permissions:', error);
            this.isLoading.set(false);
            observer.error(error);
          }
        });
    });
  }

  /**
   * Check if user has a specific permission
   */
  hasPermission(permissionCode: string): boolean {
    return this.userPermissions().includes(permissionCode);
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(...permissionCodes: string[]): boolean {
    return permissionCodes.some((code) => this.userPermissions().includes(code));
  }

  /**
   * Check if user has all specified permissions
   */
  hasAllPermissions(...permissionCodes: string[]): boolean {
    return permissionCodes.every((code) => this.userPermissions().includes(code));
  }

  /**
   * Check if user has specific role
   */
  hasRole(roleName: string): boolean {
    return this.userRole()?.name === roleName;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(...roleNames: string[]): boolean {
    return roleNames.includes(this.userRole()?.name);
  }

  /**
   * Get all user permissions
   */
  getPermissions(): string[] {
    return this.userPermissions();
  }

  /**
   * Get user role
   */
  getRole(): any {
    return this.userRole();
  }

  /**
   * Clear user permissions
   */
  clearPermissions(): void {
    this.userPermissions.set([]);
    this.userRole.set(null);
    this.permissionsSubject.next([]);
  }

  /**
   * Check permission on backend (for critical operations)
   */
  checkPermissionWithBackend(userId: string, permissionCode: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/check-permission`,
      { userId, permissionCode },
      {
        headers: {
          'x-user-id': userId
        }
      }
    );
  }
}
