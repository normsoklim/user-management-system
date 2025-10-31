import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

export interface MenuItem {
  label: string;
  icon: string;
  link: string;
  roles?: string[];
  children?: MenuItem[];
  expanded?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive,NgIf],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent {
  @Output() closeSidebar = new EventEmitter<void>();
  
  isCollapsed = false;
  isMobileOpen = false;
  
  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'fas fa-tachometer-alt',
      link: '/dashboard'
    },
    {
      label: 'Users',
      icon: 'fas fa-users',
      link: '/users',
      roles: ['admin', 'manager']
    },
    {
      label: 'Roles',
      icon: 'fas fa-user-shield',
      link: '/roles',
      roles: ['admin']
    },
    {
      label: 'Audit Logs',
      icon: 'fas fa-history',
      link: '/audit',
      roles: ['admin', 'auditor']
    }
  ];

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
    // Emit close event when collapsing on mobile
    if (this.isCollapsed && this.isMobileOpen) {
      this.closeSidebar.emit();
    }
  }

  onCloseSidebar(): void {
    this.closeSidebar.emit();
  }
  
  onLogout(): void {
    this.authService.logout();
  }
  
  navigateTo(route: string) {
    this.router.navigate([route]);
  }
  hasAccess(item: MenuItem): boolean {
    if (!item.roles || item.roles.length === 0) {
      return true;
    }
    const currentUser = this.authService.getCurrentUser();
    console.log(`Checking access for ${item.label}:`, {
      userRoles: currentUser?.roles,
      requiredRoles: item.roles,
      hasAccess: currentUser ? item.roles.some(role => currentUser.roles.includes(role)) : false
    });
    const hasAccess = this.authService.hasAnyRole(item.roles);
    return hasAccess;
  }

  getCurrentUserRoles(): string[] {
    const user = this.currentUser;
    return user ? user.roles : [];
  }

  getDescription(label: string): string {
    const descriptions: { [key: string]: string } = {
      'Dashboard': 'Overview & Analytics',
      'Users': 'Manage Users',
      'Roles': 'Permissions & Access',
      'Audit Logs': 'System Activity'
    };
    return descriptions[label] || '';
  }

  hasAnyAccessibleChildren(item: MenuItem): boolean {
    if (!item.children) {
      return false;
    }
    return item.children.some(child => this.hasAccess(child));
  }

  navigateToRoute(link: string): void {
    this.router.navigate([link]);
    this.onCloseSidebar();
  }

  toggleGroup(item: MenuItem): void {
    item.expanded = !item.expanded;
  }

  isGroupActive(children: MenuItem[]): boolean {
    return children.some(child => this.router.isActive(child.link, false));
  }

  getIconPath(iconClass: string): string {
    const iconMap: { [key: string]: string } = {
      'fas fa-tachometer-alt': 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      'fas fa-users': 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2m22-10a4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4 4 4 0 0 1 4 4zM9 9a4 4 0 1 1-8 0 4 4 0 0 1 8 0z',
      'fas fa-user-shield': 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zm0-12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
      'fas fa-history': 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
    };
    
    return iconMap[iconClass] || 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
  }

  setMobileOpen(isOpen: boolean): void {
    this.isMobileOpen = isOpen;
  }

  get currentUser() {
    return this.authService.getCurrentUser();
  }
}