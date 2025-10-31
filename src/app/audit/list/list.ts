import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditLogService, AuditLog, AuditLogFilter, AuditSummary } from '../../audit/audit-log.service';
import { NotificationService } from '../../core/services/notification.service';
import { LoadingService } from '../../core/services/loading.service';
import { DatePipe } from '../../shared/pipes/date.pipe';
import { SearchPipe } from '../../shared/pipes/search.pipe';
import { HighlightDirective } from '../../shared/directives/highlight.directive';

@Component({
  selector: 'app-audit-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    SearchPipe,
    HighlightDirective
  ],
  templateUrl: './list.html',
  styleUrls: ['./list.css']
})
export class AuditListComponent implements OnInit {
  auditLogs: AuditLog[] = [];
  filteredLogs: AuditLog[] = [];
  isLoading = false;
  totalLogs = 0;
  currentPage = 1;
  pageSize = 25;
  totalPages = 0;

  // Filter properties
  searchQuery = '';
  selectedAction = '';
  selectedResource = '';
  selectedUserId = '';
  startDate = '';
  endDate = '';
  ipAddress = '';
  sortBy = 'timestamp';
  sortOrder: 'asc' | 'desc' = 'desc';

  // Available options
  availableActions: string[] = [];
  availableResources: string[] = [];

  // Summary data
  summary: AuditSummary | null = null;

  // Access to Math object for template
  Math = Math;

  constructor(
    private auditLogService: AuditLogService,
    private notificationService: NotificationService,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.loadAuditLogs();
    this.loadSummary();
    this.loadAvailableActions();
    this.loadAvailableResources();
    
    this.loadingService.loading$.subscribe(loading => {
      this.isLoading = loading;
    });
  }

  loadAuditLogs(): void {
    const filter: AuditLogFilter = {
      action: this.selectedAction || undefined,
      resource: this.selectedResource || undefined,
      userId: this.selectedUserId || undefined,
      startDate: this.startDate || undefined,
      endDate: this.endDate || undefined,
      ipAddress: this.ipAddress || undefined,
      page: this.currentPage,
      limit: this.pageSize,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder
    };

    this.auditLogService.getAuditLogs(filter).subscribe({
      next: (response) => {
        this.auditLogs = response.logs;
        this.filteredLogs = response.logs;
        this.totalLogs = response.total;
        this.totalPages = response.totalPages;
      },
      error: (error) => {
        this.notificationService.showError('Failed to load audit logs');
      }
    });
  }

  loadSummary(): void {
    this.auditLogService.getAuditSummary().subscribe({
      next: (summary) => {
        this.summary = summary;
      },
      error: (error) => {
        console.error('Failed to load audit summary', error);
      }
    });
  }

  loadAvailableActions(): void {
    this.auditLogService.getAvailableActions().subscribe({
      next: (actions) => {
        this.availableActions = actions;
      },
      error: (error) => {
        console.error('Failed to load available actions', error);
      }
    });
  }

  loadAvailableResources(): void {
    this.auditLogService.getAvailableResources().subscribe({
      next: (resources) => {
        this.availableResources = resources;
      },
      error: (error) => {
        console.error('Failed to load available resources', error);
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadAuditLogs();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadAuditLogs();
  }

  onSort(field: string): void {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'asc';
    }
    this.loadAuditLogs();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadAuditLogs();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadAuditLogs();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedAction = '';
    this.selectedResource = '';
    this.selectedUserId = '';
    this.startDate = '';
    this.endDate = '';
    this.ipAddress = '';
    this.currentPage = 1;
    this.loadAuditLogs();
  }

  exportAuditLogs(): void {
    const filter: AuditLogFilter = {
      action: this.selectedAction || undefined,
      resource: this.selectedResource || undefined,
      userId: this.selectedUserId || undefined,
      startDate: this.startDate || undefined,
      endDate: this.endDate || undefined,
      ipAddress: this.ipAddress || undefined
    };

    this.auditLogService.exportAuditLogs(filter).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.notificationService.showSuccess('Audit logs exported successfully');
      },
      error: (error) => {
        this.notificationService.showError('Failed to export audit logs');
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

  getActionIcon(action: string): string {
    const iconMap: { [key: string]: string } = {
      'CREATE': 'fas fa-plus',
      'UPDATE': 'fas fa-edit',
      'DELETE': 'fas fa-trash',
      'LOGIN': 'fas fa-sign-in-alt',
      'LOGOUT': 'fas fa-sign-out-alt',
      'VIEW': 'fas fa-eye',
      'EXPORT': 'fas fa-download',
      'ACTIVATE': 'fas fa-toggle-on',
      'DEACTIVATE': 'fas fa-toggle-off'
    };
    return iconMap[action.toUpperCase()] || 'fas fa-info-circle';
  }

  getActionColor(action: string): string {
    const colorMap: { [key: string]: string } = {
      'CREATE': 'success',
      'UPDATE': 'info',
      'DELETE': 'danger',
      'LOGIN': 'primary',
      'LOGOUT': 'secondary',
      'VIEW': 'light',
      'EXPORT': 'warning',
      'ACTIVATE': 'success',
      'DEACTIVATE': 'warning'
    };
    return colorMap[action.toUpperCase()] || 'secondary';
  }

  formatDetails(details: any): string {
    if (!details) return '';
    if (typeof details === 'string') return details;
    return JSON.stringify(details, null, 2);
  }

  refreshData(): void {
    this.loadAuditLogs();
    this.loadSummary();
  }
}