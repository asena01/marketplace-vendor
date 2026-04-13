import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { PermissionService } from '../services/permission.service';
import { AuthService } from '../services/auth.service';

/**
 * Guard to protect routes based on specific permission
 * Usage in routing:
 * {
 *   path: 'settlements',
 *   component: SettlementsComponent,
 *   canActivate: [PermissionGuard],
 *   data: { permission: 'settlement.view' }
 * }
 */
@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {
  constructor(
    private permissionService: PermissionService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const requiredPermission = route.data['permission'];

    if (!requiredPermission) {
      return true;
    }

    if (this.permissionService.hasPermission(requiredPermission)) {
      return true;
    }

    console.warn(`Access denied: Permission '${requiredPermission}' required for route '${state.url}'`);
    this.router.navigate(['/']);
    return false;
  }
}

/**
 * Guard to protect routes based on multiple permissions (ANY)
 * Usage in routing:
 * {
 *   path: 'settings',
 *   component: SettingsComponent,
 *   canActivate: [PermissionGuard],
 *   data: { permissions: ['vendor.view', 'vendor.edit'], requireAll: false }
 * }
 */
@Injectable({
  providedIn: 'root'
})
export class PermissionsGuard implements CanActivate {
  constructor(
    private permissionService: PermissionService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const requiredPermissions = route.data['permissions'] as string[];
    const requireAll = route.data['requireAll'] ?? true;

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    let hasAccess = false;

    if (requireAll) {
      hasAccess = this.permissionService.hasAllPermissions(...requiredPermissions);
    } else {
      hasAccess = this.permissionService.hasAnyPermission(...requiredPermissions);
    }

    if (hasAccess) {
      return true;
    }

    console.warn(`Access denied: Permissions ${JSON.stringify(requiredPermissions)} required for route '${state.url}'`);
    this.router.navigate(['/']);
    return false;
  }
}

/**
 * Guard to protect routes based on role
 * Usage in routing:
 * {
 *   path: 'admin',
 *   component: AdminComponent,
 *   canActivate: [RoleGuard],
 *   data: { role: 'super-admin' }
 * }
 */
@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private permissionService: PermissionService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const requiredRole = route.data['role'];

    if (!requiredRole) {
      return true;
    }

    // Check if user has the required role via PermissionService
    if (this.permissionService.hasRole(requiredRole)) {
      console.log(`✅ RoleGuard: User has required role '${requiredRole}' (via PermissionService)`);
      return true;
    }

    // Fallback: Check localStorage if permission service hasn't loaded yet
    // This is needed right after login before async permission loading completes
    const adminRole = localStorage.getItem('adminRole');
    console.log(`🔍 RoleGuard: Checking localStorage adminRole '${adminRole}' against required '${requiredRole}'`);

    if (adminRole === requiredRole) {
      console.log(`✅ RoleGuard: User has required role '${requiredRole}' (via localStorage fallback)`);
      return true;
    }

    console.warn(`❌ RoleGuard: Access denied for '${state.url}'. Required role '${requiredRole}', but user has '${adminRole || 'none'}'`);
    this.router.navigate(['/']);
    return false;
  }
}

/**
 * Guard to protect routes based on multiple roles (ANY)
 * Usage in routing:
 * {
 *   path: 'finance',
 *   component: FinanceComponent,
 *   canActivate: [RolesGuard],
 *   data: { roles: ['super-admin', 'finance-manager'] }
 * }
 */
@Injectable({
  providedIn: 'root'
})
export class RolesGuard implements CanActivate {
  constructor(
    private permissionService: PermissionService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const requiredRoles = route.data['roles'] as string[];

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Check if user has any of the required roles via PermissionService
    if (this.permissionService.hasAnyRole(...requiredRoles)) {
      return true;
    }

    // Fallback: Check localStorage if permission service hasn't loaded yet
    const adminRole = localStorage.getItem('adminRole');
    if (adminRole && requiredRoles.includes(adminRole)) {
      return true;
    }

    console.warn(`Access denied: One of these roles required for route '${state.url}': ${requiredRoles.join(', ')}`);
    this.router.navigate(['/']);
    return false;
  }
}

@Injectable({
  providedIn: 'root'
})
export class StaffRouteGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const user = this.authService.getCurrentUser();

    if (!user || user.userType !== 'staff') {
      this.router.navigate(['/staff-login']);
      return false;
    }

    const requiredModules = (route.data['staffModules'] as string[] | undefined) || [];
    if (!requiredModules.length) {
      return true;
    }

    if (this.hasStaffRouteAccess(user, requiredModules)) {
      return true;
    }

    console.warn(`Access denied: Staff modules ${requiredModules.join(', ')} required for route '${state.url}'`);
    this.router.navigate(['/staff-dashboard/my-tasks']);
    return false;
  }

  private hasStaffRouteAccess(user: any, requiredModules: string[]): boolean {
    const position = String(user?.position || user?.staffPosition || '').toLowerCase();
    const department = String(user?.department || '').toLowerCase();
    const accessRole = String(user?.accessRole || '').toLowerCase();

    const isHousekeepingStaff =
      accessRole === 'housekeeping' ||
      position === 'housekeeping' ||
      position === 'housekeeper' ||
      department === 'housekeeping';

    if (isHousekeepingStaff) {
      return requiredModules.every((module) => ['housekeeping', 'my-tasks', 'my-schedule', 'timesheet', 'profile'].includes(module));
    }

    const allowedModules = new Set((user?.allowedModules || []).map((module: string) => String(module).toLowerCase()));
    return requiredModules.every((module) => allowedModules.has(module.toLowerCase()));
  }
}
