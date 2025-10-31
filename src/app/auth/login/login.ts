import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { LoadingService } from '../../core/services/loading.service';
import { Observable, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,NgIf],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  returnUrl: string = '/dashboard';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private loadingService: LoadingService
  ) {
    this.loginForm = this.fb.group({
      email: ['admin@gmail.com', [Validators.required, Validators.email]],
      password: ['Admin123', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    console.log('LoginComponent initialized');
    console.log('Form initial state:', {
      valid: this.loginForm.valid,
      invalid: this.loginForm.invalid,
      pristine: this.loginForm.pristine,
      dirty: this.loginForm.dirty,
      touched: this.loginForm.touched,
      values: this.loginForm.value,
      errors: {
        email: this.email?.errors,
        password: this.password?.errors
      }
    });
    
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/dashboard';
      console.log('Return URL set to:', this.returnUrl);
    });

    this.loadingService.loading$.subscribe(loading => {
      console.log('Loading state changed:', loading);
      this.isLoading = loading;
    });
    
    // Monitor form value changes
    this.loginForm.valueChanges.subscribe(values => {
      console.log('Form values changed:', {
        values,
        valid: this.loginForm.valid,
        errors: {
          email: this.email?.errors,
          password: this.password?.errors
        }
      });
    });
  }

  onSubmit(): void {
    console.log('=== LOGIN SUBMISSION STARTED ===');
    console.log('Form state:', {
      valid: this.loginForm.valid,
      invalid: this.loginForm.invalid,
      pristine: this.loginForm.pristine,
      dirty: this.loginForm.dirty,
      touched: this.loginForm.touched
    });
    
    if (this.loginForm.invalid) {
      console.log('FORM VALIDATION FAILED');
      console.log('Form errors:', {
        email: this.email?.errors,
        password: this.password?.errors
      });
      this.markFormGroupTouched(this.loginForm);
      
      // Show specific validation errors
      if (this.email?.errors?.['required']) {
        this.notificationService.showError('Email is required');
      } else if (this.email?.errors?.['email']) {
        this.notificationService.showError('Please enter a valid email address');
      } else if (this.password?.errors?.['required']) {
        this.notificationService.showError('Password is required');
      } else if (this.password?.errors?.['minlength']) {
        this.notificationService.showError('Password must be at least 6 characters');
      } else {
        this.notificationService.showError('Please fix the form errors');
      }
      return;
    }

    const { email, password } = this.loginForm.value;
    console.log('Form validation passed, attempting login with:', { email, password: '***' });
    
    // Set loading state
    this.isLoading = true;
    console.log('Loading state set to:', this.isLoading);
    
    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        console.log('LOGIN SUCCESSFUL:', response);
        this.authService.setCurrentUser(response);
        this.notificationService.showSuccess('Login successful! Redirecting...');
        
        // Add a small delay before navigation for better UX
        setTimeout(() => {
          console.log('Navigating to:', this.returnUrl);
          this.router.navigate([this.returnUrl]);
        }, 1000);
      },
      error: (error) => {
        console.error('LOGIN FAILED:', error);
        this.isLoading = false;
        console.log('Loading state reset to:', this.isLoading);
        
        // Provide more specific error messages
        if (error.message === 'Invalid credentials') {
          this.notificationService.showError('Invalid email or password. Please try again.');
        } else {
          this.notificationService.showError('Login failed. Please try again later.');
        }
      }
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}