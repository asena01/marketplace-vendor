import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { PermissionService } from '../services/permission.service';

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
    this.router.navigate(['/admin-dashboard']);
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
    this.router.navigate(['/admin-dashboard']);
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

    if (this.permissionService.hasRole(requiredRole)) {
      return true;
    }

    console.warn(`Access denied: Role '${requiredRole}' required for route '${state.url}'`);
    this.router.navigate(['/admin-dashboard']);
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

    if (this.permissionService.hasAnyRole(...requiredRoles)) {
      return true;
    }

    console.warn(`Access denied: One of these roles required for route '${state.url}': ${requiredRoles.join(', ')}`);
    this.router.navigate(['/admin-dashboard']);
    return false;
  }
}
