import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { ApiService } from '../core/services/api.service';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  isActive: boolean;
  avatar: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roles: string[];
  isActive: boolean;
  avatar?: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
  isActive?: boolean;
}

export interface UserFilter {
  search?: string;
  role?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiUserResponse {
  success: boolean;
  message: string;
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private apiService: ApiService) {}

  getUsers(filter: UserFilter = {}): Observable<UserResponse> {
    console.log('Fetching users with filter:', filter);
    
    // Convert filter to query parameters
    const params = new URLSearchParams();
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const endpoint = `users${params.toString() ? '?' + params.toString() : ''}`;
    console.log('API Service Base URL:', this.apiService['baseUrl']);
    console.log('Endpoint:', endpoint);
    console.log('Request headers:', this.apiService['getHeaders']());
    console.log('Full URL being called:', `${this.apiService['baseUrl']}/${endpoint}`);
    console.log('Constructed endpoint:', endpoint);
    
    return this.apiService.get<ApiUserResponse>(endpoint).pipe(
      switchMap(response => {
        console.log('API Response:', response);
        if (response.success) {
          return of({
            users: response.data as User[],
            total: response.pagination.total,
            page: response.pagination.page,
            limit: response.pagination.limit,
            totalPages: response.pagination.pages
          });
        } else {
          throw new Error(response.message || 'Failed to fetch users');
        }
      }),
      catchError(error => {
        console.error('Failed to fetch users:', error);
        return throwError(() => new Error('Failed to fetch users: ' + (error.message || 'Unknown error')));
      })
    );
  }

  getUserById(id: string): Observable<User> {
    console.log('Fetching user by ID:', id);
    
    return this.apiService.get<User>(`users/${id}`).pipe(
      catchError(error => {
        console.error('Failed to fetch user:', error);
        return throwError(() => new Error('Failed to fetch user: ' + (error.message || 'Unknown error')));
      })
    );
  }

  createUser(userData: CreateUserRequest): Observable<User> {
    console.log('Creating new user:', { ...userData, password: '***' });
    
    return this.apiService.post<User>('users', userData).pipe(
      catchError(error => {
        console.error('Failed to create user:', error);
        return throwError(() => new Error('Failed to create user: ' + (error.message || 'Unknown error')));
      })
    );
  }

  updateUser(id: string, userData: UpdateUserRequest): Observable<User> {
    console.log('Updating user:', id, userData);
    
    return this.apiService.put<User>(`users/${id}`, userData).pipe(
      catchError(error => {
        console.error('Failed to update user:', error);
        return throwError(() => new Error('Failed to update user: ' + (error.message || 'Unknown error')));
      })
    );
  }

  deleteUser(id: string): Observable<void> {
    console.log('Deleting user:', id);
    
    return this.apiService.delete<void>(`users/${id}`).pipe(
      catchError(error => {
        console.error('Failed to delete user:', error);
        return throwError(() => new Error('Failed to delete user: ' + (error.message || 'Unknown error')));
      })
    );
  }

  activateUser(id: string): Observable<User> {
    console.log('Activating user:', id);
    
    return this.apiService.patch<User>(`users/${id}/activate`, {}).pipe(
      catchError(error => {
        console.error('Failed to activate user:', error);
        return throwError(() => new Error('Failed to activate user: ' + (error.message || 'Unknown error')));
      })
    );
  }

  deactivateUser(id: string): Observable<User> {
    console.log('Deactivating user:', id);
    
    return this.apiService.patch<User>(`users/${id}/deactivate`, {}).pipe(
      catchError(error => {
        console.error('Failed to deactivate user:', error);
        return throwError(() => new Error('Failed to deactivate user: ' + (error.message || 'Unknown error')));
      })
    );
  }

  resetPassword(id: string, newPassword: string): Observable<void> {
    console.log('Resetting password for user:', id);
    
    return this.apiService.post<void>(`users/${id}/reset-password`, { newPassword }).pipe(
      catchError(error => {
        console.error('Failed to reset password:', error);
        return throwError(() => new Error('Failed to reset password: ' + (error.message || 'Unknown error')));
      })
    );
  }

  exportUsers(filter: UserFilter = {}): Observable<Blob> {
    console.log('Exporting users with filter:', filter);
    
    // Convert filter to query parameters
    const params = new URLSearchParams();
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const endpoint = `users/export${params.toString() ? '?' + params.toString() : ''}`;
    
    return this.apiService.get<Blob>(endpoint).pipe(
      catchError(error => {
        console.error('Failed to export users:', error);
        return throwError(() => new Error('Failed to export users: ' + (error.message || 'Unknown error')));
      })
    );
  }
}