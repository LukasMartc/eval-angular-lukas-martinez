import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppUser, AuthResponse, LoginCredentials } from '../models/user.model';

const TOKEN_STORAGE_KEY = 'mv_access_grant';

interface JwtPayload {
  sub: number;
  email: string;
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly currentUserSubject = new BehaviorSubject<AppUser | null>(this.readSessionFromStorage());

  /** Observable expuesto para usarlo con AsyncPipe en la interfaz. */
  readonly currentUser$: Observable<AppUser | null> = this.currentUserSubject.asObservable();

  private readonly currentUserSignal = toSignal(this.currentUser$, { initialValue: this.currentUserSubject.value });

  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/login`, credentials).pipe(
      tap((response) => this.persistSession(response.accessToken)),
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  private persistSession(token: string): void {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    this.currentUserSubject.next(this.buildUserFromToken(token));
  }

  private readSessionFromStorage(): AppUser | null {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      return null;
    }
    const user = this.buildUserFromToken(token);
    if (!user) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
    return user;
  }

  private buildUserFromToken(token: string): AppUser | null {
    const payload = this.decodeJwtPayload(token);
    if (!payload) {
      return null;
    }
    if (payload.exp * 1000 < Date.now()) {
      return null;
    }
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.email.split('@')[0],
    };
  }

  private decodeJwtPayload(token: string): JwtPayload | null {
    try {
      const [, payload] = token.split('.');
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(normalized)) as JwtPayload;
    } catch {
      return null;
    }
  }
}
