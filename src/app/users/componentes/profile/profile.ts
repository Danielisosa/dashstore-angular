import { Component, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ChangePasswordDto, UpdateUserProfileDto } from 'src/app/core/models/user.model';
import { UserService } from 'src/app/core/services/user.service';

type ModalMode = 'none' | 'edit' | 'password';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
readonly userService = inject(UserService);
  readonly authService = inject(AuthService);
  private fb = inject(FormBuilder);

  modalMode = signal<ModalMode>('none');
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  private successTimer: any = null;
  private errorTimer: any = null;

  profileForm = this.fb.group({
    fullName: ['', [Validators.required]],
    phone: [''],
    avatarUrl: [''],
    address: this.fb.group({
      street: [''],
      city: [''],
      state: [''],
      country: ['']
    })
  });

  passwordForm = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, {
    validators: this.passwordsMatchValidator
  });

  ngOnInit(): void {
    this.userService.getUserProfile().subscribe({
      next: (user) => this.patchFormValues(user)
    });
  }

  openModal(mode: ModalMode): void {
    this.modalMode.set(mode);
    this.clearSuccess();
    this.clearError();
    if (mode === 'edit' && this.userService.user()) {
      this.patchFormValues(this.userService.user());
    }
  }

  closeModal(): void {
    this.modalMode.set('none');
    this.passwordForm.reset();
  }

  private patchFormValues(user: any): void {
    this.profileForm.patchValue({
      fullName: user.fullName,
      phone: user.phone || '',
      avatarUrl: user.avatarUrl || '',
      address: {
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        country: user.address?.country || ''
      }
    });
  }

  private passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return newPassword && confirmPassword && newPassword !== confirmPassword
      ? { passwordsMismatch: true }
      : null;
  }

  onSaveProfile(): void {
    if (this.profileForm.invalid) return;

    const dto = this.profileForm.value as UpdateUserProfileDto;
    this.userService.updateProfile(dto).subscribe({
      next: () => {
        this.showSuccess('Perfil actualizado con éxito.');
        this.closeModal();
      },
      error: () => this.showError('Error al actualizar el perfil.')
    });
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) return;

    const { currentPassword, newPassword } = this.passwordForm.value;
    const dto: ChangePasswordDto = { currentPassword: currentPassword!, newPassword: newPassword! };

    this.userService.changePassword(dto).subscribe({
      next: (res) => {
        this.showSuccess(res.message || 'Contraseña actualizada con éxito');
        this.closeModal();
      },
      error: (err) => {
        this.showError(err.error?.message || 'Error al actualizar la contraseña.');
      }
    });
  }

  private clearSuccess(): void {
    this.successMessage.set(null);
    if (this.successTimer) {
      clearTimeout(this.successTimer);
      this.successTimer = null;
    }
  }

  private clearError(): void {
    this.errorMessage.set(null);
    if (this.errorTimer) {
      clearTimeout(this.errorTimer);
      this.errorTimer = null;
    }
  }

  private showSuccess(msg: string): void {
    this.clearSuccess();
    this.successMessage.set(msg);
    this.successTimer = setTimeout(() => this.clearSuccess(), 5000);
  }

  private showError(msg: string): void {
    this.clearError();
    this.errorMessage.set(msg);
    this.errorTimer = setTimeout(() => this.clearError(), 5000);
  }
}
