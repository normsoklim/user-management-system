import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth/auth';
import { MainLayoutComponent } from './layouts/main/main';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

// Import route configurations from feature modules
import { AUTH_ROUTES } from './auth/auth.routes';

// Import page components
import { DashboardComponent } from './pages/dashboard/dashboard';
import { NotFoundComponent } from './pages/not-found/not-found';
import { UserListComponent } from './users/list/list';
import { RoleListComponent } from './roles/list/list';
import { AuditListComponent } from './audit/list/list';
import { ProfileComponent } from './pages/profile/profile';
import { SettingsComponent } from './pages/settings/settings';

export const routes: Routes = [
  // Redirect root to login (for unauthenticated users)
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },

  // Authentication routes with auth layout
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: AUTH_ROUTES
  },

  // Main application routes with main layout and auth guard
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      // Dashboard
      {
        path: 'dashboard',
        component: DashboardComponent,
        title: 'Dashboard',
        data: {
          permissions: ['dashboard:read']
        }
      },
      
      // Users routes
      {
        path: 'users',
        canActivate: [RoleGuard],
        data: {
          roles: ['admin', 'manager'],
          title: 'Users - User Management'
        },
        children: [
          {
            path: '',
            component: UserListComponent
          }
          
        ]
      },
      
      // Roles routes
      {
        path: 'roles',
        canActivate: [RoleGuard],
        data: {
          roles: ['admin'],
          title: 'Roles - User Management'
        },
        children: [
          {
            path: '',
            component: RoleListComponent
          },
          
        ]
      },
      
      // Profile route
      {
        path: 'profile',
        component: ProfileComponent,
        title: 'Profile - User Management'
      },
      
      // Settings route
      {
        path: 'settings',
        component: SettingsComponent,
        title: 'Settings - User Management'
      },
      
      // Audit routes
      {
        path: 'audit',
        component: AuditListComponent,
        canActivate: [RoleGuard],
        data: {
          roles: ['admin', 'auditor'],
          title: 'Audit Logs - User Management'
        }
      }
    ]
  },

  // Wildcard route for 404
  {
    path: '**',
    component: NotFoundComponent
  }
];
