import { Directive, Input, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';
import { PermissionService } from '../services/permission.service';

/**
 * Directive to show element only if user has permission
 * Usage: <div *appHasPermission="'vendor.view'">Content</div>
 */
@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit {
  private permission: string = '';
  private logicalOp: 'AND' | 'OR' = 'AND';

  @Input()
  set appHasPermission(val: string) {
    this.permission = val;
    this.updateView();
  }

  @Input()
  set appHasPermissionOp(op: 'AND' | 'OR') {
    this.logicalOp = op;
    this.updateView();
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.updateView();
  }

  private updateView(): void {
    if (this.hasPermission()) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }

  private hasPermission(): boolean {
    if (!this.permission) {
      return true;
    }

    if (this.permission.includes(',')) {
      const permissions = this.permission.split(',').map((p) => p.trim());

      if (this.logicalOp === 'AND') {
        return this.permissionService.hasAllPermissions(...permissions);
      } else {
        return this.permissionService.hasAnyPermission(...permissions);
      }
    }

    return this.permissionService.hasPermission(this.permission);
  }
}

/**
 * Directive to show element only if user does NOT have permission
 * Usage: <div *appHasNotPermission="'vendor.delete'">Content</div>
 */
@Directive({
  selector: '[appHasNotPermission]',
  standalone: true
})
export class HasNotPermissionDirective implements OnInit {
  private permission: string = '';

  @Input()
  set appHasNotPermission(val: string) {
    this.permission = val;
    this.updateView();
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.updateView();
  }

  private updateView(): void {
    if (!this.permissionService.hasPermission(this.permission)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}

/**
 * Directive to show element only if user has role
 * Usage: <div *appHasRole="'super-admin'">Content</div>
 */
@Directive({
  selector: '[appHasRole]',
  standalone: true
})
export class HasRoleDirective implements OnInit {
  private role: string = '';

  @Input()
  set appHasRole(val: string) {
    this.role = val;
    this.updateView();
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.updateView();
  }

  private updateView(): void {
    if (this.permissionService.hasRole(this.role)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}

/**
 * Directive to show element only if user has any of the specified roles
 * Usage: <div *appHasAnyRole="'super-admin,admin'">Content</div>
 */
@Directive({
  selector: '[appHasAnyRole]',
  standalone: true
})
export class HasAnyRoleDirective implements OnInit {
  private roles: string[] = [];

  @Input()
  set appHasAnyRole(val: string) {
    this.roles = val.split(',').map((r) => r.trim());
    this.updateView();
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.updateView();
  }

  private updateView(): void {
    if (this.permissionService.hasAnyRole(...this.roles)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
