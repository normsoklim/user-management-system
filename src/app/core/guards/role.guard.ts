import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const expectedRoles = route.data['roles'] as string[];
    
    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    }

    if (expectedRoles && expectedRoles.length > 0) {
      const hasRequiredRole = this.authService.hasAnyRole(expectedRoles);
      
      if (!hasRequiredRole) {
        this.router.navigate(['/dashboard']);
        return false;
      }
    }

    return true;
  }
}