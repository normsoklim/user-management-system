import { Component, EventEmitter, Output, Input, HostListener, ElementRef } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIf],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent {
navigateToProfile() {
  console.log('navigateToProfile called');
  this.closeUserDropdown();
  this.router.navigate(['/profile']);
}

navigateToSettings() {
  console.log('navigateToSettings called');
  this.closeUserDropdown();
  this.router.navigate(['/settings']);
}
  @Output() toggleSidebar = new EventEmitter<void>();
  @Input() isSidebarOpen = false;
  isUserDropdownOpen = false;
  isCollapsed = false;
  
  constructor(
    public authService: AuthService,
    private router: Router,
    private elementRef: ElementRef
  ) {}

  onToggleSidebar(): void {
    // Emit the toggle event to parent component
    this.toggleSidebar.emit();
    
    // For debugging purposes
    console.log('Toggle sidebar clicked, current state:', this.isSidebarOpen);
  }

  onLogout(): void {
    this.authService.logout();
    this.isUserDropdownOpen = false;
    this.router.navigate(['auth/login']);
  }

  toggleUserDropdown(): void {
    console.log('Toggling user dropdown. Current state:', this.isUserDropdownOpen);
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
    console.log('New state:', this.isUserDropdownOpen);
  }

  closeUserDropdown(): void {
    console.log('Closing user dropdown');
    // Add a small delay to allow click events on dropdown items to complete
    setTimeout(() => {
      this.isUserDropdownOpen = false;
      console.log('User dropdown closed');
    }, 200);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    console.log('Document click. Clicked inside:', clickedInside, 'Dropdown open:', this.isUserDropdownOpen);
    if (!clickedInside && this.isUserDropdownOpen) {
      console.log('Closing dropdown due to outside click');
      this.isUserDropdownOpen = false;
    }
  }

  get currentUser() {
    return this.authService.getCurrentUser();
  }
  hasAvatar(): boolean {
    return !!(this.currentUser?.avatar && this.currentUser?.avatar.trim() !== '');
  }

  // Get avatar URL with proper server path
  getAvatarUrl(): string {
    if (!this.currentUser?.avatar || this.currentUser.avatar.trim() === '') {
      return '';
    }
    
    const avatar = this.currentUser.avatar;
    
    // If it's already a full URL (starts with http), return as is
    if (avatar.startsWith('http')) {
      return avatar;
    }
    
    // If it starts with /uploads, prepend the server URL
    if (avatar.startsWith('/uploads')) {
      return `http://localhost:4000${avatar}`;
    }
    
    // If it starts with uploads/ (without leading slash), prepend server URL with slash
    if (avatar.startsWith('uploads/')) {
      return `http://localhost:4000/${avatar}`;
    }
    
    // Otherwise, assume it's a relative path and prepend the full server URL
    return `http://localhost:4000/uploads/${avatar}`;
  }

  // Handle avatar loading error
  onAvatarError(event: any): void {
    console.warn(`Failed to load avatar for user ${this.currentUser?.firstName}: ${this.currentUser?.avatar}`);
    // Clear the avatar URL so it will show initials instead
    if (this.currentUser?.avatar) {
      this.currentUser.avatar = '';
    }
  }
}
