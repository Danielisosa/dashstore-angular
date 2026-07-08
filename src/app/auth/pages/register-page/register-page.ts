import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';
import { FormErrorLabel } from '@shared/components/form-error-label/form-error-label';

@Component({
  selector: 'app-register-page',
  imports: [RouterLink, ReactiveFormsModule, FormErrorLabel],
  templateUrl: './register-page.html',
  styleUrl: './register-page.css',
})
export class RegisterPage {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  // Signals de estado
  hasError = signal(false);
  showSuccess = signal(false);
  errorMessage = signal<string>('');
  isPosting = signal(false);

  private passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

  registerForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(this.passwordPattern)
      ]
    ]
  });

  onSubmit() {
    if (this.registerForm.invalid) {
      this.errorMessage.set('La contraseña debe incluir al menos una mayúscula, una minúscula y un número.');
      this.triggerError();
      return;
    }

    this.isPosting.set(true);
    const { fullName, email, password } = this.registerForm.value;

    this.authService.register(fullName!, email!, password!).subscribe({
      next: (isRegistered) => {
        this.isPosting.set(false);
        if (isRegistered) {

          this.showSuccess.set(true);

          setTimeout(() => {
            this.showSuccess.set(false);
            this.router.navigateByUrl('/auth/login'); // 🚀
          }, 3000);
        } else {
          this.errorMessage.set('Ocurrió un problema inesperado. Intente nuevamente.');
          this.triggerError();
        }
      },
      error: (err) => {
        this.isPosting.set(false);

        if (err.error?.message) {
          const rawMessage = Array.isArray(err.error.message) ? err.error.message[0] : err.error.message;


          if (rawMessage.includes('password must have a Uppercase')) {
            this.errorMessage.set('Tu contraseña es muy débil. Asegúrate de incluir una letra mayúscula, una minúscula y al menos un número.');
          } else if (rawMessage.includes('already exists') || err.status === 409) {
            this.errorMessage.set('Este correo electrónico ya está registrado en nuestra plataforma.');
          } else {
            this.errorMessage.set('La información ingresada no cumple con los requisitos del sistema.');
          }
        } else {
          this.errorMessage.set('Hubo un fallo de comunicación con el servidor. Inténtalo más tarde.');
        }

        this.triggerError();
      }
    });
  }

  private triggerError() {
    this.hasError.set(true);
    setTimeout(() => {
      this.hasError.set(false);
    }, 4500);
  }
}
