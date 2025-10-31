import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRoles: number;
  recentActivities: number;
}

export interface RecentActivity {
  id: string;
  action: string;
  user: string;
  timestamp: Date;
  details: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalUsers: 0,
    activeUsers: 0,
    totalRoles: 0,
    recentActivities: 0
  };

  recentActivities: RecentActivity[] = [];
  isLoading = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Simulate API call
    setTimeout(() => {
      this.stats = {
        totalUsers: 156,
        activeUsers: 89,
        totalRoles: 8,
        recentActivities: 24
      };

      this.recentActivities = [
        {
          id: '1',
          action: 'User Created',
          user: 'John Doe',
          timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
          details: 'New user account created for john.doe@example.com'
        },
        {
          id: '2',
          action: 'Role Updated',
          user: 'Admin User',
          timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
          details: 'Administrator role permissions updated'
        },
        {
          id: '3',
          action: 'User Login',
          user: 'Jane Smith',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          details: 'Successful login from 192.168.1.100'
        },
        {
          id: '4',
          action: 'Password Reset',
          user: 'Bob Johnson',
          timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
          details: 'Password reset request completed'
        }
      ];

      this.isLoading = false;
    }, 1000);
  }

  navigateToUsers(): void {
    this.router.navigate(['/users']);
  }

  navigateToRoles(): void {
    this.router.navigate(['/roles']);
  }

  navigateToAudit(): void {
    this.router.navigate(['/audit']);
  }

  formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  }
}