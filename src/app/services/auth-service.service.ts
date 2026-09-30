import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import {AuthUser,LoginRequest,LoginResponse,
   RegisterPharmacyForm,RoleName,
      } from '../model/user.model';

const DOTNET_ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
const DOTNET_NAME_ID_CLAIM = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
const DOTNET_EMAIL_CLAIM = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress';

const TOKEN_STORAGE_KEY = 'pmf_auth_token';

const VALID_ROLES: readonly RoleName[] = ['Patient', 'Pharmacy', 'PharmacyStaff', 'Admin'];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/auth`;

  
  private readonly _token = signal<string | null>(null);
  private readonly _currentUser = signal<AuthUser | null>(null);

  readonly token = this._token.asReadonly();
  readonly currentUser = this._currentUser.asReadonly();
  readonly role = computed<RoleName | null>(() => this._currentUser()?.role ?? null);
  readonly isAuthenticated = computed(() => this._token() !== null 
           && this._currentUser() !=null,);

  constructor() {
    this.restoreSession();
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, request)
      .pipe(
        tap((response) => {
          this._token.set(response.token);
          this._currentUser.set(this.decodeUser(response.token));
        })
      );
  }

  registerPharmacy(form: RegisterPharmacyForm): Observable<{ pharmacyId: number; userId: number }> {
  const data = new FormData();
  data.append('FullName', form.fullName);
  data.append('Email', form.email);
  data.append('Password', form.password);
  data.append('LocationId', String(form.locationId));
  data.append('PharmacyName', form.pharmacyName);
  data.append('LicenseNumber', form.licenseNumber);
  data.append('PhoneNumber', form.phoneNumber.replace(/\D/g, '').slice(-9)); // 9 digits only
  data.append('License', form.license, form.license.name);
  data.append('BusinessRegistration', form.businessRegistration, form.businessRegistration.name);
  data.append('PharmacistCredential', form.pharmacistCredential, form.pharmacistCredential.name);

   return this.http.post<{ pharmacyId: number; userId: number }>(`${this.apiUrl}/register-pharmacy`, data);
}

  logout(): void {
    this._token.set(null);
    this._currentUser.set(null);
  }

  hasRole(...roles: RoleName[]): boolean {
    const current = this.role();
    return current !== null && roles.includes(current);
  }

  private decodeUser(token: string): AuthUser | null {
    const payload = this.decodePayload(token);
    if (!payload) return null;

    const rawRole = payload[DOTNET_ROLE_CLAIM] ?? payload['role'];
    const role = Array.isArray(rawRole) ? rawRole[0] : rawRole;

    const rawId = payload[DOTNET_NAME_ID_CLAIM] ?? payload['sub'];
    const id = rawId !== undefined && !isNaN(Number(rawId)) ? Number(rawId) : null;

    return {
      id,
      email: payload[DOTNET_EMAIL_CLAIM] ?? payload['email'] ?? null,
      role: (role as RoleName) ?? null,
    };
  }

  private decodePayload(token: string): Record<string, any> | null {
    try {
      const part = token.split('.')[1];
      const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
      const json = decodeURIComponent(atob(padded)
          .split('')
          .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
          .join('')
      );
      return JSON.parse(json);
    } catch {
      return null;
    }
  }
  private restoreSession(): void {
    const stored = this.readToken();
    if (!stored) return;

    const user = this.decodeUser(stored);
    if (!user) {
      this.clearToken();
      return;
    }
    this._token.set(stored);
    this._currentUser.set(user);
  }
  private saveToken(token: string): void {
    try {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch {}
  }

  private readToken(): string | null {
    try {
      return sessionStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  }

  private clearToken(): void {
    try {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {}
  }
}