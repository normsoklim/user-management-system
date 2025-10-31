import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

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
}

export interface AuditLogFilter {
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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
}