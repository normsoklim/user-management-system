import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
    console.log('API Service initialized with baseUrl:', this.baseUrl);
  }

  private getHeaders(): HttpHeaders {
    // Use the same token key as StorageService for consistency
    const token = localStorage.getItem('auth_token');
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }

  get<T>(endpoint: string): Observable<T> {
    console.log(`API GET: ${this.baseUrl}/${endpoint}`);
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, {
      headers: this.getHeaders()
    });
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    const fullUrl = `${this.baseUrl}/${endpoint}`;
    console.log(`=== API SERVICE DEBUG ===`);
    console.log(`API POST: ${fullUrl}`, data);
    console.log(`Base URL: ${this.baseUrl}`);
    console.log(`Endpoint: ${endpoint}`);
    console.log(`Full URL being called: ${fullUrl}`);
    console.log(`This should go through Angular dev server proxy if configured correctly`);
    return this.http.post<T>(fullUrl, data, {
      headers: this.getHeaders()
    });
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    console.log(`API PUT: ${this.baseUrl}/${endpoint}`, data);
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, data, {
      headers: this.getHeaders()
    });
  }

  delete<T>(endpoint: string): Observable<T> {
    console.log(`API DELETE: ${this.baseUrl}/${endpoint}`);
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`, {
      headers: this.getHeaders()
    });
  }

  patch<T>(endpoint: string, data: any): Observable<T> {
    console.log(`API PATCH: ${this.baseUrl}/${endpoint}`, data);
    return this.http.patch<T>(`${this.baseUrl}/${endpoint}`, data, {
      headers: this.getHeaders()
    });
  }
}