import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../core/services/api.service';

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  user?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
}

export interface AuditLogFilter {
  userId?: string;
  action?: string;
  resource?: string;
  resourceId?: string;
  startDate?: string;
  endDate?: string;
  ipAddress?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AuditLogResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuditSummary {
  totalLogs: number;
  todayLogs: number;
  thisWeekLogs: number;
  thisMonthLogs: number;
  topActions: { action: string; count: number }[];
  topResources: { resource: string; count: number }[];
  topUsers: { user: string; count: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {
  constructor(private apiService: ApiService) {}

  getAuditLogs(filter: AuditLogFilter = {}): Observable<AuditLogResponse> {
    const queryParams = new URLSearchParams();
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    return this.apiService.get<AuditLogResponse>(`audit-logs?${queryParams.toString()}`);
  }

  getAuditLogById(id: string): Observable<AuditLog> {
    return this.apiService.get<AuditLog>(`audit-logs/${id}`);
  }

  createAuditLog(log: Partial<AuditLog>): Observable<AuditLog> {
    return this.apiService.post<AuditLog>('audit-logs', log);
  }

  exportAuditLogs(filter: AuditLogFilter = {}): Observable<Blob> {
    const queryParams = new URLSearchParams();
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    return this.apiService.get<Blob>(`audit-logs/export?${queryParams.toString()}`);
  }

  getAuditSummary(): Observable<AuditSummary> {
    return this.apiService.get<AuditSummary>('audit-logs/summary');
  }

  getAvailableActions(): Observable<string[]> {
    return this.apiService.get<string[]>('audit-logs/actions');
  }

  getAvailableResources(): Observable<string[]> {
    return this.apiService.get<string[]>('audit-logs/resources');
  }

  searchAuditLogs(searchTerm: string, filter: AuditLogFilter = {}): Observable<AuditLogResponse> {
    const searchFilter = { ...filter, search: searchTerm };
    return this.getAuditLogs(searchFilter);
  }

  getLogsByDateRange(startDate: string, endDate: string, filter: AuditLogFilter = {}): Observable<AuditLogResponse> {
    const dateFilter = { ...filter, startDate, endDate };
    return this.getAuditLogs(dateFilter);
  }

  getLogsByUser(userId: string, filter: AuditLogFilter = {}): Observable<AuditLogResponse> {
    const userFilter = { ...filter, userId };
    return this.getAuditLogs(userFilter);
  }

  getLogsByResource(resource: string, filter: AuditLogFilter = {}): Observable<AuditLogResponse> {
    const resourceFilter = { ...filter, resource };
    return this.getAuditLogs(resourceFilter);
  }

  getLogsByAction(action: string, filter: AuditLogFilter = {}): Observable<AuditLogResponse> {
    const actionFilter = { ...filter, action };
    return this.getAuditLogs(actionFilter);
  }
}