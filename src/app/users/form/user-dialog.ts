import { Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, TitleCasePipe, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { UserService, User, CreateUserRequest, UpdateUserRequest } from '../user.service';
import { NotificationService } from '../../core/services/notification.service';
import { LoadingService } from '../../core/services/loading.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TitleCasePipe,NgIf],
  templateUrl: './user-dialog.html',
  styleUrls: ['./user-dialog.css']
})
export class UserDialogComponent implements OnInit {
  userForm: FormGroup;
  isLoading = false;
  isEditMode = false;
  userId: string | null = null;
  user: User | null = null;
  avatarPreviewUrl: string | null = null;
  selectedAvatarFile: File | null = null;

  // Available roles (should come from API or config)
  availableRoles = ['admin', 'manager', 'user', 'auditor'];

  @ViewChild('avatarInput') avatarInput!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private notificationService: NotificationService,
    private loadingService: LoadingService,
    @Inject(NgbActiveModal) public activeModal: NgbActiveModal
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]],
      confirmPassword: [''],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      roles: [[], [Validators.required]],
      isActive: [true],
      avatar: ['']
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadingService.loading$.subscribe(loading => {
      this.isLoading = loading;
    });

    // If we're editing a user, populate the form
    if (this.user) {
      this.isEditMode = true;
      this.populateForm(this.user);
    } else {
      this.isEditMode = false;
      // For create mode, password is required
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }

  populateForm(user: User): void {
    this.userForm.patchValue({
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles,
      isActive: user.isActive,
      avatar: user.avatar
    });
    
    // Set avatar preview if user has an avatar
    if (user.avatar) {
      this.avatarPreviewUrl = user.avatar;
    }
  }

  onAvatarFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.match('image.*')) {
        this.notificationService.showError('Please select an image file');
        return;
      }

      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.notificationService.showError('File size exceeds 2MB limit');
        return;
      }

      this.selectedAvatarFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.avatarPreviewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
      
      // Update form value
      this.userForm.patchValue({ avatar: file.name });
    }
  }

  removeAvatar(): void {
    this.avatarPreviewUrl = null;
    this.selectedAvatarFile = null;
    this.userForm.patchValue({ avatar: '' });
    
    // Reset file input
    if (this.avatarInput) {
      this.avatarInput.nativeElement.value = '';
    }
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.markFormGroupTouched(this.userForm);
      return;
    }

    const formValue = this.userForm.value;
    
    if (this.isEditMode && this.user) {
      const updateData: UpdateUserRequest = {
        username: formValue.username,
        email: formValue.email,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        roles: formValue.roles,
        isActive: formValue.isActive
      };

      this.userService.updateUser(this.user.id, updateData).subscribe({
        next: (updatedUser) => {
          this.notificationService.showSuccess('User updated successfully');
          this.activeModal.close(updatedUser);
        },
        error: (error) => {
          this.notificationService.showError('Failed to update user');
        }
      });
    } else {
      const createData: CreateUserRequest = {
        username: formValue.username,
        email: formValue.email,
        password: formValue.password,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        roles: formValue.roles,
        isActive: formValue.isActive,
        avatar: this.avatarPreviewUrl || undefined
      };

      this.userService.createUser(createData).subscribe({
        next: (newUser) => {
          this.notificationService.showSuccess('User created successfully');
          this.activeModal.close(newUser);
        },
        error: (error) => {
          this.notificationService.showError('Failed to create user');
        }
      });
    }
  }

  onRoleChange(role: string, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const currentRoles = this.userForm.get('roles')?.value || [];
    
    if (checkbox.checked) {
      currentRoles.push(role);
    } else {
      const index = currentRoles.indexOf(role);
      if (index > -1) {
        currentRoles.splice(index, 1);
      }
    }
    
    this.userForm.get('roles')?.setValue(currentRoles);
  }

  isRoleSelected(role: string): boolean {
    const currentRoles = this.userForm.get('roles')?.value || [];
    return currentRoles.includes(role);
  }

  passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value && confirmPassword.value !== password.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  get username() {
    return this.userForm.get('username');
  }

  get email() {
    return this.userForm.get('email');
  }

  get password() {
    return this.userForm.get('password');
  }

  get confirmPassword() {
    return this.userForm.get('confirmPassword');
  }

  get firstName() {
    return this.userForm.get('firstName');
  }

  get lastName() {
    return this.userForm.get('lastName');
  }

  get roles() {
    return this.userForm.get('roles');
  }

  get isActive() {
    return this.userForm.get('isActive');
  }

  get avatar() {
    return this.userForm.get('avatar');
  }

  get pageTitle(): string {
    return this.isEditMode ? 'Edit User' : 'Create User';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'Update User' : 'Create User';
  }
}