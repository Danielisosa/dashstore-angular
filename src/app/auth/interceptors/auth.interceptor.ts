
import {HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "@auth/services/auth.service";

export function authInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
){
  const token = inject(AuthService).token();

  if (!token) {

    const r = req.clone({
      headers: req.headers
        .set('Cache-Control', 'no-cache')
        .set('Pragma', 'no-cache')
    });
    return next(r);
  }

  const newReq = req.clone({
    headers: req.headers
      .set('Authorization', `Bearer ${token}`)
      .set('Cache-Control', 'no-cache')
      .set('Pragma', 'no-cache')
  });

  return next(newReq);
}
