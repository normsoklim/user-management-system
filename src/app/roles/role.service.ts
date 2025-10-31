import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../core/services/api.service';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userCount?: number;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  permissions: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
}

export interface RoleFilter {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface RoleResponse {
  roles: Role[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  constructor(private apiService: ApiService) {}

  getRoles(filter: RoleFilter = {}): Observable<RoleResponse> {
    const queryParams = new URLSearchParams();
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    return this.apiService.get<RoleResponse>(`roles?${queryParams.toString()}`);
  }

  getRoleById(id: string): Observable<Role> {
    return this.apiService.get<Role>(`roles/${id}`);
  }

  createRole(roleData: CreateRoleRequest): Observable<Role> {
    return this.apiService.post<Role>('roles', roleData);
  }

  updateRole(id: string, roleData: UpdateRoleRequest): Observable<Role> {
    return this.apiService.put<Role>(`roles/${id}`, roleData);
  }

  deleteRole(id: string): Observable<void> {
    return this.apiService.delete<void>(`roles/${id}`);
  }

  activateRole(id: string): Observable<Role> {
    return this.apiService.patch<Role>(`roles/${id}/activate`, {});
  }

  deactivateRole(id: string): Observable<Role> {
    return this.apiService.patch<Role>(`roles/${id}/deactivate`, {});
  }

  getPermissions(): Observable<Permission[]> {
    return this.apiService.get<Permission[]>('roles/permissions');
  }

  exportRoles(filter: RoleFilter = {}): Observable<Blob> {
    const queryParams = new URLSearchParams();
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    return this.apiService.get<Blob>(`roles/export?${queryParams.toString()}`);
  }

  assignRoleToUser(userId: string, roleId: string): Observable<void> {
    return this.apiService.post<void>(`users/${userId}/roles`, { roleId });
  }

  removeRoleFromUser(userId: string, roleId: string): Observable<void> {
    return this.apiService.delete<void>(`users/${userId}/roles/${roleId}`);
  }

  getUsersWithRole(roleId: string): Observable<any[]> {
    return this.apiService.get<any[]>(`roles/${roleId}/users`);
  }
}