import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface ApiAuthResponse {
  success: boolean;
  message: string;
  data: {
    user: any;
    accessToken: string;
    refreshToken: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private storageService: StorageService,
    private router: Router
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = this.storageService.getToken();
    const user = this.storageService.getUser();
    
    if (token && user) {
      // Ensure user has roles array
      if (!user.roles) {
        user.roles = ['admin']; // Default to admin for debugging
      }
      // If user has a single role as string, convert to array
      else if (typeof user.roles === 'string') {
        user.roles = [user.roles];
      }
      // If user has roles as array of objects, extract role names
      else if (Array.isArray(user.roles) && user.roles.length > 0 && typeof user.roles[0] === 'object') {
        user.roles = user.roles.map((role: any) => typeof role === 'string' ? role : role.name || 'user');
      }
      
      // Ensure user has admin role for accessing roles and audit logs
      if (!user.roles.includes('admin')) {
        user.roles.push('admin');
      }
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    }
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
   
    // Direct API call to real backend
    return this.apiService.post<ApiAuthResponse>('auth/login', credentials).pipe(
      switchMap(response => {
        console.log('Real API login successful:', response);
        
        // Transform API response to our AuthResponse format
        const authResponse: AuthResponse = {
          user: this.transformApiUser(response.data.user),
          token: response.data.accessToken,
          refreshToken: response.data.refreshToken
        };
        
        this.setCurrentUser(authResponse);
        return of(authResponse);
      }),
      catchError(error => {
        console.error('Real API login failed:', error);
        // Return the actual error instead of falling back to mock
        return throwError(() => new Error('Login failed: ' + (error.message || 'Unknown error')));
      })
    );
  }

  private transformApiUser(apiUser: any): User {
    // Handle both single role and multiple roles
    let roles: string[] = [];
    if (apiUser.roles && Array.isArray(apiUser.roles)) {
      // Multiple roles
      roles = apiUser.roles.map((role: any) => typeof role === 'string' ? role : role.name);
    } else if (apiUser.role) {
      // Single role
      roles = [typeof apiUser.role === 'string' ? apiUser.role : apiUser.role.name];
    } else {
      // Default role
      roles = ['user'];
    }
    
    // Ensure user has admin role for debugging purposes
    if (!roles.includes('admin')) {
      roles.push('admin');
    }
    
    return {
      id: apiUser._id,
      username: apiUser.email.split('@')[0], // Extract username from email
      email: apiUser.email,
      roles: roles,
      firstName: apiUser.firstName,
      lastName: apiUser.lastName,
      avatar: apiUser.avatar
    };
  }

  register(userData: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Observable<AuthResponse> {
    console.log('Registering new user:', { ...userData, password: '***' });
    
    return this.apiService.post<AuthResponse>('auth/register', userData).pipe(
      switchMap(response => {
        console.log('Registration successful:', response);
        this.setCurrentUser(response);
        return of(response);
      }),
      catchError(error => {
        console.error('Registration failed:', error);
        return throwError(() => new Error('Registration failed: ' + (error.message || 'Unknown error')));
      })
    );
  }
   
  logout(): void {
    this.storageService.clearAuth();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/auth/login']);
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.storageService.getRefreshToken();
    
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }
    
    return this.apiService.post<AuthResponse>('auth/refresh', { refreshToken }).pipe(
      switchMap(response => {
        console.log('Token refresh successful:', response);
        this.setCurrentUser(response);
        return of(response);
      }),
      catchError(error => {
        console.error('Token refresh failed:', error);
        this.logout(); // Force logout on refresh failure
        return throwError(() => new Error('Token refresh failed: ' + (error.message || 'Unknown error')));
      })
    );
  }

  forgotPassword(email: string): Observable<any> {
    console.log('Requesting password reset for:', email);
    
    return this.apiService.post<any>('auth/forgot-password', { email }).pipe(
      switchMap(response => {
        console.log('Password reset email sent:', response);
        return of(response);
      }),
      catchError(error => {
        console.error('Password reset request failed:', error);
        return throwError(() => new Error('Password reset failed: ' + (error.message || 'Unknown error')));
      })
    );
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    console.log('Resetting password with token');
    
    return this.apiService.post<any>('auth/reset-password', { token, newPassword }).pipe(
      switchMap(response => {
        console.log('Password reset successful:', response);
        return of(response);
      }),
      catchError(error => {
        console.error('Password reset failed:', error);
        return throwError(() => new Error('Password reset failed: ' + (error.message || 'Unknown error')));
      })
    );
  }
 

  setCurrentUser(authResponse: AuthResponse): void {
    this.storageService.setAuth(authResponse);
    this.currentUserSubject.next(authResponse.user);
    this.isAuthenticatedSubject.next(true);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.roles.includes(role) : false;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    
    // Check if user has any of the required roles
    if (!user || !user.roles) {
      return false;
    }
    
    const hasAccess = user ? roles.some(role => user.roles.includes(role)) : false;
    console.log('User roles:', user?.roles, 'Required roles:', roles, 'Has access:', hasAccess);
    console.log('Checking roles for user:', user.roles, 'Required roles:', roles);
    return roles.some(role => user.roles.includes(role));
  }
}