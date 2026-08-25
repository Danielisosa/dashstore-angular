import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ChangePasswordDto } from 'src/app/core/models/user.model';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-change-password',
  imports: [ ReactiveFormsModule, RouterLink],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css',
})
export class ChangePassword {
  readonly userService = inject(UserService);
  private fb = inject(FormBuilder);

  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  private successTimer: any = null;
  private errorTimer: any = null;

  passwordForm = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, {
    validators: this.passwordsMatchValidator
  });

  private passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return newPassword && confirmPassword && newPassword !== confirmPassword
      ? { passwordsMismatch: true }
      : null;
  }

  onSubmit(): void {
    if (this.passwordForm.invalid) return;

    this.errorMessage.set(null);
    this.successMessage.set(null);

    const { currentPassword, newPassword } = this.passwordForm.value;
    const dto: ChangePasswordDto = {
      currentPassword: currentPassword!,
      newPassword: newPassword!
    };

    this.userService.changePassword(dto).subscribe({
      next: (res) => {
        this.showSuccess(res.message || 'Contraseña actualizada con éxito');
        this.passwordForm.reset();
      },
      error: (err) => {
        const msg = err.error?.message || 'Error al actualizar la contraseña. Revisa tus datos.';
        this.showError(msg);
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
