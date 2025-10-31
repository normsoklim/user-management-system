import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService, User, UserFilter } from '../../users/user.service';
import { NotificationService } from '../../core/services/notification.service';
import { LoadingService } from '../../core/services/loading.service';
import { DatePipe } from '../../shared/pipes/date.pipe';
import { SearchPipe } from '../../shared/pipes/search.pipe';
import { HighlightDirective } from '../../shared/directives/highlight.directive';
import { Role } from '../../roles/role.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserDialogComponent } from '../form/user-dialog';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    DatePipe,
    SearchPipe,
    HighlightDirective,
    NgIf,
    NgFor,
    UserDialogComponent
  ],
  templateUrl: './list.html',
  styleUrls: ['./list.css']
})
export class UserListComponent implements OnInit {
  
  users: User[] = [];
  filteredUsers: User[] = [];
  isLoading = false;
  totalUsers = 0;
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;

  // Filter properties
  searchQuery = '';
  selectedRole = '';
  selectedStatus = '';
  sortBy = 'createdAt';
  sortOrder: 'asc' | 'desc' = 'desc';

  // Access to Math object for template
  Math = Math;
  availableRoles: Role[] = [];
  
  constructor(
    private userService: UserService,
    private router: Router,
    private notificationService: NotificationService,
    private loadingService: LoadingService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadingService.loading$.subscribe(loading => {
      this.isLoading = loading;
    });
  }

  loadUsers(): void {
    const filter: UserFilter = {
      search: this.searchQuery || undefined,
      role: this.selectedRole || undefined,
      isActive: this.selectedStatus ? this.selectedStatus === 'active' : undefined,
      page: this.currentPage,
      limit: this.pageSize,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder
    };

    this.userService.getUsers(filter).subscribe({
      next: (response) => {
        this.users = response.users;
        this.filteredUsers = response.users;
        this.totalUsers = response.total;
        this.totalPages = response.totalPages;
      },
      error: (error) => {
        this.notificationService.showError('Failed to load users');
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  onSort(field: string): void {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'asc';
    }
    this.loadUsers();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadUsers();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  createUser(): void {
    const modalRef = this.modalService.open(UserDialogComponent, {
      size: 'lg',
      backdrop: 'static',
      centered: true,
      keyboard: false
    });
    modalRef.componentInstance.user = null; // For create mode, pass null
    modalRef.result.then(
      (result) => {
        // User created successfully
        this.loadUsers(); // Refresh the user list
      },
      (dismissed) => {
        // Dialog was dismissed/canceled
        // Do nothing
      }
    );
  }

  editUser(id: string): void {
    // First, get the user data
    this.userService.getUserById(id).subscribe({
      next: (user) => {
        const modalRef = this.modalService.open(UserDialogComponent, {
          size: 'lg',
          backdrop: 'static',
          centered: true,
          keyboard: false
        });
        modalRef.componentInstance.user = user; // For edit mode, pass the user data
        modalRef.result.then(
          (result) => {
            // User updated successfully
            this.loadUsers(); // Refresh the user list
          },
          (dismissed) => {
            // Dialog was dismissed/canceled
            // Do nothing
          }
        );
      },
      error: (error) => {
        this.notificationService.showError('Failed to load user data');
      }
    });
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete user "${user.firstName} ${user.lastName}"?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.notificationService.showSuccess('User deleted successfully');
          this.loadUsers();
        },
        error: (error) => {
          this.notificationService.showError('Failed to delete user');
        }
      });
    }
  }

  toggleUserStatus(user: User): void {
    const action = user.isActive ? 'deactivate' : 'activate';
    const message = `Are you sure you want to ${action} user "${user.firstName} ${user.lastName}"?`;
    
    if (confirm(message)) {
      const serviceCall = user.isActive 
        ? this.userService.deactivateUser(user.id)
        : this.userService.activateUser(user.id);

      serviceCall.subscribe({
        next: () => {
          this.notificationService.showSuccess(`User ${action}d successfully`);
          this.loadUsers();
        },
        error: (error) => {
          this.notificationService.showError(`Failed to ${action} user`);
        }
      });
    }
  }

  resetPassword(user: User): void {
    const newPassword = prompt(`Enter new password for ${user.firstName} ${user.lastName}:`);
    if (newPassword) {
      this.userService.resetPassword(user.id, newPassword).subscribe({
        next: () => {
          this.notificationService.showSuccess('Password reset successfully');
        },
        error: (error) => {
          this.notificationService.showError('Failed to reset password');
        }
      });
    }
  }

  exportUsers(): void {
    const filter: UserFilter = {
      search: this.searchQuery || undefined,
      role: this.selectedRole || undefined,
      isActive: this.selectedStatus ? this.selectedStatus === 'active' : undefined
    };

    this.userService.exportUsers(filter).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.notificationService.showSuccess('Users exported successfully');
      },
      error: (error) => {
        this.notificationService.showError('Failed to export users');
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

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedRole = '';
    this.selectedStatus = '';
    this.currentPage = 1;
    this.loadUsers();
  }
}