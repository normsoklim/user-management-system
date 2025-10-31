import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RoleService, Role, RoleFilter } from '../../roles/role.service';
import { NotificationService } from '../../core/services/notification.service';
import { LoadingService } from '../../core/services/loading.service';
import { DatePipe } from '../../shared/pipes/date.pipe';
import { SearchPipe } from '../../shared/pipes/search.pipe';
import { HighlightDirective } from '../../shared/directives/highlight.directive';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RoleDialogComponent } from '../form/role-dialog';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    DatePipe,
    SearchPipe,
    HighlightDirective,
    RoleDialogComponent
  ],
  templateUrl: './list.html',
  styleUrls: ['./list.css']
})
export class RoleListComponent implements OnInit {
  roles: Role[] = [];
  filteredRoles: Role[] = [];
  isLoading = false;
  totalRoles = 0;
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;

  // Filter properties
  searchQuery = '';
  selectedStatus = '';
  sortBy = 'createdAt';
  sortOrder: 'asc' | 'desc' = 'desc';

  // Access to Math object for template
  Math = Math;

  constructor(
    private roleService: RoleService,
    private router: Router,
    private notificationService: NotificationService,
    private loadingService: LoadingService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadRoles();
    this.loadingService.loading$.subscribe(loading => {
      this.isLoading = loading;
    });
  }

  loadRoles(): void {
    const filter: RoleFilter = {
      search: this.searchQuery || undefined,
      isActive: this.selectedStatus ? this.selectedStatus === 'active' : undefined,
      page: this.currentPage,
      limit: this.pageSize,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder
    };

    this.roleService.getRoles(filter).subscribe({
      next: (response) => {
        this.roles = response.roles;
        this.filteredRoles = response.roles;
        this.totalRoles = response.total;
        this.totalPages = response.totalPages;
      },
      error: (error) => {
        this.notificationService.showError('Failed to load roles');
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadRoles();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadRoles();
  }

  onSort(field: string): void {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'asc';
    }
    this.loadRoles();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadRoles();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadRoles();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = '';
    this.currentPage = 1;
    this.loadRoles();
  }

  createRole(): void {
    const modalRef = this.modalService.open(RoleDialogComponent, {
      size: 'lg',
      backdrop: 'static',
      centered: true,
      keyboard: false
    });
    modalRef.componentInstance.role = null; // For create mode, pass null
    modalRef.result.then(
      (result) => {
        // Role created successfully
        this.loadRoles(); // Refresh the role list
      },
      (dismissed) => {
        // Dialog was dismissed/canceled
        // Do nothing
      }
    );
  }

  editRole(id: string): void {
    // First, get the role data
    this.roleService.getRoleById(id).subscribe({
      next: (role) => {
        const modalRef = this.modalService.open(RoleDialogComponent, {
          size: 'lg',
          backdrop: 'static',
          centered: true,
          keyboard: false
        });
        modalRef.componentInstance.role = role; // For edit mode, pass the role data
        modalRef.result.then(
          (result) => {
            // Role updated successfully
            this.loadRoles(); // Refresh the role list
          },
          (dismissed) => {
            // Dialog was dismissed/canceled
            // Do nothing
          }
        );
      },
      error: (error) => {
        this.notificationService.showError('Failed to load role data');
      }
    });
  }

  deleteRole(role: Role): void {
    if (confirm(`Are you sure you want to delete role "${role.name}"?`)) {
      this.roleService.deleteRole(role.id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Role deleted successfully');
          this.loadRoles();
        },
        error: (error) => {
          this.notificationService.showError('Failed to delete role');
        }
      });
    }
  }

  toggleRoleStatus(role: Role): void {
    const action = role.isActive ? 'deactivate' : 'activate';
    const message = `Are you sure you want to ${action} role "${role.name}"?`;
    
    if (confirm(message)) {
      const serviceCall = role.isActive 
        ? this.roleService.deactivateRole(role.id)
        : this.roleService.activateRole(role.id);

      serviceCall.subscribe({
        next: () => {
          this.notificationService.showSuccess(`Role ${action}d successfully`);
          this.loadRoles();
        },
        error: (error) => {
          this.notificationService.showError(`Failed to ${action} role`);
        }
      });
    }
  }

  viewRoleUsers(roleId: string): void {
    this.router.navigate(['/roles', roleId, 'users']);
  }

  exportRoles(): void {
    const filter: RoleFilter = {
      search: this.searchQuery || undefined,
      isActive: this.selectedStatus ? this.selectedStatus === 'active' : undefined
    };

    this.roleService.exportRoles(filter).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `roles_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.notificationService.showSuccess('Roles exported successfully');
      },
      error: (error) => {
        this.notificationService.showError('Failed to export roles');
      }
    });
  }

  getSortIcon(field: string): string {
    if (this.sortBy !== field) {
      return 'fas fa-sort';
    }
    return this.sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
  }

  getPaginationArray(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  getPermissionCount(permissions: string[]): number {
    return permissions ? permissions.length : 0;
  }

  getPermissionTooltip(permissions: string[]): string {
    if (!permissions || permissions.length === 0) {
      return 'No permissions';
    }
    return permissions.join(', ');
  }
}