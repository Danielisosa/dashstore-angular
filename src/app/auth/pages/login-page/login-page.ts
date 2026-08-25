import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink} from "@angular/router";
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { AuthService } from '@auth/services/auth.service';


@Component({
  selector: 'app-login-page',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login-page.html',
})
export class LoginPage {

  fb= inject(FormBuilder);
  hasError= signal(false);
  errorMessage = signal<string | null>(null);
  isPosting= signal(false)
  router= inject(Router);

  authService= inject(AuthService);

  loginForm=this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['',[Validators.required, Validators.minLength(6)]]
  })

  onSubmit(){
    if(this.loginForm.invalid){
      this.hasError.set(true);
      setTimeout(()=>{
        this.hasError.set(false);
      },2000)
      return;
    }

    const{ email= '', password=''}=this.loginForm.value;
    this.isPosting.set(true);
    this.errorMessage.set(null);

    this.authService.login(email!, password!).subscribe({
      next: (isAuthenticated) => {
        this.isPosting.set(false);
        if (isAuthenticated) {
          this.router.navigateByUrl('/');
        }
      },
      error: (err) => {
        this.isPosting.set(false);
        const msg = err?.error?.message || 'Credenciales inválidas. Revisa tus datos.';
        this.errorMessage.set(msg);
        // Auto-hide after 5s
        setTimeout(()=> this.errorMessage.set(null), 5000);
      }
    })
  }
 }
