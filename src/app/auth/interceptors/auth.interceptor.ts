import {HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "@auth/services/auth.service";
import { Observable, tap } from "rxjs";

export function authInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
){
  const token =inject(AuthService).token();

  // Si no hay token (usuario no logueado), enviamos la petición original sin alterarla
  if (!token) {
    return next(req);
  }

  const newReq= req.clone({
    headers: req.headers.append('Authorization', `Bearer ${token}`),

  });
  return next(newReq);
}
