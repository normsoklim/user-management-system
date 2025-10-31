import { Component, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { SidebarComponent } from '../../shared/sidebar/sidebar';
import { NotificationComponent } from '../../shared/notification/notification';
import { LoadingComponent } from '../../shared/loading/loading';
import { LoadingService } from '../../core/services/loading.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    SidebarComponent,
    NotificationComponent,
    LoadingComponent
  ],
  templateUrl: './main.html',
  styleUrls: ['./main.css']
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  @ViewChild(SidebarComponent) sidebar!: SidebarComponent;
  
  isLoading = false;
  isSidebarOpen = true;
  private loadingSubscription: Subscription | null = null;

  constructor(private loadingService: LoadingService) {}

  ngOnInit(): void {
    this.loadingSubscription = this.loadingService.loading$.subscribe(loading => {
      this.isLoading = loading;
    });
    
    // Initialize sidebar state based on screen size
    if (window.innerWidth > 992) {
      this.isSidebarOpen = true;
    } else {
      this.isSidebarOpen = false;
    }
  }

  ngOnDestroy(): void {
    if (this.loadingSubscription) {
      this.loadingSubscription.unsubscribe();
    }
  }

  onToggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    if (this.sidebar) {
      // For mobile, we toggle the mobile open state
      // For desktop, we toggle the collapsed state
      if (window.innerWidth <= 992) {
        this.sidebar.setMobileOpen(this.isSidebarOpen);
      } else {
        this.sidebar.isCollapsed = !this.isSidebarOpen;
      }
    }
    console.log('Sidebar state changed to:', this.isSidebarOpen);
  }
  
  onSidebarToggle(): void {
    this.onToggleSidebar();
  }
  
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    // On large screens, sidebar should be open by default
    // On small screens, sidebar should be closed by default
    if (event.target.innerWidth > 992) {
      this.isSidebarOpen = true;
      if (this.sidebar) {
        this.sidebar.isMobileOpen = false;
        this.sidebar.isCollapsed = false;
      }
    } else {
      this.isSidebarOpen = false;
      if (this.sidebar) {
        this.sidebar.isMobileOpen = false;
        this.sidebar.isCollapsed = true;
      }
    }
  }

  onCloseSidebar(): void {
    this.isSidebarOpen = false;
    if (this.sidebar) {
      if (window.innerWidth <= 992) {
        this.sidebar.setMobileOpen(false);
      } else {
        this.sidebar.isCollapsed = true;
      }
    }
  }
}