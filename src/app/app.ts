import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';
import { LoadingService } from './core/services/loading.service';
import { NotificationService } from './core/services/notification.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NgIf
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  title = environment.appName;
  isLoading = false;
  isAuthenticated = false;
  currentUser: any = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Initialize app
    this.initializeApp();
    
    // Subscribe to loading state
    this.loadingService.loading$.subscribe(loading => {
      this.isLoading = loading;
    });

    // Subscribe to auth state
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
      this.currentUser = user;
    });

    // Handle router events for page tracking
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      if (environment.debug) {
        console.log(`Navigation to: ${event.urlAfterRedirects}`);
      }
    });
  }

  private initializeApp(): void {
    // Check authentication status on app init
    const currentUser = this.authService.getCurrentUser();
    if (environment.debug) {
      console.log('App initialized. Current user:', currentUser);
    }
  }
}
