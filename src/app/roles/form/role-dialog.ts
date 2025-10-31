import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, FormArray } from '@angular/forms';
import { RoleService, Role, CreateRoleRequest, UpdateRoleRequest, Permission } from '../role.service';
import { NotificationService } from '../../core/services/notification.service';
import { LoadingService } from '../../core/services/loading.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-role-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './role-dialog.html',
  styleUrls: ['./role-dialog.css']
})
export class RoleDialogComponent implements OnInit {
  roleForm: FormGroup;
  isLoading = false;
  isEditMode = false;
  roleId: string | null = null;
  role: Role | null = null;
  availablePermissions: Permission[] = [];
  groupedPermissions: { [category: string]: Permission[] } = {};

  // Access to Object for template
  Object = Object;

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
    private notificationService: NotificationService,
    private loadingService: LoadingService,
    @Inject(NgbActiveModal) public activeModal: NgbActiveModal
  ) {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      permissions: this.fb.array([], [Validators.required]),
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadingService.loading$.subscribe(loading => {
      this.isLoading = loading;
    });

    this.loadPermissions();

    // If we're editing a role, populate the form
    if (this.role) {
      this.isEditMode = true;
      this.roleId = this.role.id;
      this.populateForm(this.role);
    }
  }

  loadPermissions(): void {
    this.roleService.getPermissions().subscribe({
      next: (permissions) => {
        this.availablePermissions = permissions;
        this.groupPermissionsByCategory();
      },
      error: (error) => {
        this.notificationService.showError('Failed to load permissions');
      }
    });
  }

  groupPermissionsByCategory(): void {
    this.groupedPermissions = this.availablePermissions.reduce((groups, permission) => {
      const category = permission.category || 'Other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(permission);
      return groups;
    }, {} as { [category: string]: Permission[] });
  }

  populateForm(role: Role): void {
    this.roleForm.patchValue({
      name: role.name,
      description: role.description,
      isActive: role.isActive
    });

    // Set permissions
    const permissionsArray = this.roleForm.get('permissions') as FormArray;
    role.permissions.forEach(permissionId => {
      permissionsArray.push(this.fb.control(permissionId));
    });
  }

  onSubmit(): void {
    if (this.roleForm.invalid) {
      this.markFormGroupTouched(this.roleForm);
      return;
    }

    const formValue = this.roleForm.value;
    
    if (this.isEditMode && this.roleId) {
      const updateData: UpdateRoleRequest = {
        name: formValue.name,
        description: formValue.description,
        permissions: formValue.permissions,
        isActive: formValue.isActive
      };

      this.roleService.updateRole(this.roleId, updateData).subscribe({
        next: (updatedRole) => {
          this.notificationService.showSuccess('Role updated successfully');
          this.activeModal.close(updatedRole);
        },
        error: (error) => {
          this.notificationService.showError('Failed to update role');
        }
      });
    } else {
      const createData: CreateRoleRequest = {
        name: formValue.name,
        description: formValue.description,
        permissions: formValue.permissions
      };

      this.roleService.createRole(createData).subscribe({
        next: (newRole) => {
          this.notificationService.showSuccess('Role created successfully');
          this.activeModal.close(newRole);
        },
        error: (error) => {
          this.notificationService.showError('Failed to create role');
        }
      });
    }
  }

  onPermissionChange(permissionId: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const permissionsArray = this.roleForm.get('permissions') as FormArray;
    
    if (checkbox.checked) {
      permissionsArray.push(this.fb.control(permissionId));
    } else {
      const index = permissionsArray.value.indexOf(permissionId);
      if (index > -1) {
        permissionsArray.removeAt(index);
      }
    }
  }

  isPermissionSelected(permissionId: string): boolean {
    const permissionsArray = this.roleForm.get('permissions') as FormArray;
    return permissionsArray.value.includes(permissionId);
  }

  selectAllPermissionsInCategory(category: string): void {
    const permissionsArray = this.roleForm.get('permissions') as FormArray;
    const categoryPermissions = this.groupedPermissions[category] || [];
    
    categoryPermissions.forEach(permission => {
      if (!this.isPermissionSelected(permission.id)) {
        permissionsArray.push(this.fb.control(permission.id));
      }
    });
  }

  deselectAllPermissionsInCategory(category: string): void {
    const permissionsArray = this.roleForm.get('permissions') as FormArray;
    const categoryPermissions = this.groupedPermissions[category] || [];
    
    categoryPermissions.forEach(permission => {
      const index = permissionsArray.value.indexOf(permission.id);
      if (index > -1) {
        permissionsArray.removeAt(index);
      }
    });
  }

  isCategoryFullySelected(category: string): boolean {
    const categoryPermissions = this.groupedPermissions[category] || [];
    return categoryPermissions.length > 0 && 
           categoryPermissions.every(permission => this.isPermissionSelected(permission.id));
  }

  isCategoryPartiallySelected(category: string): boolean {
    const categoryPermissions = this.groupedPermissions[category] || [];
    const selectedCount = categoryPermissions.filter(permission => this.isPermissionSelected(permission.id)).length;
    return selectedCount > 0 && selectedCount < categoryPermissions.length;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  get name() {
    return this.roleForm.get('name');
  }

  get description() {
    return this.roleForm.get('description');
  }

  get permissions() {
    return this.roleForm.get('permissions') as FormArray;
  }

  get isActive() {
    return this.roleForm.get('isActive');
  }

  get pageTitle(): string {
    return this.isEditMode ? 'Edit Role' : 'Create Role';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'Update Role' : 'Create Role';
  }

  get selectedPermissionCount(): number {
    return this.permissions.value.length;
  }

  get totalPermissionCount(): number {
    return this.availablePermissions.length;
  }
}