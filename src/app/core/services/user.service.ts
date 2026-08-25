import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { UserProfile, UpdateUserProfileDto, ChangePasswordDto } from '../models/user.model';

export interface PaginatedUsersResponse {
  users: UserProfile[];
  total: number;
  limit: number;
  offset: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.baseUrl}/users`;

  // Estado reactivo principal
  private _user = signal<UserProfile | null>(null);
  public loading = signal<boolean>(false);

  // Readonly para consumo público
  public user = this._user.asReadonly();

  // Signals computadas
  public userName = computed(() => this._user()?.fullName ?? 'Usuario');
  public userEmail = computed(() => this._user()?.email ?? '');
  public userAvatar = computed(() => this._user()?.avatarUrl || '/assets/images/no-image.jpg');
  public isAdmin = computed(() => this._user()?.roles?.includes('admin') ?? false);

  getUsers(limit = 10, offset = 0, search = ''): Observable<PaginatedUsersResponse> {
    this.loading.set(true);
    let params = new HttpParams()
      .set('limit', limit)
      .set('offset', offset);

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PaginatedUsersResponse>(this.API_URL, { params }).pipe(
      tap(() => this.loading.set(false)),
      catchError((error) => {
        this.loading.set(false);
        return throwError(() => error);
      })
    );
  }

  updateUserRoles(userId: string, roles: string[]): Observable<UserProfile> {
    this.loading.set(true);
    const primary = this.http.patch<UserProfile>(`${this.API_URL}/${userId}/roles`, { roles });
    const altPatch = this.http.patch<UserProfile>(`${this.API_URL}/${userId}`, { roles });
    const altPut = this.http.put<UserProfile>(`${this.API_URL}/${userId}/roles`, { roles });

    return primary.pipe(
      tap(() => this.loading.set(false)),
      catchError((error) => {
        console.warn('updateUserRoles primary failed:', error?.status, error?.message || error);
        if (error?.status === 404) {
          // Try alternate endpoints/methods
          return altPatch.pipe(
            tap(() => this.loading.set(false)),
            catchError((err2) => {
              console.warn('updateUserRoles altPatch failed:', err2?.status, err2?.message || err2);
              return altPut.pipe(
                tap(() => this.loading.set(false)),
                catchError((err3) => {
                  this.loading.set(false);
                  console.error('updateUserRoles all attempts failed:', err3);
                  return throwError(() => err3);
                })
              );
            })
          );
        }

        this.loading.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Carga la información del perfil del servidor
   */
  getUserProfile(): Observable<UserProfile> {
    this.loading.set(true);
    return this.http.get<UserProfile>(`${this.API_URL}/profile`).pipe(
      tap((user) => {
        this._user.set(user);
        this.loading.set(false);
      }),
      catchError((error) => {
        this.loading.set(false);
        console.error('Error al obtener perfil:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Actualiza los datos de perfil y refresca el estado
   */
  updateProfile(dto: UpdateUserProfileDto): Observable<UserProfile> {
    this.loading.set(true);
    return this.http.patch<UserProfile>(`${this.API_URL}/profile`, dto).pipe(
      tap((updatedUser) => {
        this._user.set(updatedUser);
        this.loading.set(false);
      }),
      catchError((error) => {
        this.loading.set(false);
        console.error('Error al actualizar perfil:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Envía la solicitud para actualizar la contraseña.
   * El backend puede exponer la ruta en /users/change-password o /auth/change-password,
   * así que intentamos ambas para evitar un 404 por mismatch de endpoints.
   */
  changePassword(dto: ChangePasswordDto): Observable<{ message: string }> {
    this.loading.set(true);

    const primaryRequest = this.http.patch<{ message: string }>(`${this.API_URL}/change-password`, dto);
    const fallbackRequest = this.http.patch<{ message: string }>(`${environment.baseUrl}/auth/change-password`, dto);

    return primaryRequest.pipe(
      tap(() => this.loading.set(false)),
      catchError((error) => {
        console.error('Error changePassword (primary):', error);
        if (error?.status === 404) {
          return fallbackRequest.pipe(
            tap(() => this.loading.set(false)),
            catchError((fallbackError) => {
              console.error('Error changePassword (fallback):', fallbackError);
              this.loading.set(false);
              return throwError(() => fallbackError);
            })
          );
        }

        this.loading.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Limpia el estado del usuario (al cerrar sesión)
   */
  clearUserState(): void {
    this._user.set(null);
  }
}
