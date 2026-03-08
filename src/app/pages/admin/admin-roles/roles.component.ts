import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="material-icons text-4xl text-blue-600">security</span>
          <div>
            <h2 class="text-3xl font-bold text-gray-800">Role & Permission Management</h2>
            <p class="text-gray-600">Manage admin roles and permissions</p>
          </div>
        </div>
        <button
          (click)="openCreateRoleModal()"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2"
        >
          <span class="material-icons">add_circle</span>
          Create Role
        </button>
      </div>

      <!-- Tab Navigation -->
      <div class="bg-white rounded-lg shadow-md">
        <div class="flex border-b">
          <button
            (click)="setActiveTab('roles')"
            [class]="'flex-1 px-6 py-4 font-semibold transition flex items-center justify-center gap-2 ' +
              (activeTab() === 'roles'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                : 'text-gray-700 hover:bg-gray-50')"
          >
            <span class="material-icons">admin_panel_settings</span>
            Roles ({{ roles().length }})
          </button>
          <button
            (click)="setActiveTab('permissions')"
            [class]="'flex-1 px-6 py-4 font-semibold transition flex items-center justify-center gap-2 ' +
              (activeTab() === 'permissions'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                : 'text-gray-700 hover:bg-gray-50')"
          >
            <span class="material-icons">verified_user</span>
            Permissions ({{ permissions().length }})
          </button>
        </div>

        <!-- Roles Tab -->
        @if (activeTab() === 'roles') {
          <div class="p-6">
            @if (roles().length === 0) {
              <div class="text-center py-12">
                <span class="material-icons text-6xl text-gray-300 mb-4">inventory_2</span>
                <p class="text-gray-500 font-semibold">No roles created</p>
              </div>
            } @else {
              <div class="space-y-4">
                @for (role of roles(); track role._id) {
                  <div class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                    <div class="flex items-start justify-between mb-4">
                      <div>
                        <h3 class="text-lg font-bold text-gray-900">{{ role.displayName }}</h3>
                        <p class="text-gray-600 text-sm mt-1">{{ role.description }}</p>
                        <div class="flex gap-2 mt-3">
                          <span class="px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1"
                            [class]="role.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                          >
                            <span class="material-icons text-sm">{{ role.isActive ? 'check_circle' : 'block' }}</span>
                            {{ role.isActive ? 'Active' : 'Inactive' }}
                          </span>
                        </div>
                      </div>
                      <div class="flex gap-2">
                        <button
                          (click)="editRole(role._id)"
                          title="Edit"
                          class="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded transition"
                        >
                          <span class="material-icons">edit</span>
                        </button>
                        <button
                          (click)="assignPermissions(role._id, role.displayName)"
                          title="Manage Permissions"
                          class="text-purple-600 hover:text-purple-800 p-2 hover:bg-purple-50 rounded transition"
                        >
                          <span class="material-icons">assignment</span>
                        </button>
                        @if (role.name !== 'super-admin') {
                          <button
                            (click)="deleteRole(role._id)"
                            title="Delete"
                            class="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition"
                          >
                            <span class="material-icons">delete</span>
                          </button>
                        }
                      </div>
                    </div>

                    <!-- Module Access Summary -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      @for (module of getEnabledModules(role); track module) {
                        <span class="bg-blue-50 text-blue-700 px-2 py-1 rounded flex items-center gap-1">
                          <span class="material-icons text-sm">check</span>
                          {{ module }}
                        </span>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- Permissions Tab -->
        @if (activeTab() === 'permissions') {
          <div class="p-6">
            @if (permissions().length === 0) {
              <div class="text-center py-12">
                <span class="material-icons text-6xl text-gray-300 mb-4">inventory_2</span>
                <p class="text-gray-500 font-semibold">No permissions</p>
              </div>
            } @else {
              <div class="space-y-3">
                @for (permission of permissions(); track permission._id) {
                  <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <div class="flex items-center gap-2">
                          <h4 class="font-semibold text-gray-900">{{ permission.name }}</h4>
                          <span class="px-2 py-1 rounded text-xs font-semibold flex items-center gap-1"
                            [class]="getRiskColor(permission.riskLevel)"
                          >
                            <span class="material-icons text-xs">{{ getRiskIcon(permission.riskLevel) }}</span>
                            {{ permission.riskLevel }}
                          </span>
                        </div>
                        <p class="text-gray-600 text-sm mt-1">{{ permission.description }}</p>
                        <div class="flex gap-2 mt-2">
                          <span class="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700 flex items-center gap-1">
                            <span class="material-icons text-sm">folder</span>
                            {{ permission.resource }}
                          </span>
                          <span class="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700 flex items-center gap-1">
                            <span class="material-icons text-sm">functions</span>
                            {{ permission.action }}
                          </span>
                        </div>
                      </div>
                      <button
                        (click)="editPermission(permission._id)"
                        title="Edit"
                        class="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded transition ml-4"
                      >
                        <span class="material-icons">edit</span>
                      </button>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>

      <!-- Create/Edit Role Modal -->
      @if (showRoleModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full max-h-96 overflow-y-auto">
            <h3 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span class="material-icons">{{ isEditingRole() ? 'edit' : 'add_circle' }}</span>
              {{ isEditingRole() ? 'Edit Role' : 'Create Role' }}
            </h3>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Role Name</label>
                <input
                  type="text"
                  [(ngModel)]="currentRole.name"
                  placeholder="e.g., finance-manager"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Display Name</label>
                <input
                  type="text"
                  [(ngModel)]="currentRole.displayName"
                  placeholder="e.g., Finance Manager"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  [(ngModel)]="currentRole.description"
                  placeholder="Role description..."
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                ></textarea>
              </div>

              <div class="flex items-center gap-2 pt-4">
                <input
                  type="checkbox"
                  [(ngModel)]="currentRole.isActive"
                  id="isActive"
                  class="w-4 h-4"
                />
                <label for="isActive" class="text-sm font-semibold text-gray-700">Active</label>
              </div>

              <div class="flex gap-2 pt-4">
                <button
                  (click)="saveRole()"
                  class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  <span class="material-icons">save</span>
                  Save
                </button>
                <button
                  (click)="showRoleModal.set(false)"
                  class="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  <span class="material-icons">close</span>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Permission Assignment Modal -->
      @if (showPermissionModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full max-h-96 overflow-y-auto">
            <h3 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span class="material-icons">assignment</span>
              Assign Permissions to {{ assigningRoleName() }}
            </h3>

            <div class="space-y-3 max-h-64 overflow-y-auto">
              @for (permission of permissions(); track permission._id) {
                <div class="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    [checked]="isPermissionAssigned(permission._id)"
                    (change)="togglePermission(permission._id)"
                    [id]="'perm-' + permission._id"
                    class="w-4 h-4"
                  />
                  <label [for]="'perm-' + permission._id" class="flex-1 cursor-pointer">
                    <p class="font-semibold text-gray-900">{{ permission.name }}</p>
                    <p class="text-xs text-gray-600">{{ permission.code }}</p>
                  </label>
                </div>
              }
            </div>

            <div class="flex gap-2 pt-6">
              <button
                (click)="savePermissions()"
                class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2"
              >
                <span class="material-icons">save</span>
                Save
              </button>
              <button
                (click)="showPermissionModal.set(false)"
                class="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2"
              >
                <span class="material-icons">close</span>
                Cancel
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .material-icons {
        font-size: 24px;
        height: 24px;
        width: 24px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        user-select: none;
      }
    `
  ]
})
export class RolesComponent implements OnInit {
  roles = signal<any[]>([]);
  permissions = signal<any[]>([]);
  activeTab = signal<'roles' | 'permissions'>('roles');

  showRoleModal = signal(false);
  showPermissionModal = signal(false);
  isEditingRole = signal(false);

  currentRole = {
    name: '',
    displayName: '',
    description: '',
    isActive: true
  };

  currentRoleId = '';
  assigningRoleId = '';
  assigningRoleName = signal('');
  assignedPermissions = new Set<string>();

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadRoles();
    this.loadPermissions();
  }

  loadRoles(): void {
    this.adminService.getRoles().subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data) {
          this.roles.set(response.data);
        }
      },
      error: (error: any) => console.error('Error loading roles:', error)
    });
  }

  loadPermissions(): void {
    this.adminService.getPermissions().subscribe({
      next: (response: any) => {
        if (response.status === 'success' && response.data) {
          this.permissions.set(response.data);
        }
      },
      error: (error: any) => console.error('Error loading permissions:', error)
    });
  }

  openCreateRoleModal(): void {
    this.isEditingRole.set(false);
    this.currentRole = { name: '', displayName: '', description: '', isActive: true };
    this.showRoleModal.set(true);
  }

  editRole(roleId: string): void {
    const role = this.roles().find((r) => r._id === roleId);
    if (role) {
      this.currentRole = { ...role };
      this.currentRoleId = roleId;
      this.isEditingRole.set(true);
      this.showRoleModal.set(true);
    }
  }

  saveRole(): void {
    if (!this.currentRole.name || !this.currentRole.displayName) {
      alert('Please fill in required fields');
      return;
    }

    if (this.isEditingRole()) {
      this.adminService.updateRole(this.currentRoleId, this.currentRole).subscribe({
        next: () => {
          this.showRoleModal.set(false);
          this.loadRoles();
        },
        error: (error: any) => console.error('Error updating role:', error)
      });
    } else {
      this.adminService.createRole(this.currentRole).subscribe({
        next: () => {
          this.showRoleModal.set(false);
          this.loadRoles();
        },
        error: (error: any) => console.error('Error creating role:', error)
      });
    }
  }

  deleteRole(roleId: string): void {
    if (confirm('Are you sure you want to delete this role?')) {
      this.adminService.deleteRole(roleId).subscribe({
        next: () => this.loadRoles(),
        error: (error: any) => console.error('Error deleting role:', error)
      });
    }
  }

  assignPermissions(roleId: string, roleName: string): void {
    this.assigningRoleId = roleId;
    this.assigningRoleName.set(roleName);

    const role = this.roles().find((r) => r._id === roleId);
    if (role && role.permissions) {
      this.assignedPermissions = new Set(role.permissions.map((p: any) => p._id || p));
    } else {
      this.assignedPermissions.clear();
    }

    this.showPermissionModal.set(true);
  }

  isPermissionAssigned(permissionId: string): boolean {
    return this.assignedPermissions.has(permissionId);
  }

  togglePermission(permissionId: string): void {
    if (this.assignedPermissions.has(permissionId)) {
      this.assignedPermissions.delete(permissionId);
    } else {
      this.assignedPermissions.add(permissionId);
    }
  }

  savePermissions(): void {
    const permissionsArray = Array.from(this.assignedPermissions);

    this.adminService.updateRole(this.assigningRoleId, { permissions: permissionsArray }).subscribe({
      next: () => {
        this.showPermissionModal.set(false);
        this.loadRoles();
      },
      error: (error: any) => console.error('Error saving permissions:', error)
    });
  }

  editPermission(permissionId: string): void {
    console.log('Edit permission:', permissionId);
  }

  setActiveTab(tab: 'roles' | 'permissions'): void {
    this.activeTab.set(tab);
  }

  getEnabledModules(role: any): string[] {
    const modules: string[] = [];
    if (role.moduleAccess) {
      Object.keys(role.moduleAccess).forEach((module) => {
        const access = (role.moduleAccess as any)[module];
        if (access.view) modules.push(module);
      });
    }
    return modules;
  }

  getRiskColor(level: string): string {
    const colors: Record<string, string> = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  }

  getRiskIcon(level: string): string {
    const icons: Record<string, string> = {
      low: 'check_circle',
      medium: 'warning',
      high: 'error',
      critical: 'block'
    };
    return icons[level] || 'help';
  }
}
