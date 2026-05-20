import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface UserInfo {
  authenticated: boolean;
  username?: string;
  name?: string;
  email?: string;
  roles?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSignal = signal<UserInfo | null>(null);
  public user$ = this.userSignal.asReadonly();

  constructor(private http: HttpClient) {}

  async login(): Promise<void> {
    // Redirect to Azure AD login
    window.location.href = '/.auth/login/aad';
  }

  async logout(): Promise<void> {
    // Clear any local state
    this.userSignal.set(null);
    // Redirect to logout endpoint
    window.location.href = '/.auth/logout';
  }

  async getUser(): Promise<UserInfo | null> {
    try {
      const response = await firstValueFrom(this.http.get<{ clientPrincipal?: any }>('/.auth/me'));

      if (response.clientPrincipal) {
        const userInfo: UserInfo = {
          authenticated: true,
          username: response.clientPrincipal.userId,
          name: response.clientPrincipal.userDetails,
          email: response.clientPrincipal.userDetails,
          roles: response.clientPrincipal.userRoles,
        };
        this.userSignal.set(userInfo);
        return userInfo;
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }

    this.userSignal.set({ authenticated: false });
    return { authenticated: false };
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getUser();
    return user?.authenticated || false;
  }

  hasRole(role: string): boolean {
    const user = this.userSignal();
    return user?.roles?.includes(role) || false;
  }
}
